import type { NextConfig } from "next";

// Host de Supabase Storage derivado de la URL del proyecto — no
// hardcodeado (Sección 17): si el proyecto de Supabase cambia, basta
// con actualizar NEXT_PUBLIC_SUPABASE_URL.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

// Cabeceras de seguridad (Sección 72). El CSP permite 'unsafe-inline'/
// 'unsafe-eval' en script-src porque Next.js App Router los necesita
// para la hidratación — un CSP más estricto requeriría nonces por
// request, fuera del alcance del MVP. Aun así bloquea que la página se
// embeba en un iframe ajeno (frame-ancestors) y restringe de dónde se
// puede cargar contenido.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // 'self' blob: — el OCR de comprobantes (Sección 30) corre
      // Tesseract.js en un Worker propio, creado a partir de un
      // blob: URL con el worker.min.js que servimos nosotros mismos
      // en /tesseract (nunca desde el CDN por defecto de la
      // librería, que quedaría bloqueado por este mismo CSP).
      "worker-src 'self' blob:",
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: blob:${supabaseHost ? ` https://${supabaseHost}` : ""}`,
      `connect-src 'self'${supabaseHost ? ` https://${supabaseHost} wss://${supabaseHost}` : ""}`,
      "font-src 'self' data:",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // No anunciar la tecnología del framework en cada respuesta
  // (mínima higiene de seguridad: menos pistas gratis para un atacante).
  poweredByHeader: false,
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
