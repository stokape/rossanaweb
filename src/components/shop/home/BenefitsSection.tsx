import { Gem, Gift, ShieldCheck, Smartphone, Truck } from "lucide-react";

// Textos confirmados directamente por Rossana (no se afirma nada que
// el negocio no haga hoy: sin envíos a otras ciudades, sin pasarela de
// pago en línea ni contraentrega — solo Yape y entrega personal).
const BENEFITS = [
  { icon: Gem, title: "Diseños exclusivos", text: "Hechos a mano con amor" },
  { icon: ShieldCheck, title: "Calidad garantizada", text: "Materiales seleccionados" },
  { icon: Gift, title: "Empaque especial", text: "Listo para regalar" },
  { icon: Truck, title: "Entrega inmediata", text: "Entrega personal en tu zona" },
  { icon: Smartphone, title: "Pago fácil", text: "Yape, así de simple" },
];

/** Sección 17. Franja de beneficios (Sección 4: fondo Rossana Red). */
export function BenefitsSection() {
  return (
    <section className="bg-rossana-red py-10 md:py-12">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-6 px-4 sm:grid-cols-3 md:grid-cols-5 md:px-8">
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-12 items-center justify-center rounded-full border border-white/30 text-white">
              <Icon className="size-6" />
            </div>
            <span className="text-sm font-semibold text-white">{title}</span>
            <span className="text-xs text-white/75">{text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
