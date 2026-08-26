"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PricingCalculator } from "@/components/admin/products/PricingCalculator";
import { ComponentsEditor } from "@/components/admin/products/ComponentsEditor";
import { PhotoUploader } from "@/components/admin/products/PhotoUploader";
import { StockEditor } from "@/components/admin/products/StockEditor";
import {
  deleteProductAction,
  setProductStatusAction,
  updateProductAction,
  type UpdateProductInput,
} from "@/lib/actions/admin/products";
import type { AdminProductDetail } from "@/lib/queries/admin/product-detail";
import type { CategorySummary } from "@/lib/queries/catalog";
import type { MaterialSummary } from "@/lib/queries/admin/materials";

interface ProductEditFormProps {
  product: AdminProductDetail;
  categories: CategorySummary[];
  materials: MaterialSummary[];
  maxProducible: number | null;
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
};

export function ProductEditForm({ product, categories, materials, maxProducible }: ProductEditFormProps) {
  const router = useRouter();
  const [fields, setFields] = useState({
    name: product.name,
    categoryId: product.categoryId ?? "",
    sku: product.sku,
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    material: product.material ?? "",
    color: product.color ?? "",
    dimensions: product.dimensions ?? "",
    weightGrams: product.weightGrams,
    laborCost: product.laborCost,
    packagingCost: product.packagingCost,
    otherDirectCost: product.otherDirectCost,
    markupPercentage: product.markupPercentage,
    includeTax: product.includeTax,
    taxRate: product.taxRate,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    seoTitle: product.seoTitle ?? "",
    seoDescription: product.seoDescription ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const materialsCost = product.components.reduce(
    (sum, c) => sum + c.quantityRequired * c.averageUnitCost,
    0,
  );

  function updatePricing(field: string, value: number | boolean | null) {
    setFields((f) => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    const input: UpdateProductInput = {
      name: fields.name,
      categoryId: fields.categoryId || null,
      sku: fields.sku,
      shortDescription: fields.shortDescription,
      description: fields.description,
      material: fields.material,
      color: fields.color,
      dimensions: fields.dimensions,
      weightGrams: fields.weightGrams,
      laborCost: fields.laborCost,
      packagingCost: fields.packagingCost,
      otherDirectCost: fields.otherDirectCost,
      markupPercentage: fields.markupPercentage,
      includeTax: fields.includeTax,
      taxRate: fields.taxRate,
      price: fields.price,
      compareAtPrice: fields.compareAtPrice,
      seoTitle: fields.seoTitle,
      seoDescription: fields.seoDescription,
    };

    const result = await updateProductAction(product.id, input);
    setSaving(false);

    if (!result.ok) {
      setError(result.error ?? "No pudimos guardar los cambios.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  async function handleTogglePublish() {
    const nextStatus = product.status === "published" ? "draft" : "published";
    await setProductStatusAction(product.id, nextStatus);
    router.refresh();
  }

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    const result = await deleteProductAction(product.id, product.name);
    setDeleting(false);

    if (!result.ok) {
      setError(result.error ?? "No pudimos eliminar el producto.");
      setConfirmingDelete(false);
      return;
    }
    router.push("/admin/productos");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-semibold text-rossana-charcoal md:text-3xl">
              {product.name}
            </h1>
            <Badge tone={product.status === "published" ? "success" : "neutral"}>
              {STATUS_LABEL[product.status]}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-rossana-charcoal/40">Código: {product.sku}</p>
        </div>
        <Button variant={product.status === "published" ? "secondary" : "primary"} onClick={handleTogglePublish}>
          {product.status === "published" ? "PASAR A BORRADOR" : "PUBLICAR"}
        </Button>
      </div>

      <Card className="flex flex-col gap-4 p-5">
        <h2 className="text-sm font-semibold text-rossana-charcoal">Producto</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Nombre"
            value={fields.name}
            onChange={(e) => setFields((f) => ({ ...f, name: e.target.value }))}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rossana-charcoal">Categoría</label>
            <select
              value={fields.categoryId}
              onChange={(e) => setFields((f) => ({ ...f, categoryId: e.target.value }))}
              className="h-12 w-full rounded-input border border-rossana-border bg-rossana-white text-rossana-charcoal px-4 text-base"
            >
              <option value="">Sin categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Descripción corta"
          value={fields.shortDescription}
          onChange={(e) => setFields((f) => ({ ...f, shortDescription: e.target.value }))}
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-rossana-charcoal">Descripción</label>
          <textarea
            value={fields.description}
            onChange={(e) => setFields((f) => ({ ...f, description: e.target.value }))}
            rows={4}
            className="w-full rounded-input border border-rossana-border bg-rossana-white text-rossana-charcoal p-4 text-base"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Input
            label="Material"
            value={fields.material}
            onChange={(e) => setFields((f) => ({ ...f, material: e.target.value }))}
          />
          <Input
            label="Color"
            value={fields.color}
            onChange={(e) => setFields((f) => ({ ...f, color: e.target.value }))}
          />
          <Input
            label="Medidas"
            value={fields.dimensions}
            onChange={(e) => setFields((f) => ({ ...f, dimensions: e.target.value }))}
          />
          <Input
            label="Peso (g)"
            type="number"
            value={fields.weightGrams ?? ""}
            onChange={(e) =>
              setFields((f) => ({ ...f, weightGrams: e.target.value ? Number(e.target.value) : null }))
            }
          />
        </div>
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <h2 className="text-sm font-semibold text-rossana-charcoal">Cómo aparece en buscadores</h2>
        <p className="-mt-2 text-xs text-rossana-charcoal/50">
          Si lo dejas vacío, usamos el nombre y la descripción corta automáticamente.
        </p>
        <Input
          label="Título para buscadores (opcional)"
          value={fields.seoTitle}
          onChange={(e) => setFields((f) => ({ ...f, seoTitle: e.target.value }))}
          placeholder={fields.name}
        />
        <Input
          label="Descripción para buscadores (opcional)"
          value={fields.seoDescription}
          onChange={(e) => setFields((f) => ({ ...f, seoDescription: e.target.value }))}
          placeholder={fields.shortDescription}
        />
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <h2 className="text-sm font-semibold text-rossana-charcoal">Fotos</h2>
        <PhotoUploader productId={product.id} images={product.images} imageType="gallery" label="Galería" />
        <PhotoUploader
          productId={product.id}
          images={product.images}
          imageType="360"
          label="Secuencia 360° (opcional)"
          hint="Sube 8 o más fotos en orden, girando el producto, para activar la vista 360°."
        />
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <h2 className="text-sm font-semibold text-rossana-charcoal">Stock</h2>
        <p className="-mt-2 text-xs text-rossana-charcoal/50">
          Usa esto si vendes piezas que ya tienes hechas. Si en vez de eso quieres que el
          sistema descuente materiales automáticamente, define los &ldquo;Componentes del
          producto&rdquo; y registra la fabricación desde &ldquo;Hacer productos&rdquo;.
        </p>
        <StockEditor
          productId={product.id}
          stockOnHand={product.stockOnHand}
          stockReserved={product.stockReserved}
          stockAvailable={product.stockAvailable}
        />
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <h2 className="text-sm font-semibold text-rossana-charcoal">Componentes del producto</h2>
        <ComponentsEditor productId={product.id} components={product.components} materials={materials} />
        {maxProducible != null && (
          <p className="rounded-card bg-rossana-ivory px-4 py-3 text-sm text-rossana-charcoal">
            Con tus materiales actuales puedes hacer aproximadamente{" "}
            <strong>{maxProducible}</strong> {product.name}.
          </p>
        )}
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <h2 className="text-sm font-semibold text-rossana-charcoal">Costo y precio</h2>
        <PricingCalculator
          materialsCost={materialsCost}
          laborCost={fields.laborCost}
          packagingCost={fields.packagingCost}
          otherDirectCost={fields.otherDirectCost}
          markupPercentage={fields.markupPercentage}
          includeTax={fields.includeTax}
          taxRate={fields.taxRate}
          price={fields.price}
          compareAtPrice={fields.compareAtPrice}
          onChange={updatePricing}
        />
      </Card>

      {error && <p className="text-sm text-danger">{error}</p>}
      {saved && <p className="text-sm text-success">Cambios guardados.</p>}

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={handleSave} loading={saving} className="w-full sm:w-auto">
          GUARDAR CAMBIOS
        </Button>

        {confirmingDelete ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-rossana-charcoal">¿Eliminar este producto?</span>
            <Button variant="secondary" size="sm" onClick={() => setConfirmingDelete(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" loading={deleting} onClick={handleDelete}>
              Sí, eliminar
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="text-sm font-medium text-danger hover:underline"
          >
            Eliminar producto
          </button>
        )}
      </div>
    </div>
  );
}
