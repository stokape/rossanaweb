export interface ParsedReceipt {
  operationNumber: string | null;
  amount: number | null;
  date: string | null;
}

/** Sección 30: intenta extraer número de operación, monto y fecha del
 * texto reconocido por OCR sobre un comprobante Yape. Heurístico, no
 * garantizado — por eso siempre hay fallback manual (Sección 30/32). */
export function parseReceiptText(text: string): ParsedReceipt {
  const normalized = text.replace(/\s+/g, " ");

  const operationMatch =
    normalized.match(/(?:n[°ºo]?\.?\s*(?:de\s*)?operaci[oó]n|c[oó]digo\s*(?:de\s*)?operaci[oó]n)\s*[:\-]?\s*(\d{6,12})/i) ??
    normalized.match(/\b(\d{8,10})\b/);

  const amountMatch = normalized.match(/S\s*\/\.?\s*([\d,]+\.\d{2})/i);

  const dateMatch = normalized.match(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/);

  return {
    operationNumber: operationMatch ? operationMatch[1] : null,
    amount: amountMatch ? Number(amountMatch[1].replace(/,/g, "")) : null,
    date: dateMatch ? dateMatch[1] : null,
  };
}
