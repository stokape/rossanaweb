import { MaterialsPageClient } from "@/components/admin/materials/MaterialsPageClient";
import { getMaterials } from "@/lib/queries/admin/materials";

// "Mis materiales" (Sección 46-48).
export default async function AdminMaterialesPage() {
  const materials = await getMaterials();
  return <MaterialsPageClient materials={materials} />;
}
