-- Create forum posts (replies to threads)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  thread_id uuid not null references public.threads(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.posts(id), -- for nested replies
  is_deleted boolean default false,
  like_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.posts enable row level security;

-- RLS policies for posts
create policy "posts_select_active"
  on public.posts for select
  using (is_deleted = false);

create policy "posts_insert_own"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "posts_update_own"
  on public.posts for update
  using (auth.uid() = author_id and is_deleted = false);

-- Create indexes for performance
create index if not exists posts_thread_id_idx on public.posts(thread_id);
create index if not exists posts_author_id_idx on public.posts(author_id);
create index if not exists posts_created_at_idx on public.posts(created_at desc);
