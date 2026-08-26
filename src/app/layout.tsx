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
};

// Aplica el tema guardado ANTES del primer paint (evita el parpadeo
// claro→oscuro al cargar). Corre una sola vez, antes de hidratar.
const themeInitScript = `
  try {
    var theme = localStorage.getItem('rossana_theme');
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  } catch (e) {}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${montserrat.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-rossana-warm-white text-rossana-charcoal">
        {children}
      </body>
    </html>
  );
}
