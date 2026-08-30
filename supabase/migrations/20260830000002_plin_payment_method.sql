-- ROSSANA — Plin como segundo método de pago manual, junto a Yape
-- (pedido directo de Rossana: "el emprendedor tiene PLIN ademas de
-- YAPE, que no se muestre exclusivamente YAPE"). Mismos campos que
-- Yape, todos opcionales/configurables desde el panel — nunca
-- hardcodeados en el código (Sección 17/64).
alter table site_settings
  add column plin_holder_name text,
  add column plin_number text,
  add column plin_qr_url text,
  add column plin_instructions text;

-- submit_payment_receipt ahora también registra con qué billetera pagó
-- el comprador (Yape o Plin), sobre el mismo `payments` del pedido
-- (payments.method ya existía como texto libre, default 'yape').
-- Se recrea (DROP + CREATE) porque agregar un parámetro cambia la
-- firma de la función.
drop function if exists submit_payment_receipt(
  uuid, text, text, int, text, operation_number_source, numeric, timestamptz, numeric, jsonb
);

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
  p_ocr_raw_data jsonb default null,
  p_payment_method text default null
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

  if p_payment_method is not null then
    update payments set method = p_payment_method, updated_at = now() where id = v_payment_id;
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
  uuid, text, text, int, text, operation_number_source, numeric, timestamptz, numeric, jsonb, text
) to anon, authenticated;
