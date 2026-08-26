import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "datos", label: "Datos y entrega" },
  { key: "pago", label: "Pago" },
  { key: "confirmacion", label: "Confirmación" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

/**
 * Indicador visual de pasos del checkout (Sección 15 del sistema de
 * diseño): puramente informativo, no cambia el flujo real (que sigue
 * siendo un formulario único + páginas de pago/confirmación ya
 * existentes) — solo ayuda a ubicar en qué parte del proceso está el
 * comprador. Activo en rojo, completado en dorado, pendiente en gris.
 */
export function CheckoutSteps({ current }: { current: StepKey }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <ol className="mb-8 flex items-center gap-2 text-xs font-medium sm:text-sm">
      {STEPS.map((step, i) => {
        const status = i < currentIndex ? "done" : i === currentIndex ? "active" : "pending";
        return (
          <li key={step.key} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                status === "done" && "border-rossana-gold bg-rossana-gold text-rossana-burgundy",
                status === "active" && "border-rossana-red bg-rossana-red text-rossana-warm-white",
                status === "pending" && "border-rossana-border bg-transparent text-rossana-charcoal/40",
              )}
            >
              {status === "done" ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden sm:inline",
                status === "pending" ? "text-rossana-charcoal/40" : "text-rossana-charcoal",
              )}
            >
              {step.label}
            </span>
            {i < STEPS.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "h-px flex-1",
                  status === "done" ? "bg-rossana-gold" : "bg-rossana-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
