// Crea (o reutiliza) el usuario dueño del panel /admin: cuenta en
// Supabase Auth + fila en `profiles` + rol 'owner' en `profile_roles`.
// Requiere SUPABASE_SERVICE_ROLE_KEY en .env.local (bypassa RLS a propósito).
//
// Uso: node --env-file=.env.local scripts/create-admin-user.mjs <email>
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const STORE_ID = "00000000-0000-0000-0000-000000000001";

const email = process.argv[2];
if (!email) {
  console.error("Uso: node --env-file=.env.local scripts/create-admin-user.mjs <email>");
  process.exit(1);
}

function generatePassword() {
  // 16 caracteres, alfabeto legible (sin 0/O/1/l ambiguos), + símbolo fijo.
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(16);
  let pass = "";
  for (let i = 0; i < 16; i++) pass += alphabet[bytes[i] % alphabet.length];
  return pass + "!7";
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function main() {
  const password = generatePassword();

  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Rossana" },
  });

  let userId;
  if (createErr) {
    if (createErr.message?.toLowerCase().includes("already been registered") || createErr.code === "email_exists") {
      console.log(`El usuario ${email} ya existe. Le reseteo la contraseña...`);
      const { data: list, error: listErr } = await supabase.auth.admin.listUsers();
      if (listErr) throw listErr;
      const existing = list.users.find((u) => u.email === email);
      if (!existing) throw new Error("No se encontró el usuario existente para resetear contraseña.");
      userId = existing.id;
      const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, { password });
      if (updateErr) throw updateErr;
    } else {
      throw createErr;
    }
  } else {
    userId = created.user.id;
  }

  await supabase.from("profiles").upsert({ id: userId, store_id: STORE_ID, full_name: "Rossana" });

  const { data: ownerRole, error: roleErr } = await supabase
    .from("roles")
    .select("id")
    .eq("key", "owner")
    .single();
  if (roleErr) throw roleErr;

  await supabase
    .from("profile_roles")
    .upsert({ profile_id: userId, role_id: ownerRole.id, store_id: STORE_ID });

  console.log("\n✅ Usuario admin listo.");
  console.log("Correo:     ", email);
  console.log("Contraseña: ", password);
  console.log("Rol:        ", "owner");
}

main().catch((err) => {
  console.error("\n❌ Falló la creación del usuario admin.");
  console.error(err);
  process.exit(1);
});
