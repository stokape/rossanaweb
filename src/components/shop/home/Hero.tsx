import { Button } from "@/components/ui/Button";
import { HeroCarousel } from "@/components/shop/home/HeroCarousel";
import type { HeroBanner } from "@/lib/queries/banners";

/** Hero (Sección 14). Copy literal del prompt maestro. El lado derecho
 * muestra fotos reales subidas desde /admin/configuracion en cuanto
 * existan; mientras tanto usa un motivo decorativo — nunca un
 * producto inventado (Sección 23). */
export function Hero({ banners }: { banners: HeroBanner[] }) {
  return (
    <section className="relative overflow-hidden bg-rossana-red">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-10 px-6 py-16 md:min-h-[560px] md:grid-cols-2 md:px-12 md:py-0">
        <div className="flex flex-col items-start gap-5 text-white">
          <span className="text-sm font-semibold tracking-[0.2em] text-rossana-gold-light">
            NUEVA COLECCIÓN
          </span>
          <h1 className="font-display text-4xl font-semibold leading-tight md:text-6xl">
            Realza tu estilo
            <br />
            cada día
          </h1>
          <p className="max-w-md text-base text-white/85 md:text-lg">
            Bisutería y accesorios que complementan tu esencia.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Button href="/productos" variant="gold" size="default">
              VER PRODUCTOS
            </Button>
          </div>
        </div>

        {banners.length > 0 ? (
          <div className="hidden md:block">
            <HeroCarousel banners={banners} />
          </div>
        ) : (
          <div
            aria-hidden
            className="relative hidden aspect-square items-center justify-center md:flex"
          >
            <div className="absolute inset-8 rounded-full border border-rossana-gold-light/30" />
            <div className="absolute inset-16 rounded-full border border-rossana-gold-light/20" />
            <span className="font-display text-3xl italic text-rossana-gold-light">
              Rossana
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
