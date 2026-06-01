create extension if not exists pgcrypto;

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text default '',
  todos jsonb not null default '[]'::jsonb,
  background_color text default '#FFFFFF',
  is_important boolean not null default false,
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists important_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  url text not null,
  created_at timestamptz not null default now()
);

alter table notes
add column if not exists is_completed boolean not null default false;

create index if not exists notes_user_completed_created_at_idx
on notes (user_id, is_completed, created_at desc);

create index if not exists notes_user_important_created_at_idx
on notes (user_id, is_important, created_at desc);

create index if not exists important_links_user_created_at_idx
on important_links (user_id, created_at asc);

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_notes_updated_at on notes;

create trigger update_notes_updated_at
before update on notes
for each row
execute function update_updated_at_column();

alter table notes enable row level security;
alter table important_links enable row level security;

drop policy if exists "Users can view own notes" on notes;
drop policy if exists "Users can insert own notes" on notes;
drop policy if exists "Users can update own notes" on notes;
drop policy if exists "Users can delete own notes" on notes;

create policy "Users can view own notes"
on notes for select
using (auth.uid() = user_id);

create policy "Users can insert own notes"
on notes for insert
with check (auth.uid() = user_id);

create policy "Users can update own notes"
on notes for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own notes"
on notes for delete
using (auth.uid() = user_id);

drop policy if exists "Users can view own important links" on important_links;
drop policy if exists "Users can insert own important links" on important_links;
drop policy if exists "Users can update own important links" on important_links;
drop policy if exists "Users can delete own important links" on important_links;

create policy "Users can view own important links"
on important_links for select
using (auth.uid() = user_id);

create policy "Users can insert own important links"
on important_links for insert
with check (auth.uid() = user_id);

create policy "Users can update own important links"
on important_links for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own important links"
on important_links for delete
using (auth.uid() = user_id);
