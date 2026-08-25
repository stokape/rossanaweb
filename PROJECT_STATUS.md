# PROJECT_STATUS — Rossana, Bisutería y Más

Última actualización: 2026-08-24

Leyenda: `COMPLETADO` · `EN DESARROLLO` · `PENDIENTE` · `BLOQUEADO`

| Fase | Descripción | Estado | Notas |
|---|---|---|---|
| 0 | Auditoría / planificación | COMPLETADO | Ver `ARCHITECTURE.md`. Repo vacío al iniciar: sin código previo, sin assets. |
| 1 | Design System | EN DESARROLLO | Tokens de color/tipografía/radios en `src/app/globals.css`. Componentes base (`Button`, `Input`, `Card`, `Badge`) creados. Falta: logo real (BLOQUEADO, ver abajo), resto de componentes (header, footer, product card). |
| 2 | Base de datos | EN DESARROLLO | Esquema completo + RLS + funciones transaccionales escritas en `supabase/migrations/`. Falta: proyecto Supabase real para aplicar y probar las migraciones (BLOQUEADO). |
| 3 | Auth + RLS | EN DESARROLLO | Clientes Supabase (`browser`/`server`/`admin`) y `middleware.ts` listos. RLS diseñada en migración 008. Falta probar contra proyecto real. |
| 4 | Home | PENDIENTE | |
| 5 | Catálogo | PENDIENTE | |
| 6 | Producto + 360° | PENDIENTE | |
| 7 | Carrito | PENDIENTE | Decisión de arquitectura: carrito de invitado en cliente (localStorage), `carts`/`cart_items` en BD solo para cuentas registradas — ver `ARCHITECTURE.md`. |
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

1. **Proyecto Supabase**: no existe todavía un proyecto real conectado. Sin URL/keys no se pueden aplicar migraciones ni probar nada end-to-end.
2. **Logo oficial**: no hay archivos de logo (`logo-primary`, `logo-light-background`, `logo-dark/red-background`, `logo-mobile`, `isotipo`, `favicon`) en el repo. Sección 5 prohíbe recrear el logo en HTML.
3. **Fotografías reales de producto**: no hay ninguna en el repo. Sección 23 prohíbe inventar productos como definitivos.
4. **Datos operativos del negocio**: número y titular Yape, QR, número de WhatsApp — configurables desde `/admin`, pero se necesita al menos un valor real antes de salir a producción.
5. **Dominio/hosting**: confirmar acceso a `ventas.stoka.pe` (DNS) y a la cuenta de despliegue (Vercel u otro) para las Fases 17-18.

## Decisiones de arquitectura registradas

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Supabase (Postgres, Auth, Storage).
- Carrito de invitado vive en `localStorage`; solo se persiste en BD al finalizar la compra (`create_guest_order`) o para cuentas de cliente registradas.
- Acceso de invitado a su propio pedido vía funciones `security definer` (`get_order_public`, `submit_payment_receipt`) usando el UUID del pedido como token — no vía RLS directa sobre `orders`.
- Costos (`labor_cost`, `packaging_cost`, `average_unit_cost`, etc.) nunca se exponen a `anon`: el catálogo público lee de la vista `storefront_products`, no de la tabla `products`.
- OCR MVP con Tesseract.js (costo S/0) detrás de una interfaz reemplazable por un proveedor en la nube más adelante.
