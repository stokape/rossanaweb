import { createClient } from "@/lib/supabase/server";
import { ROSSANA_STORE_ID } from "@/lib/queries/site";

/** Costo de envío (Sección 27/28) según la zona más específica que
 * coincida (distrito > provincia > departamento). Si no hay ninguna
 * zona configurada todavía, devuelve null — el checkout debe mostrar
 * "a coordinar" en vez de inventar un monto. */
export async function getShippingCost(
  department: string,
  province?: string,
  district?: string,
): Promise<number | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("shipping_zones")
    .select("department, province, district, cost")
    .eq("store_id", ROSSANA_STORE_ID)
    .eq("active", true)
    .eq("department", department);

  if (!data || data.length === 0) return null;

  const exact = data.find((z) => z.province === province && z.district === district);
  if (exact) return Number(exact.cost);

  const byProvince = data.find((z) => z.province === province && !z.district);
  if (byProvince) return Number(byProvince.cost);

  const byDepartment = data.find((z) => !z.province && !z.district);
  if (byDepartment) return Number(byDepartment.cost);

  return null;
}
