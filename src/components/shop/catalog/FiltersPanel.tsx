"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ChangeEvent } from "react";
import type { CategorySummary, FilterOptions } from "@/lib/queries/catalog";

interface FiltersPanelProps {
  basePath: string;
  categories: CategorySummary[];
  filterOptions: FilterOptions;
  lockedCategorySlug?: string;
  onNavigate?: () => void;
}

/** Filtros del catálogo (Sección 19). Cada control actualiza la URL
 * (?color=..., ?material=..., etc.) — así los resultados son
 * enlazables/compartibles y funcionan con back/forward del navegador. */
export function FiltersPanel({
  basePath,
  categories,
  filterOptions,
  lockedCategorySlug,
  onNavigate,
}: FiltersPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("precio_min") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("precio_max") ?? "");

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("pagina"); // cualquier cambio de filtro reinicia la paginación
    router.push(`${basePath}?${params.toString()}`);
    onNavigate?.();
  }

  function toggleParam(key: string, checked: boolean) {
    updateParam(key, checked ? "1" : null);
  }

  function applyPriceRange() {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("precio_min", minPrice);
    else params.delete("precio_min");
    if (maxPrice) params.set("precio_max", maxPrice);
    else params.delete("precio_max");
    params.delete("pagina");
    router.push(`${basePath}?${params.toString()}`);
    onNavigate?.();
  }

  const handleSelect =
    (key: string) => (e: ChangeEvent<HTMLSelectElement>) => updateParam(key, e.target.value || null);

  return (
    <div className="flex flex-col gap-6">
      {!lockedCategorySlug && categories.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-rossana-charcoal">Categoría</h3>
          <select
            className="h-11 w-full rounded-input border border-rossana-border bg-rossana-warm-white text-rossana-charcoal px-3 text-sm"
            value={searchParams.get("categoria") ?? ""}
            onChange={handleSelect("categoria")}
          >
            <option value="">Todas</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-sm font-semibold text-rossana-charcoal">Precio</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Mín."
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={applyPriceRange}
            className="h-11 w-full rounded-input border border-rossana-border bg-rossana-warm-white text-rossana-charcoal px-3 text-sm"
          />
          <span className="text-rossana-charcoal/40">–</span>
          <input
            type="number"
            min={0}
            placeholder="Máx."
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={applyPriceRange}
            className="h-11 w-full rounded-input border border-rossana-border bg-rossana-warm-white text-rossana-charcoal px-3 text-sm"
          />
        </div>
      </div>

      {filterOptions.colors.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-rossana-charcoal">Color</h3>
          <select
            className="h-11 w-full rounded-input border border-rossana-border bg-rossana-warm-white text-rossana-charcoal px-3 text-sm"
            value={searchParams.get("color") ?? ""}
            onChange={handleSelect("color")}
          >
            <option value="">Todos</option>
            {filterOptions.colors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}

      {filterOptions.materials.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-rossana-charcoal">Material</h3>
          <select
            className="h-11 w-full rounded-input border border-rossana-border bg-rossana-warm-white text-rossana-charcoal px-3 text-sm"
            value={searchParams.get("material") ?? ""}
            onChange={handleSelect("material")}
          >
            <option value="">Todos</option>
            {filterOptions.materials.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2 text-sm text-rossana-charcoal">
          <input
            type="checkbox"
            checked={searchParams.get("en_stock") === "1"}
            onChange={(e) => toggleParam("en_stock", e.target.checked)}
            className="size-4 accent-rossana-red"
          />
          Disponibilidad (solo en stock)
        </label>
        <label className="flex items-center gap-2 text-sm text-rossana-charcoal">
          <input
            type="checkbox"
            checked={searchParams.get("novedades") === "1"}
            onChange={(e) => toggleParam("novedades", e.target.checked)}
            className="size-4 accent-rossana-red"
          />
          Novedades
        </label>
        <label className="flex items-center gap-2 text-sm text-rossana-charcoal">
          <input
            type="checkbox"
            checked={searchParams.get("ofertas") === "1"}
            onChange={(e) => toggleParam("ofertas", e.target.checked)}
            className="size-4 accent-rossana-red"
          />
          Ofertas
        </label>
      </div>
    </div>
  );
}
