/**
 * Sentry Error Monitoring - Optional Setup
 * 
 * Sentry is NOT included by default to keep the bundle small.
 * To enable Sentry error tracking:
 * 
 * 1. Install Sentry packages:
 *    npm install @sentry/react @sentry/tracing
 * 
 * 2. Set environment variable:
 *    VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
 * 
 * 3. Uncomment the imports below and implement accordingly
 */

// No-op stub implementations - app works without Sentry
export function initSentry() {
  console.debug("Sentry not configured. To enable, see comments in src/lib/sentry.ts");
}

export function captureException(error: Error, context?: Record<string, unknown>) {
  // No-op stub
  if (import.meta.env.DEV) {
    console.error("Error (Sentry disabled):", error, context);
  }
}

export function captureMessage(
  message: string,
  level: "fatal" | "error" | "warning" | "info" | "debug" = "info"
) {
  // No-op stub
}

export function setUserContext(userId: string, email?: string, name?: string) {
  // No-op stub
}

export function clearUserContext() {
  // No-op stub
}

export function addBreadcrumb(
  message: string,
  category?: string,
  level?: "fatal" | "error" | "warning" | "info" | "debug"
) {
  // No-op stub
}

export default {
  init: initSentry,
  captureException,
  captureMessage,
  setUser: setUserContext,
  addBreadcrumb,
};
