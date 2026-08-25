-- ROSSANA — Vista pública de catálogo (Sección 73)
-- No incluye: labor_cost, packaging_cost, other_direct_cost,
-- markup_percentage, tax_rate, include_tax, stock_on_hand, stock_reserved.
-- El propietario de la vista (postgres) puede leer `products` sin pasar
-- por sus policies de staff; por eso el filtro status='published' va
-- explícito aquí, actuando como el único filtro de seguridad real.

create view storefront_products as
select
  id, store_id, category_id, sku, name, slug,
  short_description, description, material, color, dimensions, weight_grams,
  featured, stock_available, price, compare_at_price,
  seo_title, seo_description, created_at, updated_at
from products
where status = 'published';

grant select on storefront_products to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────
-- Funciones "puerta angosta" para el flujo de invitado (Sección 33/29)
-- El UUID del pedido actúa como token de acceso: es impredecible y se
-- entrega solo al comprador justo después de crear el pedido.
-- ─────────────────────────────────────────────────────────────────
create function get_order_public(p_order_id uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_result jsonb;
begin
  select jsonb_build_object(
    'order_number', o.order_number,
    'status', o.status,
    'total', o.total,
    'buyer_first_name', o.buyer_first_name,
    'created_at', o.created_at,
    'payment_status', p.status,
    'amount_expected', p.amount_expected,
    'items', (
      select jsonb_agg(jsonb_build_object(
        'product_name', oi.product_name, 'quantity', oi.quantity,
        'unit_price', oi.unit_price, 'subtotal', oi.subtotal
      ))
      from order_items oi where oi.order_id = o.id
    )
  ) into v_result
  from orders o
  join payments p on p.order_id = o.id
  where o.id = p_order_id;

  return v_result;
end;
$$;

grant execute on function get_order_public(uuid) to anon, authenticated;

-- El comprador sube su comprobante Yape sin necesitar cuenta. El
-- archivo en sí se sube a Storage (bucket `receipts`, ver
-- 20260824000010_storage_buckets.sql); esta función solo registra la
-- fila en `payment_receipts` una vez subido el archivo.
create function submit_payment_receipt(
  p_order_id uuid,
  p_file_url text,
  p_mime_type text,
  p_file_size_bytes int,
  p_operation_number text default null,
  p_operation_number_source operation_number_source default null,
  p_amount_detected numeric default null,
  p_operation_date_detected timestamptz default null,
  p_ocr_confidence numeric default null,
  p_ocr_raw_data jsonb default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_payment_id uuid;
  v_receipt_id uuid;
begin
  select p.id into v_payment_id from payments p where p.order_id = p_order_id;

  if v_payment_id is null then
    raise exception 'Pedido no encontrado';
  end if;

  insert into payment_receipts (
    payment_id, file_url, mime_type, file_size_bytes,
    operation_number, operation_number_source,
    amount_detected, operation_date_detected, ocr_confidence, ocr_raw_data
  ) values (
    v_payment_id, p_file_url, p_mime_type, p_file_size_bytes,
    p_operation_number, p_operation_number_source,
    p_amount_detected, p_operation_date_detected, p_ocr_confidence, p_ocr_raw_data
  ) returning id into v_receipt_id;

  return v_receipt_id;
end;
$$;

grant execute on function submit_payment_receipt(
  uuid, text, text, int, text, operation_number_source, numeric, timestamptz, numeric, jsonb
) to anon, authenticated;
