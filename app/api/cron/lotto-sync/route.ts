import { syncLotto } from "@/lib/lotto/sync";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return Response.json(
      { ok: false, error: "Supabase is not configured." },
      { status: 503 },
    );
  }

  try {
    const result = await syncLotto("incremental");
    return Response.json({ ok: true, ...result });
  } catch (error) {
    console.error("LOTTO cron sync failed", error);
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
