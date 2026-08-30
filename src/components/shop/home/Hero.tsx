import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HeroCarousel } from "@/components/shop/home/HeroCarousel";
import type { HeroBanner } from "@/lib/queries/banners";

/** Hero (Sección 14). Copy literal del prompt maestro. Con fotos
 * reales cargadas: cubren todo el fondo del hero, sin ningún
 * difuminado rojo encima — la foto se ve nítida y con sus colores
 * reales (pedido directo de Rossana: "es rojo encima de imágenes").
 * La legibilidad del texto se resuelve con una sombra detrás de las
 * letras, no con un tinte de color sobre la foto. Sin fotos todavía:
 * fondo rojo sólido + motivo decorativo — nunca un producto inventado
 * (Sección 23). */
export function Hero({ banners }: { banners: HeroBanner[] }) {
  const hasPhotos = banners.length > 0;

  return (
    <section className="relative overflow-hidden bg-rossana-red">
      {hasPhotos && <HeroCarousel banners={banners} fill />}

      <div className="relative mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-8 px-6 py-16 md:min-h-[560px] md:grid-cols-2 md:gap-10 md:px-12 md:py-0">
        <div
          className={
            hasPhotos
              ? "flex flex-col items-start gap-5 text-rossana-ivory [text-shadow:0_2px_10px_rgba(20,0,2,0.7)]"
              : "flex flex-col items-start gap-5 text-rossana-ivory"
          }
        >
          <h1 className="font-display text-4xl font-semibold leading-tight md:text-6xl">
            Realza tu estilo
            <br />
            <span className="italic text-rossana-gold">cada día</span>
          </h1>
          <div className="flex items-center gap-3 text-rossana-champagne/70">
            <span className="h-px w-10 bg-current" />
            <Sparkles className="size-3" aria-hidden />
            <span className="h-px w-10 bg-current" />
          </div>
          <p className="max-w-md text-base text-rossana-soft-text md:text-lg">
            Bisutería y accesorios que complementan tu esencia.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Button href="/productos" variant="gold" size="default">
              DESCUBRIR COLECCIÓN <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>
        </div>

        {!hasPhotos && (
          <div
            aria-hidden
            className="relative hidden aspect-square items-center justify-center md:flex"
          >
            <div className="absolute inset-8 rounded-full border border-rossana-champagne/30" />
            <div className="absolute inset-16 rounded-full border border-rossana-champagne/20" />
            <span className="font-display text-3xl italic text-rossana-champagne">
              Rossana
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
