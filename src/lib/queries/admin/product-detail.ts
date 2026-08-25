import { createClient } from "@/lib/supabase/server";
import { ROSSANA_STORE_ID } from "@/lib/queries/site";

export interface AdminProductComponent {
  id: string;
  materialId: string;
  materialName: string;
  quantityRequired: number;
  unit: string;
  averageUnitCost: number;
}

export interface AdminProductImage {
  id: string;
  url: string;
  imageType: "gallery" | "360";
  displayOrder: number;
  isPrimary: boolean;
}

export interface AdminProductDetail {
  id: string;
  sku: string;
  name: string;
  slug: string;
  categoryId: string | null;
  shortDescription: string | null;
  description: string | null;
  material: string | null;
  color: string | null;
  dimensions: string | null;
  weightGrams: number | null;
  status: "draft" | "published" | "archived";
  stockOnHand: number;
  stockAvailable: number;
  laborCost: number;
  packagingCost: number;
  otherDirectCost: number;
  markupPercentage: number;
  includeTax: boolean;
  taxRate: number;
  price: number;
  compareAtPrice: number | null;
  components: AdminProductComponent[];
  images: AdminProductImage[];
}

export async function getAdminProductDetail(id: string): Promise<AdminProductDetail | null> {
  const supabase = await createClient();

  const [{ data: product, error }, { data: components }, { data: images }] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("store_id", ROSSANA_STORE_ID)
      .maybeSingle(),
    supabase
      .from("product_components")
      .select("id, material_id, quantity_required, unit, materials(name, average_unit_cost)")
      .eq("product_id", id),
    supabase
      .from("product_images")
      .select("id, url, image_type, display_order, is_primary")
      .eq("product_id", id)
      .order("display_order", { ascending: true }),
  ]);

  if (error || !product) return null;

  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    categoryId: product.category_id,
    shortDescription: product.short_description,
    description: product.description,
    material: product.material,
    color: product.color,
    dimensions: product.dimensions,
    weightGrams: product.weight_grams,
    status: product.status,
    stockOnHand: product.stock_on_hand,
    stockAvailable: product.stock_available,
    laborCost: Number(product.labor_cost),
    packagingCost: Number(product.packaging_cost),
    otherDirectCost: Number(product.other_direct_cost),
    markupPercentage: Number(product.markup_percentage),
    includeTax: product.include_tax,
    taxRate: Number(product.tax_rate),
    price: Number(product.price),
    compareAtPrice: product.compare_at_price != null ? Number(product.compare_at_price) : null,
    components: (components ?? [])
      .filter((c) => c.materials)
      .map((c) => ({
        id: c.id,
        materialId: c.material_id,
        materialName: c.materials!.name,
        quantityRequired: Number(c.quantity_required),
        unit: c.unit,
        averageUnitCost: Number(c.materials!.average_unit_cost),
      })),
    images: (images ?? []).map((img) => ({
      id: img.id,
      url: img.url,
      imageType: img.image_type as "gallery" | "360",
      displayOrder: img.display_order,
      isPrimary: img.is_primary,
    })),
  };
}
