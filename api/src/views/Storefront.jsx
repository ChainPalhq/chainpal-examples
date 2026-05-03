import { useState } from "react";
import { products } from "../products";
import CheckoutModal from "../components/CheckoutModal";

const Storefront = () => {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <SectionHeader
        title="Storefront"
        description="Demonstrates POST /payments — initialize a hosted checkout. Each card invokes the same endpoint with a different amount/currency combo."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
            className="group bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/50 hover:-translate-y-1 transition-all flex flex-col"
          >
            <div className="relative h-44 overflow-hidden">
              <span className="absolute top-3 right-3 z-10 bg-slate-900/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-200 uppercase tracking-wider">
                {p.collectInUSD ? "USD settle" : "Local settle"}
              </span>
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="text-base font-bold text-white mb-2">{p.name}</h3>
              <p className="text-xs text-slate-400 mb-4 flex-grow">{p.description}</p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-700/50 mt-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {p.currency}
                  </span>
                  <span className="text-lg font-bold font-mono">
                    {p.price.toFixed(2)}
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
          </div>
        ))}
      </div>

      {selected && (
        <CheckoutModal product={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
};

export const SectionHeader = ({ title, description }) => (
  <header className="mb-6">
    <h2 className="text-2xl font-bold text-white">{title}</h2>
    {description && <p className="text-sm text-slate-400 mt-1 max-w-2xl">{description}</p>}
  </header>
);

export default Storefront;
