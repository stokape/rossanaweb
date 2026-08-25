"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ROSSANA_STORE_ID } from "@/lib/queries/site";

interface ActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

const materialSchema = z.object({
  name: z.string().trim().min(1, "Ponle un nombre a este material"),
  unit: z.enum(["unidad", "gramo", "kilogramo", "centimetro", "metro", "paquete"]),
  minimumStock: z.number().min(0).default(0),
  category: z.string().trim().optional(),
  supplier: z.string().trim().optional(),
});

/** Alta de un material nuevo (Sección 46-47). */
export async function createMaterialAction(input: z.infer<typeof materialSchema>): Promise<ActionResult> {
  const parsed = materialSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa los datos ingresados." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("materials")
    .insert({
      store_id: ROSSANA_STORE_ID,
      name: parsed.data.name,
      unit: parsed.data.unit,
      minimum_stock: parsed.data.minimumStock,
      category: parsed.data.category || null,
      supplier: parsed.data.supplier || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("createMaterialAction error:", error);
    return { ok: false, error: "No pudimos guardar el material. Inténtalo nuevamente." };
  }

  revalidatePath("/admin/materiales");
  return { ok: true, id: data.id };
}

const purchaseSchema = z.object({
  materialId: z.string().uuid(),
  quantity: z.number().positive("La cantidad debe ser mayor a cero"),
  totalPaid: z.number().min(0, "Ingresa cuánto pagaste"),
  supplier: z.string().trim().optional(),
});

/** "Agregar compra" (Sección 48). El costo promedio ponderado lo
 * recalcula el trigger `apply_material_purchase` en la base de datos
 * — aquí solo se registra la compra. */
export async function registerMaterialPurchaseAction(
  input: z.infer<typeof purchaseSchema>,
): Promise<ActionResult> {
  const parsed = purchaseSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa los datos ingresados." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tu sesión expiró. Vuelve a ingresar." };

  const { error } = await supabase.from("material_purchases").insert({
    store_id: ROSSANA_STORE_ID,
    material_id: parsed.data.materialId,
    quantity: parsed.data.quantity,
    total_paid: parsed.data.totalPaid,
    supplier: parsed.data.supplier || null,
    created_by: user.id,
  });

  if (error) {
    console.error("registerMaterialPurchaseAction error:", error);
    return { ok: false, error: "No pudimos guardar la compra. Inténtalo nuevamente." };
  }

  revalidatePath("/admin/materiales");
  return { ok: true };
}
