import { Sparkle } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Página 404 de la tienda (Sección 20 del sistema de diseño): mismo
// fondo crema del resto del sitio, con el mismo lenguaje visual de
// marca en vez de la 404 genérica de Next.js.
export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center md:px-8">
      {/* El "404" va en rojo, no en dorado: aun a este tamaño grande,
          dorado sobre el fondo crema no llega al contraste mínimo
          (regla de accesibilidad del propio sistema de diseño). */}
      <Sparkle className="size-8 text-rossana-gold" aria-hidden />
      <p className="mt-4 font-display text-7xl font-semibold text-rossana-red md:text-8xl">
        404
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-rossana-burgundy md:text-3xl">
        No encontramos esta página
      </h1>
      <p className="mt-3 max-w-md text-rossana-charcoal/70">
        Puede que el enlace esté mal escrito o que la página ya no exista.
        Vuelve al inicio para seguir viendo nuestras pulseras.
      </p>
      <div className="mt-8">
        <Button href="/" variant="primary">
          VOLVER AL INICIO
        </Button>
      </div>
    </div>
  );
}
