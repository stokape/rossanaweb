-- ROSSANA — Row Level Security
-- Regla crítica (Sección 73): costos, márgenes y proveedores NUNCA
-- deben poder consultarse desde el frontend público, ni inspeccionando
-- la API directamente. Por eso `products`/`materials` no se exponen a
-- `anon`: el catálogo público usa la vista `storefront_products`
-- (20260824000009_storefront_view.sql), que no incluye columnas de costo.

create function is_own_customer(p_customer_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from customers c where c.id = p_customer_id and c.auth_user_id = auth.uid()
  );
$$;

-- Habilitar RLS en todas las tablas de negocio
alter table stores enable row level security;
alter table profiles enable row level security;
alter table roles enable row level security;
alter table profile_roles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table materials enable row level security;
alter table material_purchases enable row level security;
alter table product_components enable row level security;
alter table production_runs enable row level security;
alter table inventory_movements enable row level security;
alter table customers enable row level security;
alter table addresses enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table payment_receipts enable row level security;
alter table shipping_zones enable row level security;
alter table favorites enable row level security;
alter table site_settings enable row level security;
alter table banners enable row level security;
alter table audit_logs enable row level security;
alter table order_number_counters enable row level security;

-- ─────────────────────────────────────────────────────────────────
-- stores / site_settings / categories / shipping_zones / banners
-- Lectura pública (catálogo, checkout, footer). Escritura solo staff.
-- ─────────────────────────────────────────────────────────────────
create policy stores_public_read on stores for select using (true);
create policy stores_staff_write on stores for all using (is_store_staff(id)) with check (is_store_staff(id));

create policy site_settings_public_read on site_settings for select using (true);
create policy site_settings_staff_write on site_settings for all
  using (is_store_staff(store_id)) with check (is_store_staff(store_id));

create policy categories_public_read on categories for select using (active);
create policy categories_staff_all on categories for all
  using (is_store_staff(store_id)) with check (is_store_staff(store_id));

create policy shipping_zones_public_read on shipping_zones for select using (active);
create policy shipping_zones_staff_all on shipping_zones for all
  using (is_store_staff(store_id)) with check (is_store_staff(store_id));

create policy banners_public_read on banners for select using (active);
create policy banners_staff_all on banners for all
  using (is_store_staff(store_id)) with check (is_store_staff(store_id));

-- ─────────────────────────────────────────────────────────────────
-- profiles / roles / profile_roles — solo staff / dueño de la fila
-- ─────────────────────────────────────────────────────────────────
create policy profiles_self_read on profiles for select using (id = auth.uid());
create policy profiles_self_update on profiles for update using (id = auth.uid());
create policy profiles_staff_read on profiles for select using (is_store_staff(store_id));

create policy roles_staff_read on roles for select using (auth.uid() is not null);

create policy profile_roles_staff_read on profile_roles for select using (is_store_staff(store_id));

-- ─────────────────────────────────────────────────────────────────
-- products / product_images — SIN acceso público directo a `products`
-- ─────────────────────────────────────────────────────────────────
create policy products_staff_all on products for all
  using (is_store_staff(store_id)) with check (is_store_staff(store_id));

create policy product_images_public_read on product_images for select using (
  exists (select 1 from products p where p.id = product_images.product_id and p.status = 'published')
);
create policy product_images_staff_all on product_images for all
  using (exists (select 1 from products p where p.id = product_images.product_id and is_store_staff(p.store_id)))
  with check (exists (select 1 from products p where p.id = product_images.product_id and is_store_staff(p.store_id)));

-- ─────────────────────────────────────────────────────────────────
-- materiales, compras, receta, fabricación, movimientos — 100% staff
-- ─────────────────────────────────────────────────────────────────
create policy materials_staff_all on materials for all
  using (is_store_staff(store_id)) with check (is_store_staff(store_id));
create policy material_purchases_staff_all on material_purchases for all
  using (is_store_staff(store_id)) with check (is_store_staff(store_id));
create policy production_runs_staff_all on production_runs for all
  using (is_store_staff(store_id)) with check (is_store_staff(store_id));
create policy inventory_movements_staff_read on inventory_movements for select using (is_store_staff(store_id));

create policy product_components_staff_all on product_components for all
  using (exists (select 1 from products p where p.id = product_components.product_id and is_store_staff(p.store_id)))
  with check (exists (select 1 from products p where p.id = product_components.product_id and is_store_staff(p.store_id)));

-- ─────────────────────────────────────────────────────────────────
-- customers / addresses / favorites — dueño de cuenta o staff
-- Los pedidos de INVITADO se crean vía función security definer
-- (create_guest_order) y NO dependen de estas policies para escribir.
-- ─────────────────────────────────────────────────────────────────
create policy customers_self_read on customers for select using (auth_user_id = auth.uid());
create policy customers_self_update on customers for update using (auth_user_id = auth.uid());
create policy customers_self_insert on customers for insert with check (auth_user_id = auth.uid());
create policy customers_staff_read on customers for select using (is_store_staff(store_id));

create policy addresses_self_all on addresses for all
  using (is_own_customer(customer_id)) with check (is_own_customer(customer_id));
create policy addresses_staff_read on addresses for select using (
  exists (select 1 from customers c where c.id = addresses.customer_id and is_store_staff(c.store_id))
);

create policy favorites_self_all on favorites for all
  using (is_own_customer(customer_id)) with check (is_own_customer(customer_id));

-- ─────────────────────────────────────────────────────────────────
-- carrito persistente — solo para cuentas de cliente registradas.
-- El carrito de invitado vive en el cliente (localStorage) hasta el
-- checkout, que pasa por create_guest_order().
-- ─────────────────────────────────────────────────────────────────
create policy carts_self_all on carts for all
  using (is_own_customer(customer_id)) with check (is_own_customer(customer_id));
create policy cart_items_self_all on cart_items for all
  using (exists (select 1 from carts c where c.id = cart_items.cart_id and is_own_customer(c.customer_id)))
  with check (exists (select 1 from carts c where c.id = cart_items.cart_id and is_own_customer(c.customer_id)));

-- ─────────────────────────────────────────────────────────────────
-- pedidos / pagos / comprobantes
-- El flujo de invitado (crear pedido, consultar estado, subir
-- comprobante) pasa por funciones security definer, NO por estas
-- policies directas — así el UUID del pedido actúa como token de
-- acceso sin exponer el resto de pedidos de la tienda.
-- ─────────────────────────────────────────────────────────────────
create policy orders_staff_all on orders for all
  using (is_store_staff(store_id)) with check (is_store_staff(store_id));
create policy orders_customer_read on orders for select using (is_own_customer(customer_id));

create policy order_items_staff_read on order_items for select using (
  exists (select 1 from orders o where o.id = order_items.order_id and is_store_staff(o.store_id))
);
create policy order_items_customer_read on order_items for select using (
  exists (select 1 from orders o where o.id = order_items.order_id and is_own_customer(o.customer_id))
);

create policy payments_staff_all on payments for all
  using (exists (select 1 from orders o where o.id = payments.order_id and is_store_staff(o.store_id)))
  with check (exists (select 1 from orders o where o.id = payments.order_id and is_store_staff(o.store_id)));

create policy payment_receipts_staff_all on payment_receipts for all
  using (exists (
    select 1 from payments p join orders o on o.id = p.order_id
    where p.id = payment_receipts.payment_id and is_store_staff(o.store_id)
  ))
  with check (exists (
    select 1 from payments p join orders o on o.id = p.order_id
    where p.id = payment_receipts.payment_id and is_store_staff(o.store_id)
  ));

-- ─────────────────────────────────────────────────────────────────
-- auditoría — solo lectura staff; la escritura ocurre desde las
-- funciones security definer (confirm_payment, etc.)
-- ─────────────────────────────────────────────────────────────────
create policy audit_logs_staff_read on audit_logs for select using (is_store_staff(store_id));

create policy order_number_counters_staff_read on order_number_counters for select using (is_store_staff(store_id));
