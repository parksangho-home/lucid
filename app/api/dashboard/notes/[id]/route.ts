import { requireDashboardOwner } from "../../../../../lib/dashboard/auth.ts";
import { noteInput } from "../../../../../lib/dashboard/domain.ts";
import { getNote, updateNote, deleteNote } from "../../../../../lib/dashboard/notes.ts";
import { PRIVATE_HEADERS, dashboardFailure, requireMutation, readNoteJson } from "../../../../../lib/dashboard/http.ts";
export const dynamic = "force-dynamic";
type Context = {params: Promise<{id: string}>};
export async function GET(request: Request, context: Context) {
  try {
    const owner = await requireDashboardOwner(request.headers.get("x-dashboard-user"));
    return Response.json({note: await getNote(owner, (await context.params).id)}, {headers: PRIVATE_HEADERS});
  } catch (error) {return dashboardFailure(error);}
}
export async function PATCH(request: Request, context: Context) {
  try {
    requireMutation(request);
    await requireDashboardOwner(request.headers.get("x-dashboard-user"));
    const input = noteInput(await readNoteJson(request), true);
    const owner = await requireDashboardOwner(request.headers.get("x-dashboard-user"));
    return Response.json({note: await updateNote(owner, (await context.params).id, input)}, {headers: PRIVATE_HEADERS});
  } catch (error) {return dashboardFailure(error);}
}
export async function DELETE(request: Request, context: Context) {
  try {
    requireMutation(request);
    const owner = await requireDashboardOwner(request.headers.get("x-dashboard-user"));
    await deleteNote(owner, (await context.params).id);
    return new Response(null, {status: 204, headers: PRIVATE_HEADERS});
  } catch (error) {return dashboardFailure(error);}
}
