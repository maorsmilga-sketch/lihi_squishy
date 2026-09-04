import type { Product } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

const CATEGORY_FILE = "meta/product-categories.json";

function publicCategoryMapUrl() {
  const base = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ""
  ).replace(/\/$/, "");
  if (!base) return null;
  return `${base}/storage/v1/object/public/media/${CATEGORY_FILE}`;
}

export async function loadCategoryMap(
  supabase?: SupabaseClient | null,
): Promise<Record<string, string>> {
  if (supabase) {
    const { data, error } = await supabase.storage
      .from("media")
      .download(CATEGORY_FILE);
    if (!error && data) {
      try {
        const parsed = JSON.parse(await data.text()) as Record<string, string>;
        return parsed && typeof parsed === "object" ? parsed : {};
      } catch {
        return {};
      }
    }
  }

  const url = publicCategoryMapUrl();
  if (!url) return {};

  try {
    const response = await fetch(`${url}?t=${Date.now()}`, {
      cache: "no-store",
    });
    if (!response.ok) return {};
    const parsed = (await response.json()) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function upsertProductCategory(
  supabase: SupabaseClient,
  productId: string,
  category: string | null,
) {
  const map = await loadCategoryMap(supabase);
  if (category) {
    map[productId] = category;
  } else {
    delete map[productId];
  }

  const body = JSON.stringify(map);
  await supabase.storage.from("media").upload(CATEGORY_FILE, Buffer.from(body), {
    upsert: true,
    contentType: "application/json",
  });
}

export async function removeProductCategory(
  supabase: SupabaseClient,
  productId: string,
) {
  await upsertProductCategory(supabase, productId, null);
}

export function mergeProductCategories(
  products: Product[],
  map: Record<string, string>,
): Product[] {
  return products.map((product) => ({
    ...product,
    category: product.category?.trim() || map[product.id] || null,
  }));
}
