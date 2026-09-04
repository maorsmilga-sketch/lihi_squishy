-- הגרלת סקווישי (להריץ ב-Supabase: SQL Editor → Run)
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
