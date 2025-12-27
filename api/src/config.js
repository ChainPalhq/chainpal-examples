export const config = {
  env: import.meta.env.VITE_API_ENV || 'test',
  publicKey: import.meta.env.VITE_PUBLIC_KEY || 'cp_pk_live_AQE2OTBmNGNiYTptRZMR_PffJHN6iaHhmjhyQ4V1PdZOlwKhzlIOMCyF', 
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
};
