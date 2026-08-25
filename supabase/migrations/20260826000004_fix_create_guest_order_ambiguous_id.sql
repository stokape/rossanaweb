-- ROSSANA — Fix: create_guest_order() fallaba con
-- "column reference \"id\" is ambiguous" en TODA llamada real.
--
-- Causa: `returns table (id uuid, order_number text)` declara `id`
-- como variable de salida implícita dentro de la función. Cualquier
-- referencia sin calificar a `id` dentro del cuerpo (p. ej.
-- `where id = ...` contra `customers` o `products`) queda ambigua
-- entre esa variable de salida y la columna de la tabla.
--
-- Se detectó llamando a la función end-to-end desde el navegador
-- (simulando el checkout real) contra un producto de prueba: la
-- llamada fallaba con error 42702 en el 100% de los casos. `CREATE OR
-- REPLACE FUNCTION` con la misma firma conserva los GRANT ya
-- otorgados.

create or replace function create_guest_order(
  p_store_id uuid,
  p_customer jsonb,
  p_shipping jsonb,
  p_items jsonb,
  p_gift jsonb default null,
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
  returning customers.id into v_customer_id;

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
      where products.id = (v_item->>'product_id')::uuid and products.store_id = p_store_id
      for update;

    if v_product.id is null then
      raise exception 'Producto no encontrado';
    end if;

    if v_product.stock_on_hand - v_product.stock_reserved < (v_item->>'quantity')::int then
      raise exception 'Stock insuficiente para %', v_product.name;
    end if;

    update products set stock_reserved = stock_reserved + (v_item->>'quantity')::int
      where products.id = v_product.id;

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

grant execute on function create_guest_order(uuid, jsonb, jsonb, jsonb, jsonb, numeric, numeric) to anon, authenticated;
