export function dashboardMode(env: Record<string, string | undefined> = process.env) {
  const mode = env.DASHBOARD_ROUTING_MODE ?? (env.NODE_ENV === "production" ? "legacy" : "internal");
  if (mode !== "internal" && mode !== "legacy") throw new Error("Invalid Dashboard routing mode");
  return mode;
}
export function dashboardRewrites(env: Record<string, string | undefined> = process.env) {
  if (dashboardMode(env) === "internal") return [];
  const upstream = env.DASHBOARD_UPSTREAM_ORIGIN || (env.NODE_ENV !== "production" ? "http://127.0.0.1:3001" : undefined);
  if (!upstream) return [];
  const parsed = new URL(upstream);
  if (parsed.origin !== upstream || parsed.username || parsed.password ||
    (parsed.protocol !== "https:" && !(env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(parsed.hostname))))
    throw new Error("Invalid Dashboard upstream origin");
  return [{source: "/dashboard", destination: upstream + "/dashboard"},
    {source: "/dashboard/:path*", destination: upstream + "/dashboard/:path*"}];
}
