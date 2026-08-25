import { createClient } from "@/lib/supabase/server";
import { ROSSANA_STORE_ID } from "@/lib/queries/site";
import { getProducts, type ProductSummary } from "@/lib/queries/catalog";

export interface ProductImageItem {
  url: string;
  alt: string | null;
}

export interface ProductDetail {
  id: string;
  sku: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  material: string | null;
  color: string | null;
  dimensions: string | null;
  weightGrams: number | null;
  price: number;
  compareAtPrice: number | null;
  stockAvailable: number;
  seoTitle: string | null;
  seoDescription: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  galleryImages: ProductImageItem[];
  spinImages: ProductImageItem[];
}

/** Ficha de producto (Sección 21). Fuente: `storefront_products`, sin
 * columnas de costo/margen. */
export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("storefront_products")
    .select("*")
    .eq("store_id", ROSSANA_STORE_ID)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !product) return null;

  const [{ data: images }, categoryResult] = await Promise.all([
    supabase
      .from("product_images")
      .select("url, alt, image_type, display_order, is_primary")
      .eq("product_id", product.id)
      .order("is_primary", { ascending: false })
      .order("display_order", { ascending: true }),
    product.category_id
      ? supabase
          .from("categories")
          .select("name, slug")
          .eq("id", product.category_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const gallery = (images ?? []).filter((img) => img.image_type === "gallery");
  const spin = (images ?? []).filter((img) => img.image_type === "360");

  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    shortDescription: product.short_description,
    description: product.description,
    material: product.material,
    color: product.color,
    dimensions: product.dimensions,
    weightGrams: product.weight_grams,
    price: Number(product.price),
    compareAtPrice: product.compare_at_price != null ? Number(product.compare_at_price) : null,
    stockAvailable: product.stock_available,
    seoTitle: product.seo_title,
    seoDescription: product.seo_description,
    categoryId: product.category_id,
    categoryName: categoryResult.data?.name ?? null,
    categorySlug: categoryResult.data?.slug ?? null,
    galleryImages: gallery.map((img) => ({ url: img.url, alt: img.alt })),
    spinImages: spin.map((img) => ({ url: img.url, alt: img.alt })),
  };
}

/** Productos relacionados (Sección 21): misma categoría, excluyendo el actual. */
export async function getRelatedProducts(
  categorySlug: string | null,
  excludeProductId: string,
  limit = 4,
): Promise<ProductSummary[]> {
  if (!categorySlug) return [];
  const { products } = await getProducts({ categorySlug, pageSize: limit + 1 });
  return products.filter((p) => p.id !== excludeProductId).slice(0, limit);
}
