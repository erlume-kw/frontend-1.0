import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Item images come from external hosts (Cloudinary, legacy Airtable links) —
  // plain <img> is used for exact visual parity with the previous app,
  // so no remotePatterns config is needed.
  reactStrictMode: false,
};

export default withNextIntl(nextConfig);
