# AUDITORÍA DE SEGURIDAD — Rossana, Bisutería y Más

**Sitio auditado**: `https://rossana.stoka.pe` (Vercel + Supabase)
**Fecha**: 2026-08-26
**Metodología**: revisión real de código + comandos ejecutados contra
producción (no una plantilla rellenada). Cada hallazgo dice explícitamente
si viene de un chequeo real (`curl`, `openssl`, `npm audit`, revisión de
`supabase/migrations/`) o es una recomendación de buena práctica.

**Contexto importante para leer esta auditoría**: esto es un e-commerce
MVP de una persona (bisutería, pago manual por Yape, sin tarjetas), no
una plataforma bancaria ni un hospital. Varios ítems del checklist
original (PCI DSS, HIPAA, bug bounty, red team, WAF empresarial) **no
aplican** a este tamaño/tipo de negocio — se marcan como tal en vez de
inventar una brecha que no existe, o fingir un cumplimiento que tampoco
tendría sentido reclamar.

---

## Puntuación general: **80 / 100**

Fundamentos sólidos (secretos, RLS, headers, dependencias, HTTPS) —
bien probados en vivo durante todo el desarrollo. Los puntos que bajan
la nota son reales y accionables: sin páginas legales activas, sin
MFA en la única cuenta admin, rate limiting básico, sin backups
automáticos (plan gratuito).

---

## 1. Protocolo y comunicación (HTTPS/TLS) — ✅ Implementado

**Comandos ejecutados** (reales, contra `rossana.stoka.pe`):
```
curl -I https://rossana.stoka.pe
openssl s_client -connect rossana.stoka.pe:443 -servername rossana.stoka.pe
```

**Resultado**:
- Certificado: Let's Encrypt (DV — validación de dominio), `CN=rossana.stoka.pe`, emitido 2026-08-26, vence 2026-11-24 (ciclo de 90 días, Vercel lo renueva solo).
- RSA 2048-bit, `sha256WithRSAEncryption`.
- `HTTP → HTTPS`: redirige con `308` (verificado).
- `Strict-Transport-Security: max-age=63072000` presente (Vercel lo agrega automáticamente en dominios propios con SSL).

**Riesgo si no estuviera**: intercepción de credenciales/datos en tránsito (MITM).
**Prioridad**: 🟢 Baja (ya implementado, sin acción pendiente).

---

## 2. Headers de seguridad — ✅ Implementado (con una nota)

**Comando ejecutado**: `curl -I https://rossana.stoka.pe`

| Header | Estado | Valor real |
|---|---|---|
| Content-Security-Policy | ✅ | `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; ...` |
| X-Content-Type-Options | ✅ | `nosniff` |
| X-Frame-Options | ✅ | `DENY` |
| Referrer-Policy | ✅ | `strict-origin-when-cross-origin` |
| Permissions-Policy | ✅ | `camera=(), microphone=(), geolocation=()` |
| Strict-Transport-Security | ✅ | `max-age=63072000` |
| X-XSS-Protection | ➖ N/A | Header obsoleto — los navegadores modernos lo ignoran; la CSP ya cumple ese rol. No es una brecha, es limpieza deliberada. |
| Access-Control-Allow-Origin | ➖ N/A | Ausente a propósito: no exponemos API cross-origin, así que no debe existir. |
| X-Powered-By | ✅ corregido hoy | Antes anunciaba `Next.js` en cada respuesta (mínima fuga de información). Se quitó con `poweredByHeader: false` durante esta auditoría. |

**Nota real sobre la CSP**: usa `'unsafe-inline' 'unsafe-eval'` en `script-src` porque Next.js App Router los necesita para hidratar React. Una CSP más estricta (con nonces por request) es posible pero es un cambio de arquitectura más grande — quedó documentado como mejora futura, no como algo roto hoy.

**Prioridad**: 🟢 Baja.

---

## 3. Autenticación y sesión — ⚠️ Parcial

**Descripción real**:
- Contraseñas: hasheadas por Supabase Auth (bcrypt) — no las manejamos nosotros directamente, heredado de la plataforma. ✅
- Cookies de sesión: `Secure` y `SameSite=Lax` sí (impuestos por `@supabase/ssr` en producción sobre HTTPS). `HttpOnly` **no** — es una decisión de arquitectura de Supabase, no un descuido: el cliente del navegador necesita leer el token para refrescar la sesión. Se mitiga con tokens de acceso de corta duración (1 hora) + rotación de refresh token.
- Límite de intentos de login: lo aplica Supabase Auth a nivel de su propia API (no configuramos nada nuestro encima).
- Timeout de sesión: sí, vía expiración de JWT (estándar de Supabase).
- Validación de sesión en cada petición sensible: ✅ verificado en vivo repetidas veces esta sesión (RLS + `is_store_staff()` en cada acción del admin).
- **MFA**: ❌ no implementado. Con una sola cuenta `owner` operando dinero real (aunque sea vía Yape manual), es la brecha más priorizable de esta sección.

**Riesgo**: si la contraseña del owner se filtra, no hay segundo factor que lo detenga.

**Acción recomendada**: activar MFA (TOTP) para la cuenta `owner` — Supabase Auth ya lo soporta (`supabase.auth.mfa.enroll`), falta construir la pantalla en `/admin`. Es una fase pequeña, se puede agregar después sin tocar el resto.

**Prioridad**: 🟠 Alta (protege literalmente el acceso a "confirmar pagos").

---

## 4. Protección de datos personales — ⚠️ Parcial

- Marco legal aplicable: **Perú (Ley N.° 29733, Protección de Datos Personales)**, no GDPR salvo que vendan a clientes en la UE — no asumir GDPR sin necesidad.
- Datos transmitidos: sí, todo cifrado (HTTPS + conexión TLS a Supabase).
- **Política de privacidad**: ❌ actualmente oculta (a pedido explícito del usuario, en esta misma sesión, "de momento no la vamos a usar"). Esto es una decisión de producto legítima, pero vale decirlo claro: **recolectan nombre, teléfono, correo y dirección de cada comprador sin mostrar ninguna política de privacidad**. No es un hueco técnico, es una decisión pendiente de revisar antes de operar con clientes reales.
- Auditoría de accesos a datos sensibles: parcial — `audit_logs` registra confirmar/rechazar pago, cambios de precio, cambios de configuración Yape, eliminar producto. No registra "quién vio los datos de qué cliente".
- Derecho al olvido: no hay un flujo de "borrar mis datos" para compradores invitados.
- Retención de datos: no hay política de retención definida.

**Prioridad**: 🟠 Alta (la falta de política de privacidad es el ítem más fácil de arreglar con más impacto legal/confianza — considerar reactivarla con contenido real antes de lanzar públicamente).

---

## 5. Validación de entrada y output — ✅ Implementado

- **SQL Injection**: no existe SQL crudo concatenado en ningún lado del código — todo pasa por el cliente de Supabase (PostgREST/RPC con parámetros tipados) o funciones `plpgsql` con parámetros, nunca interpolación de strings. Verificado por revisión de código (`grep` de todo `src/lib/actions` y `src/lib/queries`).
- **XSS**: React escapa todo output por defecto. Los únicos 2 usos de `dangerouslySetInnerHTML` en todo el proyecto son: (1) el JSON-LD de SEO (JSON generado por nosotros, nunca texto de usuario) y (2) el script de inicialización de tema (string estático fijo, sin interpolación de datos de usuario). Ninguno de los dos acepta input de un visitante.
- Validación server-side: con `zod` en cada server action que recibe datos del comprador o del admin (checkout, materiales, productos, configuración) — nunca se confía solo en la validación del formulario del navegador.
- Subida de archivos: valida tipo MIME y tamaño tanto en el cliente como en la configuración del bucket de Storage (Sección 29 del prompt original).

**Prioridad**: 🟢 Baja.

---

## 6. Control de acceso y autorización — ✅ Implementado

- Toda acción sensible del admin valida el rol en el servidor (`is_store_staff()`/verificación de `owner`), nunca solo en el cliente — probado en vivo múltiples veces esta sesión (intentos de acceso de `anon` a `products`, `payments`, `payment_receipts` fueron bloqueados por RLS).
- **BOLA (Broken Object Level Authorization)**: el caso más delicado (un comprador viendo el pedido de otro) se maneja con el UUID del pedido como token de acceso de un solo uso — probado que `anon` no puede listar pedidos ajenos.
- CSRF: los Server Actions de Next.js validan el header `Origin` automáticamente (protección nativa del framework desde Next 14); las llamadas directas a Supabase usan tokens Bearer, no cookies de sesión ambientales — reduce la superficie de CSRF clásico.
- RBAC: dos roles (`owner`, `staff`), principio de menor privilegio aplicado (solo `owner` puede invitar colaboradores).

**Prioridad**: 🟢 Baja.

---

## 7. Seguridad de pagos — ➖ No aplica (por diseño)

El MVP usa **exclusivamente Yape manual**: no se procesan tarjetas, no se
almacena ningún dato de tarjeta, no hay pasarela de pago integrada
(prohibido explícitamente en los requisitos del proyecto). **PCI DSS no
aplica** porque ningún dato de tarjeta toca el sistema. La validación
del pago es manual por el administrador (nunca automática), lo cual es
una decisión de producto, no una falla de seguridad.

**Prioridad**: N/A.

---

## 8. Seguridad de base de datos — ✅ Implementado (con límite conocido)

- Conexión cifrada por defecto (Supabase fuerza TLS en Postgres).
- RLS habilitada en **todas** las tablas de negocio, verificado en vivo repetidamente.
- BD no accesible públicamente sin autenticación (solo vía pooler con credenciales, o API REST con `anon key` + RLS).
- **Backups**: ❌ el plan gratuito de Supabase no incluye backups automáticos — ya documentado en `DEPLOY.md`. Se recomienda `npx supabase db dump` periódico manual, o subir de plan cuando el volumen de pedidos lo justifique.

**Prioridad**: 🟡 Media (bajo volumen inicial de datos = riesgo bajo por ahora, pero crece con cada pedido real).

---

## 9. Seguridad de APIs — ✅ Implementado para el alcance actual

No hay una API REST propia expuesta más allá de: (1) PostgREST de Supabase, protegido enteramente por RLS, y (2) Server Actions de Next.js, protegidos por la validación de sesión + rol en cada uno. No hay integración OAuth de terceros que audite. Rate limiting: implementado *best-effort* solo en el checkout (ver `src/lib/rate-limit.ts` — limitación de memoria-por-instancia documentada ahí mismo).

**Prioridad**: 🟡 Media (el rate limiting actual no resiste un ataque coordinado real; sería el primer punto a reforzar si el sitio crece).

---

## 10. Logging y monitoreo — ⚠️ Parcial

- `audit_logs`: confirmar/rechazar pago, cambiar precio, cambiar Yape, eliminar producto — con actor, fecha, valor anterior/nuevo.
- Ningún log contiene contraseñas ni tokens (verificado: los `console.error` del código solo registran mensajes de error genéricos, nunca payloads completos con datos sensibles).
- No hay alertas automáticas de actividad sospechosa (p. ej. muchos intentos de login fallidos) — eso vive en la infraestructura de Supabase/Vercel, no en código propio.

**Prioridad**: 🟡 Media.

---

## 11. Gestión de dependencias — ✅ Implementado

**Comando ejecutado**: `npm audit --json` → **0 vulnerabilidades** (crítica/alta/moderada/baja/info, todas en 0), a la fecha de esta auditoría. Set de dependencias deliberadamente pequeño (ver lista en `README.md`).

**Prioridad**: 🟢 Baja — recomendación: correr `npm audit` cada vez que se agregue una dependencia nueva, o activar Dependabot en GitHub (gratuito).

---

## 12. Configuración y secretos — ✅ Implementado

**Comprobado con `git log --all -p -- .env.local .env`**: sin resultados — esos archivos nunca estuvieron en el historial de git. `.env.example` sí está versionado (a propósito, sin secretos reales, ver commit de esta misma sesión que corrigió un `.gitignore` demasiado amplio). `SUPABASE_SERVICE_ROLE_KEY` solo se usa server-side (`src/lib/supabase/admin.ts`, con `import "server-only"` que rompe el build si algún componente de cliente lo importa por error).

**Comprobado también**: `https://rossana.stoka.pe/.env`, `/.env.local` y `/.git/config` devuelven `404` — no hay archivos de configuración expuestos públicamente.

**Prioridad**: 🟢 Baja.

---

## 13. Protección contra ataques comunes — ⚠️ Parcial

- OWASP Top 10: cubierto en su mayoría por RLS + zod + escapado de React + queries parametrizadas (ver secciones 5/6).
- **DDoS**: la protección de borde de Vercel es la única capa activa. El proxy de Cloudflare para `rossana.stoka.pe` está en modo "DNS only" (se desactivó a propósito para que la verificación de dominio de Vercel funcionara) — así que Cloudflare **no** está filtrando tráfico hoy.
- WAF dedicado: no hay.
- CAPTCHA: no hay en checkout ni en formularios — si aparece spam de pedidos falsos, sería el primer control a agregar.
- Open redirect: revisado el código — todos los `redirect()` usan rutas fijas o IDs de nuestra propia base de datos, nunca una URL controlada por el usuario. Sin hallazgos.

**Prioridad**: 🟡 Media (aceptable para el volumen de tráfico inicial; revisar si el sitio empieza a recibir tráfico significativo).

---

## 14. Infraestructura y hosting — ✅ Implementado (N/A en varios ítems por ser serverless)

Vercel (serverless) y Supabase (gestionado) — no hay servidor propio que
parchear, no hay SSH, no hay usuario root que asegurar: la plataforma
se encarga. Los ítems del checklist sobre firewall/puertos/SSH no
aplican a esta arquitectura.

**Prioridad**: N/A.

---

## 15-17. Testing de seguridad / Cumplimiento / Gestión de vulnerabilidades — ➖ No aplica a esta escala

Pentest formal, bug bounty, red team, auditoría PCI/HIPAA: no
corresponden a un MVP de una persona. Lo que sí se hizo en esta
auditoría:
- Intento de escaneo pasivo con OWASP ZAP (`docker run zaproxy/zap-stable zap-baseline.py`) — **no se pudo ejecutar**: Docker Desktop no está corriendo en esta máquina. Queda pendiente correrlo cuando Docker esté disponible, o desde otra máquina.
- Todo lo demás en este documento sí se verificó con comandos reales.

**Acción recomendada de bajo costo**: correr `npx supabase db dump` y `npm audit` una vez al mes como higiene mínima, sin necesidad de un proceso formal.

**Prioridad**: 🟢 Baja para el tamaño actual del negocio.

---

## 18. Seguridad en desarrollo — ✅ Implementado (para un equipo de una persona)

- Repositorio de GitHub: **privado**, confirmado.
- Sin protección de ramas / revisión de PRs — esperable con un solo desarrollador; se puede activar `branch protection` en GitHub gratis si se suma alguien más al equipo.
- Sin firma GPG de commits — no crítico a este tamaño.
- Despliegue: solo Vercel puede desplegar, y solo a partir de un push a `main` en el repo autorizado.

**Prioridad**: 🟢 Baja.

---

## 19. Recuperación y continuidad — ⚠️ Parcial

Sin plan formal de recuperación ante desastres, sin RTO/RPO definidos.
Mitigado parcialmente por: código versionado en GitHub (recuperable en
minutos), migraciones de base de datos versionadas en
`supabase/migrations/` (el esquema completo se puede reconstruir desde
cero), pero **sin backups de los datos** (pedidos, clientes) más allá
de lo manual que decida hacer el usuario.

**Prioridad**: 🟡 Media — crece en importancia con cada pedido real que entra.

---

## 20. Educación y concientización — N/A

Equipo de una persona por ahora; no aplica un programa formal de
training. Este documento y `MANUAL_EMPRENDEDOR.md`/`README.md` cumplen
el rol de documentación de referencia.

---

## Hoja de ruta priorizada

| # | Acción | Prioridad | Esfuerzo |
|---|---|---|---|
| 1 | Reactivar página de privacidad/términos (aunque sea básica) antes de operar con clientes reales | 🟠 Alta | Bajo — el componente ya existe, solo hay que redactar el texto y volver a mostrarlo |
| 2 | Agregar MFA (TOTP) a la cuenta `owner` | 🟠 Alta | Medio — Supabase ya lo soporta, falta la pantalla |
| 3 | Definir una rutina de backup manual (`supabase db dump`) hasta que se justifique el plan pagado | 🟡 Media | Bajo |
| 4 | Reforzar rate limiting (Upstash Redis u otro contador compartido) si el tráfico crece | 🟡 Media | Medio |
| 5 | Agregar CAPTCHA al checkout si aparece spam de pedidos falsos | 🟢 Baja | Bajo |
| 6 | Correr un escaneo OWASP ZAP real cuando haya Docker disponible | 🟢 Baja | Bajo |

Ya corregido durante esta misma auditoría: header `X-Powered-By`
eliminado (commit `b835e61`).
