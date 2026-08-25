# Rossana — Bisutería y Más

E-commerce real y administrable: tienda pública + panel del emprendedor
+ inventario de productos y materiales + costeo automático + pedidos
con pago manual por Yape.

Documentos relacionados:

- `ARCHITECTURE.md` — arquitectura, árbol de páginas, modelo de datos.
- `PROJECT_STATUS.md` — avance por fase, bugs reales encontrados y corregidos, bloqueos activos.
- `QA_CHECKLIST.md` — qué está verificado en vivo vs. revisado por código.
- `MANUAL_EMPRENDEDOR.md` — guía de uso del panel para Rossana, sin lenguaje técnico.
- `DEPLOY.md` — pasos para poner la tienda en producción (incluye lo que solo el usuario puede hacer: cuentas, DNS).

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

**Ya aplicado** contra el proyecto de producción (`cnzbifvnhuqiasgvtskn`,
2026-08-25). Para aplicarlo contra otro proyecto (o reaplicar tras
agregar una migración nueva), usar el script incluido — la Supabase CLI
(`supabase db push` / `gen types`) requiere Docker Desktop, no siempre
disponible:

```bash
DB_HOST='aws-0-<region>.pooler.supabase.com' \
DB_USER='postgres.<project-ref>' \
DB_PASSWORD='<tu contraseña de BD>' \
node scripts/run-migrations.mjs
```

El host/usuario salen de **Settings → Database → Connection string
→ Session pooler** en el dashboard de Supabase. El script aplica todos
los archivos de `supabase/migrations/` en orden y luego `supabase/seed.sql`
(usa `insert ... on conflict do nothing`, así que reaplicar el seed es
seguro).

Después de crear el primer usuario en Supabase Auth, asignarle el rol
`owner` siguiendo las instrucciones al final de `supabase/seed.sql`.

Los tipos de TypeScript (`src/types/database.ts`) están escritos a mano
a partir de las migraciones, porque `supabase gen types` también
requiere Docker en esta máquina. Si se instala Docker Desktop, se puede
regenerar y comparar con:

```bash
npx supabase gen types typescript --db-url "postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres" > src/types/database.ts
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

## SEO

`sitemap.xml` y `robots.txt` se generan dinámicamente (Next.js metadata
routes, `src/app/sitemap.ts` / `src/app/robots.ts`) a partir de lo
realmente publicado — nunca una lista fija de URLs. Datos estructurados
JSON-LD: `Organization` + `WebSite` (global), `BreadcrumbList` +
`Product` + `Offer` (ficha de producto) — sin reviews ni ratings
falsos (Sección 66).

## Seguridad

- RLS en todas las tablas (ver arriba). Verificado en vivo repetidas
  veces durante el desarrollo — ver `PROJECT_STATUS.md` para el detalle
  de los 4 bugs de RLS/tipos encontrados y corregidos.
- Cabeceras de seguridad (`X-Frame-Options`, CSP, `Referrer-Policy`,
  `Permissions-Policy`) en `next.config.ts`.
- Rate limiting best-effort en el checkout (`src/lib/rate-limit.ts`) —
  limitación de memoria-por-instancia documentada ahí mismo; para
  protección real a escala, migrar a un contador compartido (p. ej.
  Upstash Redis).
- Auditoría (`audit_logs`): confirmar/rechazar pago, cambiar precio,
  cambiar configuración de Yape, eliminar producto.

## Despliegue

Objetivo de costo fijo inicial S/0 (Sección 19): Vercel (plan
gratuito) + Supabase (plan gratuito), mientras el consumo se mantenga
dentro de esos planes. Dominio inicial: `ventas.stoka.pe`, vía
`NEXT_PUBLIC_SITE_URL` — migrar a dominio propio no requiere tocar
código, solo esa variable y el DNS. Pasos detallados, incluyendo lo que
solo el usuario puede hacer (crear cuentas, DNS, variables de entorno):
ver `DEPLOY.md`.

## Backup

Supabase provee backups automáticos diarios en planes pagos; en el
plan gratuito, exportar periódicamente con
`npx supabase db dump -f backup.sql` y guardar el archivo fuera del
repositorio (nunca versionarlo: puede contener datos de clientes).

## Dependencias principales

`next`, `react`, `react-dom`, `@supabase/supabase-js`, `@supabase/ssr`,
`zod`, `react-hook-form`, `@hookform/resolvers`, `clsx`,
`tailwind-merge`, `lucide-react`, `date-fns`, `server-only`,
`tesseract.js` (OCR), Tailwind CSS v4. Dev-only: `pg` (scripts de
migración).

## Limitaciones conocidas / pendientes

- No hay UI de "ajuste manual de stock" (el stock solo se mueve por
  compra/fabricación/venta/reserva — cubre el flujo normal, pero no un
  ajuste manual por pérdida/rotura). Se puede agregar después sin
  cambiar el esquema (`inventory_movements` ya tiene el tipo
  `adjustment`).
- El rate limiting es best-effort en memoria (ver sección Seguridad) —
  no es una defensa robusta contra abuso a gran escala.
- OCR nunca probado contra una foto real de Yape en un navegador (ver
  `QA_CHECKLIST.md`) — el fallback manual sí está garantizado.
- Falta: logo oficial, fotos de producto reales, Yape/WhatsApp reales,
  cuenta de Vercel y DNS del dominio — todo depende de acciones del
  usuario, documentadas en `DEPLOY.md`.
