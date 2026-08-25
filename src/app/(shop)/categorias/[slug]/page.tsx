import { notFound } from "next/navigation";
import { CatalogView } from "@/components/shop/catalog/CatalogView";
import { getCategoryBySlug } from "@/lib/queries/catalog";

interface CategoriaPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: CategoriaPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return { title: category?.name ?? "Categoría" };
}

// Listado por categoría (Sección 19), reutiliza el mismo catálogo con
// la categoría fija.
export default async function CategoriaPage({ params, searchParams }: CategoriaPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const resolvedSearchParams = await searchParams;

  return (
    <CatalogView
      basePath={`/categorias/${slug}`}
      title={category.name}
      breadcrumb={[
        { label: "Inicio", href: "/" },
        { label: "Productos", href: "/productos" },
        { label: category.name },
      ]}
      searchParams={resolvedSearchParams}
      lockedCategorySlug={slug}
    />
  );
}
