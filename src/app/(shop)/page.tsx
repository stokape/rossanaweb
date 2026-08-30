import type { Metadata } from "next";
import { Hero } from "@/components/shop/home/Hero";
import { CategoriesSection } from "@/components/shop/home/CategoriesSection";
import { ProductGridSection } from "@/components/shop/home/ProductGridSection";
import { BenefitsSection } from "@/components/shop/home/BenefitsSection";
import { SocialSection } from "@/components/shop/home/SocialSection";
import { FAQSection } from "@/components/shop/home/FAQSection";
import {
  getCategoriesWithProducts,
  getFeaturedProducts,
  getNewArrivals,
  getOffers,
} from "@/lib/queries/catalog";
import { getSiteSettings } from "@/lib/queries/site";
import { getHeroBanners } from "@/lib/queries/banners";

// Metadata propia de la Home (Sección 66/SEO): título sin el template
// "%s | Rossana" del layout raíz (aquí sí queremos el nombre completo
// primero) y una descripción real basada en lo que se vende hoy
// (pulseras artesanales hechas a mano, pago por Yape o Plin).
export const metadata: Metadata = {
  title: "Rossana — Bisutería y Más | Pulseras artesanales en Perú",
  description:
    "Pulseras artesanales hechas a mano, con materiales seleccionados y empaque listo para regalar. Compra como invitado y paga fácil por Yape o Plin.",
  keywords: [
    "pulseras artesanales",
    "bisutería",
    "accesorios de moda",
    "pulseras hechas a mano",
    "joyería bisutería Perú",
    "regalos para mujer",
    "pulseras Perú",
  ],
  alternates: { canonical: "/" },
};

// Orden de la Home según Sección 13: Hero → Categorías → Destacados →
// Nuevos ingresos → Ofertas → Beneficios → Redes → Preguntas frecuentes
// (barra promo, header y footer ya los pone el layout de (shop)).
export default async function HomePage() {
  const [categories, featured, newArrivals, offers, settings, heroBanners] = await Promise.all([
    getCategoriesWithProducts(),
    getFeaturedProducts(),
    getNewArrivals(),
    getOffers(),
    getSiteSettings(),
    getHeroBanners(),
  ]);

  return (
    <>
      <Hero banners={heroBanners} />

      <CategoriesSection categories={categories} />

      {featured.length > 0 && (
        <ProductGridSection
          title="Favoritos de Rossana"
          products={featured}
          viewAllHref="/productos?destacados=1"
          emptyMessage=""
          tone="ivory"
        />
      )}

      <ProductGridSection
        title="Nuevos ingresos"
        products={newArrivals}
        viewAllHref="/productos?orden=recientes"
        emptyMessage="Estamos preparando nuestra colección. Vuelve pronto."
      />

      {offers.length > 0 && (
        <ProductGridSection
          title="Ofertas"
          products={offers}
          viewAllHref="/productos?ofertas=1"
          emptyMessage=""
          tone="ivory"
        />
      )}

      <BenefitsSection />

      <SocialSection socialLinks={settings.socialLinks} />

      <FAQSection />
    </>
  );
}
