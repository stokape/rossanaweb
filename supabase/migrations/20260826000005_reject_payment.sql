-- ROSSANA — "NO PUDE VALIDARLO" (Sección 41): el admin marca que no
-- pudo confirmar el pago con ese comprobante. No cancela el pedido
-- automáticamente ni libera el stock — Rossana decide manualmente qué
-- hacer después (contactar al cliente, pedir otro comprobante, etc.).

create function reject_payment(p_payment_id uuid, p_rejected_by uuid, p_reason text default null)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_order orders%rowtype;
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
    set status = 'rejected', rejection_reason = p_reason, updated_at = now()
    where id = p_payment_id;

  insert into audit_logs (store_id, actor_id, action, entity_type, entity_id, new_value)
  values (
    v_order.store_id, p_rejected_by, 'reject_payment', 'order', v_order.id,
    jsonb_build_object('order_number', v_order.order_number, 'reason', p_reason)
  );
end;
$$;

grant execute on function reject_payment(uuid, uuid, text) to authenticated;
