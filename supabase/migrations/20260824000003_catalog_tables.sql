-- ROSSANA — Catálogo: productos, imágenes y componentes (receta)

create table products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  category_id uuid references categories (id) on delete set null,

  sku text not null,
  name text not null,
  slug text not null,
  short_description text,
  description text,
  material text,
  color text,
  dimensions text,       -- medidas
  weight_grams numeric,

  status product_status not null default 'draft',
  featured boolean not null default false,

  -- Stock de producto terminado (Sección 61)
  stock_on_hand int not null default 0,
  stock_reserved int not null default 0,
  stock_available int generated always as (stock_on_hand - stock_reserved) stored,
  minimum_stock int not null default 0,

  -- Costo y precio (Sección 54-57)
  labor_cost numeric(12, 2) not null default 0,
  packaging_cost numeric(12, 2) not null default 0,
  other_direct_cost numeric(12, 2) not null default 0,
  markup_percentage numeric(6, 2) not null default 50,
  tax_rate numeric(5, 4) not null default 0.18,
  include_tax boolean not null default true,
  price numeric(12, 2) not null default 0,        -- precio final publicado (decisión manual)
  compare_at_price numeric(12, 2),                 -- precio anterior

  -- SEO (Sección 67)
  seo_title text,
  seo_description text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (store_id, slug),
  unique (store_id, sku),
  check (stock_on_hand >= 0),
  check (stock_reserved >= 0),
  check (stock_reserved <= stock_on_hand)
);

create index products_store_status_idx on products (store_id, status);
create index products_category_idx on products (category_id);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  url text not null,
  alt text,
  display_order int not null default 0,
  is_primary boolean not null default false,
  image_type text not null default 'gallery' check (image_type in ('gallery', '360')),
  created_at timestamptz not null default now()
);

create index product_images_product_idx on product_images (product_id, image_type, display_order);

-- Nota: `product_components` (la "receta"/BOM) se crea en
-- 20260824000004_materials_and_inventory.sql porque depende de `materials`.
