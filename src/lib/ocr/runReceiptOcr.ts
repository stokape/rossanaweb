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
 * Los 3 archivos que Tesseract necesita (worker, motor WASM y datos
 * del idioma español) se sirven desde /tesseract en este mismo sitio,
 * NO desde el CDN por defecto de la librería (cdn.jsdelivr.net): el
 * CSP del sitio (Sección 72) solo permite cargar recursos del propio
 * dominio, así que con las rutas por defecto el OCR fallaba siempre
 * en silencio y el N° de operación nunca se autocompletaba — bug
 * reportado por Rossana.
 *
 * REGLA CRÍTICA (Sección 32): esto es solo una AYUDA para pre-llenar
 * el N° de operación. Nunca se usa como validación de pago, y una
 * falla aquí jamás debe bloquear la compra — por eso este helper
 * atrapa sus propios errores y devuelve `null` en vez de lanzar.
 */
export async function runReceiptOcr(file: File): Promise<OcrResult | null> {
  try {
    const { recognize } = await import("tesseract.js");
    const { data } = await recognize(file, "spa", {
      workerPath: "/tesseract/worker.min.js",
      corePath: "/tesseract/tesseract-core-lstm.wasm.js",
      langPath: "/tesseract/lang-data",
    });
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
