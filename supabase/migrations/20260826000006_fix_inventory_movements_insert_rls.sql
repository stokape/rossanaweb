-- ROSSANA — Fix: registrar una compra de material (Sección 48) fallaba
-- SIEMPRE con "new row violates row-level security policy for table
-- inventory_movements".
--
-- Causa: el trigger `apply_material_purchase()` (dispara al insertar
-- en `material_purchases`) inserta también en `inventory_movements`,
-- pero esa tabla solo tenía policy de SELECT para staff
-- (`inventory_movements_staff_read`), ninguna de INSERT. El trigger no
-- es `security definer`, así que corre con el rol del usuario
-- autenticado real — y ese INSERT quedaba bloqueado, revirtiendo toda
-- la compra (el stock del material se quedaba en 0).
--
-- Se detectó insertando un material real y dos compras reales,
-- autenticado como el usuario owner: el stock y el costo promedio no
-- se actualizaban.

create policy inventory_movements_staff_insert on inventory_movements for insert
  with check (is_store_staff(store_id));
