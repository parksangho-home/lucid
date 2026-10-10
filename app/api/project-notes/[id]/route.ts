import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function isOwner() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return !error && Boolean(user && process.env.DASHBOARD_OWNER_UUID && user.id === process.env.DASHBOARD_OWNER_UUID);
}
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, context: Context) {
  if (!await isOwner()) return Response.json({ error: "권한이 없습니다." }, { status: 403 });
  const { id } = await context.params;
  if (!/^\d+$/.test(id)) return Response.json({ error: "잘못된 글 번호입니다." }, { status: 400 });
  try {
    const input = await request.json();
    const title = typeof input.title === "string" ? input.title.trim() : "";
    const category = typeof input.category === "string" ? input.category.trim() : "";
    const body = typeof input.body === "string" ? input.body.trim() : "";
    if (!title || title.length > 160 || !category || category.length > 50 || !body || body.length > 30000)
      return Response.json({ error: "입력 내용을 확인해 주세요." }, { status: 400 });
    const { data, error } = await createAdminClient().from("project_notes")
      .update({ title, category, body, updated_at: new Date().toISOString() }).eq("id", id).select().maybeSingle();
    if (error) throw error;
    if (!data) return Response.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });
    return Response.json({ note: data });
  } catch {
    return Response.json({ error: "수정에 실패했습니다." }, { status: 500 });
  }
}
export async function DELETE(_request: Request, context: Context) {
  if (!await isOwner()) return Response.json({ error: "권한이 없습니다." }, { status: 403 });
  const { id } = await context.params;
  if (!/^\d+$/.test(id)) return Response.json({ error: "잘못된 글 번호입니다." }, { status: 400 });
  const { error } = await createAdminClient().from("project_notes").delete().eq("id", id);
  if (error) return Response.json({ error: "삭제에 실패했습니다." }, { status: 500 });
  return new Response(null, { status: 204 });
}
