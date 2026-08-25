/** Placeholder honesto para rutas cuya fase todavía no se construye
 * (ver PROJECT_STATUS.md). Evita 404 en enlaces de navegación sin
 * fingir una funcionalidad que no existe todavía. */
export function ComingSoon({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-3 px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-semibold text-rossana-red">{title}</h1>
      <p className="max-w-md text-rossana-charcoal/60">
        {note ?? "Estamos construyendo esta sección. Vuelve pronto."}
      </p>
    </div>
  );
}
