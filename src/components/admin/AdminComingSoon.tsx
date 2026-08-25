export function AdminComingSoon({ title, note }: { title: string; note?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-display text-2xl font-semibold text-rossana-charcoal md:text-3xl">
        {title}
      </h1>
      <p className="mt-8 rounded-card border border-dashed border-rossana-border bg-white px-6 py-16 text-center text-rossana-charcoal/50">
        {note ?? "Estamos construyendo esta sección. Vuelve pronto."}
      </p>
    </div>
  );
}
