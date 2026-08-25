import { createClient } from "@/lib/supabase/server";
import { ROSSANA_STORE_ID } from "@/lib/queries/site";

export interface StaffMember {
  profileId: string;
  fullName: string | null;
  roleLabel: string;
}

const ROLE_LABELS: Record<string, string> = { owner: "Dueño", staff: "Colaborador" };

/** Usuarios del panel (Sección 63). */
export async function getStaffMembers(): Promise<StaffMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profile_roles")
    .select("profile_id, profiles(full_name), roles(key, name)")
    .eq("store_id", ROSSANA_STORE_ID);

  if (error || !data) return [];

  return data
    .filter((row) => row.profiles && row.roles)
    .map((row) => ({
      profileId: row.profile_id,
      fullName: row.profiles!.full_name,
      roleLabel: ROLE_LABELS[row.roles!.key] ?? row.roles!.name,
    }));
}
