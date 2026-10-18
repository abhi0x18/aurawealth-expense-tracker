/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // We already run strict tsc in our automated testing and verification pipeline
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
