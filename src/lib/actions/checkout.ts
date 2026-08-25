"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ROSSANA_STORE_ID } from "@/lib/queries/site";
import { getShippingCost } from "@/lib/queries/shipping";
import { checkRateLimit } from "@/lib/rate-limit";

const checkoutSchema = z.object({
  firstName: z.string().trim().min(1, "Ingresa tus nombres"),
  lastName: z.string().trim().min(1, "Ingresa tus apellidos"),
  phone: z.string().trim().min(6, "Ingresa un celular válido"),
  email: z.string().trim().email("Ingresa un correo válido"),
  department: z.string().trim().min(1, "Ingresa el departamento"),
  province: z.string().trim().min(1, "Ingresa la provincia"),
  district: z.string().trim().min(1, "Ingresa el distrito"),
  address: z.string().trim().min(1, "Ingresa tu dirección"),
  reference: z.string().trim().optional(),
  instructions: z.string().trim().optional(),
  isGift: z.boolean().optional(),
  giftRecipientName: z.string().trim().optional(),
  giftRecipientPhone: z.string().trim().optional(),
  giftMessage: z.string().trim().optional(),
  giftSpecialPackaging: z.boolean().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1, "Tu carrito está vacío"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

interface CheckoutResult {
  ok: boolean;
  orderId?: string;
  orderNumber?: string;
  error?: string;
}

/** Crea el pedido de invitado (Sección 26-28). Toda la validación se
 * repite server-side (Sección 72) — nunca confiar solo en el form del
 * cliente. El precio/nombre de cada producto lo vuelve a leer
 * `create_guest_order` desde la base de datos, nunca del payload. */
export async function submitCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  // Rate limit best-effort (Sección 72) — ver limitación documentada
  // en src/lib/rate-limit.ts. Máximo 5 pedidos por IP cada 10 minutos.
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimit = checkRateLimit(`checkout:${ip}`, 5, 600);
  if (!rateLimit.allowed) {
    return {
      ok: false,
      error: "Hiciste demasiados pedidos en poco tiempo. Espera unos minutos e inténtalo de nuevo.",
    };
  }

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa los datos ingresados." };
  }
  const data = parsed.data;

  const shippingCost = await getShippingCost(data.department, data.province, data.district);

  const supabase = await createClient();
  const { data: result, error } = await supabase.rpc("create_guest_order", {
    p_store_id: ROSSANA_STORE_ID,
    p_customer: {
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
      email: data.email,
    },
    p_shipping: {
      department: data.department,
      province: data.province,
      district: data.district,
      address_line: data.address,
      reference: data.reference || null,
      instructions: data.instructions || null,
    },
    p_items: data.items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
    p_gift: data.isGift
      ? {
          recipient_name: data.giftRecipientName || null,
          recipient_phone: data.giftRecipientPhone || null,
          message: data.giftMessage || null,
          special_packaging: data.giftSpecialPackaging ?? false,
        }
      : null,
    p_shipping_cost: shippingCost ?? 0,
    p_discount: 0,
  });

  if (error || !result || result.length === 0) {
    // Nunca mostrar el error técnico crudo (Sección 77).
    console.error("submitCheckout error:", error);
    const isStockError = error?.message?.toLowerCase().includes("stock");
    return {
      ok: false,
      error: isStockError
        ? error!.message.replace(/^.*?Stock insuficiente/, "Stock insuficiente")
        : "No pudimos registrar tu pedido. Inténtalo nuevamente.",
    };
  }

  const order = result[0];
  return { ok: true, orderId: order.id, orderNumber: order.order_number };
}
