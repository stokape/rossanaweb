import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Cliente administrativo con SUPABASE_SERVICE_ROLE_KEY.
 *
 * ⚠️ SOLO server-side. El import "server-only" rompe el build si algún
 * componente de cliente intenta importar este archivo.
 *
 * Uso exclusivo para operaciones que deben saltar RLS de forma controlada
 * y auditada (p. ej. confirmar un pago Yape). Toda llamada debe validar
 * primero el rol del usuario autenticado con el cliente normal.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
