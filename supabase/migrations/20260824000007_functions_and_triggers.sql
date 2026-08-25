-- ROSSANA — Lógica de negocio: costo promedio, fabricación, pedidos,
-- reserva de stock y confirmación de pago. Todo lo transaccional vive
-- aquí como funciones de Postgres para garantizar atomicidad
-- (Sección 53/83): si algo falla, la función entera revierte sola.

-- ─────────────────────────────────────────────────────────────────
-- updated_at automático para toda tabla que tenga esa columna
-- ─────────────────────────────────────────────────────────────────
create function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  for t in
    select table_name from information_schema.columns
    where column_name = 'updated_at' and table_schema = 'public'
  loop
    execute format(
      'create trigger set_updated_at before update on %I for each row execute function set_updated_at()',
      t
    );
  end loop;
end;
$$;

-- ─────────────────────────────────────────────────────────────────
-- RBAC helper — usado por RLS y por las funciones security definer
-- ─────────────────────────────────────────────────────────────────
create function is_store_staff(p_store_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profile_roles pr
    where pr.profile_id = auth.uid() and pr.store_id = p_store_id
  );
$$;

-- ─────────────────────────────────────────────────────────────────
-- Costo promedio ponderado (Sección 49) al registrar una compra
-- ─────────────────────────────────────────────────────────────────
create function apply_material_purchase() returns trigger
language plpgsql as $$
declare
  v_material materials%rowtype;
  v_new_stock numeric;
  v_new_avg numeric;
begin
  select * into v_material from materials where id = new.material_id for update;

  v_new_stock := v_material.current_stock + new.quantity;
  if v_new_stock > 0 then
    v_new_avg := ((v_material.current_stock * v_material.average_unit_cost)
                  + (new.quantity * new.unit_cost)) / v_new_stock;
  else
    v_new_avg := v_material.average_unit_cost;
  end if;

  update materials
    set current_stock = v_new_stock, average_unit_cost = v_new_avg, updated_at = now()
    where id = new.material_id;

  insert into inventory_movements (
    store_id, movement_type, material_id, quantity, reference_type, reference_id, created_by
  ) values (
    new.store_id, 'purchase', new.material_id, new.quantity, 'material_purchase', new.id, new.created_by
  );

  return new;
end;
$$;

create trigger trg_material_purchase_after_insert
  after insert on material_purchases
  for each row execute function apply_material_purchase();

-- ─────────────────────────────────────────────────────────────────
-- Fabricación ("Hacer productos", Sección 52-53)
-- ─────────────────────────────────────────────────────────────────
create function register_production_run(
  p_store_id uuid, p_product_id uuid, p_quantity int, p_user_id uuid
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_run_id uuid;
  v_total_cost numeric := 0;
  v_component record;
  v_required numeric;
  v_missing text := '';
begin
  if not is_store_staff(p_store_id) then
    raise exception 'No autorizado';
  end if;

  if p_quantity <= 0 then
    raise exception 'La cantidad debe ser mayor a cero';
  end if;

  -- Verificar disponibilidad de TODOS los componentes antes de mover nada
  for v_component in
    select pc.material_id, pc.quantity_required, m.name, m.current_stock
    from product_components pc
    join materials m on m.id = pc.material_id
    where pc.product_id = p_product_id
    for update of m
  loop
    v_required := v_component.quantity_required * p_quantity;
    if v_component.current_stock < v_required then
      v_missing := v_missing || format(
        'Te faltan %s %s. ', round(v_required - v_component.current_stock, 2), v_component.name
      );
    end if;
  end loop;

  if v_missing <> '' then
    raise exception '%', trim(v_missing);
  end if;

  -- Consumir componentes
  for v_component in
    select pc.material_id, pc.quantity_required, m.average_unit_cost
    from product_components pc
    join materials m on m.id = pc.material_id
    where pc.product_id = p_product_id
  loop
    v_required := v_component.quantity_required * p_quantity;

    update materials set current_stock = current_stock - v_required where id = v_component.material_id;

    insert into inventory_movements (
      store_id, movement_type, material_id, quantity, reference_type, created_by
    ) values (
      p_store_id, 'production_consumption', v_component.material_id, -v_required, 'production_run', p_user_id
    );

    v_total_cost := v_total_cost + v_required * v_component.average_unit_cost;
  end loop;

  -- Registrar producto terminado
  update products set stock_on_hand = stock_on_hand + p_quantity where id = p_product_id;

  insert into inventory_movements (
    store_id, movement_type, product_id, quantity, reference_type, created_by
  ) values (
    p_store_id, 'production_output', p_product_id, p_quantity, 'production_run', p_user_id
  );

  insert into production_runs (store_id, product_id, quantity_produced, total_production_cost, created_by)
  values (p_store_id, p_product_id, p_quantity, v_total_cost, p_user_id)
  returning id into v_run_id;

  return v_run_id;
end;
$$;

-- ─────────────────────────────────────────────────────────────────
-- Numeración de pedidos: RSN-00125 (Sección 33), sin hardcodear "RSN"
-- ─────────────────────────────────────────────────────────────────
create table order_number_counters (
  store_id uuid primary key references stores (id) on delete cascade,
  last_number bigint not null default 0
);

create function generate_order_number(p_store_id uuid) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_prefix text;
  v_next bigint;
begin
  select upper(left(regexp_replace(slug, '[^a-zA-Z]', '', 'g'), 3)) into v_prefix
  from stores where id = p_store_id;
  v_prefix := coalesce(nullif(v_prefix, ''), 'ORD');

  insert into order_number_counters (store_id, last_number)
  values (p_store_id, 1)
  on conflict (store_id) do update set last_number = order_number_counters.last_number + 1
  returning last_number into v_next;

  return v_prefix || '-' || lpad(v_next::text, 5, '0');
end;
$$;

-- ─────────────────────────────────────────────────────────────────
-- Crear pedido de comprador invitado (Checkout, Sección 26-28, 36)
-- Reserva stock y crea el registro de pago en estado 'pending'.
-- ─────────────────────────────────────────────────────────────────
create function create_guest_order(
  p_store_id uuid,
  p_customer jsonb,     -- {first_name,last_name,email,phone}
  p_shipping jsonb,     -- {department,province,district,address_line,reference,instructions}
  p_items jsonb,        -- [{product_id, quantity}]
  p_gift jsonb default null,   -- {recipient_name,recipient_phone,message,special_packaging}
  p_shipping_cost numeric default 0,
  p_discount numeric default 0
) returns table (id uuid, order_number text)
language plpgsql security definer set search_path = public as $$
declare
  v_customer_id uuid;
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric := 0;
  v_total numeric;
  v_item jsonb;
  v_product products%rowtype;
  v_reservation_minutes int;
begin
  insert into customers (store_id, first_name, last_name, email, phone)
  values (p_store_id, p_customer->>'first_name', p_customer->>'last_name', p_customer->>'email', p_customer->>'phone')
  returning id into v_customer_id;

  select coalesce(stock_reservation_minutes, 45) into v_reservation_minutes
  from site_settings where store_id = p_store_id;

  v_order_number := generate_order_number(p_store_id);

  insert into orders (
    store_id, order_number, customer_id, status,
    is_gift, gift_recipient_name, gift_recipient_phone, gift_message, gift_special_packaging,
    buyer_first_name, buyer_last_name, buyer_phone, buyer_email,
    shipping_department, shipping_province, shipping_district, shipping_address,
    shipping_reference, shipping_instructions,
    subtotal, shipping_cost, discount, total, stock_reserved_until
  ) values (
    p_store_id, v_order_number, v_customer_id, 'esperando_pago',
    p_gift is not null, p_gift->>'recipient_name', p_gift->>'recipient_phone', p_gift->>'message',
    coalesce((p_gift->>'special_packaging')::boolean, false),
    p_customer->>'first_name', p_customer->>'last_name', p_customer->>'phone', p_customer->>'email',
    p_shipping->>'department', p_shipping->>'province', p_shipping->>'district', p_shipping->>'address_line',
    p_shipping->>'reference', p_shipping->>'instructions',
    0, p_shipping_cost, p_discount, 0,
    now() + (coalesce(v_reservation_minutes, 45) || ' minutes')::interval
  ) returning orders.id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_product from products
      where id = (v_item->>'product_id')::uuid and store_id = p_store_id
      for update;

    if v_product.id is null then
      raise exception 'Producto no encontrado';
    end if;

    if v_product.stock_on_hand - v_product.stock_reserved < (v_item->>'quantity')::int then
      raise exception 'Stock insuficiente para %', v_product.name;
    end if;

    update products set stock_reserved = stock_reserved + (v_item->>'quantity')::int where id = v_product.id;

    insert into order_items (order_id, product_id, product_name, sku, unit_price, quantity, subtotal)
    values (
      v_order_id, v_product.id, v_product.name, v_product.sku, v_product.price,
      (v_item->>'quantity')::int, v_product.price * (v_item->>'quantity')::int
    );

    v_subtotal := v_subtotal + v_product.price * (v_item->>'quantity')::int;
  end loop;

  v_total := v_subtotal + p_shipping_cost - p_discount;
  update orders set subtotal = v_subtotal, total = v_total where orders.id = v_order_id;

  insert into payments (order_id, method, status, amount_expected)
  values (v_order_id, 'yape', 'pending', v_total);

  return query select v_order_id, v_order_number;
end;
$$;

-- ─────────────────────────────────────────────────────────────────
-- Comprobante cargado → "pago por validar" (Sección 32/35)
-- ─────────────────────────────────────────────────────────────────
create function flag_duplicate_operation_number() returns trigger
language plpgsql as $$
begin
  if new.operation_number is not null and exists (
    select 1 from payment_receipts where operation_number = new.operation_number and id <> new.id
  ) then
    new.is_possible_duplicate := true;
  end if;
  return new;
end;
$$;

create trigger trg_flag_duplicate_operation_number
  before insert or update of operation_number on payment_receipts
  for each row execute function flag_duplicate_operation_number();

create function on_receipt_uploaded() returns trigger
language plpgsql as $$
declare
  v_order_id uuid;
begin
  update payments set status = 'submitted', updated_at = now()
    where id = new.payment_id and status = 'pending'
    returning order_id into v_order_id;

  if v_order_id is not null then
    update orders set status = 'pago_por_validar', updated_at = now() where id = v_order_id;
  end if;

  return new;
end;
$$;

create trigger trg_receipt_uploaded
  after insert on payment_receipts
  for each row execute function on_receipt_uploaded();

-- ─────────────────────────────────────────────────────────────────
-- "CONFIRMAR PAGO" — un solo clic (Sección 35/41/87)
-- ─────────────────────────────────────────────────────────────────
create function confirm_payment(p_payment_id uuid, p_confirmed_by uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_order orders%rowtype;
  v_item record;
begin
  select o.* into v_order
  from payments p join orders o on o.id = p.order_id
  where p.id = p_payment_id
  for update of o;

  if v_order.id is null then
    raise exception 'Pedido no encontrado';
  end if;

  if not is_store_staff(v_order.store_id) then
    raise exception 'No autorizado';
  end if;

  update payments
    set status = 'paid', confirmed_by = p_confirmed_by, confirmed_at = now(), updated_at = now()
    where id = p_payment_id;

  update orders set status = 'en_preparacion', updated_at = now() where id = v_order.id;

  for v_item in select * from order_items where order_id = v_order.id loop
    update products
      set stock_reserved = greatest(0, stock_reserved - v_item.quantity),
          stock_on_hand = stock_on_hand - v_item.quantity
      where id = v_item.product_id;

    insert into inventory_movements (
      store_id, movement_type, product_id, quantity, reference_type, reference_id, created_by
    ) values (
      v_order.store_id, 'sale', v_item.product_id, -v_item.quantity, 'order', v_order.id, p_confirmed_by
    );
  end loop;

  insert into audit_logs (store_id, actor_id, action, entity_type, entity_id, new_value)
  values (
    v_order.store_id, p_confirmed_by, 'confirm_payment', 'order', v_order.id,
    jsonb_build_object('order_number', v_order.order_number)
  );
end;
$$;

-- ─────────────────────────────────────────────────────────────────
-- Liberación de reservas expiradas (Sección 36) vía pg_cron
-- ─────────────────────────────────────────────────────────────────
create function release_expired_reservations() returns void
language plpgsql security definer set search_path = public as $$
declare
  v_order record;
  v_item record;
begin
  for v_order in
    select o.* from orders o
    join payments p on p.order_id = o.id
    where o.status = 'esperando_pago'
      and o.stock_reserved_until < now()
      and p.status = 'pending'   -- si ya hay comprobante, no se libera automáticamente
    for update of o
  loop
    for v_item in select * from order_items where order_id = v_order.id loop
      update products set stock_reserved = greatest(0, stock_reserved - v_item.quantity)
        where id = v_item.product_id;

      insert into inventory_movements (
        store_id, movement_type, product_id, quantity, reference_type, reference_id
      ) values (
        v_order.store_id, 'cancellation', v_item.product_id, v_item.quantity, 'order', v_order.id
      );
    end loop;

    update orders set status = 'cancelado', updated_at = now() where id = v_order.id;
    update payments set status = 'rejected', updated_at = now() where order_id = v_order.id and status = 'pending';
  end loop;
end;
$$;

select cron.schedule(
  'release-expired-stock-reservations', '*/5 * * * *', $$select release_expired_reservations()$$
);

-- ─────────────────────────────────────────────────────────────────
-- Permisos de ejecución (las tablas siguen protegidas por RLS)
-- ─────────────────────────────────────────────────────────────────
grant execute on function create_guest_order(uuid, jsonb, jsonb, jsonb, jsonb, numeric, numeric) to anon, authenticated;
grant execute on function register_production_run(uuid, uuid, int, uuid) to authenticated;
grant execute on function confirm_payment(uuid, uuid) to authenticated;
