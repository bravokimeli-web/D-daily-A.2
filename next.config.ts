import type { NextConfig } from "next";

const apiHost = (() => {
  try {
    const url = process.env.NEXT_PUBLIC_API_URL ?? "https://api.ddaily.co.ke/api";
    return new URL(url.replace(/\/api\/?$/, "") || "https://api.ddaily.co.ke").hostname;
  } catch {
    return "api.ddaily.co.ke";
  }
})();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    dirs: ["src/app", "src/components", "src/lib", "src/views", "src/hooks", "src/store"],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: apiHost, pathname: "/uploads/**" },
      { protocol: "https", hostname: "api.ddaily.co.ke", pathname: "/uploads/**" },
      { protocol: "https", hostname: "d-daily-e-commerce-backend.onrender.com", pathname: "/uploads/**" },
      { protocol: "https", hostname: "www.ddaily.co.ke" },
    { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];
    return [
      { source: "/api/:path*", destination: "http://localhost:5000/api/:path*" },
      { source: "/uploads/:path*", destination: "http://localhost:5000/uploads/:path*" },
    ];
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate, public, max-age=0",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
    ];
  },
};

export default nextConfig;
