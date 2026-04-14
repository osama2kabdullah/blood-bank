/**
 * Environment configuration
 * Compatible with Cloudflare Pages environment variables
 */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  appEnv: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  appVersion: import.meta.env.VITE_APP_VERSION ?? '0.0.1',
} as const
