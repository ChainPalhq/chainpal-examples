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

// ChainPal API keys are prefix-encoded with their type and environment:
//   cp_pk_test_…   public  · test
//   cp_pk_live_…   public  · live
//   cp_sk_test_…   secret  · test
//   cp_sk_live_…   secret  · live
// We use the prefix to detect mismatched env or wrong-type keys before
// firing requests that would otherwise return a confusing 401.
const PK_RE = /^cp_pk_(test|live)_/;
const SK_RE = /^cp_sk_(test|live)_/;

export function inspectKey(key) {
  if (!key) return { kind: "empty" };
  const pk = PK_RE.exec(key);
  if (pk) return { kind: "public", env: pk[1] };
  const sk = SK_RE.exec(key);
  if (sk) return { kind: "secret", env: sk[1] };
  return { kind: "malformed" };
}

// Returns an array of human-readable issues found in the current config.
// Empty array means everything is consistent.
export function validateConfig(c = config) {
  const issues = [];
  const pk = inspectKey(c.publicKey);
  const sk = inspectKey(c.secretKey);

  if (pk.kind === "malformed") {
    issues.push({
      field: "publicKey",
      severity: "error",
      message: 'Public key must start with "cp_pk_test_" or "cp_pk_live_".',
    });
  } else if (pk.kind === "secret") {
    issues.push({
      field: "publicKey",
      severity: "error",
      message: "That looks like a secret key, not a public key.",
    });
  } else if (pk.kind === "public" && pk.env !== c.env) {
    issues.push({
      field: "publicKey",
      severity: "error",
      message: `Public key is for ${pk.env} but the selected environment is ${c.env}.`,
    });
  }

  if (sk.kind === "malformed") {
    issues.push({
      field: "secretKey",
      severity: "error",
      message: 'Secret key must start with "cp_sk_test_" or "cp_sk_live_".',
    });
  } else if (sk.kind === "public") {
    issues.push({
      field: "secretKey",
      severity: "error",
      message: "That looks like a public key, not a secret key.",
    });
  } else if (sk.kind === "secret" && sk.env !== c.env) {
    issues.push({
      field: "secretKey",
      severity: "error",
      message: `Secret key is for ${sk.env} but the selected environment is ${c.env}.`,
    });
  }

  return issues;
}
