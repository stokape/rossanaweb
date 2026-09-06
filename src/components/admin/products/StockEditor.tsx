"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateStockAction } from "@/lib/actions/admin/products";

interface StockEditorProps {
  productId: string;
  stockOnHand: number;
  stockReserved: number;
  stockAvailable: number;
}

/**
 * Ajuste manual de stock (Sección 61) — imprescindible para productos
 * sin "Componentes del producto" definidos: sin esto, un producto
 * cargado directamente se queda en 0 unidades para siempre, porque
 * antes solo "Hacer productos" sumaba stock.
 */
export function StockEditor({ productId, stockOnHand, stockReserved, stockAvailable }: StockEditorProps) {
  const router = useRouter();
  const [value, setValue] = useState(String(stockOnHand));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setError(null);
    setSaved(false);
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 0) {
      setError("Ingresa un número entero de 0 a más.");
      return;
    }

    setSaving(true);
    const result = await updateStockAction(productId, parsed);
    setSaving(false);

    if (!result.ok) {
      setError(result.error ?? "No pudimos actualizar el stock.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="w-40">
        <Input
          label="¿Cuántos tienes?"
          type="number"
          min={0}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSaved(false);
          }}
        />
      </div>
      <Button variant="secondary" onClick={handleSave} loading={saving}>
        GUARDAR STOCK
      </Button>

      <div className="text-sm text-rossana-charcoal/60">
        {stockReserved > 0 && <p>{stockReserved} reservado(s) en pedidos por pagar</p>}
        <p>Disponible para la venta: {stockAvailable}</p>
      </div>

      {error && (
        <p className="text-sm text-danger transition-opacity duration-200 ease-[var(--ease-out)] starting:opacity-0 motion-reduce:transition-none sm:ml-2">
          {error}
        </p>
      )}
      {saved && (
        <p className="text-sm text-success transition-opacity duration-200 ease-[var(--ease-out)] starting:opacity-0 motion-reduce:transition-none sm:ml-2">
          Stock actualizado.
        </p>
      )}
    </div>
  );
}
