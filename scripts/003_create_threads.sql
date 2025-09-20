-- Create forum threads
create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category_id uuid not null references public.categories(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  is_pinned boolean default false,
  is_locked boolean default false,
  is_deleted boolean default false,
  view_count integer default 0,
  reply_count integer default 0,
  last_reply_at timestamp with time zone default now(),
  last_reply_by uuid references public.profiles(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.threads enable row level security;

-- RLS policies for threads
create policy "threads_select_active"
  on public.threads for select
  using (is_deleted = false);

create policy "threads_insert_own"
  on public.threads for insert
  with check (auth.uid() = author_id);

create policy "threads_update_own"
  on public.threads for update
  using (auth.uid() = author_id and is_deleted = false);

-- Create indexes for performance
create index if not exists threads_category_id_idx on public.threads(category_id);
create index if not exists threads_author_id_idx on public.threads(author_id);
create index if not exists threads_last_reply_at_idx on public.threads(last_reply_at desc);
