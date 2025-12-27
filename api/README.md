# ChainPal API Integration Examples

This project demonstrates how to integrate with the **ChainPal API** to accept payments in your application. It features a complete React-based storefront example and utility scripts.

## 🛍️ React Storefront Demo

A modern, responsive e-commerce interface built with **React** and **Vite**. It showcases the end-to-end flow of selecting a product, entering customer details, and initiating a crypto payment via ChainPal.

### Key Features

- **Product Catalog:** Displays items with different currencies (USD, NGN) and settlement types.
- **Settlement Logic:** Demonstrates the difference between "Collect in USD" and "Local Settlement" (converting local currency to stablecoins).
- **Checkout UI:** A clean modal interface for capturing customer information (Name, Email, Memo).
- **API Integration:** Direct implementation of the `/payments` endpoint using `axios`.
- **Error Handling:** Manages API responses, loading states, and error feedback.

### Project Structure

- **`src/App.jsx`**: The core logic. Contains the state management for the shopping cart and the `handlePayment` function that calls the ChainPal API.
- **`src/config.js`**: Centralized configuration for API keys and base URLs.
- **`src/products.js`**: Mock data file defining products with their prices, currencies, and settlement preferences.
- **`hash_test.go`**: A Go utility script for generating SHA-256 hashes of API keys (useful for backend verification or debugging).

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- A ChainPal Public Key

### Installation

1.  **Install dependencies:**

    ```bash
    npm install
    # or if using bun
    bun install
    ```

2.  **Configuration:**
    The application uses `src/config.js` to manage settings. You can override defaults using a `.env` file in the `api` root directory:

    ```properties
    VITE_API_ENV=test
    VITE_PUBLIC_KEY=cp_pk_test_...  # Your ChainPal Public Key
    VITE_API_BASE_URL=https://api.chainpal.org/v1 # Or your local/staging URL
    ```

    _Defaults:_

    - Base URL: `http://localhost:8080/api/v1`
    - Environment: `test`

3.  **Run the application:**
    ```bash
    npm run dev
    ```
    Open the URL displayed in your terminal (typically `http://localhost:5173`).

---

## 💻 Code Integration Highlights

### Payment Request (`src/App.jsx`)

The most critical part of the integration is constructing the payload and sending the POST request. Ensure your payload types match the API requirements (e.g., `amount` as a number).

```javascript
const payload = {
  amount: Number(selectedProduct.price),
  customerEmail: formData.email,
  customerFirstName: formData.name.split(" ")[0],
  customerLastName: formData.name.split(" ").slice(1).join(" "),

  // Determines if the payment should be collected in USD (Stablecoin)
  // or kept in the native currency logic if applicable.
  collectInUSD: selectedProduct.collectInUSD,

  metadata: {
    productId: selectedProduct.id.toString(),
    source: "chainpal_example_store",
    memo: formData.memo,
  },

  callbackURL: "https://your-callback-url.com/webhook",
  failureURL: window.location.href + "?failed=true",
};

// Send Request
const response = await axios.post(`${config.apiBaseUrl}/payments`, payload, {
  headers: {
    Authorization: `Bearer ${config.publicKey}`,
    "Content-Type": "application/json",
  },
});
```

### Response Handling

If successful, the API returns a `paymentURL` which you should redirect the user to:

```javascript
if (response.data.success) {
  const { paymentURL } = response.data.data;
  if (paymentURL) {
    window.location.href = paymentURL;
  }
}
```

---
