"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ROSSANA_STORE_ID } from "@/lib/queries/site";
import { slugify } from "@/lib/utils";

interface ActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

async function uniqueSlug(base: string, existingId?: string) {
  const supabase = await createClient();
  const baseSlug = slugify(base) || "producto";
  let candidate = baseSlug;
  let suffix = 1;

  while (true) {
    let query = supabase
      .from("products")
      .select("id")
      .eq("store_id", ROSSANA_STORE_ID)
      .eq("slug", candidate);
    if (existingId) query = query.neq("id", existingId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }
}

async function uniqueSku(base: string, existingId?: string) {
  const supabase = await createClient();
  const cleaned = base.trim().toUpperCase() || "PROD";
  let candidate = cleaned;
  let suffix = 1;

  while (true) {
    let query = supabase
      .from("products")
      .select("id")
      .eq("store_id", ROSSANA_STORE_ID)
      .eq("sku", candidate);
    if (existingId) query = query.neq("id", existingId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    suffix += 1;
    candidate = `${cleaned}-${suffix}`;
  }
}

/** Crea el producto "cascarón" apenas se ingresa el nombre — el resto
 * del wizard (fotos, componentes, precio) edita este mismo registro
 * (Sección 43-44). */
export async function createProductDraftAction(name: string, categoryId?: string): Promise<ActionResult> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Ponle un nombre a tu producto." };

  const [slug, sku] = await Promise.all([
    uniqueSlug(trimmed),
    uniqueSku(trimmed.slice(0, 3)),
  ]);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      store_id: ROSSANA_STORE_ID,
      name: trimmed,
      slug,
      sku,
      category_id: categoryId || null,
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("createProductDraftAction error:", error);
    return { ok: false, error: "No pudimos crear el producto. Inténtalo nuevamente." };
  }

  revalidatePath("/admin/productos");
  return { ok: true, id: data.id };
}

const updateSchema = z.object({
  name: z.string().trim().min(1),
  categoryId: z.string().uuid().nullable().optional(),
  shortDescription: z.string().trim().optional(),
  description: z.string().trim().optional(),
  material: z.string().trim().optional(),
  color: z.string().trim().optional(),
  dimensions: z.string().trim().optional(),
  weightGrams: z.number().nullable().optional(),
  sku: z.string().trim().min(1),
  laborCost: z.number().min(0),
  packagingCost: z.number().min(0),
  otherDirectCost: z.number().min(0),
  markupPercentage: z.number().min(0),
  includeTax: z.boolean(),
  taxRate: z.number().min(0).max(1),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).nullable().optional(),
});

export type UpdateProductInput = z.infer<typeof updateSchema>;

/** Guarda los datos + costo/precio de un producto (Sección 44/54-57).
 * El precio publicado SIEMPRE es la decisión manual de `price`, nunca
 * se recalcula solo. */
export async function updateProductAction(
  productId: string,
  input: UpdateProductInput,
): Promise<ActionResult> {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa los datos ingresados." };
  }
  const data = parsed.data;

  const [slug, sku] = await Promise.all([
    uniqueSlug(data.name, productId),
    uniqueSku(data.sku, productId),
  ]);

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      name: data.name,
      slug,
      sku,
      category_id: data.categoryId || null,
      short_description: data.shortDescription || null,
      description: data.description || null,
      material: data.material || null,
      color: data.color || null,
      dimensions: data.dimensions || null,
      weight_grams: data.weightGrams ?? null,
      labor_cost: data.laborCost,
      packaging_cost: data.packagingCost,
      other_direct_cost: data.otherDirectCost,
      markup_percentage: data.markupPercentage,
      include_tax: data.includeTax,
      tax_rate: data.taxRate,
      price: data.price,
      compare_at_price: data.compareAtPrice || null,
    })
    .eq("id", productId)
    .eq("store_id", ROSSANA_STORE_ID);

  if (error) {
    console.error("updateProductAction error:", error);
    return { ok: false, error: "No pudimos guardar los cambios. Inténtalo nuevamente." };
  }

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}/editar`);
  revalidatePath("/productos");
  return { ok: true };
}

/** Publicar / despublicar (Sección 43, paso 6). */
export async function setProductStatusAction(
  productId: string,
  status: "draft" | "published" | "archived",
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ status })
    .eq("id", productId)
    .eq("store_id", ROSSANA_STORE_ID);

  if (error) return { ok: false, error: "No pudimos actualizar el estado del producto." };

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}/editar`);
  revalidatePath("/productos");
  return { ok: true };
}

/** Componentes del producto = receta/BOM interno (Sección 51). */
export async function upsertProductComponentAction(
  productId: string,
  materialId: string,
  quantityRequired: number,
  unit: string,
): Promise<ActionResult> {
  if (quantityRequired <= 0) return { ok: false, error: "La cantidad debe ser mayor a cero." };

  const supabase = await createClient();
  const { error } = await supabase.from("product_components").upsert(
    {
      product_id: productId,
      material_id: materialId,
      quantity_required: quantityRequired,
      unit: unit as never,
    },
    { onConflict: "product_id,material_id" },
  );

  if (error) {
    console.error("upsertProductComponentAction error:", error);
    return { ok: false, error: "No pudimos guardar este componente." };
  }

  revalidatePath(`/admin/productos/${productId}/editar`);
  return { ok: true };
}

export async function deleteProductComponentAction(
  componentId: string,
  productId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("product_components").delete().eq("id", componentId);

  if (error) return { ok: false, error: "No pudimos quitar este componente." };

  revalidatePath(`/admin/productos/${productId}/editar`);
  return { ok: true };
}

/** Registrar la fila de la foto tras subirla a Storage (Sección 45). */
export async function addProductImageAction(
  productId: string,
  url: string,
  imageType: "gallery" | "360",
  displayOrder: number,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("product_images").insert({
    product_id: productId,
    url,
    image_type: imageType,
    display_order: displayOrder,
    is_primary: displayOrder === 0 && imageType === "gallery",
  });

  if (error) return { ok: false, error: "No pudimos guardar la foto." };

  revalidatePath(`/admin/productos/${productId}/editar`);
  return { ok: true };
}

export async function deleteProductImageAction(imageId: string, productId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("product_images").delete().eq("id", imageId);

  if (error) return { ok: false, error: "No pudimos eliminar la foto." };

  revalidatePath(`/admin/productos/${productId}/editar`);
  return { ok: true };
}

export async function setPrimaryImageAction(imageId: string, productId: string): Promise<ActionResult> {
  const supabase = await createClient();

  await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId)
    .eq("image_type", "gallery");

  const { error } = await supabase.from("product_images").update({ is_primary: true }).eq("id", imageId);

  if (error) return { ok: false, error: "No pudimos actualizar la foto principal." };

  revalidatePath(`/admin/productos/${productId}/editar`);
  return { ok: true };
}
