import { DashboardError } from "./domain.ts";
export const PRIVATE_HEADERS = {"Cache-Control": "private, no-store", Vary: "Cookie"};
export function dashboardFailure(error: unknown) {
  const e = error instanceof DashboardError ? error : new DashboardError(503, "unavailable", "Dashboard 요청을 완료하지 못했습니다.");
  return Response.json({error: e.message, code: e.code}, {status: e.status, headers: PRIVATE_HEADERS});
}
export function requireMutation(request: Request) {
  const url = new URL(request.url);
  // NextRequest normalizes loopback IPs to localhost. Compare the browser's actual Host,
  // without trusting a client-provided forwarded host or weakening same-origin checks.
  const host = request.headers.get("host") ?? url.host;
  if (!host || /[\s/\\@?#,]/.test(host) || request.headers.get("origin") !== new URL(url.protocol + "//" + host).origin ||
      (request.method !== "DELETE" && request.headers.get("content-type")?.split(";")[0] !== "application/json"))
    throw new DashboardError(403, "invalid_origin", "동일한 LucidSpace 화면에서 요청해 주세요.");
}
export async function readNoteJson(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new DashboardError(400, "invalid_input", "입력 내용이 없습니다.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const item = await reader.read();
    if (item.done) break;
    size += item.value.length;
    if (size > 512 * 1024) { await reader.cancel(); throw new DashboardError(413, "too_large", "입력 내용이 너무 큽니다."); }
    chunks.push(item.value);
  }
  const data = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) {data.set(chunk, offset); offset += chunk.length;}
  try {return JSON.parse(new TextDecoder("utf-8", {fatal: true}).decode(data)) as unknown;}
  catch {throw new DashboardError(400, "invalid_input", "입력 형식을 확인해 주세요.");}
}
