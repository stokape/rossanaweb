"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ROSSANA_STORE_ID } from "@/lib/queries/site";
import { slugify } from "@/lib/utils";

interface ActionResult {
  ok: boolean;
  error?: string;
}

async function uniqueCategorySlug(name: string, existingId?: string) {
  const supabase = await createClient();
  const base = slugify(name) || "categoria";
  let candidate = base;
  let suffix = 1;

  while (true) {
    let query = supabase
      .from("categories")
      .select("id")
      .eq("store_id", ROSSANA_STORE_ID)
      .eq("slug", candidate);
    if (existingId) query = query.neq("id", existingId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

/** Categorías (Sección 15/63): configurables, nunca hardcodeadas. */
export async function createCategoryAction(name: string): Promise<ActionResult> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Ponle un nombre a la categoría." };

  const slug = await uniqueCategorySlug(trimmed);
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .insert({ store_id: ROSSANA_STORE_ID, name: trimmed, slug });

  if (error) return { ok: false, error: "No pudimos crear la categoría." };

  revalidatePath("/admin/configuracion");
  revalidatePath("/");
  return { ok: true };
}

export async function toggleCategoryActiveAction(id: string, active: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ active })
    .eq("id", id)
    .eq("store_id", ROSSANA_STORE_ID);

  if (error) return { ok: false, error: "No pudimos actualizar la categoría." };

  revalidatePath("/admin/configuracion");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id).eq("store_id", ROSSANA_STORE_ID);

  if (error) {
    return { ok: false, error: "No pudimos eliminar esta categoría. Inténtalo nuevamente." };
  }

  revalidatePath("/admin/configuracion");
  revalidatePath("/");
  return { ok: true };
}
