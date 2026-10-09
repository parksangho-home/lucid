import { cookies } from "next/headers";
export const dynamic = "force-dynamic";
export async function GET() {
  const headers = new Headers({ "Cache-Control": "private, no-store", Vary: "Cookie" });
  let authorized = false;
  try {
    const upstream = process.env.DASHBOARD_UPSTREAM_ORIGIN || (process.env.NODE_ENV !== "production" ? "http://127.0.0.1:3001" : undefined);
    if (!upstream) return Response.json({ authorized }, { headers });
    const parsed = new URL(upstream);
    if (parsed.origin !== upstream || parsed.username || parsed.password || (parsed.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(parsed.hostname)))) throw new Error("Invalid Dashboard upstream");
    const store = await cookies();
    const cookie = store.getAll().filter(c => /^sb-gcjjktxhypwjnnwkpaxt-auth-token(?:\.\d+)?$/.test(c.name)).map(c => c.name + "=" + c.value).join("; ");
    if (!cookie) return Response.json({ authorized }, { headers });
    const response = await fetch(upstream + "/dashboard/api/v1/session", {
      headers: { Cookie: cookie }, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8000)
    });
    for (const value of response.headers.getSetCookie()) headers.append("Set-Cookie", value);
    if (response.ok) {
      const result = await response.json();
      authorized = result.state === "authenticated" && result.storageReady === true && typeof result.userId === "string";
    }
  } catch { authorized = false; }
  return Response.json({ authorized }, { headers });
}
