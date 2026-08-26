"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MaterialCard } from "@/components/admin/materials/MaterialCard";
import { AddPurchaseModal } from "@/components/admin/materials/AddPurchaseModal";
import { AddMaterialModal } from "@/components/admin/materials/AddMaterialModal";
import type { MaterialSummary } from "@/lib/queries/admin/materials";

export function MaterialsPageClient({ materials }: { materials: MaterialSummary[] }) {
  const router = useRouter();
  const [purchaseTarget, setPurchaseTarget] = useState<MaterialSummary | null>(null);
  const [addingMaterial, setAddingMaterial] = useState(false);

  function handleClose() {
    setPurchaseTarget(null);
    setAddingMaterial(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-rossana-charcoal md:text-3xl">
          Mis materiales
        </h1>
        <Button variant="primary" size="sm" onClick={() => setAddingMaterial(true)}>
          <Plus className="size-4" /> AGREGAR MATERIAL
        </Button>
      </div>

      {materials.length === 0 ? (
        <p className="rounded-card border border-dashed border-rossana-border bg-rossana-white px-6 py-16 text-center text-rossana-charcoal/50">
          Todavía no tienes materiales registrados.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onAddPurchase={() => setPurchaseTarget(material)}
            />
          ))}
        </div>
      )}

      {purchaseTarget && <AddPurchaseModal material={purchaseTarget} onClose={handleClose} />}
      {addingMaterial && <AddMaterialModal onClose={handleClose} />}
    </div>
  );
}
