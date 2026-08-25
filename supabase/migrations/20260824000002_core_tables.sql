-- ROSSANA — Tiendas, perfiles y roles (RBAC)
-- store_id se incluye desde el inicio para permitir multi-tienda futura
-- sin rediseñar el esquema (Sección 71), sin construir hoy un SaaS complejo.

create table stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  legal_name text,
  description text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Perfil de usuario del PANEL (emprendedor / staff). Los compradores
-- invitados NO tienen fila aquí; ver `customers`.
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  store_id uuid references stores (id) on delete set null,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table roles (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,     -- 'owner' | 'staff'
  name text not null            -- etiqueta legible
);

create table profile_roles (
  profile_id uuid not null references profiles (id) on delete cascade,
  role_id uuid not null references roles (id) on delete cascade,
  store_id uuid not null references stores (id) on delete cascade,
  primary key (profile_id, role_id, store_id)
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  image_url text,
  display_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, slug)
);
