import { CategoryCard } from "@/components/shop/CategoryCard";
import type { CategorySummary } from "@/lib/queries/catalog";

/** Sección 15. Se omite por completo si aún no hay categorías
 * cargadas — nunca se hardcodea su existencia. */
export function CategoriesSection({ categories }: { categories: CategorySummary[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
      <div className="mb-8 text-center">
        <h2 className="font-display text-2xl font-semibold text-rossana-charcoal md:text-3xl">
          Encuentra tu estilo
        </h2>
        <p className="mt-2 text-rossana-charcoal/60">
          Descubre piezas pensadas para cada momento.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-5 sm:gap-6">
        {categories.map((category) => (
          <div key={category.id} className="w-28 sm:w-32 md:w-36">
            <CategoryCard category={category} />
          </div>
        ))}
      </div>
    </section>
  );
}
