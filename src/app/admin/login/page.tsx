"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/shop/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

// Login del panel (Sección 38). Sencillo a propósito: solo correo y
// contraseña, sin jerga técnica.
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (signInError) {
      setError("Correo o contraseña incorrectos.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-rossana-ivory px-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-5 rounded-card border border-rossana-border bg-white p-8 shadow-soft"
      >
        <div className="flex flex-col items-center text-center">
          <Logo className="h-10 w-auto" priority />
          <p className="mt-2 text-sm text-rossana-charcoal/60">Panel del negocio</p>
        </div>

        <Input
          label="Correo"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" variant="primary" loading={loading} className="w-full">
          Ingresar
        </Button>
      </form>
    </div>
  );
}
