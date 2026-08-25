import { createClient } from "@/lib/supabase/server";
import { ROSSANA_STORE_ID } from "@/lib/queries/site";

export interface ProducibleProduct {
  id: string;
  name: string;
  sku: string;
}

/** Productos que tienen "Componentes del producto" definidos (Sección 52) —
 * sin receta no se puede fabricar. */
export async function getProducibleProducts(): Promise<ProducibleProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, sku, product_components!inner(id)")
    .eq("store_id", ROSSANA_STORE_ID);

  if (error || !data) return [];

  // Deduplicar (el join trae una fila por componente)
  const seen = new Map<string, ProducibleProduct>();
  for (const p of data) seen.set(p.id, { id: p.id, name: p.name, sku: p.sku });
  return [...seen.values()];
}

export interface ProductComponentRequirement {
  materialId: string;
  materialName: string;
  unit: string;
  quantityRequired: number;
  currentStock: number;
}

/** "Componentes del producto" (Sección 51) con el stock actual de cada
 * material, para calcular en vivo si alcanza (Sección 52). */
export async function getProductComponents(productId: string): Promise<ProductComponentRequirement[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_components")
    .select("quantity_required, unit, materials(id, name, current_stock)")
    .eq("product_id", productId);

  if (error || !data) return [];

  return data
    .filter((row) => row.materials)
    .map((row) => ({
      materialId: row.materials!.id,
      materialName: row.materials!.name,
      unit: row.unit,
      quantityRequired: Number(row.quantity_required),
      currentStock: Number(row.materials!.current_stock),
    }));
}
