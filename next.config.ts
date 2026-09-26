import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          // Forces browsers to use HTTPS
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // Prevents Clickjacking attacks (embedding your site in an iframe)
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Prevents MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Protects referrer data from leaking to cross-origin sites
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Disables unnecessary browser APIs
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
