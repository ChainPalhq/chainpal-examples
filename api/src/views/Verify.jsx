import { useState, useEffect } from "react";
import { verifyById, verifyByReference, getPaymentDetail } from "../api";
import JsonView from "../components/JsonView";
import { SectionHeader } from "./Storefront";

// Demonstrates the secret-key verify endpoints:
//   GET /payments/:id/verify
//   GET /payments/reference/:reference/verify
//   GET /payments/:id      (full detail)
//
// Accepts initialId/initialMode props so the post-checkout return banner can
// jump straight here with the values pre-filled.
const Verify = ({ initialId, initialReference }) => {
  const [mode, setMode] = useState(initialReference ? "reference" : "id");
  const [value, setValue] = useState(initialId || initialReference || "");
  const [includeDetail, setIncludeDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [detailResult, setDetailResult] = useState(null);

  // If the parent landed us with a payment to verify, do it once.
  useEffect(() => {
    if (initialId || initialReference) {
      run();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId, initialReference]);

  const run = async () => {
    if (!value) return;
    setLoading(true);
    setError(null);
    setVerifyResult(null);
    setDetailResult(null);
    try {
      const verifyP =
        mode === "id" ? verifyById(value) : verifyByReference(value);
      const result = await verifyP;
      setVerifyResult(result);

      if (includeDetail && mode === "id") {
        try {
          const detail = await getPaymentDetail(value);
          setDetailResult(detail);
        } catch {
          // Non-fatal — detail is bonus info.
        }
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const status = verifyResult?.data?.status;

  return (
    <>
      <SectionHeader
        title="Verify Payment"
        description="GET /payments/:id/verify and /payments/reference/:reference/verify — confirm payment outcome from your server."
      />

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-4 mb-6">
        <div className="flex gap-2">
          {["id", "reference"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                mode === m
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              by {m}
            </button>
          ))}
        </div>

        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="input font-mono"
          placeholder={
            mode === "id"
              ? "507f1f77bcf86cd799439011"
              : "ORDER12345678 (your clientReference)"
          }
        />

        {mode === "id" && (
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={includeDetail}
              onChange={(e) => setIncludeDetail(e.target.checked)}
            />
            <span>Also fetch full payment detail (GET /payments/:id)</span>
          </label>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        <button
          onClick={run}
          disabled={loading || !value}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-lg disabled:opacity-50"
        >
          {loading ? "Verifying…" : "Verify"}
        </button>
      </div>

      {verifyResult?.data && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat
            label="Status"
            value={status}
            color={
              status === "completed"
                ? "text-emerald-400"
                : status === "failed" || status === "expired"
                  ? "text-red-400"
                  : "text-amber-400"
            }
          />
          <Stat label="Paid?" value={verifyResult.data.paid ? "Yes" : "No"} />
          <Stat
            label="Amount"
            value={`${verifyResult.data.paymentAmount} ${verifyResult.data.paymentCurrency}`}
          />
          <Stat
            label="Crypto"
            value={`${verifyResult.data.cryptoAmount || "—"} ${verifyResult.data.token || ""}`}
          />
        </div>
      )}

      <div className="space-y-4">
        {verifyResult && (
          <JsonView data={verifyResult} label="verify response" />
        )}
        {detailResult && (
          <JsonView data={detailResult} label="GET /payments/:id response" />
        )}
      </div>
    </>
  );
};

const Stat = ({ label, value, color = "text-slate-100" }) => (
  <div>
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
      {label}
    </p>
    <p className={`text-base font-bold font-mono mt-1 break-all ${color}`}>
      {value || "—"}
    </p>
  </div>
);

export default Verify;
