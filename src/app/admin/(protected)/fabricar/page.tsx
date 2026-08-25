import { ProduceForm } from "@/components/admin/production/ProduceForm";
import { getProducibleProducts } from "@/lib/queries/admin/production";

// "Hacer productos" (Sección 52-53).
export default async function AdminFabricarPage() {
  const products = await getProducibleProducts();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-rossana-charcoal md:text-3xl">
        Hacer productos
      </h1>
      <ProduceForm products={products} />
    </div>
  );
}
