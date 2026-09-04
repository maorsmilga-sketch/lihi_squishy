import { enterRaffle } from "@/lib/raffle";
import { getServiceSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { name?: string; phone?: string }
    | null;

  const name = body?.name?.trim() ?? "";
  const phone = body?.phone?.trim() ?? "";

  if (!name) {
    return Response.json({ error: "צריך לכתוב שם כדי להשתתף" }, { status: 400 });
  }

  try {
    const supabase = getServiceSupabase();
    const entry = await enterRaffle(supabase, { name, phone });
    return Response.json(
      { entry: { id: entry.id, name: entry.name, created_at: entry.created_at } },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ההרשמה נכשלה";
    const status = /כבר נרשם|הסתיימה|אין הגרלה/.test(message) ? 409 : 400;
    return Response.json({ error: message }, { status });
  }
}
