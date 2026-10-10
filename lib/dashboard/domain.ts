export class DashboardError extends Error {
  status: number; code: string; constructor(status: number, code: string, message: string) { super(message); this.status = status; this.code = code; }
}
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export type StudyNote = {
  id: string; user_id: string; title: string; body: string; category: string;
  bookmarked: boolean; created_at: string; updated_at: string;
};
export type NoteInput = Pick<StudyNote, "title" | "body" | "category" | "bookmarked">;
export function noteId(id: string) {
  if (!UUID.test(id)) throw new DashboardError(404, "not_found", "자료를 찾을 수 없습니다.");
  return id;
}
export function noteInput(value: unknown, partial = false): Partial<NoteInput> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new DashboardError(400, "invalid_input", "입력 내용을 확인해 주세요.");
  const input = value as Record<string, unknown>;
  const allowed = ["title", "body", "category", "bookmarked"];
  if (!Object.keys(input).length || Object.keys(input).some(k => !allowed.includes(k)))
    throw new DashboardError(400, "invalid_input", "허용되지 않은 입력입니다.");
  const result: Partial<NoteInput> = {};
  for (const [key, max] of [["title", 200], ["body", 100000], ["category", 80]] as const) {
    const present = Object.hasOwn(input, key);
    const raw = present ? input[key] : (!partial && key === "category" ? "기타" : undefined);
    if (!present && partial) continue;
    if (typeof raw !== "string" || !raw.trim() || raw.length > max)
      throw new DashboardError(400, "invalid_input", "제목·본문·카테고리의 길이를 확인해 주세요.");
    result[key] = key === "body" ? raw : raw.trim();
  }
  if (!partial || input.bookmarked !== undefined) {
    const value = Object.hasOwn(input, "bookmarked") ? input.bookmarked : false;
    if (typeof value !== "boolean") throw new DashboardError(400, "invalid_input", "북마크 값을 확인해 주세요.");
    result.bookmarked = value;
  }
  return result;
}
export function searchPattern(query: string) {
  if (query.length > 200) throw new DashboardError(400, "invalid_input", "검색어는 200자 이하로 입력해 주세요.");
  // Quote PostgREST syntax and escape LIKE wildcards; input cannot add filters.
  return JSON.stringify("%" + query.replace(/[\\%_]/g, "\\$&") + "%");
}
export function safeMarkdownUrl(value: string) {
  if (!value || /[\u0000-\u0020\u007f]/.test(value)) return "";
  if (value.startsWith("#") || (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\"))) return value;
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? value : ""; } catch { return ""; }
}
