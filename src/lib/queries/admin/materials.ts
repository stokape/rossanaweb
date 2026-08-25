import { createClient } from "@/lib/supabase/server";
import { ROSSANA_STORE_ID } from "@/lib/queries/site";
import type { MaterialUnit } from "@/types/database";

export interface MaterialSummary {
  id: string;
  name: string;
  photoUrl: string | null;
  unit: MaterialUnit;
  currentStock: number;
  minimumStock: number;
  averageUnitCost: number;
  lowStock: boolean;
}

/** "Mis materiales" (Sección 46). */
export async function getMaterials(): Promise<MaterialSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("materials")
    .select("id, name, photo_url, unit, current_stock, minimum_stock, average_unit_cost")
    .eq("store_id", ROSSANA_STORE_ID)
    .eq("active", true)
    .order("name", { ascending: true });

  if (error || !data) return [];

  return data.map((m) => ({
    id: m.id,
    name: m.name,
    photoUrl: m.photo_url,
    unit: m.unit,
    currentStock: Number(m.current_stock),
    minimumStock: Number(m.minimum_stock),
    averageUnitCost: Number(m.average_unit_cost),
    lowStock: Number(m.current_stock) <= Number(m.minimum_stock),
  }));
}

export interface MaterialDetail extends MaterialSummary {
  sku: string | null;
  category: string | null;
  supplier: string | null;
}

export async function getMaterialById(id: string): Promise<MaterialDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("materials")
    .select(
      "id, sku, name, category, photo_url, unit, current_stock, minimum_stock, average_unit_cost, supplier",
    )
    .eq("id", id)
    .eq("store_id", ROSSANA_STORE_ID)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    sku: data.sku,
    name: data.name,
    category: data.category,
    photoUrl: data.photo_url,
    unit: data.unit,
    currentStock: Number(data.current_stock),
    minimumStock: Number(data.minimum_stock),
    averageUnitCost: Number(data.average_unit_cost),
    lowStock: Number(data.current_stock) <= Number(data.minimum_stock),
    supplier: data.supplier,
  };
}
