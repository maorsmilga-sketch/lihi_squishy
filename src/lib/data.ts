import { getPublicSupabase } from "@/lib/supabase/client";
import { loadCategoryMap, mergeProductCategories } from "@/lib/category-map";
import { loadStockMap, mergeProductStock } from "@/lib/stock-map";
import {
  ADMIN_PRODUCT_COLUMNS,
  PUBLIC_PRODUCT_COLUMNS,
} from "@/lib/products";
import {
  loadRaffleAndDraw,
  toPublicState,
} from "@/lib/raffle";
import { getServiceSupabase } from "@/lib/supabase/server";
import type { Product, RaffleState, Settings, Video } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function selectProducts(
  supabase: SupabaseClient,
  admin = false,
): Promise<Product[]> {
  const columns = admin ? ADMIN_PRODUCT_COLUMNS : PUBLIC_PRODUCT_COLUMNS;
  let { data, error } = await supabase
    .from("products")
    .select(columns)
    .order("created_at", { ascending: false });

  if (error && /stock/i.test(error.message)) {
    const withoutStock = columns.replace(", stock", "");
    const retry = await supabase
      .from("products")
      .select(withoutStock)
      .order("created_at", { ascending: false });
    data = retry.data as typeof data;
    error = retry.error;
  }

  let products: Product[] = [];

  if (!error) {
    products = ((data as unknown as Product[]) ?? []).map((product) => ({
      ...product,
      stock: typeof product.stock === "number" ? product.stock : 1,
    }));
  } else {
    const fallbackColumns = admin
      ? "id, image_url, price, description, external_link, created_at"
      : "id, image_url, price, description, created_at";
    const fallback = await supabase
      .from("products")
      .select(fallbackColumns)
      .order("created_at", { ascending: false });

    if (fallback.error) {
      console.error(fallback.error);
      return [];
    }

    products = ((fallback.data as unknown as Product[]) ?? []).map((product) => ({
      ...product,
      category: product.category ?? null,
      stock: 1,
    }));
  }

  const supabaseForMaps = admin ? supabase : null;
  const [categoryMap, stockMap] = await Promise.all([
    loadCategoryMap(supabaseForMaps),
    loadStockMap(supabaseForMaps),
  ]);
  const withMeta = mergeProductStock(
    mergeProductCategories(products, categoryMap),
    stockMap,
  );
  return admin ? withMeta : withMeta.filter((product) => product.stock > 0);
}

export async function getProducts(): Promise<Product[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return [];
  return selectProducts(supabase, false);
}

export async function getVideos(): Promise<Video[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("videos")
    .select("id, video_url, title, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as Video[];
}

export async function getSettings(): Promise<Settings | null> {
  const supabase = getPublicSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("settings")
    .select("id, about_text")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data as Settings | null;
}

export async function getRaffleState(): Promise<RaffleState> {
  try {
    const supabase = getServiceSupabase();
    const stored = await loadRaffleAndDraw(supabase);
    if (!stored) {
      return {
        raffle: null,
        entries: [],
        entryCount: 0,
        isOpen: false,
        isEnded: false,
      };
    }
    return toPublicState(stored.raffle, stored.entries);
  } catch (error) {
    console.error(error);
    return {
      raffle: null,
      entries: [],
      entryCount: 0,
      isOpen: false,
      isEnded: false,
    };
  }
}
