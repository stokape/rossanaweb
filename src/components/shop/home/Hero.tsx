import { ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HeroCarousel } from "@/components/shop/home/HeroCarousel";
import type { HeroBanner } from "@/lib/queries/banners";

/** Hero (Sección 14). Copy literal del prompt maestro. Con fotos
 * reales cargadas: cubren todo el fondo del hero, con un degradado
 * rojo Rossana suave y muy localizado detrás del texto (solo para que
 * se lea bien) que se disuelve rápido a transparente — el resto de la
 * foto se ve nítida, sin lavado rojo encima (pedido directo de
 * Rossana: "no se ven los productos"). Sin fotos todavía: fondo rojo
 * sólido + motivo decorativo — nunca un producto inventado (Sección 23). */
export function Hero({ banners }: { banners: HeroBanner[] }) {
  const hasPhotos = banners.length > 0;

  return (
    <section className="relative overflow-hidden bg-rossana-red">
      {hasPhotos && (
        <>
          <HeroCarousel banners={banners} fill />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-rossana-red/65 via-rossana-red/5 to-transparent"
          />
        </>
      )}

      <div className="relative mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-8 px-6 py-16 md:min-h-[560px] md:grid-cols-2 md:gap-10 md:px-12 md:py-0">
        <div className="flex flex-col items-start gap-5 text-rossana-ivory">
          <h1 className="font-display text-4xl font-semibold leading-tight md:text-6xl">
            Detalles que
            <br />
            <span className="italic text-rossana-champagne">te hacen brillar</span>
          </h1>
          <div className="flex items-center gap-3 text-rossana-champagne/70">
            <span className="h-px w-10 bg-current" />
            <Heart className="size-3 fill-current" aria-hidden />
            <span className="h-px w-10 bg-current" />
          </div>
          <p className="max-w-md text-base text-rossana-soft-text md:text-lg">
            Bisutería y accesorios que combinan elegancia, color y delicadeza
            para acompañarte todos los días.
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
