-- Fix: "ELIMINAR TODOS LOS PRODUCTOS" (deleteAllProductsAction) borra
-- primero order_items/inventory_movements/cart_items de un producto
-- antes de reintentar borrarlo — pero esas 3 tablas no tenían ninguna
-- policy de DELETE para staff (order_items e inventory_movements solo
-- tenían SELECT/INSERT; cart_items solo tenía policy de cliente dueño
-- del carrito). El staff podía LEER esas filas pero no borrarlas, así
-- que el borrado quedaba en 0 filas sin ningún error visible, y el
-- reintento sobre products volvía a chocar con la misma FK. Reportado
-- por Rossana: "0 eliminados (12 no se pudieron eliminar)".
create policy order_items_staff_delete on order_items for delete using (
  exists (select 1 from orders o where o.id = order_items.order_id and is_store_staff(o.store_id))
);

create policy inventory_movements_staff_delete on inventory_movements for delete using (
  is_store_staff(store_id)
);

create policy cart_items_staff_delete on cart_items for delete using (
  exists (select 1 from products p where p.id = cart_items.product_id and is_store_staff(p.store_id))
);
