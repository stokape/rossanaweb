import { Wrench } from "lucide-react";
import { Logo } from "@/components/shop/Logo";

/**
 * Página pública de "en mantenimiento" (pedido de Rossana). Sin
 * header/footer ni navegación a propósito — cuando está activa,
 * la tienda entera queda cerrada al comprador, no solo el contenido.
 * Ver ShopLayout: el staff con sesión iniciada nunca ve esta página.
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-rossana-red px-4 py-16 text-center">
      <Logo className="h-12 w-auto md:h-14" />
      <Wrench className="size-9 text-rossana-gold" aria-hidden />
      <h1 className="font-display text-3xl font-semibold text-rossana-warm-white md:text-4xl">
        Estamos en mantenimiento
      </h1>
      <p className="max-w-md text-rossana-warm-white/85">
        {message?.trim() || "Estamos mejorando la tienda para ti. Vuelve a visitarnos en un momento."}
      </p>
      {waHref && (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-2 rounded-button border border-rossana-gold px-6 py-3 text-sm font-semibold text-rossana-gold transition-colors hover:bg-rossana-gold hover:text-rossana-burgundy"
        >
          Escríbenos por WhatsApp
        </a>
      )}
    </div>
  );
}
