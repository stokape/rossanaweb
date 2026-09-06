import type { Metadata } from "next";
import { Gem, Gift, ShieldCheck } from "lucide-react";

const PAGE_TITLE = "Nosotros";
const PAGE_DESCRIPTION = "Conoce a Rossana — Bisutería y Más.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/nosotros" },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/nosotros",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

// Mismos 3 hechos confirmados que se usan en BenefitsSection (Sección
// 88: nunca inventar contenido) — aquí solo con más espacio para
// contarlos, en vez de un párrafo único.
const VALUES = [
  {
    icon: Gem,
    title: "Hecho a mano",
    text: "Cada pieza se arma a mano, con atención al detalle.",
  },
  {
    icon: ShieldCheck,
    title: "Materiales seleccionados",
    text: "Cuentas, cristales y componentes elegidos con cuidado.",
  },
  {
    icon: Gift,
    title: "Empaque especial",
    text: "Listo para regalar, sin pasos extra de tu parte.",
  },
];

export default function NosotrosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
      <h1 className="font-display text-3xl font-semibold text-rossana-burgundy md:text-4xl">
        Nosotros
      </h1>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-rossana-charcoal/80">
        Rossana nace del gusto por la bisutería y los accesorios que
        acompañan los pequeños grandes momentos: un regalo, una ocasión
        especial, o simplemente un día en el que quieres sentirte tú
        misma, un poco más brillante. Cada pieza se elige y se cuida
        pensando en eso — elegancia que brilla contigo.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {VALUES.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="flex flex-col gap-2 rounded-card border border-rossana-border bg-rossana-ivory p-5"
          >
            <Icon className="size-6 text-rossana-gold" aria-hidden />
            <h2 className="font-semibold text-rossana-charcoal">{title}</h2>
            <p className="text-sm text-rossana-charcoal/70">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
