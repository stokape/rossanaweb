import { createClient } from "@/lib/supabase/server";
import { ROSSANA_STORE_ID } from "@/lib/queries/site";
import type { ProductStatus } from "@/types/database";

export interface AdminProductSummary {
  id: string;
  name: string;
  price: number;
  stockAvailable: number;
  status: ProductStatus;
  imageUrl: string | null;
  lowStock: boolean;
}

/** "Mis productos" (Sección 42). No muestra costos en el listado
 * principal (solo en la ficha de edición, Sección 42/54). */
export async function getAdminProducts(): Promise<AdminProductSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, stock_available, minimum_stock, status")
    .eq("store_id", ROSSANA_STORE_ID)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const images = await getPrimaryImages(data.map((p) => p.id));

  return data.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    stockAvailable: p.stock_available,
    status: p.status,
    imageUrl: images.get(p.id) ?? null,
    lowStock: p.stock_available <= p.minimum_stock,
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
