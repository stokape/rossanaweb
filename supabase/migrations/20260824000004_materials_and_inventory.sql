-- ROSSANA — "Mis materiales", compras, receta y fabricación

create table materials (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  sku text,
  name text not null,
  category text,
  photo_url text,
  unit material_unit not null default 'unidad',
  current_stock numeric(14, 3) not null default 0,
  minimum_stock numeric(14, 3) not null default 0,
  average_unit_cost numeric(14, 4) not null default 0,
  supplier text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (current_stock >= 0)
);

create index materials_store_idx on materials (store_id, active);

-- "Componentes del producto" en la UI = receta/BOM internamente.
create table product_components (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  material_id uuid not null references materials (id),
  quantity_required numeric(12, 3) not null check (quantity_required > 0),
  unit material_unit not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, material_id)
);

-- "Agregar compra" (Sección 48). El costo promedio se recalcula por
-- trigger (ver 20260824000007_functions_and_triggers.sql).
create table material_purchases (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  material_id uuid not null references materials (id),
  quantity numeric(14, 3) not null check (quantity > 0),
  total_paid numeric(12, 2) not null check (total_paid >= 0),
  unit_cost numeric(14, 4) generated always as (
    case when quantity > 0 then round(total_paid / quantity, 4) else 0 end
  ) stored,
  supplier text,
  purchased_at timestamptz not null default now(),
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

-- "Hacer productos" (Sección 52-53).
create table production_runs (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  product_id uuid not null references products (id),
  quantity_produced int not null check (quantity_produced > 0),
  total_production_cost numeric(12, 2) not null default 0,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

-- Historial interno (Sección 50). El comprador/admin ven lenguaje
-- natural en la UI, nunca estos códigos directamente.
create table inventory_movements (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  movement_type inventory_movement_type not null,
  material_id uuid references materials (id),
  product_id uuid references products (id),
  quantity numeric(14, 3) not null,     -- convención: + entra, - sale
  reference_type text,                   -- 'material_purchase' | 'production_run' | 'order' | 'adjustment'
  reference_id uuid,
  notes text,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  check (
    (material_id is not null and product_id is null) or
    (material_id is null and product_id is not null)
  )
);

create index inventory_movements_store_idx on inventory_movements (store_id, created_at desc);
create index inventory_movements_material_idx on inventory_movements (material_id);
create index inventory_movements_product_idx on inventory_movements (product_id);
