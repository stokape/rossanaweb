import { notFound, redirect } from "next/navigation";
import { getOrderPublic } from "@/lib/queries/order-public";
import { getSiteSettings } from "@/lib/queries/site";
import { YapePanel } from "@/components/shop/payment/YapePanel";
import { ReceiptUploadForm } from "@/components/shop/payment/ReceiptUploadForm";

interface PagoPageProps {
  params: Promise<{ id: string }>;
}

// Pago Yape manual (Sección 28-32).
export default async function PagoPage({ params }: PagoPageProps) {
  const { id } = await params;
  const [order, settings] = await Promise.all([getOrderPublic(id), getSiteSettings()]);

  if (!order) notFound();
  if (order.payment_status !== "pending") redirect(`/pedido/${id}/confirmacion`);

  return (
    <div className="mx-auto max-w-xl px-4 py-10 md:px-8">
      <p className="text-sm text-rossana-charcoal/60">Pedido #{order.order_number}</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-rossana-charcoal md:text-3xl">
        Paga con Yape
      </h1>

      <div className="mt-6">
        <YapePanel
          total={order.total}
          yapeHolderName={settings.yapeHolderName}
          yapeNumber={settings.yapeNumber}
          yapeQrUrl={settings.yapeQrUrl}
          yapeInstructions={settings.yapeInstructions}
        />
      </div>

      <ReceiptUploadForm orderId={id} />
    </div>
  );
}
