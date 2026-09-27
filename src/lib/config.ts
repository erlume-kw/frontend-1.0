// ─── Single source of truth for environment URLs ──────────────────────────────
// When deploying, either set the NEXT_PUBLIC_* env vars or change the fallback
// values here — nothing else in the codebase hardcodes a host.

// Backend API base URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3000';

// The site's own canonical origin — used to build absolute URLs for metadata
// (Open Graph, hreflang alternates). No trailing slash.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://erlume.com.kw').replace(/\/$/, '');

// MyFatoorah embedded-payment script (demo vs live)
export const MYFATOORAH_SCRIPT_URL =
  process.env.NEXT_PUBLIC_MYFATOORAH_SCRIPT_URL ??
  'https://demo.myfatoorah.com/sessions/v1/session.js';

// The site's own canonical host during local development.
// MyFatoorah refuses "localhost" as a payment redirect target, so the backend
// sends customers back to 127.0.0.1 — cookies and storage are origin-scoped,
// meaning localhost:8081 and 127.0.0.1:8081 would otherwise be two separate
// sessions/carts. Everything must live on ONE origin.
const CANONICAL_DEV_HOST = '127.0.0.1';

/**
 * If the app was opened via "localhost", jump to the canonical dev host so
 * auth cookies, the persisted cart, and MyFatoorah redirects all share one
 * origin. No-op in production (real domain).
 */
export function enforceCanonicalHost(): void {
  if (typeof window === 'undefined') return;
  if (window.location.hostname === 'localhost') {
    window.location.replace(
      window.location.href.replace('//localhost', `//${CANONICAL_DEV_HOST}`),
    );
  }
}
