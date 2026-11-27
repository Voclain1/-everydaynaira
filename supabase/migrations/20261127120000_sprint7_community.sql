-- Sprint 7: comments, web push and account deletion (EverydayNaira)
-- Paste this whole file into the Supabase dashboard SQL editor and run it.
-- It is safe to run twice: tables use IF NOT EXISTS, columns use
-- IF NOT EXISTS, and policies are dropped before they are created.
-- Run it AFTER the Sprint 6 migration
-- (20261124211500_sprint6_accounts.sql).
-- This project does NOT auto-expose new tables to the Data API, so each
-- table is explicitly granted below.

-- ---------- admin flag ----------
-- The site owner flips is_admin to true on their own profile row to get
-- access to the comment moderation queue in the dashboard.
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- Helper: is the signed-in caller an admin? Security definer so the
-- comments policies can read the caller's profile row without recursion
-- through the profiles policies.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- comments ----------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null,
  user_id uuid references auth.users (id) on delete set null,
  guest_name text,
  display_name text not null,
  body text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists comments_post_status_idx
  on public.comments (post_slug, status, created_at);
create index if not exists comments_identity_time_idx
  on public.comments (user_id, created_at);

-- Anti-spam: at most 3 comments per identity in any 5-minute window.
-- Identity is the account for signed-in readers, and the display name
-- plus post for guests. Security definer so the count can see pending
-- comments too (callers can only read approved ones).
create or replace function public.comments_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count int;
begin
  select count(*) into recent_count
  from public.comments c
  where c.created_at > now() - interval '5 minutes'
    and (
      (new.user_id is not null and c.user_id = new.user_id)
      or (
        new.user_id is null
        and c.user_id is null
        and lower(c.display_name) = lower(new.display_name)
        and c.post_slug = new.post_slug
      )
    );
  if recent_count >= 3 then
    raise exception 'You are commenting too quickly. Please wait a few minutes and try again.';
  end if;
  return new;
end;
$$;

drop trigger if exists comments_rate_limit on public.comments;
create trigger comments_rate_limit
  before insert on public.comments
  for each row execute function public.comments_rate_limit();

alter table public.comments enable row level security;

-- Everyone (signed in or not) can read approved comments.
drop policy if exists "comments read approved" on public.comments;
create policy "comments read approved" on public.comments
  for select to anon, authenticated
  using (status = 'approved');

-- Admins can read every comment (the moderation queue).
drop policy if exists "comments read admin" on public.comments;
create policy "comments read admin" on public.comments
  for select to authenticated
  using (public.is_admin());

-- Anyone may post, but every new comment starts as 'pending', and a
-- signed-in reader can only post as themselves.
drop policy if exists "comments insert pending" on public.comments;
create policy "comments insert pending" on public.comments
  for insert to anon, authenticated
  with check (
    status = 'pending'
    and (user_id is null or user_id = auth.uid())
  );

-- Only admins moderate.
drop policy if exists "comments update admin" on public.comments;
create policy "comments update admin" on public.comments
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Admins can delete any comment; readers can delete their own.
drop policy if exists "comments delete admin or own" on public.comments;
create policy "comments delete admin or own" on public.comments
  for delete to authenticated
  using (public.is_admin() or user_id = auth.uid());

grant select on public.comments to anon, authenticated;
grant insert on public.comments to anon, authenticated;
grant update, delete on public.comments to authenticated;

-- ---------- push subscriptions ----------
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists push_subscriptions_updated_at on public.push_subscriptions;
create trigger push_subscriptions_updated_at
  before update on public.push_subscriptions
  for each row execute function public.set_updated_at();

alter table public.push_subscriptions enable row level security;

-- Readers manage subscriptions for themselves (or anonymously, before
-- signing in). There is deliberately NO select policy for the public:
-- the list of endpoints is read only by the server-side sending route,
-- which uses the secret key and bypasses RLS.
drop policy if exists "push_subscriptions insert own" on public.push_subscriptions;
create policy "push_subscriptions insert own" on public.push_subscriptions
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

drop policy if exists "push_subscriptions update own" on public.push_subscriptions;
create policy "push_subscriptions update own" on public.push_subscriptions
  for update to anon, authenticated
  using (user_id is null or user_id = auth.uid())
  with check (user_id is null or user_id = auth.uid());

drop policy if exists "push_subscriptions delete own" on public.push_subscriptions;
create policy "push_subscriptions delete own" on public.push_subscriptions
  for delete to anon, authenticated
  using (user_id is null or user_id = auth.uid());

grant insert, update, delete on public.push_subscriptions to anon, authenticated;

-- ---------- full account deletion ----------
-- Sprint 6 removed the reader's data rows but left the auth.users
-- record behind. This function removes everything, including the
-- sign-in record itself. Security definer: deleting from auth.users
-- is not something the authenticated role can do directly.
create or replace function public.delete_current_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not signed in.';
  end if;
  -- Comments stay (they are part of the public conversation) but are
  -- detached from the account; the FK would do this on delete anyway.
  update public.comments set user_id = null where user_id = uid;
  delete from public.push_subscriptions where user_id = uid;
  delete from public.calculator_snapshots where user_id = uid;
  delete from public.reading_history where user_id = uid;
  delete from public.saved_guides where user_id = uid;
  delete from public.preferences where user_id = uid;
  delete from public.profiles where id = uid;
  delete from auth.users where id = uid;
end;
$$;

revoke execute on function public.delete_current_user() from public;
grant execute on function public.delete_current_user() to authenticated;
