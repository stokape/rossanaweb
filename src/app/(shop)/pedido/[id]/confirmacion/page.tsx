import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getOrderPublic } from "@/lib/queries/order-public";
import { formatSoles } from "@/lib/utils";

interface ConfirmacionPageProps {
  params: Promise<{ id: string }>;
}

// Estados visibles al comprador (Sección 33-34). Nunca decir "Pago
// confirmado" antes de que el admin lo valide manualmente (Sección 32).
const STATUS_MESSAGES: Record<string, string> = {
  esperando_pago: "Estamos esperando tu pago por Yape.",
  pago_por_validar: "Recibimos tu comprobante. Estamos validando tu pago.",
  en_preparacion: "¡Tu pago fue confirmado! Estamos preparando tu pedido.",
  listo_para_entrega: "Tu pedido está listo para su entrega.",
  enviado: "Tu pedido fue enviado.",
  entregado: "Tu pedido fue entregado. ¡Gracias por tu compra!",
  cancelado: "Este pedido fue cancelado.",
};

export default async function ConfirmacionPage({ params }: ConfirmacionPageProps) {
  const { id } = await params;
  const order = await getOrderPublic(id);
  if (!order) notFound();

  const statusMessage = STATUS_MESSAGES[order.status] ?? "Estamos procesando tu pedido.";

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center md:px-8">
      <CheckCircle2 className="mx-auto size-14 text-rossana-red" />
      <h1 className="mt-4 font-display text-2xl font-semibold text-rossana-charcoal md:text-3xl">
        ¡Gracias por tu pedido, {order.buyer_first_name}!
      </h1>
      <p className="mt-2 text-sm text-rossana-charcoal/60">Pedido #{order.order_number}</p>

      <div className="mt-6 rounded-card border border-rossana-border bg-rossana-ivory px-6 py-4">
        <p className="font-medium text-rossana-charcoal">{statusMessage}</p>
      </div>

      {order.items && order.items.length > 0 && (
        <div className="mt-8 rounded-card border border-rossana-border bg-white p-5 text-left">
          <h2 className="mb-3 text-sm font-semibold text-rossana-charcoal">Resumen</h2>
          <div className="flex flex-col gap-2 text-sm">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-rossana-charcoal/70">
                  {item.product_name} × {item.quantity}
                </span>
                <span className="text-rossana-charcoal">{formatSoles(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t border-rossana-border pt-3 text-base font-semibold">
            <span>Total</span>
            <span className="text-rossana-red">{formatSoles(order.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
