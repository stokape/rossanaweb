"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ROSSANA_STORE_ID } from "@/lib/queries/site";

interface ActionResult {
  ok: boolean;
  error?: string;
}

const zoneSchema = z.object({
  department: z.string().trim().min(1, "Ingresa el departamento"),
  province: z.string().trim().optional(),
  district: z.string().trim().optional(),
  cost: z.number().min(0, "El costo no puede ser negativo"),
});

/** Zonas de envío (Sección 27/28): costo por departamento, o más
 * específico por provincia/distrito si se necesita. */
export async function createShippingZoneAction(input: z.infer<typeof zoneSchema>): Promise<ActionResult> {
  const parsed = zoneSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa los datos ingresados." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("shipping_zones").insert({
    store_id: ROSSANA_STORE_ID,
    department: parsed.data.department,
    province: parsed.data.province || null,
    district: parsed.data.district || null,
    cost: parsed.data.cost,
  });

  if (error) return { ok: false, error: "No pudimos guardar esta zona de envío." };

  revalidatePath("/admin/configuracion");
  return { ok: true };
}

export async function deleteShippingZoneAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("shipping_zones")
    .delete()
    .eq("id", id)
    .eq("store_id", ROSSANA_STORE_ID);

  if (error) return { ok: false, error: "No pudimos eliminar esta zona." };

  revalidatePath("/admin/configuracion");
  return { ok: true };
}
