-- Gleam saved board thumbnail setup
-- Run once in Supabase SQL Editor before relying on fast My Boards previews.

alter table public.boards
add column if not exists thumbnail_path text;

insert into storage.buckets (id, name, public)
values ('board-thumbnails', 'board-thumbnails', false)
on conflict (id) do nothing;

drop policy if exists "Users can read own board thumbnails" on storage.objects;
drop policy if exists "Users can upload own board thumbnails" on storage.objects;
drop policy if exists "Users can update own board thumbnails" on storage.objects;
drop policy if exists "Users can delete own board thumbnails" on storage.objects;

create policy "Users can read own board thumbnails"
on storage.objects for select
using (
  bucket_id = 'board-thumbnails'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can upload own board thumbnails"
on storage.objects for insert
with check (
  bucket_id = 'board-thumbnails'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update own board thumbnails"
on storage.objects for update
using (
  bucket_id = 'board-thumbnails'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'board-thumbnails'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete own board thumbnails"
on storage.objects for delete
using (
  bucket_id = 'board-thumbnails'
  and auth.uid()::text = (storage.foldername(name))[1]
);
