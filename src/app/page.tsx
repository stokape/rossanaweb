import { Button } from "@/components/ui/Button";

/**
 * Placeholder temporal — Fase 4 (Home) aún no implementada.
 * Se mantiene solo como smoke test del Design System (tokens de color,
 * tipografía y componente Button) mientras se resuelven los bloqueos
 * reales: logo oficial y fotografías de producto (ver PROJECT_STATUS.md).
 */
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-rossana-ivory px-6 py-24 text-center">
      <p className="font-display italic text-rossana-gold text-lg">
        Elegancia que brilla contigo
      </p>
      <h1 className="max-w-xl font-display text-4xl font-semibold text-rossana-red md:text-5xl">
        Rossana — Bisutería y Más
      </h1>
      <p className="max-w-md text-base text-rossana-charcoal/70">
        La Home real (Sección 13) se construye en la Fase 4, una vez
        resueltos los bloqueos de logo y fotografías de producto.
      </p>
      <Button variant="primary">Ver productos</Button>
    </main>
  );
}
