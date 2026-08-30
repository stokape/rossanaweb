import { notFound, redirect } from "next/navigation";
import { getOrderPublic } from "@/lib/queries/order-public";
import { getSiteSettings } from "@/lib/queries/site";
import { PaymentMethodsPanel, type PaymentMethodOption } from "@/components/shop/payment/PaymentMethodsPanel";
import { ReceiptUploadForm } from "@/components/shop/payment/ReceiptUploadForm";
import { CheckoutSteps } from "@/components/shop/checkout/CheckoutSteps";

interface PagoPageProps {
  params: Promise<{ id: string }>;
}

// Pago manual — Yape y/o Plin, según lo configurado (Sección 28-32).
export default async function PagoPage({ params }: PagoPageProps) {
  const { id } = await params;
  const [order, settings] = await Promise.all([getOrderPublic(id), getSiteSettings()]);

  if (!order) notFound();
  if (order.payment_status !== "pending") redirect(`/pedido/${id}/confirmacion`);

  const methods: PaymentMethodOption[] = [
    {
      key: "yape",
      label: "Yape",
      holderName: settings.yapeHolderName,
      number: settings.yapeNumber,
      qrUrl: settings.yapeQrUrl,
      instructions: settings.yapeInstructions,
    },
    {
      key: "plin",
      label: "Plin",
      holderName: settings.plinHolderName,
      number: settings.plinNumber,
      qrUrl: settings.plinQrUrl,
      instructions: settings.plinInstructions,
    },
  ];
  const availableMethods = methods.filter((m) => m.number || m.qrUrl);
  const heading =
    availableMethods.length === 2
      ? "Paga con Yape o Plin"
      : availableMethods.length === 1
        ? `Paga con ${availableMethods[0].label}`
        : "Completa tu pago";

  return (
    <div className="mx-auto max-w-xl px-4 py-10 md:px-8">
      <CheckoutSteps current="pago" />
      <p className="text-sm text-rossana-charcoal/60">Pedido #{order.order_number}</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-rossana-charcoal md:text-3xl">
        {heading}
      </h1>

      <div className="mt-6">
        <PaymentMethodsPanel total={order.total} methods={methods} />
      </div>

      <ReceiptUploadForm
        orderId={id}
        availableMethods={availableMethods.map((m) => ({ key: m.key, label: m.label }))}
      />
    </div>
  );
}
