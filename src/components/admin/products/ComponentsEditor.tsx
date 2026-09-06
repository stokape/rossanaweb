"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  deleteProductComponentAction,
  upsertProductComponentAction,
} from "@/lib/actions/admin/products";
import type { AdminProductComponent } from "@/lib/queries/admin/product-detail";
import type { MaterialSummary } from "@/lib/queries/admin/materials";

interface ComponentsEditorProps {
  productId: string;
  components: AdminProductComponent[];
  materials: MaterialSummary[];
}

/** "Componentes del producto" = receta/BOM interno (Sección 51). */
export function ComponentsEditor({ productId, components, materials }: ComponentsEditorProps) {
  const router = useRouter();
  const [materialId, setMaterialId] = useState(materials[0]?.id ?? "");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    setError(null);
    const material = materials.find((m) => m.id === materialId);
    const qty = Number(quantity);
    if (!material || !qty || qty <= 0) {
      setError("Elige un material y una cantidad válida.");
      return;
    }

    setSaving(true);
    const result = await upsertProductComponentAction(productId, materialId, qty, material.unit);
    setSaving(false);

    if (!result.ok) {
      setError(result.error ?? "No pudimos guardar este componente.");
      return;
    }
    setQuantity("");
    router.refresh();
  }

  async function handleDelete(componentId: string) {
    await deleteProductComponentAction(componentId, productId);
    router.refresh();
  }

  if (materials.length === 0) {
    return (
      <p className="text-sm text-rossana-charcoal/50">
        Todavía no tienes materiales registrados. Agrégalos primero en &ldquo;Mis materiales&rdquo;.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {components.length > 0 && (
        <ul className="flex flex-col gap-2">
          {components.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-card border border-rossana-border px-4 py-2 text-sm"
            >
              <span>
                {c.quantityRequired} {c.unit} de {c.materialName}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(c.id)}
                aria-label={`Quitar ${c.materialName}`}
                className="text-rossana-charcoal/40 hover:text-danger"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium text-rossana-charcoal">Material</label>
          <select
            value={materialId}
            onChange={(e) => setMaterialId(e.target.value)}
            className="h-12 w-full rounded-input border border-rossana-border bg-rossana-warm-white text-rossana-charcoal px-4 text-base"
          >
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-28">
          <Input
            label="Cantidad"
            type="number"
            min={0}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        <Button variant="secondary" onClick={handleAdd} loading={saving}>
          + AGREGAR
        </Button>
      </div>

      {error && (
        <p className="text-sm text-danger transition-opacity duration-200 ease-[var(--ease-out)] starting:opacity-0 motion-reduce:transition-none">
          {error}
        </p>
      )}
    </div>
  );
}
