import { NewProductForm } from "@/components/admin/products/NewProductForm";
import { getActiveCategories } from "@/lib/queries/catalog";

// Wizard de alta de producto, paso 1 (Sección 43-44).
export default async function NuevoProductoPage() {
  const categories = await getActiveCategories();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-rossana-charcoal md:text-3xl">
        Nuevo producto
      </h1>
      <NewProductForm categories={categories} />
    </div>
  );
}
