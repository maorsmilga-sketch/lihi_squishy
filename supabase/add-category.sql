-- הוספת עמודת קטגוריה לטבלת המוצרים (להריץ אם הסכימה כבר קיימת)
alter table public.products
  add column if not exists category text;

grant select (id, image_url, price, description, category, created_at)
  on table public.products to anon, authenticated;

create index if not exists products_category_idx on public.products (category);
