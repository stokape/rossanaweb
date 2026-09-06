"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateSocialLinksAction } from "@/lib/actions/admin/settings";
import type { SiteSettings } from "@/lib/queries/site";

export function SocialLinksSection({ settings }: { settings: SiteSettings }) {
  const [instagram, setInstagram] = useState(settings.socialLinks.instagram ?? "");
  const [facebook, setFacebook] = useState(settings.socialLinks.facebook ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await updateSocialLinksAction({ instagram, facebook });
    setSaving(false);
    setSaved(true);
  }

  return (
    <Card className="flex flex-col gap-4 p-6">
      <h2 className="text-lg font-semibold text-rossana-charcoal">Redes sociales</h2>
      <Input label="Instagram (link completo)" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
      <Input label="Facebook (link completo)" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
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
