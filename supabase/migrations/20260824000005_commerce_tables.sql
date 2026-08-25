-- ROSSANA — Clientes, carrito, pedidos, pagos y comprobantes

-- Cuenta de cliente OPCIONAL (Sección 37). auth_user_id es null para
-- compradores invitados: se crea una fila `customers` igual, para poder
-- asociar direcciones/pedidos, pero sin exigir registro.
create table customers (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  auth_user_id uuid references auth.users (id) on delete set null,
  first_name text,
  last_name text,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customers_auth_user_idx on customers (auth_user_id);

create table addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers (id) on delete cascade,
  department text not null,
  province text not null,
  district text not null,
  address_line text not null,
  reference text,
  instructions text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table carts (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  customer_id uuid references customers (id) on delete set null,
  session_token text,        -- persistencia de carrito invitado (cookie)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index carts_session_idx on carts (session_token);

create table cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references carts (id) on delete cascade,
  product_id uuid not null references products (id),
  quantity int not null check (quantity > 0),
  unit_price numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, product_id)
);

create table shipping_zones (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  department text not null,
  province text,
  district text,
  cost numeric(10, 2) not null default 0,
  active boolean not null default true
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  order_number text not null unique,      -- RSN-00125
  customer_id uuid not null references customers (id),
  status order_status not null default 'esperando_pago',

  is_gift boolean not null default false,
  gift_recipient_name text,
  gift_recipient_phone text,
  gift_message text,
  gift_special_packaging boolean not null default false,

  buyer_first_name text not null,
  buyer_last_name text not null,
  buyer_phone text not null,
  buyer_email text not null,

  shipping_department text not null,
  shipping_province text not null,
  shipping_district text not null,
  shipping_address text not null,
  shipping_reference text,
  shipping_instructions text,

  subtotal numeric(12, 2) not null,
  shipping_cost numeric(12, 2) not null default 0,
  discount numeric(12, 2) not null default 0,
  total numeric(12, 2) not null,

  -- Reserva de stock (Sección 36)
  stock_reserved_until timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_store_status_idx on orders (store_id, status);
create index orders_customer_idx on orders (customer_id);
create index orders_reserved_until_idx on orders (stock_reserved_until) where status = 'esperando_pago';

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid not null references products (id),
  product_name text not null,     -- snapshot: nunca cambia aunque el producto cambie después
  sku text,
  unit_price numeric(12, 2) not null,
  quantity int not null check (quantity > 0),
  subtotal numeric(12, 2) not null
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  method text not null default 'yape',
  status payment_status not null default 'pending',
  amount_expected numeric(12, 2) not null,
  confirmed_by uuid references profiles (id),
  confirmed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payments_order_idx on payments (order_id);
create index payments_status_idx on payments (status);

-- OCR != validación de pago (Sección 30/32). Estos campos son de apoyo,
-- nunca la fuente de verdad del pago.
create table payment_receipts (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references payments (id) on delete cascade,
  file_url text not null,
  mime_type text not null,
  file_size_bytes int not null,
  operation_number text,
  operation_number_source operation_number_source,
  amount_detected numeric(12, 2),
  operation_date_detected timestamptz,
  ocr_confidence numeric(5, 4),
  ocr_raw_data jsonb,
  is_possible_duplicate boolean not null default false,
  created_at timestamptz not null default now()
);

create index payment_receipts_operation_number_idx on payment_receipts (operation_number)
  where operation_number is not null;

create table favorites (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (customer_id, product_id)
);
