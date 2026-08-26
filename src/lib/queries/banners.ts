import { createClient } from "@/lib/supabase/server";
import { ROSSANA_STORE_ID } from "@/lib/queries/site";

export interface HeroBanner {
  id: string;
  imageUrl: string;
  title: string | null;
  linkUrl: string | null;
}

/** Fotos reales del Hero (Sección 14: "La fotografía debe mostrar
 * productos REALES Rossana cuando estén disponibles"). Se omite por
 * completo si todavía no hay ninguna activa — nunca un producto
 * inventado de relleno. */
export async function getHeroBanners(): Promise<HeroBanner[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("banners")
    .select("id, image_url, title, link_url")
    .eq("store_id", ROSSANA_STORE_ID)
    .eq("placement", "hero")
    .eq("active", true)
    .not("image_url", "is", null)
    .order("display_order", { ascending: true });

  if (error || !data) return [];
  return data
    .filter((b): b is typeof b & { image_url: string } => !!b.image_url)
    .map((b) => ({ id: b.id, imageUrl: b.image_url, title: b.title, linkUrl: b.link_url }));
}
