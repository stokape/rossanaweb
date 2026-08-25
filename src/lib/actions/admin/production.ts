"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ROSSANA_STORE_ID } from "@/lib/queries/site";
import { getProductComponents, type ProductComponentRequirement } from "@/lib/queries/admin/production";

/** Wrapper invocable desde un Client Component (la consulta en sí usa
 * el cliente de servidor, que depende de cookies()). */
export async function fetchProductComponentsAction(
  productId: string,
): Promise<ProductComponentRequirement[]> {
  return getProductComponents(productId);
}

interface ActionResult {
  ok: boolean;
  error?: string;
}

/** "Hacer productos" (Sección 52-53). Toda la validación y el
 * movimiento de stock ocurre atómicamente en `register_production_run`
 * — si falta algún material, la función entera revierte y devuelve un
 * mensaje en lenguaje natural ("Te faltan X piedras..."). */
export async function registerProductionAction(
  productId: string,
  quantity: number,
): Promise<ActionResult> {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { ok: false, error: "La cantidad debe ser mayor a cero." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tu sesión expiró. Vuelve a ingresar." };

  const { error } = await supabase.rpc("register_production_run", {
    p_store_id: ROSSANA_STORE_ID,
    p_product_id: productId,
    p_quantity: quantity,
    p_user_id: user.id,
  });

  if (error) {
    // register_production_run ya devuelve mensajes en lenguaje natural
    // ("Te faltan 8 piedras...") — se muestran tal cual (Sección 77).
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/fabricar");
  revalidatePath("/admin/materiales");
  revalidatePath("/admin/productos");
  return { ok: true };
}
