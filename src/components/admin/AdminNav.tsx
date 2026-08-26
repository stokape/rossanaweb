"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ClipboardList,
  Gem,
  Hammer,
  Home,
  LogOut,
  Menu,
  Package,
  Settings,
  X,
} from "lucide-react";
import { Logo } from "@/components/shop/Logo";
import { createClient } from "@/lib/supabase/client";

// Máximo 5 módulos operativos principales + Configuración aparte
// (Sección 38). Nombres en lenguaje cotidiano, nunca jerga técnica.
const NAV_ITEMS = [
  { label: "Inicio", href: "/admin", icon: Home },
  { label: "Pedidos", href: "/admin/pedidos", icon: ClipboardList },
  { label: "Mis productos", href: "/admin/productos", icon: Package },
  { label: "Mis materiales", href: "/admin/materiales", icon: Gem },
  { label: "Hacer productos", href: "/admin/fabricar", icon: Hammer },
];

export function AdminNav({ fullName }: { fullName: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  function isActive(href: string) {
    return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  }

  const linkClass = (href: string) =>
    `flex items-center gap-3 rounded-button px-4 py-3 text-base font-medium transition-colors ${
      isActive(href)
        ? "bg-rossana-red text-white"
        : "text-rossana-charcoal hover:bg-rossana-ivory"
    }`;

  const navContent = (
    <>
      <div className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={linkClass(item.href)}
            onClick={() => setMenuOpen(false)}
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-1 border-t border-rossana-border pt-4">
        <Link
          href="/admin/configuracion"
          className={linkClass("/admin/configuracion")}
          onClick={() => setMenuOpen(false)}
        >
          <Settings className="size-5" />
          Configuración
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-button px-4 py-3 text-base font-medium text-rossana-charcoal/60 hover:bg-rossana-ivory"
        >
          <LogOut className="size-5" />
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Header móvil */}
      <div className="flex items-center justify-between border-b border-rossana-border bg-white px-4 py-3 md:hidden">
        <Logo className="h-7 w-auto" />
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menú"
          className="p-2 text-rossana-charcoal"
        >
          <Menu className="size-6" />
        </button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="flex-1 bg-black/30" onClick={() => setMenuOpen(false)} aria-hidden />
          <div className="flex w-72 flex-col gap-6 bg-white p-5">
            <div className="flex items-center justify-between">
              <Logo className="h-7 w-auto" />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Cerrar menú"
                className="p-2 text-rossana-charcoal"
              >
                <X className="size-5" />
              </button>
            </div>
            {fullName && <p className="text-sm text-rossana-charcoal/60">Hola, {fullName}</p>}
            {navContent}
          </div>
        </div>
      )}

      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col gap-6 border-r border-rossana-border bg-white p-5 md:flex">
        <Logo className="h-7 w-auto" />
        {fullName && <p className="-mt-3 text-sm text-rossana-charcoal/60">Hola, {fullName}</p>}
        {navContent}
      </aside>
    </>
  );
}
