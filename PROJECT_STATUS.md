# PROJECT_STATUS — Rossana, Bisutería y Más

Última actualización: 2026-08-25

Leyenda: `COMPLETADO` · `EN DESARROLLO` · `PENDIENTE` · `BLOQUEADO`

| Fase | Descripción | Estado | Notas |
|---|---|---|---|
| 0 | Auditoría / planificación | COMPLETADO | Ver `ARCHITECTURE.md`. Repo vacío al iniciar: sin código previo, sin assets. |
| 1 | Design System | EN DESARROLLO | Tokens de color/tipografía/radios en `src/app/globals.css`. Componentes base (`Button`, `Input`, `Card`, `Badge`) creados. Falta: logo real (BLOQUEADO, ver abajo), resto de componentes (header, footer, product card). |
| 2 | Base de datos | COMPLETADO | Esquema completo (26 tablas + vista `storefront_products`) aplicado y verificado contra el proyecto Supabase real (`cnzbifvnhuqiasgvtskn`) el 2026-08-25 vía `scripts/run-migrations.mjs`. `pg_cron` activo. Tipos TypeScript escritos a mano en `src/types/database.ts` (la generación automática requiere Docker, no disponible en esta máquina). |
| 3 | Auth + RLS | COMPLETADO | Clientes Supabase (`browser`/`server`/`admin`) y `src/proxy.ts` listos. RLS aplicada y **verificada en vivo**: `anon` no puede leer `products` directamente (0 filas) pero sí `storefront_products` sin ninguna columna de costo — probado insertando y borrando un producto de prueba. Usuario `owner` (`stoka.peru@gmail.com`) creado y verificado con `scripts/create-admin-user.mjs`. Falta construir las pantallas de login/recuperación de `/admin` (parte de la Fase 11). |
| 4 | Home | EN DESARROLLO | Estructura completa (Sección 13): barra promo, header sticky con búsqueda/cuenta/favoritos/carrito, hero con copy literal del prompt, categorías, favoritos/nuevos ingresos/ofertas (leyendo `storefront_products`, con estado vacío honesto — hoy no hay productos reales cargados), beneficios, redes, footer. Todo data-driven desde `site_settings`/`categories`/`storefront_products`, nada hardcodeado. Falta: logo real (hoy hay un wordmark de texto marcado como temporal), fotos de categoría/producto reales, y páginas stub (`/productos`, `/carrito`, `/cuenta*`) que se completan en sus fases correspondientes. |
| 5 | Catálogo | COMPLETADO | `/productos` y `/categorias/[slug]` (comparten `CatalogView`): breadcrumb, H1, conteo, filtros (categoría, precio, color, material, disponibilidad, novedades, ofertas — vía URL, drawer en móvil), orden (destacados/recientes/precio asc/desc), paginación. Búsqueda por nombre/SKU/descripción/tags (se agregó columna `tags` y `on_offer` calculada en BD, no existían). Verificado con datos de prueba reales insertados y borrados: filtros, búsqueda y estado vacío ("No encontramos productos con esa búsqueda") funcionan correctamente. |
| 6 | Producto + 360° | COMPLETADO | `/productos/[slug]`: breadcrumb, galería 55/45, zoom (lightbox), miniaturas, vista 360° real (arrastrar para rotar, solo se activa con 8+ fotos reales — nunca simulada), nombre/SKU/precio/descuento/stock/descripción/características, cantidad, agregar al carrito, comprar ahora, consultar por WhatsApp (mensaje pre-armado Sección 65), bloque envíos/cambios/cuidados, relacionados. Se creó la infraestructura de carrito (`CartProvider`, localStorage) que también usará la Fase 7. **Bug real encontrado y corregido durante la prueba**: la policy RLS de `product_images` nunca dejaba pasar nada a `anon` (su subconsulta contra `products` quedaba bloqueada por la RLS de esa tabla) — se detectó insertando un producto de prueba con 10 fotos reales y viendo que la API devolvía `[]`; arreglado con una función `security definer` (`is_product_published`), igual patrón que `is_store_staff`. Verificado de nuevo tras el fix: las 10 fotos se leen correctamente. |
| 7 | Carrito | EN DESARROLLO | Infraestructura (`CartProvider`, badge en header, "agregar"/"comprar ahora" ya funcionales desde la ficha de producto) lista; falta la página `/carrito` en sí (hoy sigue como stub). |
| 8 | Checkout invitado | PENDIENTE | RPC `create_guest_order` ya implementada en BD. |
| 9 | Yape + comprobante + OCR | PENDIENTE | Bucket `receipts` y RPC `submit_payment_receipt` listos en BD. Proveedor OCR MVP: Tesseract.js (gratuito). |
| 10 | Pedidos | PENDIENTE | |
| 11 | Admin simplificado | PENDIENTE | |
| 12 | Materiales | PENDIENTE | Modelo de datos y trigger de costo promedio listos. |
| 13 | Fabricación | PENDIENTE | Función `register_production_run` lista y probada solo por revisión de código (no contra BD real aún). |
| 14 | Costos/precios | PENDIENTE | Fórmulas de la Sección 56 a implementar en UI; columnas ya existen en `products`. |
| 15 | SEO | PENDIENTE | |
| 16 | Seguridad | EN DESARROLLO | RLS + vista `storefront_products` sin columnas de costo + funciones "puerta angosta" para invitados ya diseñadas. Falta rate limiting, headers, auditoría de uploads. |
| 17 | QA | PENDIENTE | |
| 18 | Producción | PENDIENTE | |

## Bloqueos reales activos

1. **Logo oficial**: no hay archivos de logo (`logo-primary`, `logo-light-background`, `logo-dark/red-background`, `logo-mobile`, `isotipo`, `favicon`) en el repo. Sección 5 prohíbe recrear el logo en HTML. El usuario confirmó que los subirá en breve.
2. **Fotografías reales de producto**: no hay ninguna en el repo. Sección 23 prohíbe inventar productos como definitivos.
3. **Datos operativos del negocio**: número y titular Yape, QR, número de WhatsApp — configurables desde `/admin`, pero se necesita al menos un valor real antes de salir a producción.
4. **Dominio/hosting**: confirmar acceso a `ventas.stoka.pe` (DNS) y a la cuenta de despliegue (Vercel u otro) para las Fases 17-18.

## Resuelto

- ~~Proyecto Supabase~~ → conectado (`cnzbifvnhuqiasgvtskn`, región `us-east-2`), migraciones y seed aplicados el 2026-08-25.
- ~~Usuario admin~~ → `stoka.peru@gmail.com` creado con rol `owner`, verificado en BD (2026-08-25). Credenciales entregadas al usuario por chat, no se guardan en el repo.

## Decisiones de arquitectura registradas

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Supabase (Postgres, Auth, Storage).
- Carrito de invitado vive en `localStorage`; solo se persiste en BD al finalizar la compra (`create_guest_order`) o para cuentas de cliente registradas.
- Acceso de invitado a su propio pedido vía funciones `security definer` (`get_order_public`, `submit_payment_receipt`) usando el UUID del pedido como token — no vía RLS directa sobre `orders`.
- Costos (`labor_cost`, `packaging_cost`, `average_unit_cost`, etc.) nunca se exponen a `anon`: el catálogo público lee de la vista `storefront_products`, no de la tabla `products`.
- OCR MVP con Tesseract.js (costo S/0) detrás de una interfaz reemplazable por un proveedor en la nube más adelante.
