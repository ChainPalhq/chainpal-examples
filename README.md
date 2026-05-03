# ChainPal API Console — Integration Demo

A React + Vite playground that demonstrates **every public ChainPal Developer
API endpoint** end-to-end. Use it to learn the surface, debug your own
integration, or copy snippets into your codebase.

## What it covers

| Tab           | Endpoint                                      | Auth          |
| :------------ | :-------------------------------------------- | :------------ |
| Storefront    | `POST /payments`                              | Public key    |
| Quote         | `POST /payments/quote`                        | Public key    |
| Verify        | `GET /payments/:id/verify`                    | Secret key    |
|               | `GET /payments/reference/:reference/verify`   | Secret key    |
|               | `GET /payments/:id` (full detail)             | Secret key    |
| Payments      | `GET /payments` (paginated list)              | Secret key    |

The app also closes the loop: when the hosted checkout redirects the customer
back, it parses `?paymentId=&reference=` from the URL, surfaces a banner, and
auto-jumps to the **Verify** tab pre-filled with the returned ID — so you can
watch a single transaction go through `create → checkout → verify` in one
session.

## Features

- **Tabbed console** — one screen per API concept; each tab shows request
  inputs, response, and a raw-JSON viewer so it doubles as a request inspector.
- **Settings drawer** — paste your public/secret keys and base URL at runtime
  (persisted to `localStorage`); no Vite restart, no `.env` file required for
  quick experiments.
- **Return-from-checkout handling** — auto-detects the redirect query params
  appended by ChainPal and offers a one-click "Verify this payment" CTA.
- **Quote explorer** — pick token + network + amount, see the rate and the
  expected crypto amount before locking in a payment.
- **Paginated list** — uses the real
  `{ data, currentPage, totalPages, hasNext, hasPrev }` response shape with
  working Prev / Next; status filter chips; click any row to verify it.
- **Settlement modes** — products mix `collectInUSD: true` and `false` so you
  can see both flows.

## Run it

### Prerequisites

- Node.js 18+ (or [Bun](https://bun.sh/))
- A ChainPal **public key** (`cp_pk_test_…`) for the Storefront / Quote tabs
- A ChainPal **secret key** (`cp_sk_test_…`) for the Verify / Payments tabs

### Install + start

```bash
bun install      # or: npm install
bun run dev      # or: npm run dev
```

Open the URL Vite prints (usually <http://localhost:5173>) and click
**Settings** in the top right to paste your keys. They're persisted to
`localStorage`.

### Optional `.env`

Pre-seed the keys instead of pasting them each time:

```properties
VITE_API_ENV=test
VITE_PUBLIC_KEY=cp_pk_test_...
VITE_SECRET_KEY=cp_sk_test_...
VITE_API_BASE_URL=https://api.chainpal.org/api/v1
```

Defaults: `test` env, base URL `http://localhost:8080/api/v1`.

## Layout

```
src/
  App.jsx                        — tab shell, return-banner, key status
  api.js                         — axios wrapper for every endpoint
  config.js                      — env + localStorage merge, runtime mutable
  products.js                    — sample storefront catalog
  components/
    CheckoutModal.jsx            — POST /payments form + redirect
    JsonView.jsx                 — pretty JSON inspector
    SettingsDrawer.jsx           — runtime key/baseURL editor
  views/
    Storefront.jsx               — product grid → checkout
    Quote.jsx                    — POST /payments/quote
    Verify.jsx                   — GET /payments/:id/verify (+ by reference, + detail)
    PaymentsList.jsx             — GET /payments (paginated)
```

## ⚠️  About the secret key in the browser

The Verify and Payments tabs need a **secret key**. In a real integration
those endpoints **belong on your server**, never in the browser — the secret
key has full account privileges. This demo accepts one only so the entire
public API can be exercised from a single page. Live secret keys also enforce
IP whitelisting; add this origin's IP to your ChainPal dashboard before
flipping to live.

## Integration recipe

Minimal viable flow for a real merchant integration:

```javascript
// 1. SERVER — create the payment with your PUBLIC key
const r = await fetch("https://api.chainpal.org/api/v1/payments", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.CHAINPAL_PUBLIC_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    amount: order.total,
    customerEmail: order.email,
    reference: order.id,                                 // your stable id
    callbackURL: "https://yoursite.com/payment/success",
    failureURL: "https://yoursite.com/payment/cancel",
    metadata: { orderId: order.id },
  }),
});
const { paymentURL } = (await r.json()).data;

// 2. BROWSER — redirect the customer
window.location.href = paymentURL;

// 3. SERVER — when ChainPal redirects back to /payment/success?paymentId=...&reference=...
//    verify with your SECRET key before fulfilling the order
const v = await fetch(
  `https://api.chainpal.org/api/v1/payments/${paymentId}/verify`,
  { headers: { Authorization: `Bearer ${process.env.CHAINPAL_SECRET_KEY}` } }
);
const { status, paid } = (await v.json()).data;
if (paid && status === "completed") fulfillOrder(reference);

// 4. SERVER — also handle webhooks for async outcomes, signed with your
//    webhook signing secret. See https://docs.chainpal.org/webhooks
```

For the full reference, see the [API docs](https://docs.chainpal.org).
