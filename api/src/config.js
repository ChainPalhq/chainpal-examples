// Runtime config. Defaults come from Vite env, but each value can be
// overridden via the in-app Settings drawer (persisted to localStorage)
// so devs can paste keys without restarting the dev server.

const STORAGE_KEY = "chainpal_demo_config_v2";

const fromEnv = {
  env: import.meta.env.VITE_API_ENV || "test",
  publicKey: import.meta.env.VITE_PUBLIC_KEY || "",
  secretKey: import.meta.env.VITE_SECRET_KEY || "",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
};

const fromStorage = (() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
})();

// Merge: storage overrides env. Mutable so updateConfig() can rewrite fields
// in place — the api.js helpers read this object on every call.
export const config = { ...fromEnv, ...fromStorage };

export function updateConfig(patch) {
  Object.assign(config, patch);
  try {
    const persisted = {
      publicKey: config.publicKey,
      secretKey: config.secretKey,
      apiBaseUrl: config.apiBaseUrl,
      env: config.env,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  } catch {
    // localStorage disabled — nothing to do, in-memory copy still works.
  }
}

export function clearStoredConfig() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  Object.assign(config, fromEnv);
}
