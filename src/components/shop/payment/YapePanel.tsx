import Image from "next/image";
import { formatSoles } from "@/lib/utils";

interface YapePanelProps {
  total: number;
  yapeHolderName: string | null;
  yapeNumber: string | null;
  yapeQrUrl: string | null;
  yapeInstructions: string | null;
}

/** Único método de pago del MVP (Sección 28): sin selector, directo a
 * Yape manual. Todos los datos salen de site_settings — nunca
 * hardcodeados (Sección 17/64). */
export function YapePanel({
  total,
  yapeHolderName,
  yapeNumber,
  yapeQrUrl,
  yapeInstructions,
}: YapePanelProps) {
  const notConfigured = !yapeNumber && !yapeQrUrl;

  return (
    <div className="rounded-card border border-rossana-border bg-rossana-white p-6">
      <p className="text-sm font-medium text-rossana-charcoal/60">Total a pagar</p>
      <p className="text-3xl font-semibold text-rossana-red">{formatSoles(total)}</p>

      {notConfigured ? (
        <p className="mt-6 rounded-card border border-dashed border-rossana-border px-4 py-6 text-center text-sm text-rossana-charcoal/50">
          El pago con Yape todavía no está configurado. Escríbenos para coordinar tu pago.
        </p>
      ) : (
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {yapeQrUrl && (
            <div className="relative size-40 shrink-0 overflow-hidden rounded-card border border-rossana-border">
              <Image src={yapeQrUrl} alt="Código QR de Yape" fill className="object-contain p-2" />
            </div>
          )}
          <div className="flex flex-col gap-1 text-sm">
            {yapeNumber && (
              <p>
                <span className="text-rossana-charcoal/60">Número Yape: </span>
                <span className="font-semibold text-rossana-charcoal">{yapeNumber}</span>
              </p>
            )}
            {yapeHolderName && (
              <p>
                <span className="text-rossana-charcoal/60">Titular: </span>
                <span className="font-semibold text-rossana-charcoal">{yapeHolderName}</span>
              </p>
            )}
            <p className="mt-2 text-rossana-charcoal/70">
              {yapeInstructions ??
                "Realiza el Yape por el monto exacto y luego sube tu comprobante."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
