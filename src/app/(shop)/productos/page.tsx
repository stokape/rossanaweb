import type { Metadata } from "next";
import { CatalogView } from "@/components/shop/catalog/CatalogView";

export const metadata: Metadata = {
  title: "Productos",
  description: "Explora toda la bisutería y accesorios de Rossana.",
};

interface ProductosPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Catálogo completo (Sección 19): filtros, orden, paginación.
export default async function ProductosPage({ searchParams }: ProductosPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <CatalogView
      basePath="/productos"
      title="Todos los productos"
      breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Productos" }]}
      searchParams={resolvedSearchParams}
    />
  );
}
