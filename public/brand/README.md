# Assets de marca — Rossana

Esta carpeta es SOLO para el logo oficial (Sección 5 del prompt maestro).
Las fotos de producto NO van aquí — ver nota abajo.

Coloca los archivos con estos nombres exactos (el que tengas disponible
en cada formato; no hace falta tener los seis para empezar):

| Archivo esperado | Uso |
|---|---|
| `logo-primary.svg` (o `.png`) | Logo principal, header sobre fondo claro |
| `logo-light-bg.png` | Variante para fondo claro/marfil |
| `logo-dark-bg.png` | Variante para fondo Rossana Red / oscuro (footer, hero) |
| `logo-mobile.png` | Versión compacta para el header en móvil |
| `isotipo.png` | Solo el diamante con destello, sin texto |
| `favicon.ico` (o `favicon.png` 512×512) | Ícono de pestaña del navegador |

Formatos: SVG para el logo principal si lo tienes (escala perfecto);
si no, PNG con fondo transparente en la resolución más alta disponible.

En cuanto estén aquí, aviso y reemplazo el wordmark de texto temporal
(`src/components/shop/Wordmark.tsx`) por las imágenes reales en Header,
Footer y favicon — sin tocar el resto del código.

## Fotos de producto — NO van en esta carpeta

Las fotos de cada producto (incluida la secuencia 360°) se suben desde
el panel `/admin` (Fase 13, wizard de alta de producto), directo a
Supabase Storage — así Rossana las administra sin tocar código, y cada
producto puede tener las suyas sin límite fijo. Cuando esa pantalla
esté lista te aviso para que empieces a cargar tu catálogo real ahí.
