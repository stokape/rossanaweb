# Assets de marca — Rossana

## Estado: logo y favicon oficiales ya cargados ✅

- `logo_rossana.png` (2172×724, fondo transparente) — usado en Header, Footer, panel admin y login (`src/components/shop/Logo.tsx`).
- `favicon_rossana.png` (1254×1254) — copiado a `src/app/icon.png`, Next.js lo sirve automáticamente como ícono de pestaña.

Como el logo tiene fondo transparente, la misma imagen funciona tanto
sobre fondos claros (header, catálogo) como sobre Rossana Red (footer,
hero) — no hace falta una variante separada por fondo.

Si más adelante Rossana quiere variantes específicas (una versión más
compacta para móvil, el isotipo del diamante solo sin el "R", etc.),
se agregan aquí con el mismo patrón: subir el archivo y avisar para
conectarlo en `Logo.tsx`.

## Fotos de producto — NO van en esta carpeta

Las fotos de cada producto (incluida la secuencia 360°) se suben desde
el panel `/admin/productos`, directo a Supabase Storage — así Rossana
las administra sin tocar código.
