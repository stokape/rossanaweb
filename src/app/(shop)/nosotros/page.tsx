import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Conoce a Rossana — Bisutería y Más.",
};

export default function NosotrosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
      <h1 className="font-display text-3xl font-semibold text-rossana-red md:text-4xl">
        Nosotros
      </h1>
      <p className="mt-6 text-base leading-relaxed text-rossana-charcoal/80">
        Rossana nace del gusto por la bisutería y los accesorios que
        acompañan los pequeños grandes momentos: un regalo, una ocasión
        especial, o simplemente un día en el que quieres sentirte tú
        misma, un poco más brillante. Cada pieza se elige y se cuida
        pensando en eso — elegancia que brilla contigo.
      </p>
    </div>
  );
}
