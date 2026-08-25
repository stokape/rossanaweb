import { BusinessSettingsSection } from "@/components/admin/settings/BusinessSettingsSection";
import { CategoriesSection } from "@/components/admin/settings/CategoriesSection";
import { ShippingZonesSection } from "@/components/admin/settings/ShippingZonesSection";
import { PoliciesSection } from "@/components/admin/settings/PoliciesSection";
import { SocialLinksSection } from "@/components/admin/settings/SocialLinksSection";
import { UsersSection } from "@/components/admin/settings/UsersSection";
import { getSiteSettings } from "@/lib/queries/site";
import { getAllCategoriesForAdmin, getShippingZonesForAdmin } from "@/lib/queries/admin/categories";
import { getStaffMembers } from "@/lib/queries/admin/users";

// Configuración (Sección 63-65). Nada aquí está hardcodeado en el
// código — todo se guarda en site_settings/categories/shipping_zones.
export default async function AdminConfiguracionPage() {
  const [settings, categories, zones, staff] = await Promise.all([
    getSiteSettings(),
    getAllCategoriesForAdmin(),
    getShippingZonesForAdmin(),
    getStaffMembers(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-rossana-charcoal md:text-3xl">
        Configuración
      </h1>

      <BusinessSettingsSection settings={settings} />
      <CategoriesSection categories={categories} />
      <ShippingZonesSection zones={zones} />
      <SocialLinksSection settings={settings} />
      <PoliciesSection settings={settings} />
      <UsersSection staff={staff} />
    </div>
  );
}
