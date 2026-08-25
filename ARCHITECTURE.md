# ARCHITECTURE — Rossana, Bisutería y Más

Documento requerido por la Sección 96 del prompt maestro: arquitectura,
árbol de páginas, modelo de datos, componentes principales, plan de
implementación, dependencias y riesgos. Se entrega antes de continuar
fase por fase.

## A. Arquitectura propuesta

- **Next.js 16 (App Router) + TypeScript + React 19.** SSR/SSG donde
  aporte valor (catálogo, producto, SEO); Client Components solo donde
  hay interacción (carrito, wizard admin, uploader).
- **Tailwind CSS v4** con Design Tokens en `src/app/globals.css`
  (`@theme inline`) — un solo lugar para el rojo Rossana y el resto de
  la paleta, nunca hardcodeado por componente.
- **Supabase** como backend: Postgres + Auth + Storage.
  - Cliente **anon** (browser/server) para todo lo que respeta RLS.
  - Cliente **service role** (`src/lib/supabase/admin.ts`, `server-only`)
    reservado a operaciones administrativas puntuales, nunca en el
    frontend.
  - La mayoría de las escrituras sensibles (crear pedido de invitado,
    confirmar pago, fabricar productos) pasan por **funciones
    `security definer`** en Postgres en vez de INSERT/UPDATE directos
    desde el cliente — así la transacción es atómica (Sección 83) y la
    superficie de ataque queda acotada a parámetros validados.
- **Costos nunca públicos** (Sección 73): la tienda pública lee la vista
  `storefront_products`, que no incluye ninguna columna de costo/margen;
  la tabla `products` real solo es legible por `anon` a través de esa
  vista, nunca directamente.
- **Carrito de invitado en `localStorage`**; se persiste en BD recién al
  checkout (`create_guest_order`). Cuentas de cliente registradas sí usan
  `carts`/`cart_items` en BD para persistencia entre dispositivos.
- **OCR** desacoplado detrás de una interfaz (`src/lib/ocr/`), MVP con
  Tesseract.js (gratuito, sin costo fijo) y fallback manual siempre
  disponible — nunca bloqueante (Sección 30).
- **Multi-tienda futura**: casi todas las tablas llevan `store_id` desde
  el día uno (Sección 71) sin construir hoy un panel multi-tenant.
- **Hosting objetivo**: Vercel (plan gratuito) + Supabase (plan
  gratuito) → costo fijo inicial S/0 (Sección 19), con `NEXT_PUBLIC_SITE_URL`
  como única fuente del dominio (Sección 78).

## B. Árbol de páginas

```
/ (home)
/productos                          catálogo (filtros, orden, paginación)
/productos/[slug]                   ficha de producto + 360°
/categorias/[slug]                  listado por categoría
/buscar?q=                          resultados de búsqueda
/carrito
/checkout                           datos + entrega (invitado, sin pantalla "¿tienes cuenta?")
/checkout/pago                      YAPE manual (QR, monto, subir comprobante)
/pedido/[id]/confirmacion           confirmación + estado (vía token de invitado)
/cuenta/login
/cuenta/registro
/cuenta/recuperar
/cuenta                              perfil, direcciones, pedidos, favoritos (opcional)
/nosotros
/contacto
/politicas/[slug]                    envíos, cambios, privacidad, términos

/admin/login
/admin                                inicio ("Buenos días, Rossana")
/admin/pedidos
/admin/pedidos/[id]                   incluye "Validar Yape"
/admin/productos
/admin/productos/nuevo                wizard 6 pasos
/admin/productos/[id]/editar
/admin/materiales                     "Mis materiales"
/admin/materiales/[id]/comprar        "Agregar compra"
/admin/fabricar                       "Hacer productos"
/admin/configuracion                  negocio, Yape, WhatsApp, envíos, categorías, usuarios, SEO, políticas
```

## C. Modelo de datos (resumen — ver `supabase/migrations/`)

`stores → profiles/roles/profile_roles (RBAC) → categories → products →
product_images / product_components → materials → material_purchases /
production_runs / inventory_movements → customers → addresses → carts/
cart_items → orders → order_items → payments → payment_receipts →
shipping_zones → favorites → site_settings → banners → audit_logs`

Piezas clave ya implementadas en SQL:

- `stock_available` como columna generada (`stock_on_hand - stock_reserved`).
- Costo promedio ponderado recalculado por trigger en cada compra de material.
- `register_production_run()`: valida, consume y produce de forma atómica.
- `create_guest_order()`: crea cliente invitado + pedido + reserva de stock + fila de pago, todo en una transacción.
- `confirm_payment()`: un solo clic → pago pagado, pedido en preparación, stock consolidado, auditoría.
- `release_expired_reservations()` vía `pg_cron` cada 5 min: libera reservas vencidas solo si no hay comprobante cargado.
- Vista `storefront_products` + funciones `get_order_public` / `submit_payment_receipt`: acceso de invitado sin exponer el resto del negocio.

## D. Componentes principales

- **UI base** (`src/components/ui/`): `Button` (primary/secondary/tertiary/gold, con loading/disabled), `Input`, `Card`, `Badge` — ya creados, siguiendo Sección 7-9.
- **Shop**: Header (barra promo + header + nav sticky), Footer, ProductCard, ProductGallery+360, FiltersDrawer, CartSummary, GiftToggle, YapePanel, ReceiptUploader.
- **Admin**: AdminShell (nav de 5 módulos), HomeCards ("por revisar/preparar/stock bajo"), OrderCard, ValidateYapeSheet, ProductWizard (6 pasos), MaterialCard, PurchaseForm, ProduceForm, PricingCalculator (con "ver detalle del cálculo" oculto por defecto).

## E. Plan de implementación

Fases 0-3 (planificación, design system base, esquema de BD, auth/RLS)
iniciadas en este turno — ver `PROJECT_STATUS.md` para el detalle y los
bloqueos activos. Fases 4-18 continúan una vez resueltos los bloqueos
reales (proyecto Supabase, logo, fotos) según el orden de la Sección 91,
con lint + typecheck + build al final de cada fase (Sección 92).

## F. Dependencias

`next`, `react`, `react-dom`, `@supabase/supabase-js`, `@supabase/ssr`,
`zod`, `react-hook-form`, `@hookform/resolvers`, `clsx`, `tailwind-merge`,
`lucide-react`, `date-fns`, `server-only`, Tailwind CSS v4. OCR (Fase 9):
`tesseract.js`, a instalar cuando se implemente esa fase.

## G. Riesgos

- **Planes gratuitos tienen techo**: Supabase free (500 MB BD, 1 GB
  storage, pausas por inactividad) y Vercel free (límites de funciones)
  cubren el MVP pero no garantizan operación gratuita indefinida
  (Sección 19) — vigilar consumo antes de crecer el catálogo.
- **OCR gratuito (Tesseract.js) es menos preciso** que un servicio de
  pago; se mitiga con el fallback manual obligatorio (nunca bloquea la
  compra).
- **RLS + funciones `security definer`** concentran la seguridad: cada
  nueva función de este tipo debe revisarse con cuidado porque evita
  las policies por diseño.
- **Sin logo/fotos reales todavía**: el Design System y el Home no
  pueden darse por terminados visualmente hasta recibir los assets
  oficiales (Sección 5/23).
- **pg_cron** requiere que la extensión esté habilitada en el proyecto
  Supabase (disponible en plan gratuito, pero debe activarse desde el
  dashboard).
