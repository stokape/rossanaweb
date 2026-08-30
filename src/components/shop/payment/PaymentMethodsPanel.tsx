import Image from "next/image";
import { formatSoles } from "@/lib/utils";

export interface PaymentMethodOption {
  key: "yape" | "plin";
  label: string;
  holderName: string | null;
  number: string | null;
  qrUrl: string | null;
  instructions: string | null;
}

interface PaymentMethodsPanelProps {
  total: number;
  methods: PaymentMethodOption[];
}

/** Métodos de pago manual (Sección 28): Yape y/o Plin, según lo que
 * Rossana tenga configurado — nunca uno fijo por código (pedido
 * directo: "el emprendedor tiene PLIN ademas de YAPE, que no se
 * muestre exclusivamente YAPE"). Todos los datos salen de
 * site_settings. */
export function PaymentMethodsPanel({ total, methods }: PaymentMethodsPanelProps) {
  const configured = methods.filter((m) => m.number || m.qrUrl);

  return (
    <div className="rounded-card border border-rossana-border bg-rossana-warm-white p-6">
      <p className="text-sm font-medium text-rossana-charcoal/60">Total a pagar</p>
      <p className="text-3xl font-semibold text-rossana-red">{formatSoles(total)}</p>

      {configured.length === 0 ? (
        <p className="mt-6 rounded-card border border-dashed border-rossana-border px-4 py-6 text-center text-sm text-rossana-charcoal/50">
          El pago todavía no está configurado. Escríbenos para coordinar tu pago.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-6">
          {configured.map((method) => (
            <div key={method.key} className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              {method.qrUrl && (
                <div className="relative size-40 shrink-0 overflow-hidden rounded-card border border-rossana-border">
                  <Image
                    src={method.qrUrl}
                    alt={`Código QR de ${method.label}`}
                    fill
                    className="object-contain p-2"
                  />
                </div>
              )}
              <div className="flex flex-col gap-1 text-sm">
                <p className="font-semibold text-rossana-charcoal">{method.label}</p>
                {method.number && (
                  <p>
                    <span className="text-rossana-charcoal/60">Número {method.label}: </span>
                    <span className="font-semibold text-rossana-charcoal">{method.number}</span>
                  </p>
                )}
                {method.holderName && (
                  <p>
                    <span className="text-rossana-charcoal/60">Titular: </span>
                    <span className="font-semibold text-rossana-charcoal">{method.holderName}</span>
                  </p>
                )}
                <p className="mt-2 text-rossana-charcoal/70">
                  {method.instructions ??
                    `Realiza el ${method.label} por el monto exacto y luego sube tu comprobante.`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
