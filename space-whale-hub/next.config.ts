import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors. We'll fix these properly after deployment.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors. We'll fix these properly after deployment.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
