import type { NextConfig } from "next";
import { dashboardRewrites } from "./lib/dashboard/routing.ts";
const nextConfig: NextConfig = {
  async rewrites() {
    // Legacy zone must run before filesystem routes until the internal app is explicitly enabled in production.
    return {beforeFiles: dashboardRewrites(), afterFiles: [], fallback: []};
  },
};
export default nextConfig;
