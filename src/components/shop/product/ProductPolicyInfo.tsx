import { Package, RefreshCw, Sparkles } from "lucide-react";

interface ProductPolicyInfoProps {
  shippingPolicy: string | null;
  returnsPolicy: string | null;
}

const DEFAULT_CARE_TIP =
  "Evita el contacto con agua, perfumes y cremas, y guarda tus piezas en un lugar seco para conservar su brillo.";

/** Sección 21: bloque Envíos / Cambios / Cuidados. Envíos y cambios
 * salen de site_settings.policies (configurables); cuidados es un tip
 * genérico de cuidado de bisutería, no una promesa operativa. */
export function ProductPolicyInfo({ shippingPolicy, returnsPolicy }: ProductPolicyInfoProps) {
  const items = [
    { icon: Package, title: "Envíos", text: shippingPolicy },
    { icon: RefreshCw, title: "Cambios", text: returnsPolicy },
    { icon: Sparkles, title: "Cuidados", text: DEFAULT_CARE_TIP },
  ].filter((i) => !!i.text);

  if (items.length === 0) return null;

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 border-t border-rossana-border pt-6 sm:grid-cols-3">
      {items.map(({ icon: Icon, title, text }) => (
        <div key={title} className="flex gap-3">
          <Icon className="mt-0.5 size-5 shrink-0 text-rossana-red" />
          <div>
            <h3 className="text-sm font-semibold text-rossana-charcoal">{title}</h3>
            <p className="mt-0.5 text-xs text-rossana-charcoal/60 line-clamp-3">{text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
