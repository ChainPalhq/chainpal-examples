import { useEffect, useMemo, useState } from "react";
import { config, validateConfig } from "./config";
import Storefront from "./views/Storefront";
import Quote from "./views/Quote";
import Verify from "./views/Verify";
import PaymentsList from "./views/PaymentsList";
import SettingsDrawer from "./components/SettingsDrawer";

const TABS = [
  { id: "storefront", label: "Storefront", note: "POST /payments" },
  { id: "quote", label: "Quote", note: "POST /payments/quote" },
  { id: "verify", label: "Verify", note: "GET /payments/:id/verify" },
  { id: "list", label: "Payments", note: "GET /payments" },
];

function App() {
  const [tab, setTab] = useState("storefront");
  const [settingsOpen, setSettingsOpen] = useState(false);
  // configVersion bumps when Settings is saved → forces children to re-read.
  const [configVersion, setConfigVersion] = useState(0);

  // ──────── Detect post-checkout return ────────
  // The hosted checkout redirects back here with ?paymentId=&reference=
  // (success) or ?return=failed (failure). We surface a banner and prefill
  // Verify so the dev can see the full lifecycle in one click.
  const returnInfo = useMemo(() => {
    const sp = new URLSearchParams(window.location.search);
    return {
      paymentId: sp.get("paymentId"),
      reference: sp.get("reference"),
      mode: sp.get("return"),
      isReturn: sp.has("paymentId") || sp.has("return"),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.location.search]);

  const [returnDismissed, setReturnDismissed] = useState(false);
  // [verifyId, verifyReference] are pushed into the Verify view when the dev
  // clicks "Verify Now" in either the return banner or the payments list.
  const [verifyId, setVerifyId] = useState(null);
  const [verifyReference, setVerifyReference] = useState(null);

  const jumpToVerify = ({ id, reference }) => {
    setVerifyId(id || null);
    setVerifyReference(reference || null);
    setTab("verify");
  };

  useEffect(() => {
    if (returnInfo.isReturn) {
      // Auto-jump to Verify if we have an ID — the goal of the demo is to
      // show the full create→checkout→verify loop closing.
      if (returnInfo.paymentId) {
        jumpToVerify({
          id: returnInfo.paymentId,
          reference: returnInfo.reference,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearReturnParams = () => {
    setReturnDismissed(true);
    window.history.replaceState({}, "", window.location.pathname);
  };

  const keysReady = {
    public: !!config.publicKey,
    secret: !!config.secretKey,
  };
  // Re-validate every render — cheap, and `configVersion` already forces it.
  const configIssues = validateConfig(config);

  return (
    <div
      className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-blue-500/30"
      key={configVersion}
    >
      {/* ──────── Top bar ──────── */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-700/50">
        <div className="container mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              ChainPal API Console
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-slate-700 rounded-full px-2 py-0.5">
              {config.env}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <KeyStatus keysReady={keysReady} />
            <button
              onClick={() => setSettingsOpen(true)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                configIssues.length > 0
                  ? "bg-red-500/10 border border-red-500/40 text-red-300 hover:bg-red-500/20"
                  : "bg-slate-800 hover:bg-slate-700 border border-slate-700"
              }`}
            >
              Settings
              {configIssues.length > 0 && (
                <span className="ml-1.5">({configIssues.length})</span>
              )}
            </button>
          </div>
        </div>

        {/* ──────── Tabs ──────── */}
        <nav className="container mx-auto max-w-7xl px-6 flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                tab === t.id
                  ? "border-blue-500 text-white"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {t.label}
              <span className="ml-2 text-[10px] font-mono text-slate-500">
                {t.note}
              </span>
            </button>
          ))}
        </nav>
      </header>

      <main className="container mx-auto max-w-7xl px-6 py-8">
        {/* Config-issue banner — env mismatched against key prefix etc. */}
        {configIssues.length > 0 && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/5 p-4 flex items-start gap-3">
            <span className="text-red-400 font-bold text-lg leading-none">⚠</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-300">
                Configuration issue
                {configIssues.length > 1 ? "s" : ""}
              </p>
              <ul className="text-xs text-red-300/80 mt-1.5 space-y-1 list-disc list-inside">
                {configIssues.map((i, idx) => (
                  <li key={idx}>
                    <span className="font-mono text-red-300/60">{i.field}:</span>{" "}
                    {i.message}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setSettingsOpen(true)}
                className="text-xs font-bold text-red-300 underline mt-2 hover:text-red-200"
              >
                Open Settings →
              </button>
            </div>
          </div>
        )}

        {/* Return-from-checkout banner */}
        {returnInfo.isReturn && !returnDismissed && (
          <div
            className={`mb-6 rounded-2xl border p-4 flex items-start gap-4 ${
              returnInfo.mode === "failed"
                ? "border-red-500/30 bg-red-500/5"
                : "border-emerald-500/30 bg-emerald-500/5"
            }`}
          >
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-100">
                {returnInfo.mode === "failed"
                  ? "Customer was redirected to failureURL"
                  : "Customer was redirected to callbackURL"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Query params received:
                {returnInfo.paymentId && (
                  <span className="ml-2 font-mono">
                    paymentId=
                    <span className="text-blue-300">{returnInfo.paymentId}</span>
                  </span>
                )}
                {returnInfo.reference && (
                  <span className="ml-2 font-mono">
                    reference=
                    <span className="text-blue-300">{returnInfo.reference}</span>
                  </span>
                )}
              </p>
              {returnInfo.paymentId && (
                <button
                  onClick={() =>
                    jumpToVerify({
                      id: returnInfo.paymentId,
                      reference: returnInfo.reference,
                    })
                  }
                  className="mt-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                >
                  Verify this payment →
                </button>
              )}
            </div>
            <button
              onClick={clearReturnParams}
              className="text-slate-500 hover:text-slate-300 text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab content */}
        {tab === "storefront" && <Storefront />}
        {tab === "quote" && <Quote />}
        {tab === "verify" && (
          <Verify
            initialId={verifyId}
            initialReference={verifyReference}
          />
        )}
        {tab === "list" && (
          <PaymentsList
            onSelect={(id) => jumpToVerify({ id })}
          />
        )}
      </main>

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={() => setConfigVersion((v) => v + 1)}
      />
    </div>
  );
}

const KeyStatus = ({ keysReady }) => (
  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
    <Pill ok={keysReady.public} label="Public" />
    <Pill ok={keysReady.secret} label="Secret" />
  </div>
);

const Pill = ({ ok, label }) => (
  <span
    className={`px-2 py-0.5 rounded ${
      ok ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700/40 text-slate-500"
    }`}
  >
    {label} {ok ? "✓" : "—"}
  </span>
);

export default App;
