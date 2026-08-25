"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, XCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { formatSoles } from "@/lib/utils";
import { computeProfitability, computeSuggestedPrice, getProfitabilityAlert } from "@/lib/pricing";

interface PricingCalculatorProps {
  materialsCost: number;
  laborCost: number;
  packagingCost: number;
  otherDirectCost: number;
  markupPercentage: number;
  includeTax: boolean;
  taxRate: number;
  price: number;
  compareAtPrice: number | null;
  onChange: (field: string, value: number | boolean | null) => void;
}

const ALERT_ICON = { danger: XCircle, warning: AlertTriangle, success: CheckCircle2 } as const;
const ALERT_CLASS = {
  danger: "bg-danger/5 text-danger border-danger/30",
  warning: "bg-warning/5 text-warning border-warning/30",
  success: "bg-success/5 text-success border-success/30",
} as const;

/** Costo y precio (Sección 54-59). Pantalla simple por defecto; el
 * detalle del cálculo (margen/markup/IGV) queda oculto hasta que se
 * pide explícitamente. */
export function PricingCalculator({
  materialsCost,
  laborCost,
  packagingCost,
  otherDirectCost,
  markupPercentage,
  includeTax,
  taxRate,
  price,
  compareAtPrice,
  onChange,
}: PricingCalculatorProps) {
  const [showDetail, setShowDetail] = useState(false);

  const breakdown = computeSuggestedPrice({
    materialsCost,
    laborCost,
    packagingCost,
    otherDirectCost,
    markupPercentage,
    includeTax,
    taxRate,
  });
  const profitability = computeProfitability(breakdown.totalCost, price);
  const alert = getProfitabilityAlert(profitability.profit, profitability.margin);
  const AlertIcon = ALERT_ICON[alert.level];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm text-rossana-charcoal/60">Materiales (calculado de los componentes)</p>
        <p className="text-lg font-semibold text-rossana-charcoal">{formatSoles(materialsCost)}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          label="Mano de obra (S/)"
          type="number"
          min={0}
          step="0.01"
          value={laborCost}
          onChange={(e) => onChange("laborCost", Number(e.target.value))}
        />
        <Input
          label="Empaque (S/)"
          type="number"
          min={0}
          step="0.01"
          value={packagingCost}
          onChange={(e) => onChange("packagingCost", Number(e.target.value))}
        />
        <Input
          label="Otros (S/)"
          type="number"
          min={0}
          step="0.01"
          value={otherDirectCost}
          onChange={(e) => onChange("otherDirectCost", Number(e.target.value))}
        />
      </div>

      <p className="rounded-card bg-rossana-ivory px-4 py-3 text-sm text-rossana-charcoal">
        Hacer este producto te cuesta aproximadamente{" "}
        <strong>{formatSoles(breakdown.totalCost)}</strong>
      </p>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-rossana-charcoal">
          ¿Cuánto quieres ganar?
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={300}
            step={5}
            value={markupPercentage}
            onChange={(e) => onChange("markupPercentage", Number(e.target.value))}
            className="flex-1 accent-rossana-red"
          />
          <span className="w-16 text-right text-sm font-medium text-rossana-charcoal">
            {markupPercentage}%
          </span>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-rossana-charcoal">
        <input
          type="checkbox"
          checked={includeTax}
          onChange={(e) => onChange("includeTax", e.target.checked)}
          className="size-4 accent-rossana-red"
        />
        Incluir IGV ({Math.round(taxRate * 100)}%)
      </label>

      <div className="rounded-card border border-rossana-border p-4">
        <p className="text-sm text-rossana-charcoal/60">Precio sugerido</p>
        <p className="text-xl font-semibold text-rossana-red">
          {formatSoles(breakdown.suggestedFinalPrice)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="¿A cuánto quieres venderlo?"
          type="number"
          min={0}
          step="0.01"
          value={price}
          onChange={(e) => onChange("price", Number(e.target.value))}
        />
        <Input
          label="Precio anterior (opcional, para ofertas)"
          type="number"
          min={0}
          step="0.01"
          value={compareAtPrice ?? ""}
          onChange={(e) => onChange("compareAtPrice", e.target.value ? Number(e.target.value) : null)}
        />
      </div>

      <div className={`flex items-start gap-2 rounded-card border px-4 py-3 text-sm ${ALERT_CLASS[alert.level]}`}>
        <AlertIcon className="mt-0.5 size-4 shrink-0" />
        <p>{alert.message}</p>
      </div>

      <button
        type="button"
        onClick={() => setShowDetail((v) => !v)}
        className="flex w-fit items-center gap-1 text-sm font-medium text-rossana-red"
      >
        VER DETALLE DEL CÁLCULO
        <ChevronDown className={`size-4 transition-transform ${showDetail ? "rotate-180" : ""}`} />
      </button>

      {showDetail && (
        <div className="grid grid-cols-2 gap-y-2 rounded-card bg-rossana-ivory p-4 text-sm">
          <span className="text-rossana-charcoal/60">Costo</span>
          <span className="text-right text-rossana-charcoal">{formatSoles(breakdown.totalCost)}</span>
          <span className="text-rossana-charcoal/60">Precio neto</span>
          <span className="text-right text-rossana-charcoal">{formatSoles(breakdown.netSuggestedPrice)}</span>
          <span className="text-rossana-charcoal/60">IGV</span>
          <span className="text-right text-rossana-charcoal">{formatSoles(breakdown.tax)}</span>
          <span className="text-rossana-charcoal/60">Precio de venta</span>
          <span className="text-right text-rossana-charcoal">{formatSoles(price)}</span>
          <span className="text-rossana-charcoal/60">Ganancia estimada</span>
          <span className="text-right text-rossana-charcoal">{formatSoles(profitability.profit)}</span>
          <span className="text-rossana-charcoal/60">Margen</span>
          <span className="text-right text-rossana-charcoal">{(profitability.margin * 100).toFixed(1)}%</span>
          <span className="text-rossana-charcoal/60">Markup</span>
          <span className="text-right text-rossana-charcoal">{(profitability.markup * 100).toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
}
