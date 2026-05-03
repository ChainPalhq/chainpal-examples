// Sample storefront catalog. The two important per-product knobs are:
//
//   price        — number, sent to POST /payments as `amount`
//   collectInUSD — boolean. Controls how `amount` is INTERPRETED, not where
//                  the merchant gets paid. Settlement always lands in your
//                  account's local fiat currency either way.
//
//                  collectInUSD: true   →  treat `amount` as USD. We compute
//                                          the matching USDC/USDT amount via
//                                          a USD↔stablecoin rate.
//                  collectInUSD: false  →  treat `amount` as your account's
//                                          local currency.
//
// `currency` here is purely for display in the storefront and isn't sent to
// the API. The API uses your merchant account's local currency for the
// fiat side of the conversion.
//
// Backend amount minimums (per ValidateFiatAmountLimits):
//   USD   ≥ $1     (per country: NG $1, GH $1.5, KE $1.5, ZA $2)
//   NGN   ≥ ₦1000
//   GHS   ≥ 20
//   KES   ≥ 50
//   ZAR   ≥ 35
//
// Small-price products at the top of each block are intended for testnet
// runs where faucets only dispense modest crypto.

export const CATEGORIES = ["all", "electronics", "fashion", "home", "subscriptions", "test"];

export const products = [
  // ────────── Faucet-friendly test items (USD-priced) ──────────
  {
    id: "test-tiny-1usd",
    name: "Smoke Test ($1)",
    category: "test",
    price: 1.0,
    currency: "USD",
    collectInUSD: true,
    image:
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80",
    description: "Minimum allowed USD payment. For end-to-end smoke tests.",
  },
  {
    id: "test-coffee-2usd",
    name: "Test Coffee ($2)",
    category: "test",
    price: 2.0,
    currency: "USD",
    collectInUSD: true,
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
    description: "Tiny payment that sits comfortably above the $1 minimum.",
  },
  {
    id: "test-snack-5usd",
    name: "Test Snack ($5)",
    category: "test",
    price: 5.0,
    currency: "USD",
    collectInUSD: true,
    image:
      "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&w=800&q=80",
    description: "Slightly above faucet noise — good for fee + rounding tests.",
  },
  {
    id: "test-lunch-10usd",
    name: "Test Lunch ($10)",
    category: "test",
    price: 10.0,
    currency: "USD",
    collectInUSD: true,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    description: "Round 10 USD — handy for inspecting decimal handling.",
  },

  // ────────── Faucet-friendly test items (NGN-priced) ──────────
  {
    id: "test-ngn-1500",
    name: "Test Order (₦1,500)",
    category: "test",
    price: 1500.0,
    currency: "NGN",
    collectInUSD: false,
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
    description: "Sits just above NGN's ₦1,000 minimum — no rounding gotchas.",
  },
  {
    id: "test-ngn-2500",
    name: "Test Order (₦2,500)",
    category: "test",
    price: 2500.0,
    currency: "NGN",
    collectInUSD: false,
    image:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80",
    description: "Mid-range testnet amount.",
  },
  {
    id: "test-ngn-5000",
    name: "Test Order (₦5,000)",
    category: "test",
    price: 5000.0,
    currency: "NGN",
    collectInUSD: false,
    image:
      "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=800&q=80",
    description: "Comfortably above the minimum, still light on faucet funds.",
  },

  // ────────── Realistic USD-priced products ──────────
  {
    id: "wh-pro-air-1",
    name: "Pro Air Headphones",
    category: "electronics",
    price: 249.0,
    currency: "USD",
    collectInUSD: true,
    image:
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80",
    description: "Studio-grade ANC, 40h battery, hi-res certified.",
  },
  {
    id: "lap-zenith-x1",
    name: "Zenith X1 Laptop",
    category: "electronics",
    price: 1799.0,
    currency: "USD",
    collectInUSD: true,
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
    description: "M-series chip, 16GB RAM, 512GB SSD, 14\" Retina.",
  },
  {
    id: "watch-arc-s2",
    name: "Arc S2 Smart Watch",
    category: "electronics",
    price: 399.0,
    currency: "USD",
    collectInUSD: true,
    image:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80",
    description: "GPS, ECG, sapphire crystal, 7-day battery.",
  },
  {
    id: "cam-vista-mk3",
    name: "Vista Mark III Camera",
    category: "electronics",
    price: 1299.0,
    currency: "USD",
    collectInUSD: true,
    image:
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80",
    description: "Full-frame mirrorless, 8K video, dual card slots.",
  },
  {
    id: "sneaker-runrise",
    name: "Runrise Sneakers",
    category: "fashion",
    price: 159.0,
    currency: "USD",
    collectInUSD: true,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    description: "Carbon plate, vapor-cell midsole, race-day kit.",
  },
  {
    id: "bag-canvas-tote",
    name: "Canvas Field Tote",
    category: "fashion",
    price: 89.0,
    currency: "USD",
    collectInUSD: true,
    image:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
    description: "Heavy-duck canvas, leather trim, hand-stitched.",
  },
  {
    id: "sub-saas-pro",
    name: "Pro Plan (annual)",
    category: "subscriptions",
    price: 120.0,
    currency: "USD",
    collectInUSD: true,
    image:
      "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80",
    description: "Unlimited seats, priority support, early features.",
  },

  // ────────── Realistic local-currency products ──────────
  {
    id: "chair-ergo-l4",
    name: "Aero L4 Ergonomic Chair",
    category: "home",
    price: 320000.0,
    currency: "NGN",
    collectInUSD: false,
    image:
      "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=800&q=80",
    description: "Mesh back, dynamic lumbar, 12-yr warranty.",
  },
  {
    id: "table-walnut",
    name: "Walnut Coffee Table",
    category: "home",
    price: 240000.0,
    currency: "NGN",
    collectInUSD: false,
    image:
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80",
    description: "Solid walnut top, brushed-steel legs, 1.4m.",
  },
  {
    id: "lamp-arc-brass",
    name: "Arc Brass Floor Lamp",
    category: "home",
    price: 95000.0,
    currency: "NGN",
    collectInUSD: false,
    image:
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80",
    description: "Marble base, brushed brass arc, dimmable LED.",
  },
  {
    id: "shades-piano-black",
    name: "Piano Black Sunglasses",
    category: "fashion",
    price: 75000.0,
    currency: "NGN",
    collectInUSD: false,
    image:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80",
    description: "Polarized titanium, hand-finished acetate.",
  },
  {
    id: "kbd-tactile-65",
    name: "Tactile 65 Keyboard",
    category: "electronics",
    price: 110000.0,
    currency: "NGN",
    collectInUSD: false,
    image:
      "https://images.unsplash.com/photo-1595044426077-d36d9236d54a?auto=format&fit=crop&w=800&q=80",
    description: "Aluminum case, hot-swap, gasket-mount.",
  },
];
