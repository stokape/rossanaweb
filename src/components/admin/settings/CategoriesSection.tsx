"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  createCategoryAction,
  deleteCategoryAction,
  toggleCategoryActiveAction,
} from "@/lib/actions/admin/categories";
import type { AdminCategory } from "@/lib/queries/admin/categories";

export function CategoriesSection({ categories }: { categories: AdminCategory[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    setError(null);
    setSaving(true);
    const result = await createCategoryAction(name);
    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? "No pudimos crear la categoría.");
      return;
    }
    setName("");
    router.refresh();
  }

  async function handleToggle(id: string, active: boolean) {
    await toggleCategoryActiveAction(id, !active);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await deleteCategoryAction(id);
    router.refresh();
  }

  return (
    <Card className="flex flex-col gap-4 p-6">
      <h2 className="text-lg font-semibold text-rossana-charcoal">Categorías</h2>

      {categories.length > 0 && (
        <ul className="flex flex-col gap-2">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-card border border-rossana-border px-4 py-2.5 text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-rossana-charcoal">{c.name}</span>
                <Badge tone={c.active ? "success" : "neutral"}>
                  {c.active ? "Visible" : "Oculta"}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleToggle(c.id, c.active)}
                  className="text-xs font-medium text-rossana-red hover:underline"
                >
                  {c.active ? "Ocultar" : "Mostrar"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  aria-label={`Eliminar ${c.name}`}
                  className="text-rossana-charcoal/40 hover:text-danger"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Input label="Nueva categoría" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <Button variant="secondary" onClick={handleAdd} loading={saving}>
          + AGREGAR
        </Button>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </Card>
  );
}
