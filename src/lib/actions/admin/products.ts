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
  seoTitle: z.string().trim().optional(),
  seoDescription: z.string().trim().optional(),
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

  // Precio anterior, para auditoría si cambia (Sección 84).
  const { data: before } = await supabase
    .from("products")
    .select("price")
    .eq("id", productId)
    .maybeSingle();

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
      seo_title: data.seoTitle || null,
      seo_description: data.seoDescription || null,
    })
    .eq("id", productId)
    .eq("store_id", ROSSANA_STORE_ID);

  if (error) {
    console.error("updateProductAction error:", error);
    return { ok: false, error: "No pudimos guardar los cambios. Inténtalo nuevamente." };
  }

  if (before && Number(before.price) !== data.price) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("audit_logs").insert({
      store_id: ROSSANA_STORE_ID,
      actor_id: user?.id ?? null,
      action: "update_price",
      entity_type: "product",
      entity_id: productId,
      old_value: { price: Number(before.price) },
      new_value: { price: data.price },
    });
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

/** Eliminar producto (Sección 84 — acción sensible, queda auditada).
 * Si el producto ya tiene pedidos asociados, la base de datos rechaza
 * el borrado (integridad referencial) y se sugiere archivarlo en su
 * lugar — nunca se pierde el historial de una venta real. */
export async function deleteProductAction(productId: string, productName: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("store_id", ROSSANA_STORE_ID);

  if (error) {
    if (error.code === "23503") {
      return {
        ok: false,
        error: "Este producto ya tiene pedidos asociados — no se puede eliminar. Puedes archivarlo en su lugar.",
      };
    }
    console.error("deleteProductAction error:", error);
    return { ok: false, error: "No pudimos eliminar el producto. Inténtalo nuevamente." };
  }

  await supabase.from("audit_logs").insert({
    store_id: ROSSANA_STORE_ID,
    actor_id: user?.id ?? null,
    action: "delete_product",
    entity_type: "product",
    entity_id: productId,
    old_value: { name: productName },
  });

  revalidatePath("/admin/productos");
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

/**
 * Ajuste manual de stock (Sección 61/84): para productos sin
 * componentes definidos (o para corregir un conteo físico) — sin
 * esto, un producto cargado directamente se queda en 0 unidades para
 * siempre, porque solo "Hacer productos" sumaba stock. Queda
 * registrado como movimiento `adjustment` + en `audit_logs`.
 */
export async function updateStockAction(productId: string, newStockOnHand: number): Promise<ActionResult> {
  if (!Number.isInteger(newStockOnHand) || newStockOnHand < 0) {
    return { ok: false, error: "La cantidad debe ser un número entero de 0 a más." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tu sesión expiró. Vuelve a ingresar." };

  const { data: current, error: fetchError } = await supabase
    .from("products")
    .select("stock_on_hand, stock_reserved, name")
    .eq("id", productId)
    .eq("store_id", ROSSANA_STORE_ID)
    .maybeSingle();

  if (fetchError || !current) return { ok: false, error: "No encontramos este producto." };

  if (newStockOnHand < current.stock_reserved) {
    return {
      ok: false,
      error: `No puedes bajar de ${current.stock_reserved}: hay pedidos que ya reservaron esa cantidad.`,
    };
  }

  const delta = newStockOnHand - current.stock_on_hand;
  if (delta === 0) return { ok: true };

  const { error: updateError } = await supabase
    .from("products")
    .update({ stock_on_hand: newStockOnHand })
    .eq("id", productId)
    .eq("store_id", ROSSANA_STORE_ID);

  if (updateError) {
    console.error("updateStockAction error:", updateError);
    return { ok: false, error: "No pudimos actualizar el stock. Inténtalo nuevamente." };
  }

  await supabase.from("inventory_movements").insert({
    store_id: ROSSANA_STORE_ID,
    movement_type: "adjustment",
    product_id: productId,
    quantity: delta,
    reference_type: "manual_adjustment",
    created_by: user.id,
  });

  await supabase.from("audit_logs").insert({
    store_id: ROSSANA_STORE_ID,
    actor_id: user.id,
    action: "adjust_stock",
    entity_type: "product",
    entity_id: productId,
    old_value: { stock_on_hand: current.stock_on_hand },
    new_value: { stock_on_hand: newStockOnHand },
  });

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}/editar`);
  revalidatePath("/productos");
  return { ok: true };
}
