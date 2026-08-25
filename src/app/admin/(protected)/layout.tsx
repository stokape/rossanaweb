import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { getCurrentAdminProfile } from "@/lib/queries/admin/profile";

/**
 * Layout del panel del emprendedor (Sección 38), aplicado solo a las
 * rutas protegidas — /admin/login vive FUERA de este grupo a propósito
 * (si no, "sin sesión" entraría en loop: login → este layout redirige
 * a login → este layout otra vez).
 *
 * El proxy ya protege /admin/** exigiendo sesión; este layout es la
 * segunda barrera (Sección 72) y trae el nombre para el saludo.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentAdminProfile();
  if (!profile) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-col bg-rossana-ivory md:flex-row">
      <AdminNav fullName={profile.fullName} />
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
