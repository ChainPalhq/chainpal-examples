import { useState } from "react";
import axios from "axios";

import { products } from "./products";
import { config } from "./config";

function App() {
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "john@example.com",
    memo: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openCheckout = (product) => {
    setSelectedProduct(product);
    setFormData((prev) => ({
      ...prev,
      memo: `Payment for ${product.name}`,
    }));
  };

  const closeCheckout = () => {
    if (!loading) {
      setSelectedProduct(null);
    }
  };

  const handlePayment = async () => {
    if (!selectedProduct) return;
    setLoading(true);

    try {
      const payload = {
        amount: Number(selectedProduct.price), // Must be a number (float64 in backend)

        customerEmail: formData.email,
        customerFirstName: formData.name.split(" ")[0] || "Guest",
        customerLastName: formData.name.split(" ").slice(1).join(" ") || "User",

        collectInUSD: selectedProduct.collectInUSD,

        metadata: {
          productId: selectedProduct.id.toString(),
          productName: selectedProduct.name,
          source: "chainpal_example_store",
          description: selectedProduct.name,
          memo: formData.memo,
        },

        callbackURL: "https://your-callback-url.com/webhook",
        failureURL: window.location.href + "?failed=true",
      };

      console.log("🚀 Initiating Payment:", payload);

      const response = await axios.post(
        `${config.apiBaseUrl}/payments`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${config.publicKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ API Response:", response.data);

      if (response.data.success) {
        const paymentData = response.data.data;
        if (paymentData.paymentURL) {
          window.location.href = paymentData.paymentURL;
        } else {
          alert("Payment created successfully! ID: " + paymentData.id);
          closeCheckout();
        }
      } else {
        alert(
          "Payment creation failed: " +
            (response.data.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("❌ Error:", error);
      const errorMsg = error.response?.data?.message || error.message;
      alert(`Error creating payment: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-blue-500/30">
      <div className="absolute top-4 right-4 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-400">
        {config.env}
      </div>

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <header className="text-center mb-16 space-y-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
            ChainPal Store
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium">
            Developer Test Bench & Integration Demo
          </p>
        </header>

        <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-900/20 hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className="relative h-56 overflow-hidden">
                <div className="absolute top-3 right-3 z-10 bg-slate-900/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-200">
                  {product.collectInUSD ? "USD Settlement" : "Local Settlement"}
                </div>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <h2 className="text-xl font-bold mb-2 text-white">
                  {product.name}
                </h2>
                <p className="text-slate-400 text-sm mb-6 flex-grow leading-relaxed">
                  {product.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {product.currency}
                    </span>
                    <span className="text-2xl font-bold font-mono tracking-tight">
                      {product.price.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => openCheckout(product)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-lg shadow-blue-900/30"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </main>
      </div>

      {/* Checkout Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={closeCheckout}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative p-6 border-b border-slate-700/50 text-center bg-slate-900/50">
              <button
                onClick={closeCheckout}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
              <h3 className="text-2xl font-bold text-white mb-1">Checkout</h3>
              <p className="text-slate-400 text-sm">
                {selectedProduct.name} &bull;{" "}
                <span className="text-blue-400 font-mono">
                  {selectedProduct.currency} {selectedProduct.price.toFixed(2)}
                </span>
              </p>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                  placeholder="name@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Reference / Memo
                </label>
                <input
                  type="text"
                  name="memo"
                  value={formData.memo}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                  placeholder="Payment description"
                />
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-wait transition-all flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  "Proceed to Payment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
