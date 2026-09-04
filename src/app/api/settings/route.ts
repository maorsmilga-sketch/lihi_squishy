import { requireAdmin, unauthorized } from "@/lib/admin";
import { getPublicSupabase } from "@/lib/supabase/client";
import { getServiceSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getPublicSupabase();
  if (!supabase) {
    return Response.json({
      settings: { id: 1, about_text: "" },
    });
  }

  const { data, error } = await supabase
    .from("settings")
    .select("id, about_text")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    return Response.json({ error: "לא הצלחנו לטעון את עמוד עלינו" }, { status: 500 });
  }

  return Response.json({
    settings: data ?? { id: 1, about_text: "" },
  });
}

export async function PUT(request: Request) {
  if (!requireAdmin(request)) {
    return unauthorized();
  }

  const body = (await request.json().catch(() => null)) as
    | { about_text?: string }
    | null;
  const aboutText = body?.about_text ?? "";

  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("settings")
      .upsert({ id: 1, about_text: aboutText })
      .select("id, about_text")
      .single();

    if (error) {
      return Response.json({ error: "לא הצלחנו לשמור את הטקסט" }, { status: 500 });
    }

    return Response.json({ settings: data });
  } catch {
    return Response.json({ error: "חסר חיבור לסופאבייס" }, { status: 500 });
  }
}
