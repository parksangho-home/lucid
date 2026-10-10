import { DashboardError, UUID } from "./domain.ts";
export type UserAuth = {
  getClaims: () => Promise<{data: {claims: Record<string, unknown>} | null; error: {status?: number} | null}>;
  getUser: () => Promise<{data: {user: {id: string; email_confirmed_at?: string; identities?: {provider: string}[]} | null}; error: {status?: number} | null}>;
};
export async function verifyDashboardOwner(auth: UserAuth, owner: string | undefined, now = Date.now()) {
  try {
    const proof = await auth.getClaims();
    const c = proof.data?.claims;
    if (proof.error || !c) {
      if (proof.error && (!proof.error.status || proof.error.status >= 500)) throw new DashboardError(503, "auth_unavailable", "인증 서비스를 확인할 수 없습니다.");
      throw new DashboardError(401, "unauthenticated", "LucidSpace 상단에서 Google 로그인해 주세요.");
    }
    if (c.iss !== "https://gcjjktxhypwjnnwkpaxt.supabase.co/auth/v1" || c.role !== "authenticated" || c.aud !== "authenticated" ||
      typeof c.exp !== "number" || c.exp * 1000 <= now || typeof c.sub !== "string" || !UUID.test(c.sub) ||
      typeof c.session_id !== "string" || !UUID.test(c.session_id))
      throw new DashboardError(401, "unauthenticated", "로그인 상태를 다시 확인해 주세요.");
    const result = await auth.getUser();
    if (result.error && (!result.error.status || result.error.status >= 500))
      throw new DashboardError(503, "auth_unavailable", "인증 서비스를 확인할 수 없습니다.");
    const user = result.data.user;
    if (result.error || !user || user.id !== c.sub) throw new DashboardError(401, "unauthenticated", "로그인 상태를 다시 확인해 주세요.");
    if (!owner || !UUID.test(owner)) throw new DashboardError(503, "setup_required", "Dashboard 본인 UUID 설정이 필요합니다.");
    if (user.id !== owner || !user.email_confirmed_at || !user.identities?.some(i => i.provider === "google"))
      throw new DashboardError(403, "forbidden", "본인 Google 계정만 Dashboard를 이용할 수 있습니다.");
    return {id: user.id, sessionId: c.session_id};
  } catch (error) {
    if (error instanceof DashboardError) throw error;
    throw new DashboardError(503, "auth_unavailable", "인증 서비스를 확인할 수 없습니다.");
  }
}
