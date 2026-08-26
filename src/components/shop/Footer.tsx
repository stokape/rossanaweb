import Link from "next/link";
import { Globe, MessageCircle } from "lucide-react";
import { Logo } from "@/components/shop/Logo";
import type { SiteSettings } from "@/lib/queries/site";

// Sección "Políticas" oculta a pedido del usuario (de momento no se
// usa) — el componente PoliciesSection del admin y la ruta
// /politicas/[slug] siguen existiendo, solo no están enlazadas.

function buildWhatsAppLink(whatsappNumber: string) {
  const digits = whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

export function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();

  return (
    // Fondo fijo (no usa el token --rossana-charcoal): el footer se
    // mantiene siempre oscuro/de marca, independiente del tema claro/oscuro.
    <footer className="bg-[#211a18] text-white">
      <div className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <Logo className="h-16 w-auto sm:h-10" />
          <p className="text-sm text-white/70 max-w-xs">
            Bisutería y accesorios que complementan tu esencia. Elegancia
            que brilla contigo.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <h3 className="mb-1 font-semibold text-rossana-gold">Navegación</h3>
          <Link href="/productos" className="text-white/70 hover:text-white">Productos</Link>
          <Link href="/nosotros" className="text-white/70 hover:text-white">Nosotros</Link>
          <Link href="/contacto" className="text-white/70 hover:text-white">Contacto</Link>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <h3 className="mb-1 font-semibold text-rossana-gold">Contáctanos</h3>
          {settings.whatsappNumber && (
            <a
              href={buildWhatsAppLink(settings.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/70 hover:text-white"
            >
              <MessageCircle className="size-4" /> WhatsApp
            </a>
          )}
          <div className="flex gap-4 mt-1">
            {Object.entries(settings.socialLinks)
              .filter(([, url]) => !!url)
              .map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={platform}
                  className="flex items-center gap-1 text-white/70 hover:text-white"
                >
                  <Globe className="size-4" />
                  <span className="text-xs capitalize">{platform}</span>
                </a>
              ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {year} {settings.businessName ?? "Rossana — Bisutería y Más"}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
