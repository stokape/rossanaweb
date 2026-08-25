import { notFound } from "next/navigation";
import { getSiteSettings } from "@/lib/queries/site";

const KNOWN_SLUGS: Record<string, string> = {
  envios: "Envíos",
  "cambios-devoluciones": "Cambios y devoluciones",
  privacidad: "Política de privacidad",
  terminos: "Términos y condiciones",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: KNOWN_SLUGS[slug] ?? "Políticas" };
}

// Contenido editable desde /admin/configuracion → Políticas
// (site_settings.policies). Si Rossana todavía no la redactó, se
// muestra un aviso honesto en vez de texto inventado.
export default async function PoliticaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = KNOWN_SLUGS[slug];
  if (!title) notFound();

  const settings = await getSiteSettings();
  const content = settings.policies[slug];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
      <h1 className="font-display text-3xl font-semibold text-rossana-red md:text-4xl">
        {title}
      </h1>
      {content ? (
        <div className="mt-6 whitespace-pre-line text-base leading-relaxed text-rossana-charcoal/80">
          {content}
        </div>
      ) : (
        <p className="mt-8 rounded-card border border-dashed border-rossana-border px-6 py-8 text-center text-rossana-charcoal/50">
          Esta política todavía no ha sido configurada.
        </p>
      )}
    </div>
  );
}
