-- ROSSANA — Fix: `product_images_public_read` nunca dejaba pasar nada
-- a `anon`. Su USING clause hacía `exists (select 1 from products ...)`,
-- pero esa subconsulta contra `products` también está sujeta a RLS, y
-- `anon` no tiene ningún policy de lectura sobre `products` (a propósito,
-- Sección 73) — así que el `exists` siempre daba falso, sin importar el
-- `status` real del producto. Se detectó insertando un producto de
-- prueba con fotos: `anon` recibía `[]` en vez de las imágenes.
--
-- Solución: una función `security definer` (como `is_store_staff`) que
-- consulta `products` con los privilegios del dueño de la función,
-- evitando la recursión de RLS, igual que ya se hacía para el resto de
-- chequeos entre tablas.

create function is_product_published(p_product_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from products where id = p_product_id and status = 'published'
  );
$$;

drop policy product_images_public_read on product_images;
create policy product_images_public_read on product_images for select using (
  is_product_published(product_id)
);
