insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('logos', 'logos', true, 2097152, array['image/png','image/jpeg','image/webp','image/gif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "logos_upload_own_folder" on storage.objects;
create policy "logos_upload_own_folder"
on storage.objects for insert to authenticated
with check (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "logos_update_own_folder" on storage.objects;
create policy "logos_update_own_folder"
on storage.objects for update to authenticated
using (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "logos_delete_own_folder" on storage.objects;
create policy "logos_delete_own_folder"
on storage.objects for delete to authenticated
using (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);
