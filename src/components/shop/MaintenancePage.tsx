import Image from "next/image";
import { Wrench } from "lucide-react";

/**
 * Página pública de "en mantenimiento" (pedido de Rossana). Sin
 * header/footer ni navegación a propósito — cuando está activa,
 * la tienda entera queda cerrada al comprador, no solo el contenido.
 * Ver ShopLayout: el staff con sesión iniciada nunca ve esta página.
 *
 * Fondo: fondo_mantenimiento.png (agregado por Rossana), ya trae el
 * logo integrado — por eso no se repite <Logo/> aparte. Igual que en
 * el Hero (Sección 14, pedido explícito: "es rojo encima de
 * imágenes"), la legibilidad del texto se resuelve con sombra detrás
 * de las letras, nunca con un tinte de color sobre la foto.
 */
export function MaintenancePage({
  message,
  whatsappNumber,
}: {
  message: string | null;
  whatsappNumber: string | null;
}) {
  const waHref = whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}` : null;

  return (
    <div className="relative flex min-h-screen flex-col items-end justify-end overflow-hidden bg-rossana-red">
      <Image
        src="/brand/fondo_mantenimiento.png"
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />

      <div className="relative flex w-full flex-col items-center gap-5 px-4 pb-16 pt-24 text-center text-rossana-warm-white [text-shadow:0_2px_10px_rgba(20,0,2,0.7)]">
        <Wrench className="size-9 text-rossana-gold" aria-hidden />
        <h1 className="font-display text-3xl font-semibold md:text-4xl">Estamos en mantenimiento</h1>
        <p className="max-w-md text-rossana-warm-white/90">
          {message?.trim() || "Estamos mejorando la tienda para ti. Vuelve a visitarnos en un momento."}
        </p>
        {waHref && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 rounded-button border border-rossana-gold px-6 py-3 text-sm font-semibold text-rossana-gold [text-shadow:none] transition-colors hover:bg-rossana-gold hover:text-rossana-burgundy"
          >
            Escríbenos por WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
