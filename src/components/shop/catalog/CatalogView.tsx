import { Breadcrumb, type BreadcrumbItem } from "@/components/shop/catalog/Breadcrumb";
import { FiltersPanel } from "@/components/shop/catalog/FiltersPanel";
import { MobileFiltersDrawer } from "@/components/shop/catalog/MobileFiltersDrawer";
import { SortSelect } from "@/components/shop/catalog/SortSelect";
import { Pagination } from "@/components/shop/catalog/Pagination";
import { ProductCard } from "@/components/shop/ProductCard";
import {
  getActiveCategories,
  getFilterOptions,
  getProducts,
  type ProductFilters,
  type SortOption,
} from "@/lib/queries/catalog";

const PAGE_SIZE = 12;

export interface CatalogViewProps {
  basePath: string;
  title: string;
  breadcrumb: BreadcrumbItem[];
  searchParams: Record<string, string | string[] | undefined>;
  lockedCategorySlug?: string;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const VALID_SORTS: SortOption[] = ["destacados", "recientes", "precio_asc", "precio_desc"];

export async function CatalogView({
  basePath,
  title,
  breadcrumb,
  searchParams,
  lockedCategorySlug,
}: CatalogViewProps) {
  const q = first(searchParams.buscar);
  const categoria = lockedCategorySlug ?? first(searchParams.categoria);
  const precioMin = first(searchParams.precio_min);
  const precioMax = first(searchParams.precio_max);
  const color = first(searchParams.color);
  const material = first(searchParams.material);
  const enStock = first(searchParams.en_stock) === "1";
  const novedades = first(searchParams.novedades) === "1";
  const ofertas = first(searchParams.ofertas) === "1";
  const ordenRaw = first(searchParams.orden);
  const orden = (VALID_SORTS.includes(ordenRaw as SortOption) ? ordenRaw : "destacados") as SortOption;
  const pagina = Math.max(1, Number(first(searchParams.pagina)) || 1);

  const filters: ProductFilters = {
    categorySlug: categoria,
    q,
    minPrice: precioMin ? Number(precioMin) : undefined,
    maxPrice: precioMax ? Number(precioMax) : undefined,
    color,
    material,
    onlyInStock: enStock,
    onlyNew: novedades,
    onlyOffers: ofertas,
    sort: orden,
    page: pagina,
    pageSize: PAGE_SIZE,
  };

  const [{ products, total }, categories, filterOptions] = await Promise.all([
    getProducts(filters),
    getActiveCategories(),
    getFilterOptions(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const urlSearchParams = new URLSearchParams(
    Object.entries(searchParams).flatMap(([key, value]) =>
      value == null ? [] : [[key, Array.isArray(value) ? value[0] : value]],
    ),
  );

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
      <Breadcrumb items={breadcrumb} />

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-rossana-charcoal md:text-3xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-rossana-charcoal/60">
            {total} {total === 1 ? "producto" : "productos"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <MobileFiltersDrawer
            basePath={basePath}
            categories={categories}
            filterOptions={filterOptions}
            lockedCategorySlug={lockedCategorySlug}
          />
          <SortSelect basePath={basePath} />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[240px_1fr]">
        <aside className="hidden md:block">
          <FiltersPanel
            basePath={basePath}
            categories={categories}
            filterOptions={filterOptions}
            lockedCategorySlug={lockedCategorySlug}
          />
        </aside>

        <div>
          {products.length === 0 ? (
            <div className="rounded-card border border-dashed border-rossana-border px-6 py-16 text-center">
              <p className="font-medium text-rossana-charcoal">
                {q
                  ? "No encontramos productos con esa búsqueda."
                  : "No hay productos que coincidan con estos filtros."}
              </p>
              <p className="mt-2 text-sm text-rossana-charcoal/60">
                Prueba con otras palabras, o quita algunos filtros para ver más opciones.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <Pagination
            basePath={basePath}
            searchParams={urlSearchParams}
            currentPage={pagina}
            totalPages={totalPages}
          />
        </div>
      </div>
    </div>
  );
}
