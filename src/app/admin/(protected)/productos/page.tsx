import { Plus, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AdminProductCard } from "@/components/admin/products/AdminProductCard";
import { DeleteAllProductsSection } from "@/components/admin/products/DeleteAllProductsSection";
import { getAdminProducts } from "@/lib/queries/admin/products";

// "Mis productos" (Sección 42).
export default async function AdminProductosPage() {
  const products = await getAdminProducts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-rossana-charcoal md:text-3xl">
          Mis productos
        </h1>
        <div className="flex flex-wrap gap-2">
          <Button href="/admin/productos/importar" variant="secondary" size="sm">
            <UploadCloud className="size-4" /> IMPORTAR VARIOS
          </Button>
          <Button href="/admin/productos/nuevo" variant="primary" size="sm">
            <Plus className="size-4" /> AGREGAR PRODUCTO
          </Button>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="rounded-card border border-dashed border-rossana-border bg-rossana-warm-white px-6 py-16 text-center text-rossana-charcoal/50">
          Todavía no tienes productos. Agrega el primero para empezar a vender.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((product) => (
            <AdminProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <DeleteAllProductsSection totalProducts={products.length} />
    </div>
  );
}
