"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

interface ActionResult {
  ok: boolean;
  error?: string;
}

/** "CONFIRMAR PAGO" — un solo clic (Sección 35/41/87). Toda la lógica
 * transaccional vive en la función de BD `confirm_payment`. */
export async function confirmPaymentAction(paymentId: string, orderId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Tu sesión expiró. Vuelve a ingresar." };

  const { error } = await supabase.rpc("confirm_payment", {
    p_payment_id: paymentId,
    p_confirmed_by: user.id,
  });

  if (error) {
    console.error("confirmPaymentAction error:", error);
    return { ok: false, error: "No pudimos confirmar el pago. Inténtalo nuevamente." };
  }

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/admin");
  return { ok: true };
}

/** "NO PUDE VALIDARLO" (Sección 41). */
export async function rejectPaymentAction(
  paymentId: string,
  orderId: string,
  reason?: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Tu sesión expiró. Vuelve a ingresar." };

  const { error } = await supabase.rpc("reject_payment", {
    p_payment_id: paymentId,
    p_rejected_by: user.id,
    p_reason: reason ?? null,
  });

  if (error) {
    console.error("rejectPaymentAction error:", error);
    return { ok: false, error: "No pudimos registrar esto. Inténtalo nuevamente." };
  }

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
  return { ok: true };
}
