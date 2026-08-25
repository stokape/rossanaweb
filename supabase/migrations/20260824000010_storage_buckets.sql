-- ROSSANA — Buckets de Storage
-- product-images: fotos de producto (incluye secuencia 360°) — públicas.
-- receipts: comprobantes de Yape — privados, solo staff puede leerlos;
--   el comprador solo puede SUBIR (insert) al momento de la compra.
-- branding: logo, favicon, QR de Yape — públicas (se muestran en la web).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp']),
  ('branding', 'branding', true, 4194304, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/x-icon']),
  ('receipts', 'receipts', false, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- product-images / branding: lectura pública, escritura solo staff.
create policy "product_images_public_read" on storage.objects for select
  using (bucket_id in ('product-images', 'branding'));

create policy "product_images_staff_write" on storage.objects for insert
  with check (bucket_id in ('product-images', 'branding') and auth.role() = 'authenticated');

create policy "product_images_staff_update" on storage.objects for update
  using (bucket_id in ('product-images', 'branding') and auth.role() = 'authenticated');

create policy "product_images_staff_delete" on storage.objects for delete
  using (bucket_id in ('product-images', 'branding') and auth.role() = 'authenticated');

-- receipts: cualquiera (incluido invitado) puede SUBIR un comprobante
-- durante el checkout; solo el staff autenticado puede leerlos o
-- borrarlos. Válida el MIME/tamaño el bucket (arriba) + el cliente
-- (Sección 29).
create policy "receipts_anyone_can_upload" on storage.objects for insert
  with check (bucket_id = 'receipts');

create policy "receipts_staff_read" on storage.objects for select
  using (bucket_id = 'receipts' and auth.role() = 'authenticated');

create policy "receipts_staff_delete" on storage.objects for delete
  using (bucket_id = 'receipts' and auth.role() = 'authenticated');
