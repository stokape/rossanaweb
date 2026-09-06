import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CatalogView } from "@/components/shop/catalog/CatalogView";
import { getCategoryBySlug } from "@/lib/queries/catalog";

interface CategoriaPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: CategoriaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Categoría" };

  const title = category.name;
  const description = `Descubre ${category.name.toLowerCase()} de Rossana — Bisutería y Más: piezas hechas a mano con materiales seleccionados.`;
  const canonical = `/categorias/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: category.imageUrl ? [{ url: category.imageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: category.imageUrl ? [category.imageUrl] : undefined,
    },
  };
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
