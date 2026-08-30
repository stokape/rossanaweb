"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cancelOrderAction } from "@/lib/actions/admin/payments";

/**
 * "Anular pedido" (pedido directo de Rossana): disponible para
 * cualquier pedido que no esté ya anulado. Siempre pide confirmación
 * explícita antes de ejecutar `cancel_order` (Sección 87: acción
 * sensible, no reversible desde el panel).
 */
export function CancelOrderCard({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "cancelado") {
    return (
      <Card className="flex items-center gap-3 p-5 text-rossana-charcoal/60">
        <Ban className="size-5 shrink-0" />
        <p className="text-sm">Este pedido está anulado.</p>
      </Card>
    );
  }

  async function handleCancel() {
    setLoading(true);
    setError(null);
    const result = await cancelOrderAction(orderId, reason);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "No pudimos anular este pedido.");
      return;
    }
    router.refresh();
  }

  if (!confirming) {
    return (
      <Card className="p-5">
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="flex items-center gap-2 text-sm font-medium text-danger hover:underline"
        >
          <Ban className="size-4" /> Anular pedido
        </button>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-3 p-5">
      <p className="text-sm font-medium text-rossana-charcoal">
        ¿Seguro que quieres anular este pedido? Si el stock ya se había descontado, se devuelve
        automáticamente.
      </p>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-rossana-charcoal">
          Motivo (opcional)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          placeholder="Ej. la clienta pidió cancelar, error al cargar el pedido, etc."
          className="w-full rounded-input border border-rossana-border bg-rossana-warm-white p-3 text-sm text-rossana-charcoal"
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => {
            setConfirming(false);
            setError(null);
          }}
        >
          NO, VOLVER
        </Button>
        <Button variant="primary" className="flex-1" loading={loading} onClick={handleCancel}>
          SÍ, ANULAR PEDIDO
        </Button>
      </div>
    </Card>
  );
}
