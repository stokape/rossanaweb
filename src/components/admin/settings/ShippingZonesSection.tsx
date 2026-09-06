"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatSoles } from "@/lib/utils";
import { createShippingZoneAction, deleteShippingZoneAction } from "@/lib/actions/admin/shipping";
import type { AdminShippingZone } from "@/lib/queries/admin/categories";

export function ShippingZonesSection({ zones }: { zones: AdminShippingZone[] }) {
  const router = useRouter();
  const [department, setDepartment] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [cost, setCost] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    setError(null);
    setSaving(true);
    const result = await createShippingZoneAction({
      department,
      province: province || undefined,
      district: district || undefined,
      cost: Number(cost) || 0,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? "No pudimos guardar esta zona.");
      return;
    }
    setDepartment("");
    setProvince("");
    setDistrict("");
    setCost("");
    router.refresh();
  }

  async function handleDelete(id: string) {
    await deleteShippingZoneAction(id);
    router.refresh();
  }

  return (
    <Card className="flex flex-col gap-4 p-6">
      <h2 className="text-lg font-semibold text-rossana-charcoal">Envíos</h2>
      <p className="-mt-2 text-xs text-rossana-charcoal/50">
        Define el costo de envío por departamento (o más específico, por provincia/distrito). Si
        una zona no está aquí, el checkout mostrará &ldquo;a coordinar&rdquo;.
      </p>

      {zones.length > 0 && (
        <ul className="flex flex-col gap-2">
          {zones.map((z) => (
            <li
              key={z.id}
              className="flex items-center justify-between rounded-card border border-rossana-border px-4 py-2.5 text-sm"
            >
              <span className="text-rossana-charcoal">
                {[z.district, z.province, z.department].filter(Boolean).join(", ")} —{" "}
                <strong>{formatSoles(z.cost)}</strong>
              </span>
              <button
                type="button"
                onClick={() => handleDelete(z.id)}
                aria-label="Eliminar zona"
                className="text-rossana-charcoal/40 hover:text-danger"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:items-end">
        <Input label="Departamento" value={department} onChange={(e) => setDepartment(e.target.value)} />
        <Input label="Provincia (opcional)" value={province} onChange={(e) => setProvince(e.target.value)} />
        <Input label="Distrito (opcional)" value={district} onChange={(e) => setDistrict(e.target.value)} />
        <Input label="Costo (S/)" type="number" min={0} value={cost} onChange={(e) => setCost(e.target.value)} />
      </div>
      <Button variant="secondary" onClick={handleAdd} loading={saving} className="w-fit">
        + AGREGAR ZONA
      </Button>
      {error && (
        <p className="text-sm text-danger transition-opacity duration-200 ease-[var(--ease-out)] starting:opacity-0 motion-reduce:transition-none">
          {error}
        </p>
      )}
    </Card>
  );
}
