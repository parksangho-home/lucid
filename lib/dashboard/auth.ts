import { createClient } from "../supabase/server.ts";
import { dashboardMode } from "./routing.ts";
import { DashboardError } from "./domain.ts";
import { verifyDashboardOwner } from "./auth-policy.ts";
export async function requireDashboardOwner(expected?: string | null) {
  if (dashboardMode() !== "internal") throw new DashboardError(404, "not_available", "내부 Dashboard가 활성화되지 않았습니다.");
  const client = await createClient();
  const identity = await verifyDashboardOwner(client.auth, process.env.DASHBOARD_OWNER_UUID);
  if (expected && expected !== identity.id) throw new DashboardError(401, "session_changed", "로그인 계정이 변경되었습니다.");
  try {
    const result = await client.rpc("dashboard_session_active").abortSignal(AbortSignal.timeout(5000));
    if (result.error) throw new DashboardError(503, "auth_unavailable", "활성 세션을 확인할 수 없습니다.");
    if (result.data !== true) throw new DashboardError(401, "unauthenticated", "로그인 세션이 종료되었습니다.");
    const proof = await client.auth.getClaims();
    if (proof.error || proof.data?.claims.sub !== identity.id || proof.data?.claims.session_id !== identity.sessionId)
      throw new DashboardError(401, "session_changed", "로그인 세션이 변경되었습니다.");
  } catch (error) {
    if (error instanceof DashboardError) throw error;
    throw new DashboardError(503, "auth_unavailable", "활성 세션을 확인할 수 없습니다.");
  }
  return {client, userId: identity.id};
}
