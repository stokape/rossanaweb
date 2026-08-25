import type { MetadataRoute } from "next";

// Sección 66. NEXT_PUBLIC_SITE_URL nunca hardcodeado (Sección 78): hoy
// ventas.stoka.pe, mañana el dominio propio, sin tocar código.
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/carrito", "/checkout", "/cuenta", "/pedido"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
