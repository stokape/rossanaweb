import { Hero } from "@/components/shop/home/Hero";
import { CategoriesSection } from "@/components/shop/home/CategoriesSection";
import { ProductGridSection } from "@/components/shop/home/ProductGridSection";
import { BenefitsSection } from "@/components/shop/home/BenefitsSection";
import { SocialSection } from "@/components/shop/home/SocialSection";
import {
  getActiveCategories,
  getFeaturedProducts,
  getNewArrivals,
  getOffers,
} from "@/lib/queries/catalog";
import { getSiteSettings } from "@/lib/queries/site";
import { getHeroBanners } from "@/lib/queries/banners";

// Sin metadata propia: hereda el título/descripción "default" del
// layout raíz tal cual (sin aplicar el template "%s | Rossana"), que
// es exactamente lo que debe verse en la Home.
// Orden de la Home según Sección 13: Hero → Categorías → Destacados →
// Nuevos ingresos → Ofertas → Beneficios → Redes (barra promo, header
// y footer ya los pone el layout de (shop)).
export default async function HomePage() {
  const [categories, featured, newArrivals, offers, settings, heroBanners] = await Promise.all([
    getActiveCategories(),
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

      <ProductGridSection
        title="Favoritos de Rossana"
        products={featured}
        viewAllHref="/productos?destacados=1"
        emptyMessage="Muy pronto vas a encontrar aquí los favoritos de Rossana."
        tone="ivory"
      />

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
    </>
  );
}
