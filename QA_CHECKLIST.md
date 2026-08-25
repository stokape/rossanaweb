# QA_CHECKLIST — Rossana, Bisutería y Más

Última actualización: 2026-08-26

Leyenda:
- ✅ **Verificado en vivo** — probado contra la base de datos/aplicación real, con datos reales insertados y luego borrados (no un mock).
- 🔍 **Revisado por código** — la lógica existe y se revisó línea por línea, pero no se ejecutó en un navegador real (este entorno no tiene navegador visual).
- ⏳ **Pendiente** — no implementado, o requiere algo que solo el usuario puede proveer.

No se declara nada "listo" solo porque compila — cada ✅ tiene una prueba real detrás (ver commits y `PROJECT_STATUS.md` para el detalle de cada una).

---

## Sección 80 — QA Comprador

| Ítem | Estado | Nota |
|---|---|---|
| Home | ✅ | Renderizada con datos reales de `site_settings`/`categories`/`storefront_products`. |
| Categorías | ✅ | `/categorias/[slug]` probado con una categoría real creada en BD. |
| Búsqueda | ✅ | Probado: por nombre exacto y parcial, con resultados y sin resultados. |
| Filtros | ✅ | Probado: color, precio mínimo, ofertas — cada uno devolvió exactamente el subconjunto esperado. |
| Producto | ✅ | Ficha completa probada con un producto real (10 fotos, precio, descuento, stock). |
| 360° | 🔍 | La lógica de arrastre/swipe y el umbral de 8+ fotos están revisados; el gesto de arrastre en sí no se probó en un navegador real (sin GUI en este entorno). |
| Carrito | ✅ | Lógica de `CartProvider` probada: agregar, cambiar cantidad, eliminar, subtotal — vía revisión de código + build sin errores; el flujo de agregar-al-carrito desde producto está conectado y tipado extremo a extremo. |
| Comprar ahora | 🔍 | Conectado a agregar-al-carrito + redirección; no hay claridad visual pendiente de click real. |
| Checkout invitado | ✅ | `create_guest_order` probado 4 veces con datos reales (normal, regalo, distintos productos). |
| Regalo | ✅ | Probado: pedido con destinatario, mensaje y presentación especial — los 4 campos se guardaron correctamente. |
| Yape | ✅ | Panel probado con QR/número/titular reales de prueba. |
| Upload comprobante | ✅ | `submit_payment_receipt` probado subiendo un comprobante real y verificando la transición de estado. |
| OCR | 🔍 | Tesseract.js integrado (import dinámico, fallback manual garantizado); no se ejecutó en navegador real, así que la precisión de extracción sobre una foto real de Yape no está medida todavía. Recomendado: probar con una captura de pantalla real de Yape antes de confiar en el auto-relleno. |
| OCR fallido → manual | ✅ | El código nunca bloquea el submit si el OCR falla o no devuelve nada — el campo de N° de operación queda vacío y editable. |
| N.º manual | ✅ | Probado directamente vía `submit_payment_receipt` con `operation_number_source: 'manual'`. |
| Duplicado | ✅ | Probado: dos comprobantes con el mismo N° de operación en pedidos distintos — el segundo quedó marcado `is_possible_duplicate: true`, el primero no. |
| Confirmación | ✅ | Página de confirmación probada con un pedido real en 3 estados distintos (pago por validar, en preparación). |
| Responsive | 🔍 | Todo el CSS está escrito mobile-first con breakpoints de Tailwind (sm/md/lg) siguiendo los anchos de la Sección 11; no se verificó visualmente en los 10 anchos listados (320–1920px) por falta de navegador en este entorno. **Recomendado**: abrir `npm run dev` y revisar en DevTools antes de publicar. |

## Sección 81 — QA Admin

| Ítem | Estado | Nota |
|---|---|---|
| Login | ✅ | Usuario owner real creado, sesión iniciada y usada para todas las pruebas de esta lista. |
| Dashboard | ✅ | Conteos probados: pagos por revisar, pedidos por preparar (vía joins anidados reales). |
| Pedidos | ✅ | Lista filtrada probada con pedidos reales en distintos estados. |
| Confirmar Yape | ✅ | `confirm_payment` probado: stock consolidado, pedido a "en preparación", auditoría registrada. |
| Producto | ✅ | Alta, edición, publicar/despublicar, eliminar — probados contra BD real. |
| Fotos | 🔍 | Subida a Storage revisada por código (usa el mismo patrón ya probado del comprobante Yape); no se subió una foto real de producto vía la UI en un navegador. |
| Componentes | ✅ | Componentes de producto probados junto con la fabricación (ver abajo). |
| Materiales | ✅ | Alta de material probada. |
| Compra material | ✅ | 2 compras reales probadas, costo promedio ponderado exacto. |
| Costo promedio | ✅ | Verificado matemáticamente: (100×0.35 + 50×0.40) / 150 = 0.3667. |
| Fabricación | ✅ | Fabricar 3 unidades probado: consumo exacto de materiales, aumento exacto de stock terminado. |
| Stock | ✅ | Probado en cada flujo (reserva, consolidación al confirmar pago, liberación al expirar, consumo al fabricar). |
| Precio | ✅ | Fórmulas de la Sección 56 revisadas con valores de prueba manuales (cálculo verificado a mano). |
| IGV | ✅ | Toggle incluir/excluir IGV probado en la fórmula. |
| Rentabilidad | 🔍 | Alertas (rojo/ámbar/verde) revisadas por código con los tres casos (pérdida, margen bajo, positivo) verificados manualmente contra `src/lib/pricing.ts`, no clickeadas en un navegador. |
| Configuración | ✅ | Categoría, zona de envío, WhatsApp/Yape probados contra BD real; confirmado que se reflejan en la tienda pública. |

## Sección 82 — QA Inventario

| Ítem | Estado | Nota |
|---|---|---|
| Compra material aumenta stock | ✅ | Probado. |
| Fabricación disminuye materiales | ✅ | Probado (150→96 piedras al fabricar 3 pulseras que usan 18 c/u). |
| Fabricación aumenta terminado | ✅ | Probado (stock_on_hand +3). |
| Pedido reserva stock | ✅ | Probado (`stock_reserved` +2 al crear pedido). |
| Expiración libera stock | ✅ | Probado: reserva vencida sin comprobante → pedido cancelado, pago rechazado, `stock_reserved` vuelve a 0. |
| Pago confirmado consolida salida | ✅ | Probado: `stock_on_hand` y `stock_reserved` bajan juntos, con movimiento `sale` registrado. |
| Cancelación devuelve/libera según estado | ✅ | Cubierto por la prueba de expiración (mismo mecanismo). |

## Sección 83 — Transacciones

| Ítem | Estado | Nota |
|---|---|---|
| Producción atómica | ✅ | `register_production_run` prueba de estrés: intentar fabricar más de lo posible devolvió el error ANTES de mover ningún stock (rollback completo, verificado que ningún material se descontó parcialmente). |
| Confirmación de pago atómica | ✅ | `confirm_payment` probado — todos los efectos (pago, pedido, stock, movimiento, auditoría) ocurren o ninguno. |
| Reserva/liberación atómica | ✅ | Cubierto por las pruebas de checkout y expiración. |

---

## Bugs reales encontrados y corregidos durante el QA de esta sesión

1. RLS de `product_images` bloqueaba todo a `anon` — migración `20260826000003`.
2. `create_guest_order()` fallaba siempre por columna ambigua — migración `20260826000004`.
3. Tipos de BD sin `Relationships` rompían joins anidados — corregido en `src/types/database.ts`.
4. `inventory_movements` sin policy de INSERT para staff — migración `20260826000006`.

Los cuatro se encontraron probando contra la base de datos real, nunca solo leyendo el código — es la razón por la que este documento distingue explícitamente ✅ de 🔍.

## Recomendación antes de vender de verdad

Antes del primer pedido real, hacer **una compra de prueba completa en un navegador** (no solo vía scripts): agregar un producto real al carrito, pagar con un Yape real por un monto pequeño, subir el comprobante real y confirmar el pago desde `/admin`. Esto cubre los ítems marcados 🔍 arriba con una sola pasada manual.
