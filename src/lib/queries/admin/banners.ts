import { createClient } from "@/lib/supabase/server";
import { ROSSANA_STORE_ID } from "@/lib/queries/site";

export interface AdminBanner {
  id: string;
  imageUrl: string;
  title: string | null;
  active: boolean;
  displayOrder: number;
}

export async function getBannersForAdmin(placement: "hero" | "promo" | "brand" = "hero"): Promise<AdminBanner[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("banners")
    .select("id, image_url, title, active, display_order")
    .eq("store_id", ROSSANA_STORE_ID)
    .eq("placement", placement)
    .order("display_order", { ascending: true });

  if (error || !data) return [];
  return data
    .filter((b): b is typeof b & { image_url: string } => !!b.image_url)
    .map((b) => ({
      id: b.id,
      imageUrl: b.image_url,
      title: b.title,
      active: b.active,
      displayOrder: b.display_order,
    }));
}
