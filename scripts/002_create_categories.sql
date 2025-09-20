-- Create forum categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  slug text unique not null,
  color text default '#8B5CF6',
  icon text,
  sort_order integer default 0,
  is_active boolean default true,
  thread_count integer default 0,
  post_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.categories enable row level security;

-- RLS policies for categories (public read)
create policy "categories_select_all"
  on public.categories for select
  using (is_active = true);

-- Insert default categories
insert into public.categories (name, description, slug, color, icon, sort_order) values
  ('General Discussion', 'Chat about anything and everything', 'general', '#EC4899', 'MessageCircle', 1),
  ('Advice & Support', 'Get help and support from the community', 'advice', '#10B981', 'Heart', 2),
  ('Hobbies & Interests', 'Share your passions and discover new ones', 'hobbies', '#F59E0B', 'Star', 3),
  ('Study & Career', 'Academic help and career guidance', 'study-career', '#3B82F6', 'BookOpen', 4),
  ('Health & Wellness', 'Physical and mental health discussions', 'health', '#06B6D4', 'Activity', 5),
  ('Creative Corner', 'Art, writing, music, and creative projects', 'creative', '#8B5CF6', 'Palette', 6)
on conflict (slug) do nothing;
