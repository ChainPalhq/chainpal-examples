import { useState } from "react";
import { getQuote } from "../api";
import JsonView from "../components/JsonView";
import { SectionHeader } from "./Storefront";

// Demonstrates POST /payments/quote. Lets devs preview the crypto amount +
// rate they'll get for a given fiat amount on a specific token+network,
// without creating a payment.
const TOKENS = ["USDC", "USDT"];
const NETWORKS = [
  "base",
  "celo",
  "polygon",
  "ethereum",
  "bsc",
  "arbitrum",
  "tron",
];

const Quote = () => {
  const [form, setForm] = useState({
    token: "USDC",
    network: "base",
    amount: 100,
    collectInUSD: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const fetchQuote = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const r = await getQuote(form);
      setData(r);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SectionHeader
        title="Quote Explorer"
        description="POST /payments/quote — preview the crypto amount and exchange rate for a fiat amount before locking in a payment."
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-4">
          <Field label="Token">
            <select value={form.token} onChange={set("token")} className="input">
              {TOKENS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Network">
            <select value={form.network} onChange={set("network")} className="input">
              {NETWORKS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Amount"
            hint={form.collectInUSD ? "Treated as USD" : "Treated as your account's local currency"}
          >
            <input
              type="number"
              value={form.amount}
              onChange={set("amount")}
              className="input font-mono"
              step="0.01"
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.collectInUSD}
              onChange={set("collectInUSD")}
            />
            <span>Collect in USD</span>
          </label>
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-300">
              {error}
            </div>
          )}
          <button
            onClick={fetchQuote}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50"
          >
            {loading ? "Quoting…" : "Get Quote"}
          </button>
        </div>

        <div className="space-y-4">
          {data?.data ? (
            <>
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 grid grid-cols-2 gap-4">
                <Stat label="Crypto Amount" value={`${data.data.cryptoAmount} ${form.token}`} />
                <Stat label="Fiat Amount" value={`${data.data.fiatAmount} ${data.data.currency}`} />
                <Stat label="Rate" value={data.data.rate} />
                <Stat label="Network" value={form.network} />
              </div>
              <JsonView data={data} label="Response" />
            </>
          ) : (
            <div className="bg-slate-800/30 border border-dashed border-slate-700 rounded-2xl p-10 text-center text-sm text-slate-500">
              Run a quote to see the response here.
            </div>
          )}
        </div>
      </div>
    </>
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

const Stat = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
      {label}
    </p>
    <p className="text-lg font-bold font-mono text-slate-100 mt-1 break-all">
      {value}
    </p>
  </div>
);

export default Quote;
