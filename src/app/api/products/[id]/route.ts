import { requireAdmin, unauthorized } from "@/lib/admin";
import { removeProductCategory, upsertProductCategory } from "@/lib/category-map";
import { ADMIN_PRODUCT_COLUMNS } from "@/lib/products";
import { loadStockMap, removeProductStock, upsertProductStock } from "@/lib/stock-map";
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
        stock?: number | string;
        sold?: boolean;
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
  if (body?.stock !== undefined) {
    const stock = Number(body.stock);
    if (Number.isNaN(stock) || stock < 0) {
      return Response.json({ error: "כמות לא תקינה" }, { status: 400 });
    }
    patch.stock = Math.floor(stock);
  }

  try {
    const supabase = getServiceSupabase();
    const categoryValue =
      body?.category !== undefined ? body.category.trim() || null : undefined;

    if (body?.sold) {
      const current = await supabase
        .from("products")
        .select("id, stock")
        .eq("id", id)
        .maybeSingle();
      const currentStock =
        typeof current.data?.stock === "number" ? current.data.stock : undefined;
      if (currentStock !== undefined) {
        patch.stock = Math.max(0, currentStock - 1);
      } else {
        const map = await loadStockMap(supabase);
        const mapped = map[id] ?? 1;
        patch.stock = Math.max(0, mapped - 1);
      }
    }

    let { data, error } = await supabase
      .from("products")
      .update(patch)
      .eq("id", id)
      .select(ADMIN_PRODUCT_COLUMNS)
      .single();

    if (error && /stock/i.test(error.message)) {
      const withoutStock = { ...patch };
      delete withoutStock.stock;
      if (Object.keys(withoutStock).length === 0) {
        const existing = await supabase
          .from("products")
          .select("id, image_url, price, description, category, external_link, created_at")
          .eq("id", id)
          .single();
        data = existing.data
          ? { ...existing.data, stock: typeof patch.stock === "number" ? patch.stock : 1 }
          : null;
        error = existing.error;
      } else {
        const retry = await supabase
          .from("products")
          .update(withoutStock)
          .eq("id", id)
          .select("id, image_url, price, description, category, external_link, created_at")
          .single();
        data = retry.data
          ? { ...retry.data, stock: typeof patch.stock === "number" ? patch.stock : 1 }
          : null;
        error = retry.error;
      }
    }

    if (error && /category/i.test(error.message)) {
      const withoutCategory = { ...patch };
      delete withoutCategory.category;
      delete withoutCategory.stock;
      const retry = await supabase
        .from("products")
        .update(withoutCategory)
        .eq("id", id)
        .select("id, image_url, price, description, external_link, created_at")
        .single();
      data = retry.data
        ? { ...retry.data, category: categoryValue ?? null, stock: typeof patch.stock === "number" ? patch.stock : 1 }
        : null;
      error = retry.error;
    }

    if (error || !data) {
      return Response.json({ error: "לא הצלחנו לעדכן את הסקווישי" }, { status: 500 });
    }

    if (categoryValue !== undefined) {
      await upsertProductCategory(supabase, id, categoryValue);
    }
    if (typeof patch.stock === "number") {
      await upsertProductStock(supabase, id, patch.stock);
    }

    return Response.json({
      product: {
        ...data,
        category: categoryValue !== undefined ? categoryValue : data.category,
        stock: typeof patch.stock === "number" ? patch.stock : (data.stock ?? 1),
      },
    });
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

    await removeProductCategory(supabase, id);
    await removeProductStock(supabase, id);

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "חסר חיבור לסופאבייס" }, { status: 500 });
  }
}
