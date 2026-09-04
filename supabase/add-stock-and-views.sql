-- כמות מלאי למוצרים + מונה צפיות
-- להריץ ב-Supabase: SQL Editor → New query → Run

alter table public.products
  add column if not exists stock integer not null default 1 check (stock >= 0);

alter table public.settings
  add column if not exists page_views integer not null default 0 check (page_views >= 0);

grant select (id, image_url, price, description, category, stock, created_at)
  on table public.products to anon, authenticated;
