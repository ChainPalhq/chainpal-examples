import { useState, useEffect, useCallback } from "react";
import { listPayments } from "../api";
import JsonView from "../components/JsonView";
import { SectionHeader } from "./Storefront";

// Demonstrates GET /payments — paginated list with optional status filter.
// Shows the new pagination shape: { data, currentPage, totalPages, hasNext,
// hasPrev, totalItems }.
const STATUSES = ["all", "pending", "processing", "completed", "failed", "expired"];

const PaymentsList = ({ onSelect }) => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [showRaw, setShowRaw] = useState(false);

  const fetchPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await listPayments({
        page,
        pageSize,
        status: status === "all" ? undefined : status,
      });
      setPageData(r.data);
    } catch (e) {
      setError(e.message);
      setPageData(null);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, status]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const setStatusFilter = (s) => {
    setStatus(s);
    setPage(1);
  };

  const rows = pageData?.data || [];

  return (
    <>
      <SectionHeader
        title="Recent Payments"
        description="GET /payments — paginated list. Note the response shape: { data, currentPage, totalPages, hasNext, hasPrev }."
      />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              status === s
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {s}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowRaw((v) => !v)}
            className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5"
          >
            {showRaw ? "Hide" : "Show"} raw JSON
          </button>
          <button
            onClick={fetchPage}
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
          >
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-300 mb-4">
          {error}
        </div>
      )}

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/60">
            <tr className="text-left">
              <Th>Reference</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
              <Th>Token</Th>
              <Th>Created</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center text-slate-500 py-12 italic"
                >
                  {loading ? "Loading…" : "No payments on this page"}
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr
                  key={p.id || p._id}
                  className="border-t border-slate-700/40 hover:bg-slate-800/40"
                >
                  <Td className="font-mono text-xs">{p.clientReference || "—"}</Td>
                  <Td>
                    <span className="font-mono">
                      {p.fiatAmount} {p.currency}
                    </span>
                  </Td>
                  <Td>
                    <StatusBadge status={p.status} />
                  </Td>
                  <Td className="font-mono">
                    {p.token || "—"}
                    {p.network && (
                      <span className="text-xs text-slate-500 ml-1">
                        / {p.network}
                      </span>
                    )}
                  </Td>
                  <Td className="text-xs text-slate-400">
                    {p.created_at
                      ? new Date(p.created_at).toLocaleString()
                      : "—"}
                  </Td>
                  <Td>
                    <button
                      onClick={() => onSelect?.(p.id || p._id)}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Verify →
                    </button>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-400 mb-6">
        <span>
          Page{" "}
          <span className="text-slate-200 font-bold">
            {pageData?.currentPage || page}
          </span>{" "}
          of{" "}
          <span className="text-slate-200 font-bold">
            {pageData?.totalPages || 1}
          </span>{" "}
          · {pageData?.totalItems || 0} total
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!pageData?.hasPrev || loading}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs font-semibold"
          >
            ← Prev
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!pageData?.hasNext || loading}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs font-semibold"
          >
            Next →
          </button>
        </div>
      </div>

      {showRaw && pageData && <JsonView data={pageData} label="response data" />}
    </>
  );
};

const Th = ({ children }) => (
  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
    {children}
  </th>
);
const Td = ({ children, className = "" }) => (
  <td className={`px-4 py-3 ${className}`}>{children}</td>
);

const StatusBadge = ({ status }) => {
  const styles = {
    completed: "bg-emerald-500/20 text-emerald-400",
    pending: "bg-amber-500/20 text-amber-400",
    processing: "bg-blue-500/20 text-blue-400",
    failed: "bg-red-500/20 text-red-400",
    expired: "bg-slate-600/20 text-slate-400",
    refunded: "bg-orange-500/20 text-orange-400",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${styles[status] || "bg-slate-700 text-slate-300"}`}
    >
      {status || "unknown"}
    </span>
  );
};

export default PaymentsList;
