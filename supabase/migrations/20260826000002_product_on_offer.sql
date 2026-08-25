-- ROSSANA — Columna calculada para filtrar/paginar "Ofertas" (Sección
-- 19/20) en SQL en vez de post-filtrar en JS (lo que rompería el conteo
-- y la paginación).

alter table products
  add column on_offer boolean generated always as (
    compare_at_price is not null and compare_at_price > price
  ) stored;

create or replace view storefront_products as
select
  id, store_id, category_id, sku, name, slug,
  short_description, description, material, color, dimensions, weight_grams,
  featured, stock_available, price, compare_at_price,
  seo_title, seo_description, created_at, updated_at,
  tags, on_offer
from products
where status = 'published';
