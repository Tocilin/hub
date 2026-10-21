import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  typedRoutes: true,
  // Pin the workspace root; stray lockfiles in parent folders would otherwise confuse Turbopack.
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
