import { notFound } from "next/navigation";
import { ProductEditForm } from "@/components/admin/products/ProductEditForm";
import { getAdminProductDetail } from "@/lib/queries/admin/product-detail";
import { getActiveCategories } from "@/lib/queries/catalog";
import { getMaterials } from "@/lib/queries/admin/materials";

interface EditarProductoPageProps {
  params: Promise<{ id: string }>;
}

// Capacidad de fabricación (Sección 60): el componente limitante
// determina cuántos se pueden hacer con el stock actual — se calcula
// abajo, inline, a partir de los componentes + el stock de materiales.
export default async function EditarProductoPage({ params }: EditarProductoPageProps) {
  const { id } = await params;
  const [product, categories, materials] = await Promise.all([
    getAdminProductDetail(id),
    getActiveCategories(),
    getMaterials(),
  ]);

  if (!product) notFound();

  let maxProducible: number | null = null;
  if (product.components.length > 0) {
    const materialStock = new Map(materials.map((m) => [m.id, m.currentStock]));
    const possible = product.components.map((c) => {
      const stock = materialStock.get(c.materialId) ?? 0;
      return c.quantityRequired > 0 ? Math.floor(stock / c.quantityRequired) : 0;
    });
    maxProducible = Math.min(...possible);
  }

  return (
    <ProductEditForm
      product={product}
      categories={categories}
      materials={materials}
      maxProducible={maxProducible}
    />
  );
}
