"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ROSSANA_STORE_ID } from "@/lib/queries/site";

interface ActionResult {
  ok: boolean;
  error?: string;
}

export interface BusinessSettingsInput {
  businessName: string;
  whatsappNumber: string;
  yapeHolderName: string;
  yapeNumber: string;
  yapeQrUrl: string | null;
  yapeInstructions: string;
  taxRate: number;
  stockReservationMinutes: number;
}

/** Configuración del negocio (Sección 63-65). Un solo guardado para
 * negocio + Yape + WhatsApp — nada de esto se hardcodea en el código.
 * Cambiar la configuración de Yape queda auditado (Sección 84). */
export async function updateBusinessSettingsAction(input: BusinessSettingsInput): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: before } = await supabase
    .from("site_settings")
    .select("yape_holder_name, yape_number, yape_qr_url")
    .eq("store_id", ROSSANA_STORE_ID)
    .maybeSingle();

  const { error } = await supabase
    .from("site_settings")
    .update({
      business_name: input.businessName || null,
      whatsapp_number: input.whatsappNumber || null,
      yape_holder_name: input.yapeHolderName || null,
      yape_number: input.yapeNumber || null,
      yape_qr_url: input.yapeQrUrl,
      yape_instructions: input.yapeInstructions || null,
      tax_rate: input.taxRate,
      stock_reservation_minutes: input.stockReservationMinutes,
    })
    .eq("store_id", ROSSANA_STORE_ID);

  if (error) {
    console.error("updateBusinessSettingsAction error:", error);
    return { ok: false, error: "No pudimos guardar los cambios. Inténtalo nuevamente." };
  }

  const yapeChanged =
    before &&
    (before.yape_holder_name !== (input.yapeHolderName || null) ||
      before.yape_number !== (input.yapeNumber || null) ||
      before.yape_qr_url !== input.yapeQrUrl);

  if (yapeChanged) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("audit_logs").insert({
      store_id: ROSSANA_STORE_ID,
      actor_id: user?.id ?? null,
      action: "update_yape_config",
      entity_type: "site_settings",
      old_value: before,
      new_value: {
        yape_holder_name: input.yapeHolderName || null,
        yape_number: input.yapeNumber || null,
        yape_qr_url: input.yapeQrUrl,
      },
    });
  }

  revalidatePath("/admin/configuracion");
  revalidatePath("/", "layout");
  return { ok: true };
}

export interface PoliciesInput {
  envios: string;
  cambiosDevoluciones: string;
  privacidad: string;
  terminos: string;
}

/** Políticas (Sección 63/67): el texto que se muestra en /politicas/[slug]. */
export async function updatePoliciesAction(input: PoliciesInput): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      policies: {
        envios: input.envios || "",
        "cambios-devoluciones": input.cambiosDevoluciones || "",
        privacidad: input.privacidad || "",
        terminos: input.terminos || "",
      },
    })
    .eq("store_id", ROSSANA_STORE_ID);

  if (error) return { ok: false, error: "No pudimos guardar las políticas." };

  revalidatePath("/admin/configuracion");
  revalidatePath("/politicas/[slug]", "page");
  return { ok: true };
}

export interface SocialLinksInput {
  instagram: string;
  facebook: string;
}

export async function updateSocialLinksAction(input: SocialLinksInput): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      social_links: {
        ...(input.instagram ? { instagram: input.instagram } : {}),
        ...(input.facebook ? { facebook: input.facebook } : {}),
      },
    })
    .eq("store_id", ROSSANA_STORE_ID);

  if (error) return { ok: false, error: "No pudimos guardar las redes sociales." };

  revalidatePath("/admin/configuracion");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updatePromoBarAction(messages: string[]): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({ promo_bar_messages: messages.filter((m) => m.trim()) })
    .eq("store_id", ROSSANA_STORE_ID);

  if (error) return { ok: false, error: "No pudimos guardar los mensajes." };

  revalidatePath("/admin/configuracion");
  revalidatePath("/", "layout");
  return { ok: true };
}
