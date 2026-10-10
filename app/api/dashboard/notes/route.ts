import { requireDashboardOwner } from "../../../../lib/dashboard/auth.ts";
import { noteInput, type NoteInput } from "../../../../lib/dashboard/domain.ts";
import { listNotes, createNote } from "../../../../lib/dashboard/notes.ts";
import { PRIVATE_HEADERS, dashboardFailure, requireMutation, readNoteJson } from "../../../../lib/dashboard/http.ts";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const owner = await requireDashboardOwner(request.headers.get("x-dashboard-user"));
    return Response.json(await listNotes(owner, new URL(request.url).searchParams), {headers: PRIVATE_HEADERS});
  } catch (error) {return dashboardFailure(error);}
}
export async function POST(request: Request) {
  try {
    requireMutation(request);
    await requireDashboardOwner(request.headers.get("x-dashboard-user"));
    const input = noteInput(await readNoteJson(request)) as NoteInput;
    const owner = await requireDashboardOwner(request.headers.get("x-dashboard-user"));
    return Response.json({note: await createNote(owner, input)}, {status: 201, headers: PRIVATE_HEADERS});
  } catch (error) {return dashboardFailure(error);}
}
