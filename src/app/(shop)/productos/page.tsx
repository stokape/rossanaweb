import type { Metadata } from "next";
import { CatalogView } from "@/components/shop/catalog/CatalogView";

const PAGE_TITLE = "Productos";
const PAGE_DESCRIPTION = "Explora toda la bisutería y accesorios de Rossana.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/productos" },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/productos",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
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
