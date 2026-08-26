"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateStockAction } from "@/lib/actions/admin/products";

interface InlineStockEditorProps {
  productId: string;
  stockOnHand: number;
  stockReserved: number;
  lowStock: boolean;
}

/**
 * Edición rápida de stock directo desde "Mis productos" (Sección 42),
 * sin tener que abrir la ficha completa del producto — pedido directo
 * de Rossana: poder actualizar unidades ahí mismo en la lista.
 */
export function InlineStockEditor({
  productId,
  stockOnHand,
  stockReserved,
  lowStock,
}: InlineStockEditorProps) {
  const router = useRouter();
  const [value, setValue] = useState(String(stockOnHand));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const dirty = value !== String(stockOnHand);

  async function handleSave() {
    setError(null);
    setSaved(false);
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 0) {
      setError("Número inválido");
      return;
    }
    setSaving(true);
    const result = await updateStockAction(productId, parsed);
    setSaving(false);

    if (!result.ok) {
      setError(result.error ?? "No se pudo guardar");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <label
        htmlFor={`stock-${productId}`}
        className="text-xs font-semibold text-rossana-charcoal/60"
      >
        Stock:
      </label>
      <input
        id={`stock-${productId}`}
        type="number"
        min={0}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSave();
          }
        }}
        className={`w-16 rounded-[6px] border bg-rossana-warm-white px-2 py-0.5 text-sm font-semibold text-rossana-charcoal ${
          lowStock ? "border-warning" : "border-rossana-border"
        }`}
      />

      {dirty && (
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-[6px] bg-rossana-red px-2 py-1 text-xs font-semibold text-rossana-warm-white disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
      )}

      {saved && !dirty && <span className="text-xs text-success">Guardado</span>}
      {error && <span className="text-xs text-danger">{error}</span>}
      {stockReserved > 0 && (
        <span className="text-xs text-rossana-charcoal/40">
          ({stockReserved} reservado{stockReserved > 1 ? "s" : ""})
        </span>
      )}
    </div>
  );
}
