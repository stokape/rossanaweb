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

/** "Favoritos de Rossana" (Sección 16): productos marcados como
 * destacados. Lee de `storefront_products`, sin columnas de costo. */
export async function getFeaturedProducts(limit = 8): Promise<ProductSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("storefront_products")
    .select("id, name, slug, price, compare_at_price, stock_available")
    .eq("store_id", ROSSANA_STORE_ID)
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  const images = await getPrimaryImages(data.map((p) => p.id));
  return data.map((p) => toSummary(p, images));
}

/** "Nuevos ingresos" (Sección 13/19). */
export async function getNewArrivals(limit = 8): Promise<ProductSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("storefront_products")
    .select("id, name, slug, price, compare_at_price, stock_available")
    .eq("store_id", ROSSANA_STORE_ID)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  const images = await getPrimaryImages(data.map((p) => p.id));
  return data.map((p) => toSummary(p, images));
}

/** "Ofertas" (Sección 13/20): productos con precio anterior mayor al actual. */
export async function getOffers(limit = 8): Promise<ProductSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("storefront_products")
    .select("id, name, slug, price, compare_at_price, stock_available")
    .eq("store_id", ROSSANA_STORE_ID)
    .not("compare_at_price", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  const withDiscount = data.filter(
    (p) => p.compare_at_price != null && Number(p.compare_at_price) > Number(p.price),
  );
  const images = await getPrimaryImages(withDiscount.map((p) => p.id));
  return withDiscount.map((p) => toSummary(p, images));
}
