-- Create likes system
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_id, post_id)
);

-- Enable RLS
alter table public.likes enable row level security;

-- RLS policies for likes
create policy "likes_select_all"
  on public.likes for select
  using (true);

create policy "likes_insert_own"
  on public.likes for insert
  with check (auth.uid() = user_id);

create policy "likes_delete_own"
  on public.likes for delete
  using (auth.uid() = user_id);

-- Function to update like counts
create or replace function update_post_like_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts 
    set like_count = like_count + 1 
    where id = NEW.post_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.posts 
    set like_count = like_count - 1 
    where id = OLD.post_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql;

-- Triggers for like count updates
drop trigger if exists update_like_count_trigger on public.likes;
create trigger update_like_count_trigger
  after insert or delete on public.likes
  for each row execute function update_post_like_count();
