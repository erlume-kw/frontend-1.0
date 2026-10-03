import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Content-Security-Policy for the storefront. Scoped to what the site actually
// loads: self-hosted assets, Cloudinary/Airtable item images, and the MyFatoorah
// embedded payment widget (script + iframe + its API). 'unsafe-inline' is required
// because Next.js App Router injects inline hydration scripts/styles and is not
// wired for nonces here — so this CSP is defense-in-depth (clickjacking, base-uri,
// object-src, source allow-listing), not a full XSS guard.
// Next.js dev mode (react-refresh / HMR) evaluates strings as JS, which needs
// 'unsafe-eval'. Production builds never eval, so it's added ONLY in development
// — keeping the deployed CSP strict.
const isProd = process.env.NODE_ENV === 'production';
const devEval = isProd ? '' : " 'unsafe-eval'";
// Local dev talks to the backend on another port (127.0.0.1:3000), which is a
// different origin than the page, so it must be allow-listed for connect-src —
// dev only. Production connects to the real *.erlume.com.kw backend.
const devConnect = isProd ? '' : ' http://127.0.0.1:* http://localhost:* ws://127.0.0.1:* ws://localhost:*';
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${devEval} https://*.myfatoorah.com https://applepay.cdn-apple.com`,
  `connect-src 'self' https://*.erlume.com.kw https://*.myfatoorah.com${devConnect}`,
  "frame-src 'self' https://*.myfatoorah.com",
  "form-action 'self' https://*.myfatoorah.com",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Item images come from external hosts (Cloudinary, legacy Airtable links) —
  // plain <img> is used for exact visual parity with the previous app,
  // so no remotePatterns config is needed.
  reactStrictMode: false,
  // Don't advertise the framework.
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
