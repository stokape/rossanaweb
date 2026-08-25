import { createClient } from "@/lib/supabase/server";

export interface OrderPublicItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface OrderPublic {
  order_number: string;
  status: string;
  total: number;
  buyer_first_name: string;
  created_at: string;
  payment_status: string;
  amount_expected: number;
  items: OrderPublicItem[] | null;
}

/**
 * Consulta el estado de un pedido de invitado (Sección 33). El UUID
 * del pedido actúa como token de acceso — nunca se listan todos los
 * pedidos por esta vía, solo uno por id (ver `get_order_public` en
 * supabase/migrations, y la nota de diseño en ARCHITECTURE.md).
 */
export async function getOrderPublic(orderId: string): Promise<OrderPublic | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_order_public", { p_order_id: orderId });
  if (error || !data) return null;
  return data as unknown as OrderPublic;
}
