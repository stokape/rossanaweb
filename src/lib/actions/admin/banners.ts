"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ROSSANA_STORE_ID } from "@/lib/queries/site";

interface ActionResult {
  ok: boolean;
  error?: string;
}

/** Registrar la foto del inicio tras subirla a Storage (mismo patrón
 * que las fotos de producto, Sección 45). */
export async function createBannerAction(
  imageUrl: string,
  placement: "hero" | "promo" | "brand" = "hero",
): Promise<ActionResult> {
  const supabase = await createClient();

  const { count } = await supabase
    .from("banners")
    .select("id", { count: "exact", head: true })
    .eq("store_id", ROSSANA_STORE_ID)
    .eq("placement", placement);

  const { error } = await supabase.from("banners").insert({
    store_id: ROSSANA_STORE_ID,
    image_url: imageUrl,
    placement,
    display_order: count ?? 0,
    active: true,
  });

  if (error) return { ok: false, error: "No pudimos guardar la imagen." };

  revalidatePath("/admin/configuracion");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteBannerAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("banners").delete().eq("id", id).eq("store_id", ROSSANA_STORE_ID);

  if (error) return { ok: false, error: "No pudimos eliminar la imagen." };

  revalidatePath("/admin/configuracion");
  revalidatePath("/");
  return { ok: true };
}

export async function toggleBannerActiveAction(id: string, active: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("banners")
    .update({ active })
    .eq("id", id)
    .eq("store_id", ROSSANA_STORE_ID);

  if (error) return { ok: false, error: "No pudimos actualizar la imagen." };

  revalidatePath("/admin/configuracion");
  revalidatePath("/");
  return { ok: true };
}

/** Sube o baja una imagen en el orden intercambiando su posición con
 * la vecina — mantiene la lógica de reordenar extremadamente simple. */
export async function moveBannerAction(
  id: string,
  direction: "up" | "down",
  placement: "hero" | "promo" | "brand" = "hero",
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: banners, error } = await supabase
    .from("banners")
    .select("id, display_order")
    .eq("store_id", ROSSANA_STORE_ID)
    .eq("placement", placement)
    .order("display_order", { ascending: true });

  if (error || !banners) return { ok: false, error: "No pudimos reordenar." };

  const index = banners.findIndex((b) => b.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapIndex < 0 || swapIndex >= banners.length) return { ok: true };

  const current = banners[index];
  const swap = banners[swapIndex];

  await supabase.from("banners").update({ display_order: swap.display_order }).eq("id", current.id);
  await supabase.from("banners").update({ display_order: current.display_order }).eq("id", swap.id);

  revalidatePath("/admin/configuracion");
  revalidatePath("/");
  return { ok: true };
}
