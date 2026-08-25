"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ROSSANA_STORE_ID } from "@/lib/queries/site";

interface ActionResult {
  ok: boolean;
  error?: string;
  temporaryPassword?: string;
}

function generateTemporaryPassword() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pass = "";
  for (let i = 0; i < 14; i++) pass += alphabet[Math.floor(Math.random() * alphabet.length)];
  return pass + "!7";
}

/** Invitar colaborador (Sección 63). Solo el dueño puede hacerlo. Usa
 * el cliente con service role (server-only, nunca en el frontend) para
 * crear la cuenta en Supabase Auth — la sesión del solicitante se
 * valida primero con el cliente normal. */
export async function inviteStaffAction(email: string, fullName: string): Promise<ActionResult> {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) return { ok: false, error: "Ingresa un correo válido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tu sesión expiró. Vuelve a ingresar." };

  const { data: ownerRole } = await supabase
    .from("profile_roles")
    .select("profile_id, roles!inner(key)")
    .eq("profile_id", user.id)
    .eq("store_id", ROSSANA_STORE_ID)
    .eq("roles.key", "owner")
    .maybeSingle();

  if (!ownerRole) {
    return { ok: false, error: "Solo el dueño de la tienda puede agregar colaboradores." };
  }

  const admin = createAdminClient();
  const password = generateTemporaryPassword();

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: trimmedEmail,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName || null },
  });

  if (createErr || !created.user) {
    console.error("inviteStaffAction error:", createErr);
    return { ok: false, error: "No pudimos crear esta cuenta. Revisa el correo e inténtalo de nuevo." };
  }

  await admin.from("profiles").upsert({
    id: created.user.id,
    store_id: ROSSANA_STORE_ID,
    full_name: fullName || null,
  });

  const { data: staffRole } = await admin.from("roles").select("id").eq("key", "staff").single();
  if (staffRole) {
    await admin
      .from("profile_roles")
      .upsert({ profile_id: created.user.id, role_id: staffRole.id, store_id: ROSSANA_STORE_ID });
  }

  revalidatePath("/admin/configuracion");
  return { ok: true, temporaryPassword: password };
}
