import { Gift, MessageCircle, ShieldCheck, Smartphone, Truck } from "lucide-react";

const BENEFITS = [
  { icon: Truck, title: "Envíos", text: "Rápidos y coordinados" },
  { icon: Smartphone, title: "Yape", text: "Pago sencillo" },
  { icon: ShieldCheck, title: "Compra segura", text: "Tus datos protegidos" },
  { icon: MessageCircle, title: "WhatsApp", text: "Estamos para ayudarte" },
  { icon: Gift, title: "Regalos", text: "Presentación especial" },
];

/** Sección 17. Beneficios genéricos del modelo de compra (Yape,
 * checkout de invitado, WhatsApp) — no promesas operativas específicas
 * no confirmadas (p. ej. no se afirma "envío gratis" ni plazos). */
export function BenefitsSection() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-rossana-ivory text-rossana-red">
              <Icon className="size-6" />
            </div>
            <span className="text-sm font-semibold text-rossana-charcoal">{title}</span>
            <span className="text-xs text-rossana-charcoal/60">{text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
