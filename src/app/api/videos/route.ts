import { requireAdmin, unauthorized } from "@/lib/admin";
import { getPublicSupabase } from "@/lib/supabase/client";
import { getServiceSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getPublicSupabase();
  if (!supabase) {
    return Response.json({ videos: [] });
  }

  const { data, error } = await supabase
    .from("videos")
    .select("id, video_url, title, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: "לא הצלחנו לטעון סרטונים" }, { status: 500 });
  }

  return Response.json({ videos: data ?? [] });
}

export async function POST(request: Request) {
  if (!requireAdmin(request)) {
    return unauthorized();
  }

  const body = (await request.json().catch(() => null)) as
    | { video_url?: string; title?: string }
    | null;

  const videoUrl = body?.video_url?.trim();
  const title = body?.title?.trim();

  if (!videoUrl || !title) {
    return Response.json({ error: "חסרים כותרת או סרטון" }, { status: 400 });
  }

  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("videos")
      .insert({ video_url: videoUrl, title })
      .select("id, video_url, title, created_at")
      .single();

    if (error) {
      return Response.json({ error: "לא הצלחנו לשמור את הסרטון" }, { status: 500 });
    }

    return Response.json({ video: data }, { status: 201 });
  } catch {
    return Response.json({ error: "חסר חיבור לסופאבייס" }, { status: 500 });
  }
}
