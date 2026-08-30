"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { updateMaintenanceModeAction } from "@/lib/actions/admin/settings";
import type { SiteSettings } from "@/lib/queries/site";

/** Modo mantenimiento (pedido de Rossana): mientras está activo, los
 * compradores ven una página de "en mantenimiento" en toda la tienda
 * pública en vez del catálogo/checkout — útil para hacer cambios sin
 * que alguien compre a mitad de una actualización. Tú (con sesión
 * iniciada) sigues viendo la tienda con normalidad. */
export function MaintenanceModeSection({ settings }: { settings: SiteSettings }) {
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode);
  const [maintenanceMessage, setMaintenanceMessage] = useState(settings.maintenanceMessage ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);

    const result = await updateMaintenanceModeAction({ maintenanceMode, maintenanceMessage });

    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? "No pudimos guardar los cambios.");
      return;
    }
    setSaved(true);
  }

  return (
    <Card className="flex flex-col gap-4 p-6">
      <div>
        <h2 className="text-lg font-semibold text-rossana-charcoal">Modo mantenimiento</h2>
        <p className="mt-1 text-sm text-rossana-charcoal/60">
          Muestra una página de &quot;en mantenimiento&quot; a tus clientes mientras haces
          cambios en la tienda. Tú sigues viendo todo con normalidad si tienes la sesión
          iniciada.
        </p>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-3 rounded-input border border-rossana-border px-4 py-3">
        <input
          type="checkbox"
          checked={maintenanceMode}
          onChange={(e) => setMaintenanceMode(e.target.checked)}
          className="size-5 accent-rossana-red"
        />
        <span className="text-sm font-medium text-rossana-charcoal">
          {maintenanceMode
            ? "Tienda en mantenimiento (los clientes no pueden comprar)"
            : "Tienda activa"}
        </span>
      </label>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="maintenance-message" className="text-sm font-medium text-rossana-charcoal">
          Mensaje para tus clientes (opcional)
        </label>
        <textarea
          id="maintenance-message"
          value={maintenanceMessage}
          onChange={(e) => setMaintenanceMessage(e.target.value)}
          rows={3}
          placeholder="Estamos actualizando la tienda. ¡Volvemos muy pronto!"
          className="w-full rounded-input border border-rossana-border bg-rossana-warm-white px-4 py-3 text-base placeholder:text-rossana-charcoal/40 focus:outline-none focus:ring-2 focus:ring-rossana-red/40 focus:border-rossana-red"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {saved && <p className="text-sm text-success">Cambios guardados.</p>}

      <Button variant="primary" onClick={handleSave} loading={saving} className="w-fit">
        GUARDAR CAMBIOS
      </Button>
    </Card>
  );
}
