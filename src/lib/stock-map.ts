import type { Product } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

const STOCK_FILE = "meta/product-stock.json";

function publicStockMapUrl() {
  const base = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ""
  ).replace(/\/$/, "");
  if (!base) return null;
  return `${base}/storage/v1/object/public/media/${STOCK_FILE}`;
}

export async function loadStockMap(
  supabase?: SupabaseClient | null,
): Promise<Record<string, number>> {
  if (supabase) {
    const { data, error } = await supabase.storage
      .from("media")
      .download(STOCK_FILE);
    if (!error && data) {
      try {
        const parsed = JSON.parse(await data.text()) as Record<string, number>;
        return parsed && typeof parsed === "object" ? parsed : {};
      } catch {
        return {};
      }
    }
  }

  const url = publicStockMapUrl();
  if (!url) return {};

  try {
    const response = await fetch(`${url}?t=${Date.now()}`, {
      cache: "no-store",
    });
    if (!response.ok) return {};
    const parsed = (await response.json()) as Record<string, number>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function upsertProductStock(
  supabase: SupabaseClient,
  productId: string,
  stock: number,
) {
  const map = await loadStockMap(supabase);
  map[productId] = Math.max(0, Math.floor(stock));
  await supabase.storage.from("media").upload(
    STOCK_FILE,
    Buffer.from(JSON.stringify(map)),
    { upsert: true, contentType: "application/json" },
  );
}

export async function removeProductStock(
  supabase: SupabaseClient,
  productId: string,
) {
  const map = await loadStockMap(supabase);
  delete map[productId];
  await supabase.storage.from("media").upload(
    STOCK_FILE,
    Buffer.from(JSON.stringify(map)),
    { upsert: true, contentType: "application/json" },
  );
}

export function mergeProductStock(
  products: Product[],
  map: Record<string, number>,
): Product[] {
  return products.map((product) => {
    const mapped = map[product.id];
    const stock =
      typeof product.stock === "number"
        ? product.stock
        : typeof mapped === "number"
          ? mapped
          : 1;
    return { ...product, stock };
  });
}
