-- ROSSANA — Configuración del negocio, banners y auditoría
-- Nada de esto se hardcodea en el código (Sección 17): dominio, Yape,
-- WhatsApp y envíos viven aquí y son editables desde /admin/configuracion.

create table site_settings (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null unique references stores (id) on delete cascade,

  business_name text,
  whatsapp_number text,

  yape_holder_name text,
  yape_number text,
  yape_qr_url text,
  yape_instructions text,

  tax_rate numeric(5, 4) not null default 0.18,
  stock_reservation_minutes int not null default 45,

  promo_bar_messages jsonb not null default '[]',
  social_links jsonb not null default '{}',
  policies jsonb not null default '{}',   -- envíos, cambios, privacidad, términos

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table banners (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  title text,
  subtitle text,
  image_url text,
  link_url text,
  placement text not null default 'hero' check (placement in ('hero', 'promo', 'brand')),
  display_order int not null default 0,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auditoría de acciones sensibles (Sección 84)
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  actor_id uuid references profiles (id),
  action text not null,          -- 'confirm_payment' | 'update_price' | 'adjust_stock' | ...
  entity_type text not null,
  entity_id uuid,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_store_idx on audit_logs (store_id, created_at desc);
