import { useMemo, useState } from "react";
import { initializePayment } from "../api";
import JsonView from "./JsonView";

// Field-level validation that mirrors the backend's InitializePaymentDTO
// rules so the dev sees the same errors locally that they'd get from a 400.
//   amount            required, > 0
//   customerEmail     required, valid email
//   customerFirstName optional, 2-50 chars when present
//   customerLastName  optional, 2-50 chars when present
//   reference         optional, 8-64 alphanumeric chars when present
function validatePayload(form, product) {
  const errors = {};

  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Enter a valid email.";
  }

  // We split full name into first/last; whichever is present must be 2-50.
  const parts = form.name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0] || "";
  const last = parts.slice(1).join(" ");
  if (first && (first.length < 2 || first.length > 50)) {
    errors.name = "First name must be 2-50 characters.";
  } else if (last && (last.length < 2 || last.length > 50)) {
    errors.name = "Last name must be 2-50 characters.";
  } else if (!first) {
    errors.name = "Name is required.";
  }

  if (form.reference) {
    if (!/^[a-zA-Z0-9]{8,64}$/.test(form.reference)) {
      errors.reference =
        "Reference must be 8-64 alphanumeric characters (no spaces or symbols).";
    }
  }

  if (!product || !(Number(product.price) > 0)) {
    errors.amount = "Product price must be a positive number.";
  }

  return errors;
}

// Wraps the POST /payments call with a small form. After success, redirects
// the customer to paymentURL (the hosted checkout). The redirect target,
// once payment is complete, lands back on `/` with ?paymentId=&reference=
// query params — App.jsx detects that and surfaces the return banner.
const CheckoutModal = ({ product, onClose }) => {
  const [form, setForm] = useState({
    name: "John Doe",
    email: "john@example.com",
    reference: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const fieldErrors = useMemo(
    () => validatePayload(form, product),
    [form, product]
  );
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (hasFieldErrors) return;
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const payload = {
        amount: Number(product.price),
        customerEmail: form.email,
        customerFirstName: form.name.split(" ")[0] || "Guest",
        customerLastName: form.name.split(" ").slice(1).join(" ") || "User",
        collectInUSD: !!product.collectInUSD,
        // Optional: passing a reference makes it the canonical clientReference.
        // If omitted, ChainPal generates one.
        ...(form.reference ? { reference: form.reference } : {}),
        metadata: {
          productId: String(product.id),
          productName: product.name,
          source: "chainpal_example_store",
        },
        // After hosted-checkout completes, the customer is sent here. The URL
        // gets ?paymentId=<ObjectID>&reference=<clientReference> appended.
        callbackURL: window.location.origin + "/?return=success",
        failureURL: window.location.origin + "/?return=failed",
      };

      const data = await initializePayment(payload);
      setResponse(data);
      if (data?.data?.paymentURL) {
        // Give the dev a beat to see the response, then redirect.
        setTimeout(() => {
          window.location.href = data.data.paymentURL;
        }, 800);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={() => !loading && onClose()}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-700/50 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Checkout</h3>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            {product.name} ·{" "}
            <span className="text-blue-400 font-mono">
              {product.currency} {product.price.toFixed(2)}
            </span>
            <span
              className={`ml-2 text-[10px] uppercase tracking-widest ${
                product.collectInUSD ? "text-emerald-400" : "text-violet-400"
              }`}
              title="How `amount` is interpreted by the API. Settlement is always to your local fiat."
            >
              {product.collectInUSD
                ? "amount = USD"
                : "amount = local currency"}
            </span>
          </p>
        </div>

        <div className="p-6 space-y-4">
          <Field label="Full Name" error={fieldErrors.name}>
            <input
              value={form.name}
              onChange={set("name")}
              className="input"
            />
          </Field>
          <Field label="Email" error={fieldErrors.email}>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              className="input"
            />
          </Field>
          <Field
            label="Reference (optional)"
            hint="Your unique order ID — appears on every webhook + redirect. Auto-generated if empty. 8-64 alphanumeric chars when supplied."
            error={fieldErrors.reference}
          >
            <input
              value={form.reference}
              onChange={set("reference")}
              className="input font-mono"
              placeholder="ORDER12345678"
            />
          </Field>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          {response && <JsonView data={response} label="POST /payments response" />}

          <button
            onClick={submit}
            disabled={loading || hasFieldErrors}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={hasFieldErrors ? "Fix the errors above first" : ""}
          >
            {loading ? "Creating payment…" : "Proceed to ChainPal Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, hint, error, children }) => (
  <div>
    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
      {label}
    </label>
    {children}
    {error ? (
      <p className="text-[11px] text-red-400 mt-1.5">{error}</p>
    ) : (
      hint && <p className="text-[11px] text-slate-500 mt-1.5">{hint}</p>
    )}
  </div>
);

export default CheckoutModal;
