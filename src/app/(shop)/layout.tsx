import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { PromoBar } from "@/components/shop/PromoBar";
import { JsonLd } from "@/components/seo/JsonLd";
import { getActiveCategories } from "@/lib/queries/catalog";
import { getSiteSettings } from "@/lib/queries/site";
import { CartProvider } from "@/lib/cart/CartProvider";

/** Layout de la tienda pública (Sección 12/18): barra promocional +
 * header + navegación arriba, footer abajo, en todas las rutas de
 * comprador. El panel /admin usa su propio layout (Fase 11). */
export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [categories, settings] = await Promise.all([
    getActiveCategories(),
    getSiteSettings(),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const businessName = settings.businessName ?? "Rossana — Bisutería y Más";

  return (
    <CartProvider>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: businessName,
          url: siteUrl,
          ...(settings.whatsappNumber ? { telephone: settings.whatsappNumber } : {}),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: businessName,
          url: siteUrl,
        }}
      />
      <PromoBar messages={settings.promoBarMessages} />
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </CartProvider>
  );
}
