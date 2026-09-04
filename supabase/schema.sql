-- =============================================================================
-- עולם הסקווישים של ליהי וארי
-- הרצת הסקריפט ב-Supabase: SQL Editor → New query → Run
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- טבלאות
-- -----------------------------------------------------------------------------

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  price numeric(10, 2) not null check (price >= 0),
  description text,
  category text,
  external_link text,
  created_at timestamptz not null default now()
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  video_url text not null,
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  id integer primary key default 1 check (id = 1),
  about_text text not null default ''
);

insert into public.settings (id, about_text)
values (
  1,
  'ברוכים הבאים לעולם הסקווישים של ליהי וארי!

אנחנו אוהבות סקווישים רכים, צבעוניים ומלאים בהפתעות. כאן תוכלו לראות את האוסף שלנו, לגלות מחירים, ולצפות בסרטונים שמלמדים איך משחקים עם הסקווישים.

תודה שבאתן לבקר ♡'
)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- אחסון תמונות וסרטונים (Storage bucket: media)
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- אבטחת שורות (RLS)
-- קריאה ציבורית מותרת. כתיבה מתבצעת משרת Next.js עם מפתח service role.
-- -----------------------------------------------------------------------------

alter table public.products enable row level security;
alter table public.videos enable row level security;
alter table public.settings enable row level security;

drop policy if exists "Public can read products" on public.products;
create policy "Public can read products"
  on public.products
  for select
  using (true);

drop policy if exists "Public can read videos" on public.videos;
create policy "Public can read videos"
  on public.videos
  for select
  using (true);

drop policy if exists "Public can read settings" on public.settings;
create policy "Public can read settings"
  on public.settings
  for select
  using (true);

-- הקישור החיצוני מוסתר ממשתמשות רגילות גם ברמת העמודה
revoke all on table public.products from anon, authenticated;
grant select (id, image_url, price, description, category, created_at)
  on table public.products to anon, authenticated;

grant select on table public.videos to anon, authenticated;
grant select on table public.settings to anon, authenticated;

-- קריאה ציבורית לקבצים בבאקט media
drop policy if exists "Public can view media" on storage.objects;
create policy "Public can view media"
  on storage.objects
  for select
  using (bucket_id = 'media');

-- אינדקסים
create index if not exists products_created_at_idx on public.products (created_at desc);
create index if not exists products_category_idx on public.products (category);
create index if not exists videos_created_at_idx on public.videos (created_at desc);

-- -----------------------------------------------------------------------------
-- הגרלה
-- -----------------------------------------------------------------------------

create table if not exists public.raffles (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'הגרלת סקווישי',
  description text,
  image_url text not null,
  ends_at timestamptz not null,
  winner_entry_id uuid,
  winner_name text,
  drawn_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.raffle_entries (
  id uuid primary key default gen_random_uuid(),
  raffle_id uuid not null references public.raffles (id) on delete cascade,
  name text not null,
  name_normalized text not null,
  phone text,
  created_at timestamptz not null default now(),
  unique (raffle_id, name_normalized)
);

create unique index if not exists raffle_entries_phone_idx
  on public.raffle_entries (raffle_id, phone)
  where phone is not null;

alter table public.raffles enable row level security;
alter table public.raffle_entries enable row level security;

drop policy if exists "Public can read raffles" on public.raffles;
create policy "Public can read raffles"
  on public.raffles
  for select
  using (true);

drop policy if exists "Public can read raffle entries" on public.raffle_entries;
create policy "Public can read raffle entries"
  on public.raffle_entries
  for select
  using (true);

revoke all on table public.raffles from anon, authenticated;
grant select (
  id, title, description, image_url, ends_at,
  winner_entry_id, winner_name, drawn_at, created_at
) on table public.raffles to anon, authenticated;

revoke all on table public.raffle_entries from anon, authenticated;
grant select (id, raffle_id, name, created_at)
  on table public.raffle_entries to anon, authenticated;

create index if not exists raffles_created_at_idx on public.raffles (created_at desc);
create index if not exists raffle_entries_raffle_id_idx on public.raffle_entries (raffle_id);
