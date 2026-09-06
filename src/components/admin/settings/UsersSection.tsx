"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { inviteStaffAction } from "@/lib/actions/admin/users";
import type { StaffMember } from "@/lib/queries/admin/users";

export function UsersSection({ staff }: { staff: StaffMember[] }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  async function handleInvite() {
    setError(null);
    setTempPassword(null);
    setSaving(true);
    const result = await inviteStaffAction(email, fullName);
    setSaving(false);

    if (!result.ok) {
      setError(result.error ?? "No pudimos crear esta cuenta.");
      return;
    }
    setTempPassword(result.temporaryPassword ?? null);
    setEmail("");
    setFullName("");
  }

  return (
    <Card className="flex flex-col gap-4 p-6">
      <h2 className="text-lg font-semibold text-rossana-charcoal">Usuarios</h2>

      {staff.length > 0 && (
        <ul className="flex flex-col gap-2">
          {staff.map((s) => (
            <li
              key={s.profileId}
              className="flex items-center justify-between rounded-card border border-rossana-border px-4 py-2.5 text-sm"
            >
              <span className="text-rossana-charcoal">{s.fullName ?? "Sin nombre"}</span>
              <Badge tone="neutral">{s.roleLabel}</Badge>
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input label="Nombre" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Input label="Correo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <Button variant="secondary" onClick={handleInvite} loading={saving} className="w-fit">
        + AGREGAR COLABORADOR
      </Button>

      {error && (
        <p className="text-sm text-danger transition-opacity duration-200 ease-[var(--ease-out)] starting:opacity-0 motion-reduce:transition-none">
          {error}
        </p>
      )}
      {tempPassword && (
        <p className="rounded-card bg-rossana-ivory px-4 py-3 text-sm text-rossana-charcoal">
          Cuenta creada. Contraseña temporal: <strong>{tempPassword}</strong> — compártela de forma
          segura, no queda guardada en ningún lado.
        </p>
      )}
    </Card>
  );
}
