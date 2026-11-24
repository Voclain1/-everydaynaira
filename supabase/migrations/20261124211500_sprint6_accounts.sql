-- Sprint 6: accounts and dashboards (EverydayNaira)
-- Paste this whole file into the Supabase dashboard SQL editor and run it.
-- It is safe to run twice: tables use IF NOT EXISTS and policies are
-- dropped before they are created.
-- This project does NOT auto-expose new tables to the Data API, so each
-- table is explicitly granted to the authenticated role below.

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- saved_guides ----------
create table if not exists public.saved_guides (
  user_id uuid not null references auth.users (id) on delete cascade,
  slug text not null,
  saved_at timestamptz not null default now(),
  primary key (user_id, slug)
);

-- ---------- reading_history ----------
create table if not exists public.reading_history (
  user_id uuid not null references auth.users (id) on delete cascade,
  slug text not null,
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  updated_at timestamptz not null default now(),
  primary key (user_id, slug)
);

-- ---------- calculator_snapshots ----------
create table if not exists public.calculator_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  calculator text not null,
  inputs jsonb not null default '{}'::jsonb,
  results jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------- preferences ----------
create table if not exists public.preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  newsletter boolean not null default false,
  notify_new_posts boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ---------- new-user profile ----------
-- Runs when a reader signs up: creates their profile row from the name
-- given at sign-up (or the name from Google sign-in).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- updated_at maintenance ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
drop trigger if exists reading_history_updated_at on public.reading_history;
create trigger reading_history_updated_at before update on public.reading_history
  for each row execute function public.set_updated_at();
drop trigger if exists preferences_updated_at on public.preferences;
create trigger preferences_updated_at before update on public.preferences
  for each row execute function public.set_updated_at();

-- ---------- Row Level Security: own rows only ----------
alter table public.profiles enable row level security;
alter table public.saved_guides enable row level security;
alter table public.reading_history enable row level security;
alter table public.calculator_snapshots enable row level security;
alter table public.preferences enable row level security;

-- profiles: a reader sees and edits only their own profile row
drop policy if exists "profiles own rows" on public.profiles;
create policy "profiles own rows" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "saved_guides own rows" on public.saved_guides;
create policy "saved_guides own rows" on public.saved_guides
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "reading_history own rows" on public.reading_history;
create policy "reading_history own rows" on public.reading_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "calculator_snapshots own rows" on public.calculator_snapshots;
create policy "calculator_snapshots own rows" on public.calculator_snapshots
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "preferences own rows" on public.preferences;
create policy "preferences own rows" on public.preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- Data API access ----------
-- New tables are not exposed automatically, so grant explicitly.
-- Only the authenticated role gets access; each policy above still
-- limits every reader to their own rows.
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.saved_guides to authenticated;
grant select, insert, update, delete on public.reading_history to authenticated;
grant select, insert, update, delete on public.calculator_snapshots to authenticated;
grant select, insert, update, delete on public.preferences to authenticated;
