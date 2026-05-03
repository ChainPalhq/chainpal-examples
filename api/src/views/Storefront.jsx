import { useMemo, useState } from "react";
import { products, CATEGORIES } from "../products";
import CheckoutModal from "../components/CheckoutModal";

const formatMoney = (price, currency) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "NGN" ? 0 : 2,
  }).format(price);

const Storefront = () => {
  const [selected, setSelected] = useState(null);
  const [category, setCategory] = useState("all");
  // priceUnit filters by how each product's `amount` is interpreted —
  // collectInUSD: true → "usd", false → "local". Settlement is unrelated.
  const [priceUnit, setPriceUnit] = useState("all");

  const visible = useMemo(() => {
    return products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (priceUnit === "usd" && !p.collectInUSD) return false;
      if (priceUnit === "local" && p.collectInUSD) return false;
      return true;
    });
  }, [category, priceUnit]);

  return (
    <>
      <SectionHeader
        title="Storefront"
        description="Demonstrates POST /payments. Every card hits the same endpoint with a different (amount, collectInUSD) combo — pick one to inspect its exact payload. Settlement always lands in your account's local fiat regardless of collectInUSD; the flag only controls how `amount` is interpreted (USD vs local)."
      />

      {/* Filter bar */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((c) => (
            <Chip
              key={c}
              active={category === c}
              onClick={() => setCategory(c)}
              label={c}
            />
          ))}
        </div>
        <div className="hidden md:block w-px h-6 bg-slate-700" />
        <div className="flex flex-wrap gap-1" title="How each product's amount is interpreted">
          <Chip
            active={priceUnit === "all"}
            onClick={() => setPriceUnit("all")}
            label="any unit"
          />
          <Chip
            active={priceUnit === "usd"}
            onClick={() => setPriceUnit("usd")}
            label="USD-priced"
            tone="emerald"
          />
          <Chip
            active={priceUnit === "local"}
            onClick={() => setPriceUnit("local")}
            label="Local-priced"
            tone="violet"
          />
        </div>
        <span className="ml-auto text-xs text-slate-500">
          {visible.length} of {products.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {visible.map((p) => (
          <article
            key={p.id}
            className="group bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden hover:border-blue-500/60 hover:shadow-2xl hover:shadow-blue-900/20 hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
              <img
                src={p.image}
                alt={p.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/600x450/1e293b/64748b?text=" +
                    encodeURIComponent(p.name);
                }}
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge tone={p.collectInUSD ? "emerald" : "violet"}>
                  {p.collectInUSD ? "USD-priced" : "Local-priced"}
                </Badge>
              </div>
              <div className="absolute top-3 right-3">
                <Badge tone="slate">{p.category}</Badge>
              </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="font-bold text-white leading-snug mb-1">
                {p.name}
              </h3>
              <p className="text-xs text-slate-400 mb-4 flex-grow leading-relaxed">
                {p.description}
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-700/40">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Sends as <span className="text-slate-400">amount</span>
                  </span>
                  <span className="text-base font-bold font-mono text-slate-100">
                    {formatMoney(p.price, p.currency)}
                  </span>
                </div>
                <button
                  onClick={() => setSelected(p)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Buy
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="text-center py-16 text-sm text-slate-500 italic">
          No products match those filters.
        </div>
      )}

      {selected && (
        <CheckoutModal product={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
};

const Chip = ({ active, onClick, label, tone = "blue" }) => {
  const activeBg = {
    blue: "bg-blue-600 text-white",
    emerald: "bg-emerald-600 text-white",
    violet: "bg-violet-600 text-white",
  }[tone];
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
        active ? activeBg : "bg-slate-800 text-slate-400 hover:text-slate-200"
      }`}
    >
      {label}
    </button>
  );
};

const Badge = ({ children, tone = "slate" }) => {
  const tones = {
    emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    violet: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    slate: "bg-slate-900/70 text-slate-300 border-slate-700",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md ${tones[tone]}`}
    >
      {children}
    </span>
  );
};

export const SectionHeader = ({ title, description }) => (
  <header className="mb-6">
    <h2 className="text-2xl font-bold text-white">{title}</h2>
    {description && (
      <p className="text-sm text-slate-400 mt-1 max-w-2xl">{description}</p>
    )}
  </header>
);

export default Storefront;
