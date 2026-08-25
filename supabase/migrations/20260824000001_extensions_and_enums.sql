-- ROSSANA — Extensiones y tipos enumerados
-- Fase 2: Base de datos

create extension if not exists "pgcrypto";      -- gen_random_uuid()
create extension if not exists "pg_cron";        -- expiración de reservas de stock

create type product_status as enum ('draft', 'published', 'archived');

create type material_unit as enum (
  'unidad', 'gramo', 'kilogramo', 'centimetro', 'metro', 'paquete'
);

create type inventory_movement_type as enum (
  'purchase',                 -- Compraste materiales
  'production_consumption',   -- Usaste materiales para fabricar
  'production_output',        -- Fabricaste productos
  'sale',                     -- Se vendió (pago confirmado)
  'adjustment',                -- Ajuste manual
  'return',                    -- Devolución
  'cancellation'                -- Cancelación (libera reserva)
);

-- Estados visibles al comprador y al admin (Sección 34)
create type order_status as enum (
  'esperando_pago',
  'pago_por_validar',
  'en_preparacion',
  'listo_para_entrega',
  'enviado',
  'entregado',
  'cancelado'
);

create type payment_status as enum (
  'pending',            -- esperando comprobante
  'submitted',          -- comprobante recibido, por validar
  'possible_duplicate', -- n° de operación repetido (no es fraude automático)
  'paid',               -- confirmado manualmente por el admin
  'rejected'            -- "no pude validarlo"
);

create type operation_number_source as enum ('ocr', 'manual');
