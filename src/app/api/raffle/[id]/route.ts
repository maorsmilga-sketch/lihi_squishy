import { requireAdmin, unauthorized } from "@/lib/admin";
import { deleteRaffle, updateRaffle } from "@/lib/raffle";
import { getServiceSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  if (!requireAdmin(request)) {
    return unauthorized();
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as
    | {
        title?: string;
        description?: string;
        image_url?: string;
        ends_at?: string;
      }
    | null;

  const patch: {
    title?: string;
    description?: string | null;
    image_url?: string;
    ends_at?: string;
  } = {};

  if (typeof body?.title === "string" && body.title.trim()) {
    patch.title = body.title.trim();
  }
  if (body?.description !== undefined) {
    patch.description = body.description.trim() || null;
  }
  if (typeof body?.image_url === "string" && body.image_url.trim()) {
    patch.image_url = body.image_url.trim();
  }
  if (typeof body?.ends_at === "string" && body.ends_at.trim()) {
    const endsDate = new Date(body.ends_at);
    if (Number.isNaN(endsDate.getTime())) {
      return Response.json({ error: "זמן סיום לא תקין" }, { status: 400 });
    }
    patch.ends_at = endsDate.toISOString();
  }

  try {
    const supabase = getServiceSupabase();
    const raffle = await updateRaffle(supabase, id, patch);
    return Response.json({ raffle });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "לא הצלחנו לעדכן את ההגרלה";
    const status = message.includes("לא נמצאה") ? 404 : 400;
    return Response.json({ error: message }, { status });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!requireAdmin(request)) {
    return unauthorized();
  }

  const { id } = await context.params;

  try {
    const supabase = getServiceSupabase();
    await deleteRaffle(supabase, id);
    return Response.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "לא הצלחנו למחוק את ההגרלה";
    return Response.json({ error: message }, { status: 500 });
  }
}
