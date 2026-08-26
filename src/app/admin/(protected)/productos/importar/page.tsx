import { ImportProductsForm } from "@/components/admin/products/ImportProductsForm";
import { getActiveCategories } from "@/lib/queries/catalog";

// Importar varios productos a la vez desde un CSV (Sección 42).
export default async function ImportarProductosPage() {
  const categories = await getActiveCategories();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-rossana-charcoal md:text-3xl">
          Importar varios productos
        </h1>
        <p className="mt-1 text-sm text-rossana-charcoal/60">
          Para cargar tus productos de a uno, usa &quot;Agregar producto&quot;. Esta opción es
          para cuando tienes varios a la vez.
        </p>
      </div>
      <ImportProductsForm categories={categories} />
    </div>
  );
}
