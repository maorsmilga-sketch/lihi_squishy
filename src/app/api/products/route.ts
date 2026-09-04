import { requireAdmin, unauthorized } from "@/lib/admin";
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
    const { data, error } = await supabase
      .from("products")
      .insert({
        image_url: imageUrl,
        price,
        description,
        category,
        external_link: externalLink,
      })
      .select(ADMIN_PRODUCT_COLUMNS)
      .single();

    if (error) {
      const needsCategoryColumn = /category/i.test(error.message);
      return Response.json(
        {
          error: needsCategoryColumn
            ? "חסרה עמודת קטגוריה. הריצו את supabase/add-category.sql בסופאבייס"
            : "לא הצלחנו לשמור את הסקווישי",
        },
        { status: 500 },
      );
    }

    return Response.json({ product: data }, { status: 201 });
  } catch {
    return Response.json({ error: "חסר חיבור לסופאבייס" }, { status: 500 });
  }
}
