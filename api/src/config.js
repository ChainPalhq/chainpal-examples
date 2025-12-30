export const config = {
  env: import.meta.env.VITE_API_ENV || 'test',
  publicKey: import.meta.env.VITE_PUBLIC_KEY, 
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
};
