"use client";

import { useState } from "react";
import Image from "next/image";
import { UploadCloud } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { updateBusinessSettingsAction } from "@/lib/actions/admin/settings";
import type { SiteSettings } from "@/lib/queries/site";

export function BusinessSettingsSection({ settings }: { settings: SiteSettings }) {
  const [businessName, setBusinessName] = useState(settings.businessName ?? "");
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber ?? "");
  const [yapeHolderName, setYapeHolderName] = useState(settings.yapeHolderName ?? "");
  const [yapeNumber, setYapeNumber] = useState(settings.yapeNumber ?? "");
  const [yapeQrUrl, setYapeQrUrl] = useState(settings.yapeQrUrl);
  const [yapeInstructions, setYapeInstructions] = useState(settings.yapeInstructions ?? "");
  const [plinHolderName, setPlinHolderName] = useState(settings.plinHolderName ?? "");
  const [plinNumber, setPlinNumber] = useState(settings.plinNumber ?? "");
  const [plinQrUrl, setPlinQrUrl] = useState(settings.plinQrUrl);
  const [plinInstructions, setPlinInstructions] = useState(settings.plinInstructions ?? "");
  const [taxRate, setTaxRate] = useState(Math.round(settings.taxRate * 100));
  const [uploadingQr, setUploadingQr] = useState<"yape" | "plin" | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleQrUpload(method: "yape" | "plin", file: File) {
    setUploadingQr(method);
    setError(null);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "png";
      const path = `${method}-qr-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("branding")
        .upload(path, file, { contentType: file.type, upsert: true });
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from("branding").getPublicUrl(path);
      if (method === "yape") setYapeQrUrl(publicUrl);
      else setPlinQrUrl(publicUrl);
    } catch (err) {
      console.error(err);
      setError("No pudimos subir el QR. Inténtalo nuevamente.");
    } finally {
      setUploadingQr(null);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);

    const result = await updateBusinessSettingsAction({
      businessName,
      whatsappNumber,
      yapeHolderName,
      yapeNumber,
      yapeQrUrl,
      yapeInstructions,
      plinHolderName,
      plinNumber,
      plinQrUrl,
      plinInstructions,
      taxRate: taxRate / 100,
      stockReservationMinutes: 45,
    });

    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? "No pudimos guardar los cambios.");
      return;
    }
    setSaved(true);
  }

  return (
    <Card className="flex flex-col gap-5 p-6">
      <h2 className="text-lg font-semibold text-rossana-charcoal">Datos del negocio</h2>
      <Input label="Nombre del negocio" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />

      <h2 className="mt-2 text-lg font-semibold text-rossana-charcoal">WhatsApp</h2>
      <Input
        label="Número de WhatsApp"
        value={whatsappNumber}
        onChange={(e) => setWhatsappNumber(e.target.value)}
        placeholder="+51 999 999 999"
        hint="Se usa en el botón de WhatsApp de la tienda y en el checkout."
      />

      {/* Yape y Plin (Sección 28/64): ambos son opcionales de forma
          independiente — la tienda muestra al comprador solo los que
          Rossana complete aquí, nunca uno fijo por código. */}
      <h2 className="mt-2 text-lg font-semibold text-rossana-charcoal">Yape</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Nombre del titular" value={yapeHolderName} onChange={(e) => setYapeHolderName(e.target.value)} />
        <Input label="Número Yape" value={yapeNumber} onChange={(e) => setYapeNumber(e.target.value)} />
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-rossana-charcoal">Código QR de Yape</p>
        <div className="flex items-center gap-4">
          {yapeQrUrl && (
            <div className="relative size-20 overflow-hidden rounded-card border border-rossana-border">
              <Image src={yapeQrUrl} alt="QR de Yape" fill className="object-contain p-1" />
            </div>
          )}
          <label className="flex cursor-pointer items-center gap-2 rounded-button border border-dashed border-rossana-border px-4 py-2.5 text-sm text-rossana-charcoal/60 hover:border-rossana-red">
            <UploadCloud className="size-4" />
            {uploadingQr === "yape" ? "Subiendo..." : "Subir QR"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={uploadingQr !== null}
              onChange={(e) => e.target.files?.[0] && handleQrUpload("yape", e.target.files[0])}
            />
          </label>
        </div>
      </div>

      <Input
        label="Instrucciones para el comprador"
        value={yapeInstructions}
        onChange={(e) => setYapeInstructions(e.target.value)}
        placeholder="Realiza el Yape por el monto exacto y luego sube tu comprobante."
      />

      <h2 className="mt-2 text-lg font-semibold text-rossana-charcoal">Plin</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Nombre del titular" value={plinHolderName} onChange={(e) => setPlinHolderName(e.target.value)} />
        <Input label="Número Plin" value={plinNumber} onChange={(e) => setPlinNumber(e.target.value)} />
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-rossana-charcoal">Código QR de Plin</p>
        <div className="flex items-center gap-4">
          {plinQrUrl && (
            <div className="relative size-20 overflow-hidden rounded-card border border-rossana-border">
              <Image src={plinQrUrl} alt="QR de Plin" fill className="object-contain p-1" />
            </div>
          )}
          <label className="flex cursor-pointer items-center gap-2 rounded-button border border-dashed border-rossana-border px-4 py-2.5 text-sm text-rossana-charcoal/60 hover:border-rossana-red">
            <UploadCloud className="size-4" />
            {uploadingQr === "plin" ? "Subiendo..." : "Subir QR"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={uploadingQr !== null}
              onChange={(e) => e.target.files?.[0] && handleQrUpload("plin", e.target.files[0])}
            />
          </label>
        </div>
      </div>

      <Input
        label="Instrucciones para el comprador"
        value={plinInstructions}
        onChange={(e) => setPlinInstructions(e.target.value)}
        placeholder="Realiza el Plin por el monto exacto y luego sube tu comprobante."
      />

      <div className="w-32">
        <Input
          label="IGV (%)"
          type="number"
          min={0}
          max={100}
          value={taxRate}
          onChange={(e) => setTaxRate(Number(e.target.value))}
        />
      </div>

      {error && (
        <p className="text-sm text-danger transition-opacity duration-200 ease-[var(--ease-out)] starting:opacity-0 motion-reduce:transition-none">
          {error}
        </p>
      )}
      {saved && (
        <p className="text-sm text-success transition-opacity duration-200 ease-[var(--ease-out)] starting:opacity-0 motion-reduce:transition-none">
          Cambios guardados.
        </p>
      )}

      <Button variant="primary" onClick={handleSave} loading={saving} className="w-fit">
        GUARDAR CAMBIOS
      </Button>
    </Card>
  );
}
