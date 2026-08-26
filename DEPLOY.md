# DEPLOY — Poner Rossana en producción

Última actualización: 2026-08-26

Todo el código, la base de datos y las pruebas están listos (ver
`PROJECT_STATUS.md` y `QA_CHECKLIST.md`). Lo que queda son pasos que
**solo tú puedes hacer** — necesitan cuentas, tarjetas o accesos que no
están disponibles desde aquí. Este documento es esa lista, en orden.

---

## 1. Subir el código a GitHub ✅ hecho

El código ya está en `https://github.com/stokape/rossanaweb` (rama `main`).
Cada vez que se agreguen cambios nuevos, un `git push` los sube ahí.

## 2. Crear el proyecto en Vercel

1. Ya tienes cuenta en [vercel.com](https://vercel.com).
2. **"Add New" → "Project"** → importa el repositorio `rossanaweb` (si no aparece, "Adjust GitHub App Permissions" y autorízalo).
3. Framework: Vercel detecta Next.js automáticamente. No cambies nada del build.

## 3. Variables de entorno en Vercel

Antes de darle "Deploy", en la pantalla de configuración del proyecto
(o después, en **Settings → Environment Variables**), agrega exactamente
estas (los mismos valores que tienes en tu `.env.local`):

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://rossana.stoka.pe` (o tu dominio final — ver paso 5) |
| `NEXT_PUBLIC_SUPABASE_URL` | El de tu `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | El de tu `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | El de tu `.env.local` (⚠️ nunca lo compartas ni lo subas a GitHub) |
| `OCR_PROVIDER` | `tesseract` |

`.env.local` nunca se sube a git (está en `.gitignore`) — por eso hay
que volver a escribir estos valores acá, a mano, una sola vez.

## 4. Desplegar

Dale **"Deploy"**. Vercel construye el proyecto (2-3 minutos) y te da
una URL de prueba tipo `rossana-tienda.vercel.app`. Ábrela y confirma
que la Home carga.

## 5. Conectar tu dominio

### Opción A — `rossana.stoka.pe` (subdominio existente)
1. En Vercel: **Settings → Domains** → agrega `rossana.stoka.pe`.
2. Vercel te muestra un registro DNS (tipo `CNAME`, apuntando a `cname.vercel-dns.com`).
3. Entra al panel DNS donde administras `stoka.pe` y agrega ese registro para el subdominio `rossana`.
4. Espera la propagación (minutos a un par de horas). Vercel marca el dominio como "Valid" cuando está listo.

### Opción B — Dominio propio futuro
Repite el mismo paso con el nuevo dominio cuando lo tengas — no hay que
tocar código, solo actualizar `NEXT_PUBLIC_SITE_URL` en Vercel y
volver a desplegar (Sección 78, ya diseñado para esto).

## 6. Supabase — revisar antes de recibir pedidos reales

1. **Auth → URL Configuration**: agrega tu dominio final (`https://rossana.stoka.pe`) a la lista de "Redirect URLs" si más adelante activas login de clientes.
2. **Database → Extensions**: confirma que `pg_cron` sigue activo (ya lo está — lo usamos para liberar reservas de stock vencidas).
3. Considera activar los **backups automáticos** si subes de plan (el plan gratuito no los incluye — ver sección de Backup abajo).

## 7. Antes del primer pedido real

Sigue la recomendación de `QA_CHECKLIST.md`: haz **una compra de
prueba completa** en el sitio ya desplegado (agregar al carrito, pagar
con un Yape real por un monto pequeño, subir el comprobante, confirmar
el pago desde `/admin`) antes de anunciar la tienda públicamente.

---

## Lo que necesito que hagas tú, específicamente (no puedo hacerlo por ti)

- [ ] Crear el repositorio en GitHub y hacer el primer `git push` (o instalar/usar `vercel` CLI localmente).
- [ ] Crear tu cuenta de Vercel y conectar el repositorio.
- [ ] Copiar las 5 variables de entorno a Vercel (tienes los valores en tu `.env.local`).
- [ ] Confirmar/agregar el registro DNS de `rossana.stoka.pe` apuntando a Vercel.
- [ ] Subir el **logo oficial** a `public/brand/` (ver `public/brand/README.md`) y avisarme para conectarlo.
- [ ] Cargar tus **productos reales** (fotos + precios) desde `/admin/productos` — el catálogo está vacío a propósito, nunca se inventó nada.
- [ ] Configurar tu **Yape y WhatsApp reales** desde `/admin/configuracion` (hoy están vacíos).
- [ ] Decidir si quieres backups pagos de Supabase, o exportar tú mismo con `npx supabase db dump` periódicamente (plan gratuito no los incluye).
- [ ] Hacer la compra de prueba real antes de anunciar la tienda.

Todo lo demás — el código, la base de datos, las migraciones, la
seguridad, el SEO — ya está hecho y probado.
