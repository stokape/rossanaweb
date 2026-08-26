import { createClient } from "@/lib/supabase/server";
import { ROSSANA_STORE_ID } from "@/lib/queries/site";

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  stockAvailable: number;
  imageUrl: string | null;
}

export type SortOption = "destacados" | "recientes" | "precio_asc" | "precio_desc";

export interface ProductFilters {
  categorySlug?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  material?: string;
  onlyInStock?: boolean;
  onlyNew?: boolean;
  onlyOffers?: boolean;
  featuredOnly?: boolean;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

export interface ProductListResult {
  products: ProductSummary[];
  total: number;
}

/** Categorías activas (Sección 15). Nunca hardcodeadas: si no hay
 * ninguna cargada todavía, se devuelve una lista vacía y la Home la
 * omite en vez de mostrar una sección rota. */
export async function getActiveCategories(): Promise<CategorySummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, image_url")
    .eq("store_id", ROSSANA_STORE_ID)
    .eq("active", true)
    .order("display_order", { ascending: true });

  if (error || !data) return [];

  return data.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    imageUrl: c.image_url,
  }));
}

/** Categorías activas que además ya tienen al menos un producto
 * publicado — para la sección "Encuentra tu estilo" del Home, que no
 * debe mostrar categorías todavía vacías (Sección 15/88: nunca
 * aparentar más catálogo del que realmente existe). El resto de usos
 * (nav del header, filtros, selector del admin) siguen usando
 * `getActiveCategories()` sin este filtro, porque ahí sí tiene sentido
 * ver una categoría antes de cargarle productos. */
export async function getCategoriesWithProducts(): Promise<CategorySummary[]> {
  const supabase = await createClient();

  const [{ data: categories, error: catError }, { data: products, error: prodError }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug, image_url")
      .eq("store_id", ROSSANA_STORE_ID)
      .eq("active", true)
      .order("display_order", { ascending: true }),
    supabase.from("storefront_products").select("category_id").eq("store_id", ROSSANA_STORE_ID),
  ]);

  if (catError || prodError || !categories || !products) return [];

  const categoryIdsWithProducts = new Set(products.map((p) => p.category_id).filter(Boolean));

  return categories
    .filter((c) => categoryIdsWithProducts.has(c.id))
    .map((c) => ({ id: c.id, name: c.name, slug: c.slug, imageUrl: c.image_url }));
}

export async function getCategoryBySlug(slug: string): Promise<CategorySummary | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, image_url")
    .eq("store_id", ROSSANA_STORE_ID)
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (error || !data) return null;
  return { id: data.id, name: data.name, slug: data.slug, imageUrl: data.image_url };
}

async function getPrimaryImages(productIds: string[]) {
  if (productIds.length === 0) return new Map<string, string>();
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_images")
    .select("product_id, url, is_primary, display_order")
    .in("product_id", productIds)
    .eq("image_type", "gallery")
    .order("is_primary", { ascending: false })
    .order("display_order", { ascending: true });

  const map = new Map<string, string>();
  for (const img of data ?? []) {
    if (!map.has(img.product_id)) map.set(img.product_id, img.url);
  }
  return map;
}

function toSummary(
  p: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compare_at_price: number | null;
    stock_available: number;
  },
  images: Map<string, string>,
): ProductSummary {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    compareAtPrice: p.compare_at_price != null ? Number(p.compare_at_price) : null,
    stockAvailable: p.stock_available,
    imageUrl: images.get(p.id) ?? null,
  };
}

/** Escapa el término de búsqueda para no romper la sintaxis `.or()` de
 * PostgREST (usa coma como separador de condiciones). */
function sanitizeSearchTerm(term: string) {
  return term.replace(/[,()%]/g, " ").trim();
}

const DEFAULT_PAGE_SIZE = 12;

/** Listado de catálogo con filtros/orden/paginación (Sección 19-20).
 * Fuente: `storefront_products` (sin columnas de costo). */
export async function getProducts(filters: ProductFilters): Promise<ProductListResult> {
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("storefront_products")
    .select("id, name, slug, price, compare_at_price, stock_available", { count: "exact" })
    .eq("store_id", ROSSANA_STORE_ID);

  if (filters.categorySlug) {
    const category = await getCategoryBySlug(filters.categorySlug);
    if (!category) return { products: [], total: 0 };
    query = query.eq("category_id", category.id);
  }

  if (filters.q) {
    const term = sanitizeSearchTerm(filters.q);
    if (term) {
      query = query.or(
        [
          `name.ilike.%${term}%`,
          `sku.ilike.%${term}%`,
          `description.ilike.%${term}%`,
          `short_description.ilike.%${term}%`,
          `tags.cs.{${term}}`,
        ].join(","),
      );
    }
  }

  if (filters.minPrice != null) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice != null) query = query.lte("price", filters.maxPrice);
  if (filters.color) query = query.eq("color", filters.color);
  if (filters.material) query = query.eq("material", filters.material);
  if (filters.onlyInStock) query = query.gt("stock_available", 0);
  if (filters.onlyOffers) query = query.eq("on_offer", true);
  if (filters.featuredOnly) query = query.eq("featured", true);
  if (filters.onlyNew) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte("created_at", thirtyDaysAgo);
  }

  switch (filters.sort) {
    case "precio_asc":
      query = query.order("price", { ascending: true });
      break;
    case "precio_desc":
      query = query.order("price", { ascending: false });
      break;
    case "recientes":
      query = query.order("created_at", { ascending: false });
      break;
    case "destacados":
    default:
      query = query.order("featured", { ascending: false }).order("created_at", { ascending: false });
      break;
  }

  const { data, error, count } = await query.range(from, to);
  if (error || !data) return { products: [], total: 0 };

  const images = await getPrimaryImages(data.map((p) => p.id));
  return { products: data.map((p) => toSummary(p, images)), total: count ?? data.length };
}

export interface FilterOptions {
  colors: string[];
  materials: string[];
}

/** Valores disponibles para los chips de Color/Material (Sección 19),
 * calculados a partir de lo que realmente existe publicado — nunca
 * una lista fija. */
export async function getFilterOptions(): Promise<FilterOptions> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("storefront_products")
    .select("color, material")
    .eq("store_id", ROSSANA_STORE_ID);

  const colors = new Set<string>();
  const materials = new Set<string>();
  for (const row of data ?? []) {
    if (row.color) colors.add(row.color);
    if (row.material) materials.add(row.material);
  }
  return { colors: [...colors].sort(), materials: [...materials].sort() };
}

/** "Favoritos de Rossana" (Sección 16): productos marcados como
 * destacados. */
export async function getFeaturedProducts(limit = 8): Promise<ProductSummary[]> {
  const { products } = await getProducts({ featuredOnly: true, sort: "recientes", pageSize: limit });
  return products;
}

/** "Nuevos ingresos" (Sección 13/19). */
export async function getNewArrivals(limit = 8): Promise<ProductSummary[]> {
  const { products } = await getProducts({ sort: "recientes", pageSize: limit });
  return products;
}

/** "Ofertas" (Sección 13/20). */
export async function getOffers(limit = 8): Promise<ProductSummary[]> {
  const { products } = await getProducts({ onlyOffers: true, sort: "recientes", pageSize: limit });
  return products;
}
