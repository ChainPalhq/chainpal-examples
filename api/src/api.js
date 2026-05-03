// Thin axios wrapper around every public ChainPal Developer API endpoint.
// Each function returns the parsed `data` envelope from the server, or throws
// with a friendly message extracted from the error body.
import axios from "axios";
import { config } from "./config";

const PUBLIC_AUTH = () => `Bearer ${config.publicKey || ""}`;
const SECRET_AUTH = () => `Bearer ${config.secretKey || ""}`;

const handle = (p) =>
  p
    .then((r) => r.data)
    .catch((e) => {
      const msg =
        e.response?.data?.message ||
        e.response?.data?.error ||
        e.message ||
        "Request failed";
      const err = new Error(msg);
      err.status = e.response?.status;
      err.body = e.response?.data;
      throw err;
    });

// ────────────── Public-key endpoints (safe in browser) ──────────────

// POST /payments/quote — preview the crypto amount + rate for a given
// fiat amount on a chosen token/network. No payment is created.
export function getQuote({ token, network, amount, collectInUSD = false }) {
  return handle(
    axios.post(
      `${config.apiBaseUrl}/payments/quote`,
      { token, network, amount: Number(amount), collectInUSD },
      { headers: { Authorization: PUBLIC_AUTH() } }
    )
  );
}

// POST /payments — create a hosted-checkout session. Returns paymentId +
// paymentURL.
export function initializePayment(payload) {
  return handle(
    axios.post(`${config.apiBaseUrl}/payments`, payload, {
      headers: { Authorization: PUBLIC_AUTH() },
    })
  );
}

// ────────────── Secret-key endpoints (NOT safe in browser) ──────────────
// In production these belong on YOUR server. They're called from the browser
// here only for the developer demo, with a visible "secret key in browser"
// warning. The endpoints themselves enforce IP whitelisting in live mode.

export function verifyById(paymentId) {
  return handle(
    axios.get(`${config.apiBaseUrl}/payments/${paymentId}/verify`, {
      headers: { Authorization: SECRET_AUTH() },
    })
  );
}

export function verifyByReference(reference) {
  return handle(
    axios.get(
      `${config.apiBaseUrl}/payments/reference/${encodeURIComponent(
        reference
      )}/verify`,
      { headers: { Authorization: SECRET_AUTH() } }
    )
  );
}

export function getPaymentDetail(paymentId) {
  return handle(
    axios.get(`${config.apiBaseUrl}/payments/${paymentId}`, {
      headers: { Authorization: SECRET_AUTH() },
    })
  );
}

export function listPayments({ page = 1, pageSize = 10, status } = {}) {
  const params = new URLSearchParams({ page, pageSize });
  if (status) params.set("status", status);
  return handle(
    axios.get(`${config.apiBaseUrl}/payments?${params}`, {
      headers: { Authorization: SECRET_AUTH() },
    })
  );
}
