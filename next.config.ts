import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const upstream = process.env.DASHBOARD_UPSTREAM_ORIGIN || (process.env.NODE_ENV !== "production" ? "http://127.0.0.1:3001" : undefined);
    if (!upstream) return [];
    const parsed = new URL(upstream);
    if (parsed.origin !== upstream || parsed.username || parsed.password || (parsed.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(parsed.hostname)))) throw new Error("Invalid Dashboard upstream origin");
    return [{ source: "/dashboard", destination: upstream + "/dashboard" }, { source: "/dashboard/:path*", destination: upstream + "/dashboard/:path*" }];
  }
};

export default nextConfig;
