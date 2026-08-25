/** Estados visibles de pedido (Sección 34), en lenguaje cotidiano —
 * nunca los códigos internos (esperando_pago, en_preparacion, ...). */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  esperando_pago: "Esperando pago",
  pago_por_validar: "Pago por revisar",
  en_preparacion: "En preparación",
  listo_para_entrega: "Listo para entrega",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export const ORDER_STATUS_EMOJI: Record<string, string> = {
  esperando_pago: "🟡",
  pago_por_validar: "🔴",
  en_preparacion: "🟠",
  listo_para_entrega: "🔵",
  enviado: "🚚",
  entregado: "✅",
  cancelado: "⚫",
};

export function formatOrderStatus(status: string) {
  return `${ORDER_STATUS_EMOJI[status] ?? "•"} ${ORDER_STATUS_LABELS[status] ?? status}`;
}
