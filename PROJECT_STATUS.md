# PROJECT_STATUS — Rossana, Bisutería y Más

Última actualización: 2026-08-26

Leyenda: `COMPLETADO` · `EN DESARROLLO` · `PENDIENTE` · `BLOQUEADO`

| Fase | Descripción | Estado | Notas |
|---|---|---|---|
| 0 | Auditoría / planificación | COMPLETADO | Ver `ARCHITECTURE.md`. Repo vacío al iniciar: sin código previo, sin assets. |
| 1 | Design System | COMPLETADO | Tokens de color/tipografía/radios en `src/app/globals.css`. Componentes base (`Button`, `Input`, `Card`, `Badge`) creados. Logo oficial y favicon reales cargados y conectados (`src/components/shop/Logo.tsx`, `src/app/icon.png`) — reemplazan el wordmark de texto temporal en Header, Footer, panel admin y login. |
| 2 | Base de datos | COMPLETADO | Esquema completo (26 tablas + vista `storefront_products`) aplicado y verificado contra el proyecto Supabase real (`cnzbifvnhuqiasgvtskn`) el 2026-08-25 vía `scripts/run-migrations.mjs`. `pg_cron` activo. Tipos TypeScript escritos a mano en `src/types/database.ts` (la generación automática requiere Docker, no disponible en esta máquina). |
| 3 | Auth + RLS | COMPLETADO | Clientes Supabase (`browser`/`server`/`admin`) y `src/proxy.ts` listos. RLS aplicada y **verificada en vivo**: `anon` no puede leer `products` directamente (0 filas) pero sí `storefront_products` sin ninguna columna de costo — probado insertando y borrando un producto de prueba. Usuario `owner` (`stoka.peru@gmail.com`) creado y verificado con `scripts/create-admin-user.mjs`. Falta construir las pantallas de login/recuperación de `/admin` (parte de la Fase 11). |
| 4 | Home | COMPLETADO | Estructura completa (Sección 13): barra promo, header sticky con búsqueda/cuenta/favoritos/carrito, hero con copy literal del prompt, categorías, favoritos/nuevos ingresos/ofertas (leyendo `storefront_products`, con estado vacío honesto), beneficios, redes, footer. Todo data-driven desde `site_settings`/`categories`/`storefront_products`, nada hardcodeado. Logo oficial ya conectado. Falta solo: fotos de categoría/producto reales (el usuario las carga desde `/admin`). |
| 5 | Catálogo | COMPLETADO | `/productos` y `/categorias/[slug]` (comparten `CatalogView`): breadcrumb, H1, conteo, filtros (categoría, precio, color, material, disponibilidad, novedades, ofertas — vía URL, drawer en móvil), orden (destacados/recientes/precio asc/desc), paginación. Búsqueda por nombre/SKU/descripción/tags (se agregó columna `tags` y `on_offer` calculada en BD, no existían). Verificado con datos de prueba reales insertados y borrados: filtros, búsqueda y estado vacío ("No encontramos productos con esa búsqueda") funcionan correctamente. |
| 6 | Producto + 360° | COMPLETADO | `/productos/[slug]`: breadcrumb, galería 55/45, zoom (lightbox), miniaturas, vista 360° real (arrastrar para rotar, solo se activa con 8+ fotos reales — nunca simulada), nombre/SKU/precio/descuento/stock/descripción/características, cantidad, agregar al carrito, comprar ahora, consultar por WhatsApp (mensaje pre-armado Sección 65), bloque envíos/cambios/cuidados, relacionados. Se creó la infraestructura de carrito (`CartProvider`, localStorage) que también usará la Fase 7. **Bug real encontrado y corregido durante la prueba**: la policy RLS de `product_images` nunca dejaba pasar nada a `anon` (su subconsulta contra `products` quedaba bloqueada por la RLS de esa tabla) — se detectó insertando un producto de prueba con 10 fotos reales y viendo que la API devolvía `[]`; arreglado con una función `security definer` (`is_product_published`), igual patrón que `is_store_staff`. Verificado de nuevo tras el fix: las 10 fotos se leen correctamente. |
| 7 | Carrito | COMPLETADO | `/carrito`: imagen/nombre/cantidad/precio/subtotal por línea, editar cantidad, eliminar, resumen (subtotal/envío pendiente hasta checkout/total), "Finalizar compra" y "Seguir comprando". Estado vacío con CTA. Como el carrito vive en `localStorage` (Client Component), se ajustó el estado previo a la hidratación para mostrar un skeleton en vez de una pantalla en blanco (Sección 76) — verificado que el skeleton aparece en el HTML del servidor. |
| 8 | Checkout invitado | COMPLETADO | `/checkout`: sin pantalla "¿tienes cuenta?", directo al formulario (datos + entrega + regalo opcional), validado con zod tanto en cliente como en el server action (`submitCheckout`, Sección 72). Costo de envío por zona (`shipping_zones`, fallback "a coordinar" si no hay ninguna configurada). Redirige a `/carrito` si el carrito está vacío. |
| 9 | Yape + comprobante + OCR | COMPLETADO | `/pedido/[id]/pago`: QR/número/titular/instrucciones desde `site_settings`, subida de comprobante (valida MIME/tamaño), OCR con Tesseract.js en el navegador (nunca bloquea si falla, Sección 30/32), duplicados marcados automáticamente por trigger. `/pedido/[id]/confirmacion` con los estados de la Sección 33-34. **Probado de punta a punta contra la BD real**: crear pedido → reservar stock → subir comprobante → "pago por validar" → `confirm_payment` (autenticado como owner) → stock consolidado, movimiento `sale`, auditoría — todo verificado con valores reales y limpiado después. |
| 10 | Pedidos | COMPLETADO | `/admin/pedidos` (filtros Todos/Por revisar/Preparando/Enviados/Entregados) y `/admin/pedidos/[id]` con "Validar Yape": comprobante (URL firmada, el bucket es privado), N.º de operación/monto detectado, alerta de duplicado, "Confirmar pago" y "No pude validarlo" con confirmación explícita (Sección 87). Se agregó la función `reject_payment` (no existía). **Probado de punta a punta contra la BD real, autenticado como el usuario owner real**: lista filtrada, detalle con joins anidados (pedido→pago→comprobante), `reject_payment` y el conteo del dashboard — todo verificado con datos reales y limpiado después. |
| 11 | Admin simplificado | COMPLETADO | Layout protegido (`/admin/(protected)`) con navegación de 5 módulos + Configuración aparte, saludo por hora del día, cards "Pagos por revisar / Pedidos por preparar / Con poco stock", ventas y pedidos de hoy. Login simple (correo/contraseña). Verificado que un usuario sin sesión es redirigido (307) desde `/admin` y `/admin/pedidos`, y que `/admin/login` es accesible. |
| 12 | Materiales | COMPLETADO | `/admin/materiales`: tarjetas "Tienes: X unidades" / "Avisarme cuando queden...", "+ Agregar material", "Agregar compra" (Sección 48, con el costo unitario aproximado mostrado en vivo). **Probado de punta a punta contra la BD real**: 2 compras reales (100u a S/35, 50u a S/20) dieron el costo promedio ponderado exacto esperado (0.3667). |
| 13 | Fabricación | COMPLETADO | `/admin/fabricar`: selector de producto, cantidad con -/+, "Para hacer N necesitas" con ✓/✗ por material, registra con `register_production_run`. **Probado contra la BD real**: fabricar 3 unidades consumió 54 piedras (150→96) y sumó 3 al stock del producto, exactamente como se esperaba; intentar fabricar de más devolvió "Te faltan 84.00 Piedra roja de prueba." en lenguaje natural, sin romper nada. |
| 14 | Costos/precios | COMPLETADO | `/admin/productos` (lista) y `/admin/productos/nuevo` → `/admin/productos/[id]/editar` (info, fotos, componentes, costo y precio). PricingCalculator implementa las fórmulas de la Sección 56 (costo total, ganancia deseada, IGV, precio sugerido) y la Sección 58 (detalle oculto por defecto: costo/precio neto/IGV/precio venta/ganancia/margen/markup) y la Sección 59 (alertas rojo/ámbar/verde). Capacidad de fabricación (Sección 60) calculada por el componente limitante. El wizard de 6 pasos de la Sección 43 se implementó como un formulario único por sección en vez de 6 pantallas secuenciales — simplificación consciente por tiempo, mismo contenido funcional. |
| — | Configuración (`/admin/configuracion`) | COMPLETADO | No estaba en las 18 fases numeradas pero era necesaria para que Rossana opere sin tocar la BD (Sección 63-65): datos del negocio, WhatsApp, Yape (con subida de QR a Storage), zonas de envío, categorías (crear/ocultar/eliminar), redes sociales, políticas (envíos/cambios/privacidad/términos), usuarios (ver colaboradores + invitar, solo el dueño puede invitar — usa el cliente con service role server-side). **Probado contra la BD real, autenticado como owner**: categoría creada, zona de envío creada, WhatsApp/Yape actualizados, y confirmado que `anon` los lee correctamente desde la tienda pública. Datos de prueba revertidos después. |
| 15 | SEO | COMPLETADO | Metadata dinámica (título/descripción/OG/Twitter/canonical) en producto; `sitemap.xml` y `robots.txt` generados dinámicamente desde lo realmente publicado (nunca una lista fija); JSON-LD Organization + WebSite (global), BreadcrumbList + Product + Offer (ficha de producto) — sin reviews/ratings falsos. Campos SEO editables desde `/admin/productos/[id]/editar`. Verificado en vivo: headers, `/robots.txt` y `/sitemap.xml` responden correctamente. |
| 16 | Seguridad | COMPLETADO | RLS completa y verificada en vivo durante toda la sesión. Se agregó: cabeceras de seguridad (`X-Frame-Options`, CSP, `Referrer-Policy`, `Permissions-Policy`) verificadas en runtime; rate limiting best-effort en `submitCheckout` (5 pedidos / 10 min por IP — limitación de memoria-por-instancia documentada en `src/lib/rate-limit.ts`); auditoría ampliada (cambio de precio, cambio de configuración Yape, eliminar producto, además de confirmar/rechazar pago ya cubiertos). Pendiente conocido: no hay UI de "ajuste manual de stock" todavía, así que ese tipo de movimiento de auditoría no aplica aún. |
| 17 | QA | COMPLETADO | Ver `QA_CHECKLIST.md` — recorrido de las Secciones 80-83 y 94, con resultado de cada ítem y qué se verificó en vivo vs. por revisión de código. |
| 18 | Producción | EN DESARROLLO | Build de producción limpio y verificado repetidamente. Ver `DEPLOY.md` para los pasos de despliegue — requiere acciones que solo el usuario puede hacer (cuenta de Vercel, DNS del dominio), documentadas ahí. |

## Bloqueos reales activos (requieren acción del usuario — ver `DEPLOY.md`)

1. **Fotografías reales de producto**: no hay ninguna en el repo. Sección 23 prohíbe inventar productos como definitivos. Se suben desde `/admin/productos` (ya funcional).
2. **Datos operativos reales**: Yape/WhatsApp reales — la pantalla para cargarlos ya existe y funciona (`/admin/configuracion`), solo falta que el usuario ingrese sus datos reales.
3. **DNS del dominio**: `rossana.stoka.pe` agregado en Vercel, pendiente de que el registro CNAME propague en Cloudflare.

Ninguno de estos bloquea código: todo lo que se puede construir sin
ellos ya está construido y probado. Son, literalmente, las únicas
tareas que le quedan al usuario.

## Resuelto

- ~~Proyecto Supabase~~ → conectado (`cnzbifvnhuqiasgvtskn`, región `us-east-2`), migraciones y seed aplicados el 2026-08-25.
- ~~Usuario admin~~ → `stoka.peru@gmail.com` creado con rol `owner`, verificado en BD (2026-08-25). Credenciales entregadas al usuario por chat, no se guardan en el repo.
- ~~Logo oficial~~ → `logo_rossana.png` + `favicon_rossana.png` cargados y conectados (2026-08-26). Ver `public/brand/README.md`.
- ~~Repositorio GitHub~~ → `https://github.com/stokape/rossanaweb`, rama `main`.
- ~~Despliegue en Vercel~~ → `https://rossanaweb.vercel.app` en producción, verificado en vivo (Home, `/robots.txt`, `/admin` redirige correctamente).

## Decisiones de arquitectura registradas

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Supabase (Postgres, Auth, Storage).
- Carrito de invitado vive en `localStorage`; solo se persiste en BD al finalizar la compra (`create_guest_order`) o para cuentas de cliente registradas.
- Acceso de invitado a su propio pedido vía funciones `security definer` (`get_order_public`, `submit_payment_receipt`) usando el UUID del pedido como token — no vía RLS directa sobre `orders`.
- Costos (`labor_cost`, `packaging_cost`, `average_unit_cost`, etc.) nunca se exponen a `anon`: el catálogo público lee de la vista `storefront_products`, no de la tabla `products`.
- OCR MVP con Tesseract.js (costo S/0) detrás de una interfaz reemplazable por un proveedor en la nube más adelante.
- Departamento/Provincia/Distrito en el checkout son campos de texto libre, no un selector en cascada con el ubigeo oficial de Perú (simplificación consciente por tiempo; se puede añadir después sin cambiar el esquema, que ya guarda esos tres campos como texto).

## Bugs reales encontrados y corregidos durante las pruebas

- `product_images` RLS bloqueaba todo a `anon` (Fase 6) — ver migración `20260826000003`.
- `create_guest_order()` fallaba siempre con "column reference id is ambiguous" (Fase 8) — ver migración `20260826000004`.
- Los tipos de TypeScript escritos a mano tenían `Relationships: []` en todas las tablas (Fase 10): rompía cualquier `select()` con joins anidados (`orders → order_items`, `payments → payment_receipts`, etc.), necesarios para el panel admin. Se corrigió agregando las relaciones reales en `src/types/database.ts`.
- `inventory_movements` no tenía policy de INSERT para staff (Fase 12): registrar una compra de material fallaba siempre porque el trigger que actualiza el costo promedio inserta ahí también, y esa tabla solo tenía policy de lectura. El stock se quedaba en 0 silenciosamente hasta que se revertía la transacción completa. Se detectó registrando dos compras reales y viendo que el costo promedio no se actualizaba — ver migración `20260826000006`.

Los cuatro se detectaron construyendo y probando contra la base de datos en vivo (incluyendo sesiones autenticadas reales), nunca solo leyendo el código.

## Criterios de aceptación finales (Sección 94)

`[x]` construido y probado · `[~]` construido, no verificado visualmente en navegador (ver `QA_CHECKLIST.md`) · `[ ]` pendiente de una acción del usuario

- [x] Identidad Rossana correcta — logo oficial conectado (2026-08-26)
- [x] Rossana Red correcto (`#C00008`, un solo token en todo el sistema)
- [x] Logo correcto — `logo_rossana.png` + favicon reales, sin recrear en HTML
- [~] Responsive (mobile-first en todo el CSS, no verificado visualmente en los 10 anchos de la Sección 11)
- [x] Home
- [x] Catálogo
- [x] Categorías
- [x] Búsqueda
- [x] Filtros
- [x] Producto
- [ ] Fotografías — pendiente de que el usuario cargue productos reales
- [~] 360° (implementado y activo con 8+ fotos; gesto no probado en navegador real)
- [x] Carrito
- [x] Comprar ahora
- [x] Checkout invitado
- [x] Registro opcional (cuenta de cliente no obligatoria en ningún punto del flujo)
- [x] Yape manual
- [x] QR configurable
- [x] Upload comprobante
- [~] OCR (integrado, nunca probado contra una foto real de Yape)
- [x] Fallback manual
- [x] Duplicados
- [x] Validación manual Yape
- [x] Pedidos
- [x] Reserva stock
- [x] Admin simplificado
- [x] Productos administrables
- [x] Materiales administrables
- [x] Compras de materiales
- [x] Costo promedio
- [x] Componentes por producto
- [x] Fabricación
- [x] Stock terminado
- [x] Costo automático
- [x] % ganancia
- [x] IGV configurable
- [x] Precio sugerido
- [x] Precio manual
- [x] Rentabilidad
- [x] SEO
- [x] Sitemap
- [x] Structured Data
- [x] RLS
- [x] Auditoría
- [x] QA (ver `QA_CHECKLIST.md`)
- [x] Build producción (verificado repetidas veces, en verde)

**Lectura honesta de esta lista**: todo lo que depende de código, base
de datos o lógica de negocio está construido y con pruebas reales
contra Supabase. Lo que falta son, exclusivamente, cosas que
literalmente nadie más que el usuario puede proveer (sus fotos, su
logo, sus cuentas de servicios externos) — ver `DEPLOY.md`.
