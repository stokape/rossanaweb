"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createMaterialAction } from "@/lib/actions/admin/materials";
import type { MaterialUnit } from "@/types/database";

const UNIT_OPTIONS: { value: MaterialUnit; label: string }[] = [
  { value: "unidad", label: "Unidad" },
  { value: "gramo", label: "Gramo" },
  { value: "kilogramo", label: "Kilogramo" },
  { value: "centimetro", label: "Centímetro" },
  { value: "metro", label: "Metro" },
  { value: "paquete", label: "Paquete" },
];

export function AddMaterialModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState<MaterialUnit>("unidad");
  const [minimumStock, setMinimumStock] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError(null);
    if (!name.trim()) {
      setError("Ponle un nombre a este material.");
      return;
    }

    setSaving(true);
    const result = await createMaterialAction({
      name: name.trim(),
      unit,
      minimumStock: minimumStock ? Number(minimumStock) : 0,
    });
    setSaving(false);

    if (!result.ok) {
      setError(result.error ?? "No pudimos guardar el material.");
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm rounded-modal bg-rossana-white p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-rossana-charcoal">Nuevo material</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-rossana-charcoal/50">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} placeholder="Piedra roja" />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-rossana-charcoal">Unidad</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as MaterialUnit)}
              className="h-12 w-full rounded-input border border-rossana-border bg-rossana-white text-rossana-charcoal px-4 text-base"
            >
              {UNIT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Avisarme cuando queden... (opcional)"
            type="number"
            min={0}
            value={minimumStock}
            onChange={(e) => setMinimumStock(e.target.value)}
            placeholder="20"
          />

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button variant="primary" onClick={handleSave} loading={saving} className="w-full">
            GUARDAR MATERIAL
          </Button>
        </div>
      </div>
    </div>
  );
}
