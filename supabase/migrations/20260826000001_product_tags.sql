-- ROSSANA — Tags de producto (Sección 20: la búsqueda debe cubrir
-- nombre, SKU, categoría, descripción y tags; no existía columna).

alter table products add column tags text[] not null default '{}';
create index products_tags_idx on products using gin (tags);

-- Recrear la vista pública para exponer `tags` (CREATE OR REPLACE VIEW
-- solo permite agregar columnas al final, nunca reordenar/quitar).
create or replace view storefront_products as
select
  id, store_id, category_id, sku, name, slug,
  short_description, description, material, color, dimensions, weight_grams,
  featured, stock_available, price, compare_at_price,
  seo_title, seo_description, created_at, updated_at,
  tags
from products
where status = 'published';
