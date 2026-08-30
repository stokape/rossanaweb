-- ROSSANA — "ANULAR PEDIDO" (panel de admin, pedido directo de
-- Rossana): un solo clic para anular un pedido, en cualquier estado
-- menos "cancelado" (ya anulado). Reversa el stock según qué tan
-- avanzado estaba el pedido, igual que hace release_expired_reservations
-- para reservas vencidas:
--   - esperando_pago / pago_por_validar: el pago nunca se confirmó,
--     el stock solo estaba RESERVADO (nunca se descontó de verdad) ->
--     se libera la reserva.
--   - en_preparacion: el pago ya se había confirmado (confirm_payment
--     ya descontó stock_on_hand de verdad), pero el pedido todavía no
--     salió -> se devuelve la mercadería a stock_on_hand.
--   - listo_para_entrega / enviado / entregado: el producto pudo haber
--     salido físicamente de la tienda -> NO se toca el stock solo;
--     Rossana lo ajusta a mano desde la ficha del producto si el
--     artículo vuelve de verdad.
-- El pago ya confirmado ('paid') nunca se reescribe a 'rejected' -- es
-- un hecho histórico real (el dinero sí se recibió), aunque el pedido
-- se anule después.

create function cancel_order(p_order_id uuid, p_cancelled_by uuid, p_reason text default null)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_order orders%rowtype;
  v_item record;
begin
  select * into v_order from orders where id = p_order_id for update;

  if v_order.id is null then
    raise exception 'Pedido no encontrado';
  end if;

  if not is_store_staff(v_order.store_id) then
    raise exception 'No autorizado';
  end if;

  if v_order.status = 'cancelado' then
    raise exception 'Este pedido ya está anulado';
  end if;

  if v_order.status in ('esperando_pago', 'pago_por_validar') then
    for v_item in select * from order_items where order_id = v_order.id loop
      update products set stock_reserved = greatest(0, stock_reserved - v_item.quantity)
        where id = v_item.product_id;
    end loop;
  elsif v_order.status = 'en_preparacion' then
    for v_item in select * from order_items where order_id = v_order.id loop
      update products set stock_on_hand = stock_on_hand + v_item.quantity
        where id = v_item.product_id;

      insert into inventory_movements (
        store_id, movement_type, product_id, quantity, reference_type, reference_id, created_by
      ) values (
        v_order.store_id, 'cancellation', v_item.product_id, v_item.quantity, 'order', v_order.id, p_cancelled_by
      );
    end loop;
  end if;

  update orders set status = 'cancelado', updated_at = now() where id = v_order.id;
  update payments
    set status = 'rejected', rejection_reason = coalesce(p_reason, rejection_reason), updated_at = now()
    where order_id = v_order.id and status <> 'paid';

  insert into audit_logs (store_id, actor_id, action, entity_type, entity_id, new_value)
  values (
    v_order.store_id, p_cancelled_by, 'cancel_order', 'order', v_order.id,
    jsonb_build_object('order_number', v_order.order_number, 'reason', p_reason, 'previous_status', v_order.status)
  );
end;
$$;

grant execute on function cancel_order(uuid, uuid, text) to authenticated;
