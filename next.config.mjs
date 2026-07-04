/** @type {import('next').NextConfig} */
const nextConfig = {
  // Item images come from external hosts (Cloudinary, legacy Airtable links) —
  // plain <img> is used for exact visual parity with the previous app,
  // so no remotePatterns config is needed.
  reactStrictMode: false,
};

export default nextConfig;
