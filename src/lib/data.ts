import { getPublicSupabase } from "@/lib/supabase/client";
import { loadCategoryMap, mergeProductCategories } from "@/lib/category-map";
import {
  ADMIN_PRODUCT_COLUMNS,
  PUBLIC_PRODUCT_COLUMNS,
} from "@/lib/products";
import type { Product, Settings, Video } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function selectProducts(
  supabase: SupabaseClient,
  admin = false,
): Promise<Product[]> {
  const columns = admin ? ADMIN_PRODUCT_COLUMNS : PUBLIC_PRODUCT_COLUMNS;
  const { data, error } = await supabase
    .from("products")
    .select(columns)
    .order("created_at", { ascending: false });

  let products: Product[] = [];

  if (!error) {
    products = (data as unknown as Product[]) ?? [];
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
    }));
  }

  const map = await loadCategoryMap(admin ? supabase : null);
  return mergeProductCategories(products, map);
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
