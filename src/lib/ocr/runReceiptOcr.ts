import { parseReceiptText, type ParsedReceipt } from "@/lib/ocr/parseReceiptText";

export interface OcrResult extends ParsedReceipt {
  confidence: number;
  rawText: string;
}

/**
 * OCR del comprobante (Sección 30). Corre en el navegador con
 * Tesseract.js — gratuito, sin backend adicional (Sección 19: costo
 * fijo inicial S/0). Import dinámico: el bundle de Tesseract no debe
 * cargarse hasta que el comprador realmente suba una foto.
 *
 * REGLA CRÍTICA (Sección 32): esto es solo una AYUDA para pre-llenar
 * el N° de operación. Nunca se usa como validación de pago, y una
 * falla aquí jamás debe bloquear la compra — por eso este helper
 * atrapa sus propios errores y devuelve `null` en vez de lanzar.
 */
export async function runReceiptOcr(file: File): Promise<OcrResult | null> {
  try {
    const { recognize } = await import("tesseract.js");
    const { data } = await recognize(file, "spa");
    const parsed = parseReceiptText(data.text);
    return {
      ...parsed,
      confidence: data.confidence / 100,
      rawText: data.text,
    };
  } catch (err) {
    console.error("OCR de comprobante falló (se usa ingreso manual):", err);
    return null;
  }
}
