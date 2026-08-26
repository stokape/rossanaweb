import { Globe } from "lucide-react";

interface SocialSectionProps {
  socialLinks: Record<string, string>;
}

/** Sección 13 (bloque "Redes"). Se omite si no hay redes configuradas
 * todavía en site_settings.social_links. Ícono genérico: lucide-react
 * ya no incluye íconos de marca (Instagram/Facebook) en esta versión. */
export function SocialSection({ socialLinks }: SocialSectionProps) {
  const entries = Object.entries(socialLinks).filter(([, url]) => !!url);
  if (entries.length === 0) return null;

  return (
    <section className="bg-rossana-ivory">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-4 px-4 py-12 text-center md:px-8">
        <h2 className="font-display text-2xl font-semibold text-rossana-charcoal">
          Síguenos
        </h2>
        <div className="flex gap-4">
          {entries.map(([platform, url]) => (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={platform}
              className="flex items-center gap-2 rounded-badge bg-rossana-white px-4 py-2 text-sm font-medium capitalize text-rossana-red shadow-soft hover:text-rossana-red-dark"
            >
              <Globe className="size-4" />
              {platform}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
