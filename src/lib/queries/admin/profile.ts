import { createClient } from "@/lib/supabase/server";

export interface AdminProfile {
  userId: string;
  fullName: string | null;
  storeId: string | null;
}

/** Perfil del usuario logueado en /admin. El proxy ya garantiza que
 * hay sesión; esto solo trae el nombre para el saludo (Sección 39). */
export async function getCurrentAdminProfile(): Promise<AdminProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, store_id")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    fullName: profile?.full_name ?? null,
    storeId: profile?.store_id ?? null,
  };
}
