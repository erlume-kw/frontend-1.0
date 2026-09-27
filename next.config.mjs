import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Content-Security-Policy for the storefront. Scoped to what the site actually
// loads: self-hosted assets, Cloudinary/Airtable item images, and the MyFatoorah
// embedded payment widget (script + iframe + its API). 'unsafe-inline' is required
// because Next.js App Router injects inline hydration scripts/styles and is not
// wired for nonces here — so this CSP is defense-in-depth (clickjacking, base-uri,
// object-src, source allow-listing), not a full XSS guard.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "img-src 'self' data: blob: https://res.cloudinary.com https://*.airtable.com https://dl.airtableusercontent.com",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' https://*.myfatoorah.com https://applepay.cdn-apple.com",
  "connect-src 'self' https://*.erlume.com.kw https://*.myfatoorah.com",
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
