"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/**
 * "Retroceder un paso atrás" en el flujo de compra (pedido directo de
 * Rossana): usa el historial del navegador, así que siempre vuelve a
 * la pantalla real de la que vino el comprador, sin asumir una
 * ubicación fija. Puramente navegación — no deshace ningún dato ni
 * pedido ya creado.
 */
export function BackLink({ label = "Volver", fallbackHref }: { label?: string; fallbackHref?: string }) {
  const router = useRouter();

  function handleClick() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else if (fallbackHref) {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mb-4 inline-flex items-center gap-1 text-sm text-rossana-charcoal/60 hover:text-rossana-red"
    >
      <ArrowLeft className="size-4" /> {label}
    </button>
  );
}
