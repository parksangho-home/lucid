import { createWeeklyPicks, PickError } from "@/lib/lotto/storage-supabase";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSupabaseConfigured())
    return Response.json(
      { error: "LOTTO LAB 계정 기능이 설정되지 않았습니다." },
      { status: 503 },
    );
  const origin = request.headers.get("origin");
  if (
    !origin ||
    origin !== new URL(request.url).origin ||
    request.headers.get("content-type")?.split(";")[0] !== "application/json"
  ) {
    return Response.json(
      { error: "요청을 확인할 수 없습니다." },
      { status: 403 },
    );
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user)
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  try {
    const games = await createWeeklyPicks(user.id);
    return Response.json({ games }, { status: 201 });
  } catch (error) {
    if (error instanceof PickError)
      return Response.json({ error: error.message }, { status: error.status });
    console.error("Failed to create lotto picks", error);
    return Response.json(
      { error: "추천을 저장하지 못했습니다. 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
