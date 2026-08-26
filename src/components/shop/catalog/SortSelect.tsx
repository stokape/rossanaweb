"use client";

import { useRouter, useSearchParams } from "next/navigation";

const OPTIONS: { value: string; label: string }[] = [
  { value: "destacados", label: "Destacados" },
  { value: "recientes", label: "Más recientes" },
  { value: "precio_asc", label: "Precio: menor a mayor" },
  { value: "precio_desc", label: "Precio: mayor a menor" },
];

/** Orden del catálogo (Sección 19). */
export function SortSelect({ basePath }: { basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <select
      className="h-11 rounded-input border border-rossana-border bg-rossana-white text-rossana-charcoal px-3 text-sm"
      value={searchParams.get("orden") ?? "destacados"}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("orden", e.target.value);
        params.delete("pagina");
        router.push(`${basePath}?${params.toString()}`);
      }}
      aria-label="Ordenar productos"
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
