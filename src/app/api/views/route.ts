import { requireAdmin, unauthorized } from "@/lib/admin";
import { getPageViews, incrementPageViews } from "@/lib/views";
import { getServiceSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!requireAdmin(request)) {
    return unauthorized();
  }

  try {
    const supabase = getServiceSupabase();
    const pageViews = await getPageViews(supabase);
    return Response.json({ page_views: pageViews });
  } catch {
    return Response.json({ error: "חסר חיבור לסופאבייס" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const supabase = getServiceSupabase();
    const pageViews = await incrementPageViews(supabase);
    return Response.json({ page_views: pageViews });
  } catch {
    return Response.json({ error: "חסר חיבור לסופאבייס" }, { status: 500 });
  }
}
