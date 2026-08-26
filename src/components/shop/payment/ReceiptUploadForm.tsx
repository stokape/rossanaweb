"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ChangeEvent } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { runReceiptOcr, type OcrResult } from "@/lib/ocr/runReceiptOcr";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024;

export function ReceiptUploadForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrRunning, setOcrRunning] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [operationNumber, setOperationNumber] = useState("");
  const [operationSource, setOperationSource] = useState<"ocr" | "manual">("manual");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setError(null);
    setOcrResult(null);
    setOperationNumber("");
    setOperationSource("manual");

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError("Formato no permitido. Usa JPG, PNG o WEBP.");
      return;
    }
    if (selected.size > MAX_SIZE_BYTES) {
      setError("La imagen es demasiado pesada (máximo 8 MB).");
      return;
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));

    // OCR es solo una ayuda (Sección 30/32): si falla, no bloquea nada.
    setOcrRunning(true);
    const result = await runReceiptOcr(selected);
    setOcrRunning(false);
    if (result?.operationNumber) {
      setOcrResult(result);
      setOperationNumber(result.operationNumber);
      setOperationSource("ocr");
    }
  }

  async function handleSubmit() {
    if (!file) {
      setError("Sube tu comprobante para continuar.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${orderId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(path, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      const { error: rpcError } = await supabase.rpc("submit_payment_receipt", {
        p_order_id: orderId,
        p_file_url: path,
        p_mime_type: file.type,
        p_file_size_bytes: file.size,
        p_operation_number: operationNumber || null,
        p_operation_number_source: operationNumber ? operationSource : null,
        p_amount_detected: ocrResult?.amount ?? null,
        p_operation_date_detected: null,
        p_ocr_confidence: ocrResult?.confidence ?? null,
        p_ocr_raw_data: ocrResult ? { text: ocrResult.rawText } : null,
      });

      if (rpcError) throw rpcError;

      router.push(`/pedido/${orderId}/confirmacion`);
    } catch (err) {
      console.error("Error al subir comprobante:", err);
      setError("No pudimos subir tu comprobante. Inténtalo nuevamente.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-4 rounded-card border border-rossana-border bg-rossana-warm-white p-6">
      <h2 className="text-sm font-semibold text-rossana-charcoal">Sube tu comprobante</h2>

      {previewUrl ? (
        // <img> nativo a propósito: es un blob: URL local del archivo
        // recién elegido, next/image no lo acepta (espera http(s)/data).
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt="Vista previa del comprobante"
          className="mx-auto h-48 w-48 rounded-card border border-rossana-border object-contain"
        />
      ) : (
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-card border border-dashed border-rossana-border px-6 py-10 text-center text-sm text-rossana-charcoal/60 hover:border-rossana-red">
          <UploadCloud className="size-8 text-rossana-charcoal/30" />
          Toca para elegir tu captura de Yape (JPG, PNG o WEBP)
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      )}

      {previewUrl && (
        <label className="text-center text-xs font-medium text-rossana-red hover:underline">
          <span className="cursor-pointer">Cambiar foto</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      )}

      {ocrRunning && (
        <p className="flex items-center justify-center gap-2 text-sm text-rossana-charcoal/50">
          <Loader2 className="size-4 animate-spin" /> Analizando comprobante...
        </p>
      )}

      {file && !ocrRunning && (
        <div>
          <Input
            label={
              operationSource === "ocr"
                ? "N.º de operación detectado (puedes corregirlo)"
                : "N.º de operación"
            }
            value={operationNumber}
            onChange={(e) => {
              setOperationNumber(e.target.value);
              setOperationSource("manual");
            }}
            placeholder="Ej. 12345678"
          />
        </div>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button variant="primary" onClick={handleSubmit} loading={submitting} disabled={!file}>
        YA REALICÉ MI YAPE
      </Button>
    </div>
  );
}
