import { createClient } from "@/lib/supabase/server";
import { ROSSANA_STORE_ID } from "@/lib/queries/site";

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  active: boolean;
}

export async function getAllCategoriesForAdmin(): Promise<AdminCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, active")
    .eq("store_id", ROSSANA_STORE_ID)
    .order("display_order", { ascending: true });

  if (error || !data) return [];
  return data;
}

export interface AdminShippingZone {
  id: string;
  department: string;
  province: string | null;
  district: string | null;
  cost: number;
}

export async function getShippingZonesForAdmin(): Promise<AdminShippingZone[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shipping_zones")
    .select("id, department, province, district, cost")
    .eq("store_id", ROSSANA_STORE_ID)
    .order("department", { ascending: true });

  if (error || !data) return [];
  return data.map((z) => ({ ...z, cost: Number(z.cost) }));
}
