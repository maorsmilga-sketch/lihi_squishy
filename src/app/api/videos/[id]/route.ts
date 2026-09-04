import { requireAdmin, unauthorized } from "@/lib/admin";
import { getServiceSupabase } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  if (!requireAdmin(request)) {
    return unauthorized();
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as
    | { video_url?: string; title?: string }
    | null;

  const patch: Record<string, unknown> = {};
  if (typeof body?.video_url === "string" && body.video_url.trim()) {
    patch.video_url = body.video_url.trim();
  }
  if (typeof body?.title === "string" && body.title.trim()) {
    patch.title = body.title.trim();
  }

  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("videos")
      .update(patch)
      .eq("id", id)
      .select("id, video_url, title, created_at")
      .single();

    if (error) {
      return Response.json({ error: "לא הצלחנו לעדכן את הסרטון" }, { status: 500 });
    }

    return Response.json({ video: data });
  } catch {
    return Response.json({ error: "חסר חיבור לסופאבייס" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!requireAdmin(request)) {
    return unauthorized();
  }

  const { id } = await context.params;

  try {
    const supabase = getServiceSupabase();
    const { error } = await supabase.from("videos").delete().eq("id", id);

    if (error) {
      return Response.json({ error: "לא הצלחנו למחוק את הסרטון" }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "חסר חיבור לסופאבייס" }, { status: 500 });
  }
}
