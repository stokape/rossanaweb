import { createClient } from "@/lib/supabase/server";

export const ROSSANA_STORE_ID = "00000000-0000-0000-0000-000000000001";

export interface SiteSettings {
  businessName: string | null;
  whatsappNumber: string | null;
  yapeHolderName: string | null;
  yapeNumber: string | null;
  yapeQrUrl: string | null;
  yapeInstructions: string | null;
  plinHolderName: string | null;
  plinNumber: string | null;
  plinQrUrl: string | null;
  plinInstructions: string | null;
  taxRate: number;
  promoBarMessages: string[];
  socialLinks: Record<string, string>;
  policies: Record<string, string>;
}

const EMPTY_SETTINGS: SiteSettings = {
  businessName: null,
  whatsappNumber: null,
  yapeHolderName: null,
  yapeNumber: null,
  yapeQrUrl: null,
  yapeInstructions: null,
  plinHolderName: null,
  plinNumber: null,
  plinQrUrl: null,
  plinInstructions: null,
  taxRate: 0.18,
  promoBarMessages: [],
  socialLinks: {},
  policies: {},
};

/** Configuración pública del negocio (Sección 63/65/66). Nunca lanza:
 * si algo falla, la tienda debe seguir mostrándose con valores vacíos. */
export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("store_id", ROSSANA_STORE_ID)
    .maybeSingle();

  if (error || !data) return EMPTY_SETTINGS;

  return {
    businessName: data.business_name,
    whatsappNumber: data.whatsapp_number,
    yapeHolderName: data.yape_holder_name,
    yapeNumber: data.yape_number,
    yapeQrUrl: data.yape_qr_url,
    yapeInstructions: data.yape_instructions,
    plinHolderName: data.plin_holder_name,
    plinNumber: data.plin_number,
    plinQrUrl: data.plin_qr_url,
    plinInstructions: data.plin_instructions,
    taxRate: Number(data.tax_rate ?? 0.18),
    promoBarMessages: Array.isArray(data.promo_bar_messages)
      ? (data.promo_bar_messages as string[])
      : [],
    socialLinks: (data.social_links as Record<string, string>) ?? {},
    policies: (data.policies as Record<string, string>) ?? {},
  };
}
