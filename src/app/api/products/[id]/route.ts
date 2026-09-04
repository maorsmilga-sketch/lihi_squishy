import { requireAdmin, unauthorized } from "@/lib/admin";
import { ADMIN_PRODUCT_COLUMNS } from "@/lib/products";
import { getServiceSupabase } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  if (!requireAdmin(request)) {
    return unauthorized();
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as
    | {
        image_url?: string;
        price?: number | string;
        description?: string;
        category?: string;
        external_link?: string;
      }
    | null;

  const patch: Record<string, unknown> = {};

  if (typeof body?.image_url === "string" && body.image_url.trim()) {
    patch.image_url = body.image_url.trim();
  }
  if (body?.price !== undefined) {
    const price = Number(body.price);
    if (Number.isNaN(price) || price < 0) {
      return Response.json({ error: "מחיר לא תקין" }, { status: 400 });
    }
    patch.price = price;
  }
  if (body?.description !== undefined) {
    patch.description = body.description.trim() || null;
  }
  if (body?.category !== undefined) {
    patch.category = body.category.trim() || null;
  }
  if (body?.external_link !== undefined) {
    patch.external_link = body.external_link.trim() || null;
  }

  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("products")
      .update(patch)
      .eq("id", id)
      .select(ADMIN_PRODUCT_COLUMNS)
      .single();

    if (error) {
      const needsCategoryColumn = /category/i.test(error.message);
      return Response.json(
        {
          error: needsCategoryColumn
            ? "חסרה עמודת קטגוריה. הריצו את supabase/add-category.sql בסופאבייס"
            : "לא הצלחנו לעדכן את הסקווישי",
        },
        { status: 500 },
      );
    }

    return Response.json({ product: data });
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
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      return Response.json({ error: "לא הצלחנו למחוק את הסקווישי" }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "חסר חיבור לסופאבייס" }, { status: 500 });
  }
}
