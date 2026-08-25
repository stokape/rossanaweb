"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { updatePoliciesAction } from "@/lib/actions/admin/settings";
import type { SiteSettings } from "@/lib/queries/site";

const FIELDS: { key: keyof ReturnType<typeof initial>; label: string; policyKey: string }[] = [
  { key: "envios", label: "Envíos", policyKey: "envios" },
  { key: "cambiosDevoluciones", label: "Cambios y devoluciones", policyKey: "cambios-devoluciones" },
  { key: "privacidad", label: "Privacidad", policyKey: "privacidad" },
  { key: "terminos", label: "Términos y condiciones", policyKey: "terminos" },
];

function initial(settings: SiteSettings) {
  return {
    envios: settings.policies.envios ?? "",
    cambiosDevoluciones: settings.policies["cambios-devoluciones"] ?? "",
    privacidad: settings.policies.privacidad ?? "",
    terminos: settings.policies.terminos ?? "",
  };
}

export function PoliciesSection({ settings }: { settings: SiteSettings }) {
  const [values, setValues] = useState(initial(settings));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    const result = await updatePoliciesAction(values);
    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? "No pudimos guardar las políticas.");
      return;
    }
    setSaved(true);
  }

  return (
    <Card className="flex flex-col gap-4 p-6">
      <h2 className="text-lg font-semibold text-rossana-charcoal">Políticas</h2>
      <p className="-mt-2 text-xs text-rossana-charcoal/50">
        Este texto se muestra en las páginas públicas de políticas (pie de página).
      </p>

      {FIELDS.map((f) => (
        <div key={f.key}>
          <label className="mb-1.5 block text-sm font-medium text-rossana-charcoal">{f.label}</label>
          <textarea
            value={values[f.key]}
            onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            rows={3}
            className="w-full rounded-input border border-rossana-border p-3 text-sm"
          />
        </div>
      ))}

      {error && <p className="text-sm text-danger">{error}</p>}
      {saved && <p className="text-sm text-success">Cambios guardados.</p>}

      <Button variant="primary" onClick={handleSave} loading={saving} className="w-fit">
        GUARDAR CAMBIOS
      </Button>
    </Card>
  );
}
