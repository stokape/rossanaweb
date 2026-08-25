/** Datos estructurados (Sección 66-67). Nunca reviews/ratings falsos —
 * solo Organization, WebSite, BreadcrumbList, Product y Offer reales. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD exige ir en un <script>; el contenido es JSON generado
      // por nosotros mismos, no HTML de usuario.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
