import { productSku } from "@/lib/products";
import type { Product } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

const SKU_FILE = "meta/product-skus.json";

function publicSkuMapUrl() {
  const base = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ""
  ).replace(/\/$/, "");
  if (!base) return null;
  return `${base}/storage/v1/object/public/media/${SKU_FILE}`;
}

export async function loadSkuMap(
  supabase?: SupabaseClient | null,
): Promise<Record<string, string>> {
  if (supabase) {
    const { data, error } = await supabase.storage.from("media").download(SKU_FILE);
    if (!error && data) {
      try {
        const parsed = JSON.parse(await data.text()) as Record<string, string>;
        return parsed && typeof parsed === "object" ? parsed : {};
      } catch {
        return {};
      }
    }
  }

  const url = publicSkuMapUrl();
  if (!url) return {};

  try {
    const response = await fetch(`${url}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return {};
    const parsed = (await response.json()) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function upsertProductSku(
  supabase: SupabaseClient,
  productId: string,
  sku: string,
) {
  const map = await loadSkuMap(supabase);
  map[productId] = sku;
  await supabase.storage.from("media").upload(
    SKU_FILE,
    Buffer.from(JSON.stringify(map)),
    { upsert: true, contentType: "application/json" },
  );
}

export async function removeProductSku(
  supabase: SupabaseClient,
  productId: string,
) {
  const map = await loadSkuMap(supabase);
  delete map[productId];
  await supabase.storage.from("media").upload(
    SKU_FILE,
    Buffer.from(JSON.stringify(map)),
    { upsert: true, contentType: "application/json" },
  );
}

export function mergeProductSkus(
  products: Product[],
  map: Record<string, string>,
): Product[] {
  return products.map((product) => ({
    ...product,
    sku: productSku({
      id: product.id,
      sku: product.sku?.trim() || map[product.id] || null,
    }),
  }));
}
