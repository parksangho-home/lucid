import type { SupabaseClient } from "@supabase/supabase-js";
import { DashboardError, noteId, searchPattern, type StudyNote, type NoteInput } from "./domain.ts";
type Context = {client: SupabaseClient; userId: string};
const columns = "id,user_id,title,body,category,bookmarked,created_at,updated_at";
function dbError(error: {code?: string} | null) {
  if (!error) return;
  if (["42P01", "PGRST205", "42501"].includes(error.code ?? ""))
    throw new DashboardError(503, "database_setup_required", "study_notes 테이블 SQL 적용·권한 설정이 필요합니다.");
  throw new DashboardError(503, "storage_unavailable", "저장소 요청을 완료하지 못했습니다. 입력 내용은 그대로 유지됩니다.");
}
export async function listNotes({client, userId}: Context, params: URLSearchParams) {
  const page = Number(params.get("page") ?? "0");
  if (!Number.isInteger(page) || page < 0 || page > 10000) throw new DashboardError(400, "invalid_input", "목록 요청을 확인해 주세요.");
  let query = client.from("study_notes").select(columns, {count: "exact"}).eq("user_id", userId);
  const search = params.get("q")?.trim();
  const category = params.get("category");
  if (search) { const value = searchPattern(search); query = query.or("title.ilike." + value + ",body.ilike." + value); }
  if (category) query = query.eq("category", category);
  if (params.get("bookmarked") === "true") query = query.eq("bookmarked", true);
  const result = await query.order("updated_at", {ascending: false}).order("id").range(page * 30, page * 30 + 29);
  dbError(result.error);
  return {notes: result.data as StudyNote[], count: result.count ?? 0};
}
export async function getNote({client, userId}: Context, id: string) {
  const result = await client.from("study_notes").select(columns).eq("user_id", userId).eq("id", noteId(id)).maybeSingle();
  dbError(result.error);
  if (!result.data) throw new DashboardError(404, "not_found", "자료를 찾을 수 없습니다.");
  return result.data as StudyNote;
}
export async function createNote({client, userId}: Context, input: NoteInput) {
  const result = await client.from("study_notes").insert({...input, user_id: userId}).select(columns).single();
  dbError(result.error);
  if (!result.data) throw new DashboardError(503, "storage_unavailable", "저장을 확인할 수 없습니다.");
  return result.data as StudyNote;
}
export async function updateNote({client, userId}: Context, id: string, input: Partial<NoteInput>) {
  const result = await client.from("study_notes").update({...input, updated_at: new Date().toISOString()})
    .eq("user_id", userId).eq("id", noteId(id)).select(columns).maybeSingle();
  dbError(result.error);
  if (!result.data) throw new DashboardError(404, "not_found", "자료를 찾을 수 없습니다.");
  return result.data as StudyNote;
}
export async function deleteNote({client, userId}: Context, id: string) {
  const result = await client.from("study_notes").delete().eq("user_id", userId).eq("id", noteId(id)).select("id").maybeSingle();
  dbError(result.error);
  if (!result.data) throw new DashboardError(404, "not_found", "자료를 찾을 수 없습니다.");
}
