/** Fórmulas de costo y precio (Sección 56). markup_percentage se
 * ingresa como porcentaje (50 = 50%), se usa como fracción internamente. */
export interface PricingInput {
  materialsCost: number;
  laborCost: number;
  packagingCost: number;
  otherDirectCost: number;
  markupPercentage: number;
  includeTax: boolean;
  taxRate: number;
}

export interface PricingBreakdown {
  materialsCost: number;
  totalCost: number;
  desiredProfit: number;
  netSuggestedPrice: number;
  tax: number;
  suggestedFinalPrice: number;
}

export function computeSuggestedPrice(input: PricingInput): PricingBreakdown {
  const totalCost =
    input.materialsCost + input.laborCost + input.packagingCost + input.otherDirectCost;
  const desiredProfit = totalCost * (input.markupPercentage / 100);
  const netSuggestedPrice = totalCost + desiredProfit;
  const tax = input.includeTax ? netSuggestedPrice * input.taxRate : 0;
  const suggestedFinalPrice = netSuggestedPrice + tax;

  return {
    materialsCost: input.materialsCost,
    totalCost,
    desiredProfit,
    netSuggestedPrice,
    tax,
    suggestedFinalPrice,
  };
}

export interface ProfitabilityResult {
  profit: number;
  margin: number; // profit / precio de venta
  markup: number; // profit / costo
}

/** markup != margen (Sección 56/58): distintos denominadores. */
export function computeProfitability(totalCost: number, finalPrice: number): ProfitabilityResult {
  const profit = finalPrice - totalCost;
  return {
    profit,
    margin: finalPrice > 0 ? profit / finalPrice : 0,
    markup: totalCost > 0 ? profit / totalCost : 0,
  };
}

export type ProfitabilityAlertLevel = "danger" | "warning" | "success";

/** Sección 59. Umbral de margen bajo: 15% (elegido como referencia
 * conservadora para bisutería; ajustable si Rossana lo pide). */
const LOW_MARGIN_THRESHOLD = 0.15;

export function getProfitabilityAlert(profit: number, margin: number): {
  level: ProfitabilityAlertLevel;
  message: string;
} {
  if (profit < 0) {
    return { level: "danger", message: "Con este precio perderías dinero." };
  }
  if (margin < LOW_MARGIN_THRESHOLD) {
    return { level: "warning", message: "El margen de este producto es bajo." };
  }
  return { level: "success", message: "Este producto tiene rentabilidad positiva." };
}
