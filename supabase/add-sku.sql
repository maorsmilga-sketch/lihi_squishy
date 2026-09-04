-- מזהה ייחודי קצר לכל סקווישי (מק״ט)
-- להריץ ב-Supabase: SQL Editor → New query → Run

alter table public.products
  add column if not exists sku text;

update public.products
set sku = 'S-' || upper(right(replace(id::text, '-', ''), 6))
where sku is null;

create unique index if not exists products_sku_idx on public.products (sku);

grant select (id, image_url, price, description, category, stock, sku, created_at)
  on table public.products to anon, authenticated;
