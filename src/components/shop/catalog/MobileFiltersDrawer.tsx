"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { CategorySummary, FilterOptions } from "@/lib/queries/catalog";
import { FiltersPanel } from "@/components/shop/catalog/FiltersPanel";

interface MobileFiltersDrawerProps {
  basePath: string;
  categories: CategorySummary[];
  filterOptions: FilterOptions;
  lockedCategorySlug?: string;
}

/** Filtros en drawer para móvil (Sección 11/19). */
export function MobileFiltersDrawer(props: MobileFiltersDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 items-center gap-2 rounded-button border border-rossana-border px-4 text-sm font-medium text-rossana-charcoal"
      >
        <SlidersHorizontal className="size-4" /> Filtros
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/30"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="flex w-[85%] max-w-sm flex-col bg-rossana-warm-white p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-rossana-charcoal">Filtros</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar filtros"
                className="p-2 text-rossana-charcoal"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="overflow-y-auto">
              <FiltersPanel {...props} onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
