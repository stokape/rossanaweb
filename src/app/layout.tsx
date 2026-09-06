import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Rossana — Bisutería y Más",
    template: "%s | Rossana",
  },
  description:
    "Bisutería y accesorios que complementan tu esencia. Elegancia que brilla contigo.",
  keywords: [
    "bisutería",
    "pulseras artesanales",
    "accesorios de moda",
    "joyería bisutería Perú",
    "pulseras hechas a mano",
  ],
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: "Rossana — Bisutería y Más",
    title: "Rossana — Bisutería y Más",
    description:
      "Bisutería y accesorios que complementan tu esencia. Elegancia que brilla contigo.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rossana — Bisutería y Más",
    description:
      "Bisutería y accesorios que complementan tu esencia. Elegancia que brilla contigo.",
    images: ["/og-image.png"],
  },
  // Verificación de Google Search Console (método "etiqueta HTML"): el
  // código lo genera Google al agregar la propiedad, nunca se hardcodea
  // (Sección 78) — se pega en NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION.
  // Si no está configurada, Next.js simplemente no imprime la etiqueta.
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${montserrat.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-rossana-ivory text-rossana-charcoal">
        {children}
      </body>
    </html>
  );
}
