import { createClient } from "@/lib/supabase/server";
import { ROSSANA_STORE_ID } from "@/lib/queries/site";
import type { OrderStatus } from "@/types/database";

export type OrderFilter = "todos" | "por_revisar" | "preparando" | "enviados" | "entregados";

export interface AdminOrderSummary {
  id: string;
  orderNumber: string;
  buyerName: string;
  firstItemLabel: string;
  extraItemsCount: number;
  total: number;
  status: string;
}

const FILTER_STATUS: Record<Exclude<OrderFilter, "todos">, OrderStatus> = {
  por_revisar: "pago_por_validar",
  preparando: "en_preparacion",
  enviados: "enviado",
  entregados: "entregado",
};

/** Lista de pedidos del admin (Sección 40). */
export async function getOrdersForAdmin(filter: OrderFilter): Promise<AdminOrderSummary[]> {
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select(
      "id, order_number, buyer_first_name, buyer_last_name, total, status, order_items(product_name, quantity)",
    )
    .eq("store_id", ROSSANA_STORE_ID)
    .order("created_at", { ascending: false });

  if (filter !== "todos") {
    query = query.eq("status", FILTER_STATUS[filter]);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((o) => {
    const items = o.order_items ?? [];
    const first = items[0];
    return {
      id: o.id,
      orderNumber: o.order_number,
      buyerName: `${o.buyer_first_name} ${o.buyer_last_name}`,
      firstItemLabel: first ? `${first.product_name} × ${first.quantity}` : "",
      extraItemsCount: Math.max(0, items.length - 1),
      total: Number(o.total),
      status: o.status,
    };
  });
}

export interface AdminOrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  buyerFirstName: string;
  buyerLastName: string;
  buyerPhone: string;
  buyerEmail: string;
  shippingDepartment: string;
  shippingProvince: string;
  shippingDistrict: string;
  shippingAddress: string;
  shippingReference: string | null;
  shippingInstructions: string | null;
  isGift: boolean;
  giftRecipientName: string | null;
  giftRecipientPhone: string | null;
  giftMessage: string | null;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  items: { productName: string; sku: string | null; quantity: number; unitPrice: number; subtotal: number }[];
  payment: {
    id: string;
    method: string;
    status: string;
    amountExpected: number;
  } | null;
  receipt: {
    id: string;
    fileUrl: string;
    operationNumber: string | null;
    operationNumberSource: string | null;
    amountDetected: number | null;
    operationDateDetected: string | null;
    isPossibleDuplicate: boolean;
    createdAt: string;
  } | null;
}

/** Detalle de pedido + pago + comprobante para "Validar Yape" (Sección 41). */
export async function getOrderDetailForAdmin(orderId: string): Promise<AdminOrderDetail | null> {
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `id, order_number, status, created_at,
       buyer_first_name, buyer_last_name, buyer_phone, buyer_email,
       shipping_department, shipping_province, shipping_district, shipping_address,
       shipping_reference, shipping_instructions,
       is_gift, gift_recipient_name, gift_recipient_phone, gift_message,
       subtotal, shipping_cost, discount, total,
       order_items (product_name, sku, quantity, unit_price, subtotal),
       payments (id, method, status, amount_expected, payment_receipts (id, file_url, operation_number, operation_number_source, amount_detected, operation_date_detected, is_possible_duplicate, created_at))`,
    )
    .eq("id", orderId)
    .eq("store_id", ROSSANA_STORE_ID)
    .maybeSingle();

  if (error || !order) return null;

  const payment = order.payments?.[0] ?? null;
  const receipts = payment?.payment_receipts ?? [];
  const latestReceipt = receipts.length > 0 ? receipts[receipts.length - 1] : null;

  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    createdAt: order.created_at,
    buyerFirstName: order.buyer_first_name,
    buyerLastName: order.buyer_last_name,
    buyerPhone: order.buyer_phone,
    buyerEmail: order.buyer_email,
    shippingDepartment: order.shipping_department,
    shippingProvince: order.shipping_province,
    shippingDistrict: order.shipping_district,
    shippingAddress: order.shipping_address,
    shippingReference: order.shipping_reference,
    shippingInstructions: order.shipping_instructions,
    isGift: order.is_gift,
    giftRecipientName: order.gift_recipient_name,
    giftRecipientPhone: order.gift_recipient_phone,
    giftMessage: order.gift_message,
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shipping_cost),
    discount: Number(order.discount),
    total: Number(order.total),
    items: (order.order_items ?? []).map((i) => ({
      productName: i.product_name,
      sku: i.sku,
      quantity: i.quantity,
      unitPrice: Number(i.unit_price),
      subtotal: Number(i.subtotal),
    })),
    payment: payment
      ? {
          id: payment.id,
          method: payment.method,
          status: payment.status,
          amountExpected: Number(payment.amount_expected),
        }
      : null,
    receipt: latestReceipt
      ? {
          id: latestReceipt.id,
          fileUrl: latestReceipt.file_url,
          operationNumber: latestReceipt.operation_number,
          operationNumberSource: latestReceipt.operation_number_source,
          amountDetected:
            latestReceipt.amount_detected != null ? Number(latestReceipt.amount_detected) : null,
          operationDateDetected: latestReceipt.operation_date_detected,
          isPossibleDuplicate: latestReceipt.is_possible_duplicate,
          createdAt: latestReceipt.created_at,
        }
      : null,
  };
}
