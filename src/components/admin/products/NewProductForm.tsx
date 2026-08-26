"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createProductDraftAction } from "@/lib/actions/admin/products";
import type { CategorySummary } from "@/lib/queries/catalog";

export function NewProductForm({ categories }: { categories: CategorySummary[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleContinue() {
    setError(null);
    if (!name.trim()) {
      setError("Ponle un nombre a tu producto.");
      return;
    }

    setSaving(true);
    const result = await createProductDraftAction(name, categoryId || undefined);
    setSaving(false);

    if (!result.ok || !result.id) {
      setError(result.error ?? "No pudimos crear el producto.");
      return;
    }
    router.push(`/admin/productos/${result.id}/editar`);
  }

  return (
    <Card className="flex max-w-md flex-col gap-4 p-6">
      <p className="text-sm text-rossana-charcoal/60">
        Empecemos por lo básico — el resto (fotos, componentes, precio) lo completas en el
        siguiente paso.
      </p>

      <Input label="Nombre del producto" value={name} onChange={(e) => setName(e.target.value)} />

      {categories.length > 0 && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-rossana-charcoal">
            Categoría (opcional)
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-12 w-full rounded-input border border-rossana-border bg-rossana-warm-white text-rossana-charcoal px-4 text-base"
          >
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button variant="primary" onClick={handleContinue} loading={saving} className="w-full">
        CONTINUAR
      </Button>
    </Card>
  );
}
