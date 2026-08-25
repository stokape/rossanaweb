import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { MaterialSummary } from "@/lib/queries/admin/materials";

interface MaterialCardProps {
  material: MaterialSummary;
  onAddPurchase: () => void;
}

/** "Mis materiales" (Sección 46) — lenguaje cotidiano, sin jerga de
 * inventario. */
export function MaterialCard({ material, onAddPurchase }: MaterialCardProps) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-rossana-charcoal">{material.name}</h3>
        {material.lowStock && <Badge tone="warning">Poco stock</Badge>}
      </div>

      <p className="text-sm text-rossana-charcoal/70">
        Tienes: <span className="font-semibold text-rossana-charcoal">{material.currentStock} {material.unit}</span>
      </p>
      <p className="text-xs text-rossana-charcoal/50">
        Avisarme cuando queden: {material.minimumStock} {material.unit}
      </p>

      <Button variant="secondary" size="sm" onClick={onAddPurchase} className="mt-2">
        + AGREGAR COMPRA
      </Button>
    </Card>
  );
}
