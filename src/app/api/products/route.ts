import { requireAdmin, unauthorized } from "@/lib/admin";
import { upsertProductCategory } from "@/lib/category-map";
import { selectProducts } from "@/lib/data";
import { ADMIN_PRODUCT_COLUMNS } from "@/lib/products";
import { getPublicSupabase } from "@/lib/supabase/client";
import { getServiceSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const isAdmin = Boolean(requireAdmin(request));

  if (isAdmin) {
    try {
      const supabase = getServiceSupabase();
      const products = await selectProducts(supabase, true);
      return Response.json({ products });
    } catch {
      return Response.json({ error: "חסר חיבור לסופאבייס" }, { status: 500 });
    }
  }

  const supabase = getPublicSupabase();
  if (!supabase) {
    return Response.json({ products: [] });
  }

  const products = await selectProducts(supabase, false);
  return Response.json({ products });
}

export async function POST(request: Request) {
  if (!requireAdmin(request)) {
    return unauthorized();
  }

  const body = (await request.json().catch(() => null)) as
    | {
        image_url?: string;
        price?: number | string;
        description?: string;
        category?: string;
        external_link?: string;
      }
    | null;

  const imageUrl = body?.image_url?.trim();
  const price = Number(body?.price);
  const description = body?.description?.trim() || null;
  const category = body?.category?.trim() || null;
  const externalLink = body?.external_link?.trim() || null;

  if (!imageUrl || Number.isNaN(price) || price < 0) {
    return Response.json({ error: "חסרים תמונה או מחיר תקין" }, { status: 400 });
  }

  try {
    const supabase = getServiceSupabase();
    const row = {
      image_url: imageUrl,
      price,
      description,
      category,
      external_link: externalLink,
    };

    let { data, error } = await supabase
      .from("products")
      .insert(row)
      .select(ADMIN_PRODUCT_COLUMNS)
      .single();

    if (error && /category/i.test(error.message)) {
      const withoutCategory = {
        image_url: row.image_url,
        price: row.price,
        description: row.description,
        external_link: row.external_link,
      };
      const retry = await supabase
        .from("products")
        .insert(withoutCategory)
        .select("id, image_url, price, description, external_link, created_at")
        .single();
      data = retry.data
        ? { ...retry.data, category }
        : null;
      error = retry.error;
    }

    if (error || !data) {
      return Response.json({ error: "לא הצלחנו לשמור את הסקווישי" }, { status: 500 });
    }

    await upsertProductCategory(supabase, data.id, category);

    return Response.json(
      { product: { ...data, category } },
      { status: 201 },
    );
  } catch {
    return Response.json({ error: "חסר חיבור לסופאבייס" }, { status: 500 });
  }
}
