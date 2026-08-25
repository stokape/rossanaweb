-- ROSSANA — Seed estructural
-- Solo datos de configuración necesarios para operar. NUNCA productos,
-- ventas ni reseñas falsas (Sección 88). El alta de productos reales,
-- Yape y WhatsApp se hace desde /admin una vez creado el usuario dueño.

insert into roles (key, name) values
  ('owner', 'Dueño'),
  ('staff', 'Colaborador')
on conflict (key) do nothing;

insert into stores (id, name, slug, legal_name, description)
values (
  '00000000-0000-0000-0000-000000000001',
  'Rossana',
  'rossana',
  null,
  'Bisutería y accesorios que complementan tu esencia.'
)
on conflict (id) do nothing;

insert into site_settings (store_id, business_name, tax_rate, stock_reservation_minutes)
values ('00000000-0000-0000-0000-000000000001', 'Rossana — Bisutería y Más', 0.18, 45)
on conflict (store_id) do nothing;

-- Después de crear el primer usuario en Supabase Auth (Fase 3), asignar
-- el rol 'owner' manualmente una vez, por ejemplo desde el SQL editor:
--
-- insert into profiles (id, store_id, full_name)
--   values ('<auth_user_id>', '00000000-0000-0000-0000-000000000001', 'Rossana');
--
-- insert into profile_roles (profile_id, role_id, store_id)
--   select '<auth_user_id>', id, '00000000-0000-0000-0000-000000000001'
--   from roles where key = 'owner';
