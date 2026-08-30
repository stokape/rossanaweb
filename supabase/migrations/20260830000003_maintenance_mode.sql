-- Modo mantenimiento (pedido de Rossana): permite mostrarle a los
-- compradores una página de "en mantenimiento" sin tocar código,
-- mientras el panel /admin sigue funcionando con normalidad.
alter table site_settings
  add column maintenance_mode boolean not null default false,
  add column maintenance_message text;
