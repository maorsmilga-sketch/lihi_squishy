import { requireAdmin, unauthorized } from "@/lib/admin";
import {
  createRaffle,
  loadRaffleAndDraw,
  toAdminState,
  toPublicState,
} from "@/lib/raffle";
import { getServiceSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const isAdmin = Boolean(requireAdmin(request));

  try {
    const supabase = getServiceSupabase();
    const stored = await loadRaffleAndDraw(supabase);
    if (!stored) {
      return Response.json({
        raffle: null,
        entries: [],
        entryCount: 0,
        isOpen: false,
        isEnded: false,
      });
    }

    return Response.json(
      isAdmin
        ? toAdminState(stored.raffle, stored.entries)
        : toPublicState(stored.raffle, stored.entries),
    );
  } catch {
    return Response.json({ error: "חסר חיבור לסופאבייס" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!requireAdmin(request)) {
    return unauthorized();
  }

  const body = (await request.json().catch(() => null)) as
    | {
        title?: string;
        description?: string;
        image_url?: string;
        ends_at?: string;
      }
    | null;

  const imageUrl = body?.image_url?.trim();
  const title = body?.title?.trim() || "הגרלת סקווישי";
  const description = body?.description?.trim() || null;
  const endsAt = body?.ends_at?.trim();

  if (!imageUrl || !endsAt) {
    return Response.json({ error: "חסרים תמונה או זמן סיום" }, { status: 400 });
  }

  const endsDate = new Date(endsAt);
  if (Number.isNaN(endsDate.getTime()) || endsDate.getTime() <= Date.now()) {
    return Response.json({ error: "זמן הסיום צריך להיות בעתיד" }, { status: 400 });
  }

  try {
    const supabase = getServiceSupabase();
    const raffle = await createRaffle(supabase, {
      title,
      description,
      image_url: imageUrl,
      ends_at: endsDate.toISOString(),
    });
    return Response.json({ raffle }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "לא הצלחנו לפתוח הגרלה";
    const status = message.includes("כבר הגרלה") ? 409 : 500;
    return Response.json({ error: message }, { status });
  }
}
