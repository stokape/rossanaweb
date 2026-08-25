"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatSoles } from "@/lib/utils";
import { confirmPaymentAction, rejectPaymentAction } from "@/lib/actions/admin/payments";
import type { AdminOrderDetail } from "@/lib/queries/admin/orders";

interface ValidateYapeCardProps {
  order: AdminOrderDetail;
  receiptUrl: string | null;
}

/** "Validar Yape" (Sección 41). Confirmar pago es la acción más
 * sensible del panel — siempre pide confirmación explícita
 * (Sección 87) antes de ejecutar `confirm_payment`. */
export function ValidateYapeCard({ order, receiptUrl }: ValidateYapeCardProps) {
  const [confirming, setConfirming] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"confirmed" | "rejected" | null>(null);

  const payment = order.payment;
  const receipt = order.receipt;

  if (!payment) return null;

  async function handleConfirm() {
    if (!payment) return;
    setLoading(true);
    setError(null);
    const result = await confirmPaymentAction(payment.id, order.id);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "No pudimos confirmar el pago.");
      return;
    }
    setDone("confirmed");
    setConfirming(false);
  }

  async function handleReject() {
    if (!payment) return;
    setLoading(true);
    setError(null);
    const result = await rejectPaymentAction(payment.id, order.id);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "No pudimos registrar esto.");
      return;
    }
    setDone("rejected");
    setRejecting(false);
  }

  if (done === "confirmed" || payment.status === "paid") {
    return (
      <Card className="flex items-center gap-3 p-5 text-success">
        <CheckCircle2 className="size-6 shrink-0" />
        <p className="font-medium">Pago confirmado correctamente.</p>
      </Card>
    );
  }

  if (done === "rejected" || payment.status === "rejected") {
    return (
      <Card className="p-5">
        <p className="text-sm text-rossana-charcoal/60">
          Marcaste que no pudiste validar este pago. El pedido sigue aquí para que decidas el
          siguiente paso (contactar a la clienta, pedir otro comprobante, etc.).
        </p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4 p-5">
      <h2 className="text-lg font-semibold text-rossana-charcoal">Validar Yape</h2>

      <div className="flex justify-between text-sm">
        <span className="text-rossana-charcoal/60">Total esperado</span>
        <span className="font-semibold text-rossana-charcoal">{formatSoles(payment.amountExpected)}</span>
      </div>

      {receiptUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={receiptUrl}
          alt="Comprobante de Yape"
          className="mx-auto max-h-80 rounded-card border border-rossana-border object-contain"
        />
      ) : (
        <p className="rounded-card border border-dashed border-rossana-border px-4 py-6 text-center text-sm text-rossana-charcoal/50">
          Aún no hay comprobante cargado.
        </p>
      )}

      {receipt && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-rossana-charcoal/50">N.º de operación</p>
            <p className="font-medium text-rossana-charcoal">{receipt.operationNumber ?? "—"}</p>
          </div>
          <div>
            <p className="text-rossana-charcoal/50">Monto detectado</p>
            <p className="font-medium text-rossana-charcoal">
              {receipt.amountDetected != null ? formatSoles(receipt.amountDetected) : "—"}
            </p>
          </div>
        </div>
      )}

      {receipt?.isPossibleDuplicate && (
        <div className="flex items-start gap-2 rounded-card border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-warning">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>Este número de operación aparece asociado a otro pedido. Revísalo antes de confirmar.</p>
        </div>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      {confirming ? (
        <div className="flex flex-col gap-3 rounded-card border border-rossana-border bg-rossana-ivory p-4">
          <p className="text-sm font-medium text-rossana-charcoal">
            ¿Confirmas que recibiste {formatSoles(payment.amountExpected)} por Yape?
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setConfirming(false)}>
              CANCELAR
            </Button>
            <Button variant="primary" className="flex-1" loading={loading} onClick={handleConfirm}>
              SÍ, CONFIRMAR PAGO
            </Button>
          </div>
        </div>
      ) : rejecting ? (
        <div className="flex flex-col gap-3 rounded-card border border-rossana-border bg-rossana-ivory p-4">
          <p className="text-sm font-medium text-rossana-charcoal">
            ¿Confirmas que no pudiste validar este comprobante?
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setRejecting(false)}>
              CANCELAR
            </Button>
            <Button variant="primary" className="flex-1" loading={loading} onClick={handleReject}>
              SÍ, MARCAR ASÍ
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" className="flex-1" onClick={() => setRejecting(true)}>
            NO PUDE VALIDARLO
          </Button>
          <Button variant="primary" className="flex-1" onClick={() => setConfirming(true)}>
            CONFIRMAR PAGO
          </Button>
        </div>
      )}
    </Card>
  );
}
