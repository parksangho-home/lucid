import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function isOwner() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return !error && Boolean(user && process.env.DASHBOARD_OWNER_UUID && user.id === process.env.DASHBOARD_OWNER_UUID);
}

export async function GET() {
  try {
    const [owner, result] = await Promise.all([
      isOwner(),
      createAdminClient().from("project_notes").select("id,title,category,body,created_at,updated_at").order("created_at", { ascending: false }).limit(500),
    ]);
    if (result.error) throw result.error;
    return Response.json({ notes: result.data, owner }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "글을 불러오지 못했습니다." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!await isOwner()) return Response.json({ error: "권한이 없습니다." }, { status: 403 });
  try {
    const input = await request.json();
    const title = typeof input.title === "string" ? input.title.trim() : "";
    const category = typeof input.category === "string" ? input.category.trim() : "";
    const body = typeof input.body === "string" ? input.body.trim() : "";
    if (!title || title.length > 160 || !category || category.length > 50 || !body || body.length > 30000)
      return Response.json({ error: "제목, 분류, 본문을 확인해 주세요." }, { status: 400 });
    const { data, error } = await createAdminClient().from("project_notes").insert({ title, category, body }).select().single();
    if (error) throw error;
    return Response.json({ note: data }, { status: 201 });
  } catch {
    return Response.json({ error: "저장에 실패했습니다." }, { status: 500 });
  }
}
