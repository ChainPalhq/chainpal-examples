import { useState } from "react";
import { config, updateConfig, clearStoredConfig } from "../config";

// Slide-in drawer letting devs paste their public/secret keys + base URL
// without restarting Vite. Values are persisted to localStorage.
const SettingsDrawer = ({ open, onClose, onSaved }) => {
  const [draft, setDraft] = useState({ ...config });

  if (!open) return null;

  const set = (k) => (e) => setDraft((d) => ({ ...d, [k]: e.target.value }));

  const save = () => {
    updateConfig(draft);
    onSaved?.();
    onClose();
  };

  const reset = () => {
    clearStoredConfig();
    setDraft({ ...config });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="absolute right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-700 shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          <Field
            label="Environment"
            hint="Pick one — must match your key's prefix"
          >
            <select
              value={draft.env}
              onChange={set("env")}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm"
            >
              <option value="test">test</option>
              <option value="live">live</option>
            </select>
          </Field>

          <Field label="API Base URL" hint="e.g. https://api.chainpal.org/api/v1">
            <input
              value={draft.apiBaseUrl}
              onChange={set("apiBaseUrl")}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono"
            />
          </Field>

          <Field
            label="Public Key"
            hint="cp_pk_test_… or cp_pk_live_… — required for create + quote"
          >
            <input
              value={draft.publicKey}
              onChange={set("publicKey")}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono"
              placeholder="cp_pk_test_..."
            />
          </Field>

          <Field
            label="Secret Key"
            hint="cp_sk_test_… or cp_sk_live_… — required for verify + list"
          >
            <input
              type="password"
              value={draft.secretKey}
              onChange={set("secretKey")}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono"
              placeholder="cp_sk_test_..."
            />
          </Field>

          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-300 leading-relaxed">
            <strong className="font-bold">Heads up.</strong> Secret keys belong
            on your server, never in the browser. This demo accepts one only
            so the verify/list views can be exercised end-to-end. Live secret
            keys also enforce IP whitelisting — add this origin's IP in your
            ChainPal dashboard.
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={save}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              Save
            </button>
            <button
              onClick={reset}
              className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-lg transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, hint, children }) => (
  <div>
    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
      {label}
    </label>
    {children}
    {hint && <p className="text-[11px] text-slate-500 mt-1.5">{hint}</p>}
  </div>
);

export default SettingsDrawer;
