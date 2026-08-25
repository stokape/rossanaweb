"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatSoles } from "@/lib/utils";
import { registerMaterialPurchaseAction } from "@/lib/actions/admin/materials";
import type { MaterialSummary } from "@/lib/queries/admin/materials";

interface AddPurchaseModalProps {
  material: MaterialSummary;
  onClose: () => void;
}

/** "Agregar compra" (Sección 48) — formulario extremadamente sencillo. */
export function AddPurchaseModal({ material, onClose }: AddPurchaseModalProps) {
  const [quantity, setQuantity] = useState("");
  const [totalPaid, setTotalPaid] = useState("");
  const [supplier, setSupplier] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const qtyNum = Number(quantity);
  const totalNum = Number(totalPaid);
  const unitCost = qtyNum > 0 && totalNum >= 0 ? totalNum / qtyNum : null;

  async function handleSave() {
    setError(null);
    if (!qtyNum || qtyNum <= 0) {
      setError("Ingresa cuánto compraste.");
      return;
    }
    if (totalPaid === "" || totalNum < 0) {
      setError("Ingresa cuánto pagaste.");
      return;
    }

    setSaving(true);
    const result = await registerMaterialPurchaseAction({
      materialId: material.id,
      quantity: qtyNum,
      totalPaid: totalNum,
      supplier: supplier || undefined,
    });
    setSaving(false);

    if (!result.ok) {
      setError(result.error ?? "No pudimos guardar la compra.");
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm rounded-modal bg-white p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-rossana-charcoal">Agregar compra</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-rossana-charcoal/50">
            <X className="size-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-rossana-charcoal/60">
          ¿Qué compraste? <span className="font-medium text-rossana-charcoal">{material.name}</span>
        </p>

        <div className="flex flex-col gap-4">
          <Input
            label={`Cantidad (${material.unit})`}
            type="number"
            min={0}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="100"
          />
          <Input
            label="¿Cuánto pagaste? (S/)"
            type="number"
            min={0}
            step="0.01"
            value={totalPaid}
            onChange={(e) => setTotalPaid(e.target.value)}
            placeholder="35.00"
          />
          <Input
            label="Proveedor (opcional)"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
          />

          {unitCost != null && (
            <p className="rounded-card bg-rossana-ivory px-4 py-3 text-sm text-rossana-charcoal">
              Cada unidad te costó aproximadamente: <strong>{formatSoles(unitCost)}</strong>
            </p>
          )}

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button variant="primary" onClick={handleSave} loading={saving} className="w-full">
            GUARDAR COMPRA
          </Button>
        </div>
      </div>
    </div>
  );
}
