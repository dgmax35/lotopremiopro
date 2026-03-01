import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/api/**/*': ['./src/data/cache/**/*'],
  },
};

export default nextConfig;
