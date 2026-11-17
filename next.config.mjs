/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  // undici is only used server-side to reach the LLM API through an HTTPS proxy.
  experimental: { serverComponentsExternalPackages: ["undici"] },
};
export default nextConfig;
