import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { getSiteSettings } from "@/lib/queries/site";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbenos a Rossana — Bisutería y Más.",
};

export default async function ContactoPage() {
  const settings = await getSiteSettings();
  const whatsappHref = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
      <h1 className="font-display text-3xl font-semibold text-rossana-burgundy md:text-4xl">
        Contacto
      </h1>
      <p className="mt-4 text-base text-rossana-charcoal/70">
        ¿Tienes una consulta sobre un producto o tu pedido? Escríbenos.
      </p>

      {whatsappHref ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-button bg-rossana-red px-6 py-3 font-semibold text-rossana-warm-white hover:bg-rossana-burgundy"
        >
          <MessageCircle className="size-5" /> Escribir por WhatsApp
        </a>
      ) : (
        <p className="mt-8 rounded-card border border-dashed border-rossana-border px-6 py-8 text-center text-rossana-charcoal/50">
          El número de WhatsApp aún no está configurado.
        </p>
      )}
    </div>
  );
}
