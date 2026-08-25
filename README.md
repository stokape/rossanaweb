# Rossana — Bisutería y Más

E-commerce real y administrable: tienda pública + panel del emprendedor
+ inventario de productos y materiales + costeo automático + pedidos
con pago manual por Yape. Ver `ARCHITECTURE.md` (arquitectura, árbol de
páginas, modelo de datos) y `PROJECT_STATUS.md` (avance por fase y
bloqueos activos).

## Stack

Next.js 16 (App Router) · TypeScript · React 19 · Tailwind CSS v4 ·
Supabase (Postgres + Auth + Storage).

## Instalación

```bash
npm install
cp .env.example .env.local   # completar con tu proyecto de Supabase
npm run dev
```

## Variables de entorno

Ver `.env.example`. Ninguna URL, credencial de Yape o número de
WhatsApp está hardcodeada en el código: todo lo operativo se configura
desde `/admin/configuracion` una vez desplegado; lo técnico (URL del
sitio, credenciales de Supabase) vive en variables de entorno.

## Supabase — migraciones y RLS

El esquema completo vive en `supabase/migrations/`, en orden:

1. `20260824000001_extensions_and_enums.sql`
2. `20260824000002_core_tables.sql` — tiendas, perfiles, roles (RBAC), categorías
3. `20260824000003_catalog_tables.sql` — productos, imágenes
4. `20260824000004_materials_and_inventory.sql` — materiales, compras, receta, fabricación
5. `20260824000005_commerce_tables.sql` — clientes, carrito, pedidos, pagos, comprobantes
6. `20260824000006_settings_tables.sql` — configuración del negocio, banners, auditoría
7. `20260824000007_functions_and_triggers.sql` — costo promedio, fabricación, numeración de pedidos, checkout de invitado, confirmación de pago, expiración de reservas
8. `20260824000008_rls_policies.sql` — Row Level Security
9. `20260824000009_storefront_view.sql` — vista pública sin columnas de costo + funciones de acceso de invitado
10. `20260824000010_storage_buckets.sql` — buckets de imágenes/comprobantes y sus policies

Aplicar con la Supabase CLI:

```bash
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push
npx supabase db seed   # o: psql < supabase/seed.sql
```

Después de crear el primer usuario en Supabase Auth, asignarle el rol
`owner` siguiendo las instrucciones al final de `supabase/seed.sql`.

Regenerar los tipos de TypeScript del esquema real (reemplaza el
placeholder en `src/types/database.ts`):

```bash
npx supabase gen types typescript --project-id <PROJECT_REF> > src/types/database.ts
```

### RLS — regla crítica de costos

`products` y `materials` **no son legibles por `anon`**. El catálogo
público lee de la vista `storefront_products`, que no incluye ninguna
columna de costo/margen (Sección 73 del prompt maestro). No agregar
columnas de costo a esa vista ni exponer `products` directamente a
`anon` sin revisar esta regla primero.

## Inventario y costos — resumen funcional

- **Mis materiales**: stock, costo promedio ponderado (recalculado
  automáticamente en cada compra), aviso de reposición.
- **Componentes del producto** (receta/BOM interno): qué materiales y
  cuánto consume cada producto.
- **Hacer productos**: valida stock suficiente, consume materiales,
  aumenta stock terminado, todo en una sola transacción atómica.
- **Costo y precio**: costo total = materiales + mano de obra + empaque
  + otros; precio sugerido = costo + % de ganancia + IGV configurable;
  el precio final publicado siempre lo decide el emprendedor.

## Yape manual — regla crítica

Subir un comprobante **nunca** es igual a pago confirmado. El estado
pasa a "pago por validar" y solo un clic del administrador en
"Confirmar pago" (`confirm_payment` en BD) marca el pago como pagado,
consolida el stock y dispara la auditoría. El OCR es solo una ayuda
para pre-llenar el N° de operación; nunca es la validación financiera.

## Desarrollo

```bash
npm run dev      # servidor de desarrollo
npm run lint      # ESLint
npm run build     # build de producción (incluye chequeo de tipos)
```

## Despliegue

Objetivo de costo fijo inicial S/0 (Sección 19): Vercel (plan
gratuito) + Supabase (plan gratuito), mientras el consumo se mantenga
dentro de esos planes. Dominio inicial: `ventas.stoka.pe`, vía
`NEXT_PUBLIC_SITE_URL` — migrar a dominio propio no requiere tocar
código, solo esa variable y el DNS.

## Backup

Supabase provee backups automáticos diarios en planes pagos; en el
plan gratuito, exportar periódicamente con
`npx supabase db dump -f backup.sql` y guardar el archivo fuera del
repositorio (nunca versionarlo: puede contener datos de clientes).

## Limitaciones conocidas / pendientes

Ver `PROJECT_STATUS.md` — sección "Bloqueos reales activos" y tabla de
fases. En resumen: falta proyecto Supabase real, logo oficial, fotos de
producto reales y datos operativos (Yape/WhatsApp) para poder avanzar
de la Fase 3 en adelante con datos reales en vez de placeholders.
