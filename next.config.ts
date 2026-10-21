import type { NextConfig } from "next";

/**
 * Security headers for every response. The CSP is intentionally minimal: a strict
 * `script-src` would need per-request nonces for Next.js and next-themes inline scripts,
 * which forces dynamic rendering everywhere. HUB renders no user-generated HTML, so the
 * policy focuses on framing, plugins, form targets and base-URL hijacking.
 */
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  typedRoutes: true,
  // Pin the workspace root; stray lockfiles in parent folders would otherwise confuse Turbopack.
  turbopack: { root: import.meta.dirname },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
