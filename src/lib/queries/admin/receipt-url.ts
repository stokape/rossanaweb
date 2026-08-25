import { createClient } from "@/lib/supabase/server";

/** El bucket `receipts` es privado (Sección 72): solo staff autenticado
 * puede generar una URL firmada temporal para ver el comprobante. */
export async function getSignedReceiptUrl(path: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("receipts")
    .createSignedUrl(path, 60 * 10); // 10 minutos

  if (error || !data) return null;
  return data.signedUrl;
}
