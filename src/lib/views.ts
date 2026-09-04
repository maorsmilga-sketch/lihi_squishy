import type { SupabaseClient } from "@supabase/supabase-js";

const STATS_FILE = "meta/site-stats.json";

async function loadStoredViews(supabase: SupabaseClient) {
  const { data, error } = await supabase.storage.from("media").download(STATS_FILE);
  if (error || !data) return 0;
  try {
    const parsed = JSON.parse(await data.text()) as { page_views?: number };
    return typeof parsed.page_views === "number" ? parsed.page_views : 0;
  } catch {
    return 0;
  }
}

async function saveStoredViews(supabase: SupabaseClient, pageViews: number) {
  await supabase.storage.from("media").upload(
    STATS_FILE,
    Buffer.from(JSON.stringify({ page_views: pageViews })),
    { upsert: true, contentType: "application/json" },
  );
}

function missingColumn(error: { message?: string } | null) {
  return Boolean(error?.message && /page_views|column/i.test(error.message));
}

export async function getPageViews(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("settings")
    .select("page_views")
    .eq("id", 1)
    .maybeSingle();

  if (!error && data && typeof data.page_views === "number") {
    return data.page_views;
  }
  if (error && !missingColumn(error)) {
    return loadStoredViews(supabase);
  }
  return loadStoredViews(supabase);
}

export async function incrementPageViews(supabase: SupabaseClient) {
  const current = await getPageViews(supabase);
  const next = current + 1;

  const update = await supabase
    .from("settings")
    .update({ page_views: next })
    .eq("id", 1);

  if (update.error && missingColumn(update.error)) {
    await saveStoredViews(supabase, next);
    return next;
  }
  if (update.error) {
    await saveStoredViews(supabase, next);
  }
  return next;
}
