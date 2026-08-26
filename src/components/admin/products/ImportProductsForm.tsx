"use client";

import Papa from "papaparse";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";
import { Download, FileSpreadsheet, UploadCloud } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { bulkImportProductsAction, type ProductImportRow } from "@/lib/actions/admin/products";
import type { CategorySummary } from "@/lib/queries/catalog";

interface PreviewRow {
  csvRow: number;
  data: ProductImportRow;
  error: string | null;
  categoryWarning: string | null;
  priceWarning: string | null;
}

const TRUE_VALUES = new Set(["si", "sí", "sí.", "yes", "true", "1", "x"]);

function parseNumber(raw?: string): number | null {
  if (raw == null) return null;
  let s = raw.trim();
  if (!s) return null;
  if (s.includes(",") && s.includes(".")) {
    s = s.replace(/,/g, "");
  } else if (s.includes(",") && !s.includes(".")) {
    s = s.replace(",", ".");
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Normaliza el nombre de columna del CSV: sin acentos, sin espacios
 * extra, en minúscula — así "Nombre", " nombre ", "NOMBRE" son lo
 * mismo, y no obligamos a Rossana a escribirlo exactamente igual. */
function normalizeKey(key: string): string {
  return key
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

export function ImportProductsForm({ categories }: { categories: CategorySummary[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    created: number;
    failed: { name: string; error?: string }[];
  } | null>(null);

  const categoryNames = new Set(categories.map((c) => c.name.trim().toLowerCase()));

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParseError(null);
    setImportSummary(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeKey,
      complete: (results) => {
        if (results.errors.length > 0) {
          setParseError("No pudimos leer el archivo. Revisa que sea un CSV válido.");
          setRows([]);
          return;
        }

        const parsed: PreviewRow[] = results.data.map((raw, i) => {
          const name = (raw.nombre ?? "").trim();
          const price = parseNumber(raw.precio);
          const compareAtPrice = parseNumber(raw.precio_oferta);
          const stock = parseNumber(raw.stock);
          const weightGrams = parseNumber(raw.peso_gramos);
          const laborCost = parseNumber(raw.costo_mano_obra);
          const packagingCost = parseNumber(raw.costo_empaque);
          const otherDirectCost = parseNumber(raw.costo_otros);
          const markupPercentage = parseNumber(raw.margen_porcentaje);
          const categoryName = (raw.categoria ?? "").trim();
          const destacadoRaw = (raw.destacado ?? "").trim().toLowerCase();
          const incluyeIgvRaw = (raw.incluye_igv ?? "").trim().toLowerCase();

          const hasCostInputs = laborCost != null || packagingCost != null || otherDirectCost != null;

          let error: string | null = null;
          if (!name) error = "Falta el nombre.";
          else if (price != null && price < 0) error = "El precio no es válido.";

          let categoryWarning: string | null = null;
          if (categoryName && !categoryNames.has(categoryName.toLowerCase())) {
            categoryWarning = `La categoría "${categoryName}" no existe todavía — se importará sin categoría.`;
          }
          let priceWarning: string | null = null;
          if (price == null && !hasCostInputs) {
            priceWarning = "Sin precio ni costos: se importará a S/ 0.00, corrígelo después.";
          } else if (price == null) {
            priceWarning = "Sin precio: se calculará solo a partir de los costos y el margen.";
          }

          return {
            csvRow: i + 2,
            error,
            categoryWarning,
            priceWarning,
            data: {
              name,
              categoryName: categoryName || undefined,
              price,
              compareAtPrice: compareAtPrice ?? null,
              color: raw.color?.trim() || undefined,
              material: raw.material?.trim() || undefined,
              dimensions: raw.medidas?.trim() || undefined,
              weightGrams: weightGrams ?? null,
              stock: stock ?? undefined,
              shortDescription: raw.descripcion_corta?.trim() || undefined,
              description: raw.descripcion?.trim() || undefined,
              seoTitle: raw.titulo_seo?.trim() || undefined,
              seoDescription: raw.descripcion_seo?.trim() || undefined,
              featured: TRUE_VALUES.has(destacadoRaw),
              laborCost: laborCost ?? undefined,
              packagingCost: packagingCost ?? undefined,
              otherDirectCost: otherDirectCost ?? undefined,
              markupPercentage: markupPercentage ?? undefined,
              includeTax: incluyeIgvRaw ? TRUE_VALUES.has(incluyeIgvRaw) : undefined,
            },
          };
        });

        setRows(parsed);
      },
      error: () => {
        setParseError("No pudimos leer el archivo. Revisa que sea un CSV válido.");
        setRows([]);
      },
    });

    e.target.value = "";
  }

  const validRows = rows.filter((r) => !r.error);
  const invalidRows = rows.filter((r) => r.error);

  async function handleConfirm() {
    setImporting(true);
    const result = await bulkImportProductsAction(validRows.map((r) => r.data));
    setImporting(false);

    setImportSummary({
      created: result.created,
      failed: result.results.filter((r) => !r.ok).map((r) => ({ name: r.name, error: r.error })),
    });

    if (result.created > 0) {
      setRows([]);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-3 p-6">
        <h2 className="font-semibold text-rossana-charcoal">1. Descarga la plantilla</h2>
        <p className="text-sm text-rossana-charcoal/60">
          Tiene casi todo lo que ves en la ficha de un producto: nombre, categoría,
          descripciones, material, color, medidas, peso, stock, costos, margen, precio y SEO.
          Ábrela en Excel o Google Sheets, complétala (una fila por producto) y guárdala como
          CSV.
        </p>
        <p className="text-sm text-rossana-charcoal/60">
          Dos cosas no van en el archivo, se agregan después en cada producto: las{" "}
          <strong>fotos</strong> y los <strong>&quot;Componentes del producto&quot;</strong>{" "}
          (la receta de materiales para descontar stock automáticamente al fabricar).
        </p>
        <p className="text-sm text-rossana-charcoal/60">
          Si dejas la columna <strong>precio</strong> vacía pero completas los costos y el
          margen, lo calculamos igual que en la ficha de producto.
        </p>
        <a
          href="/plantilla-productos.csv"
          download
          className="inline-flex w-fit items-center gap-2 rounded-button border border-rossana-red px-4 py-2.5 text-sm font-semibold text-rossana-red hover:bg-rossana-red hover:text-rossana-warm-white"
        >
          <Download className="size-4" /> Descargar plantilla (CSV)
        </a>
      </Card>

      <Card className="flex flex-col gap-3 p-6">
        <h2 className="font-semibold text-rossana-charcoal">2. Sube tu archivo completo</h2>
        <label className="flex w-fit cursor-pointer items-center gap-2 rounded-button border border-dashed border-rossana-border px-4 py-2.5 text-sm text-rossana-charcoal/70 hover:border-rossana-red">
          <UploadCloud className="size-4" />
          {fileName ?? "Elegir archivo CSV"}
          <input type="file" accept=".csv" className="hidden" onChange={handleFile} />
        </label>
        {parseError && <p className="text-sm text-danger">{parseError}</p>}
      </Card>

      {rows.length > 0 && (
        <Card className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="size-5 text-rossana-red" />
            <h2 className="font-semibold text-rossana-charcoal">3. Revisa antes de importar</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge tone="success">{validRows.length} listas para importar</Badge>
            {invalidRows.length > 0 && (
              <Badge tone="danger">{invalidRows.length} con error (no se importarán)</Badge>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-rossana-border text-xs uppercase tracking-wide text-rossana-charcoal/50">
                  <th className="py-2 pr-3">Fila</th>
                  <th className="py-2 pr-3">Nombre</th>
                  <th className="py-2 pr-3">Precio</th>
                  <th className="py-2 pr-3">Categoría</th>
                  <th className="py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.csvRow} className="border-b border-rossana-border/60">
                    <td className="py-2 pr-3 text-rossana-charcoal/50">{r.csvRow}</td>
                    <td className="py-2 pr-3 text-rossana-charcoal">{r.data.name || "—"}</td>
                    <td className="py-2 pr-3 text-rossana-charcoal">
                      {r.data.price != null ? `S/ ${r.data.price.toFixed(2)}` : "Se calcula"}
                    </td>
                    <td className="py-2 pr-3 text-rossana-charcoal/70">
                      {r.data.categoryName || "Sin categoría"}
                    </td>
                    <td className="py-2">
                      {r.error ? (
                        <span className="text-danger">{r.error}</span>
                      ) : r.categoryWarning ? (
                        <span className="text-warning">{r.categoryWarning}</span>
                      ) : r.priceWarning ? (
                        <span className="text-warning">{r.priceWarning}</span>
                      ) : (
                        <span className="text-success">Lista</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button
            variant="primary"
            onClick={handleConfirm}
            loading={importing}
            disabled={validRows.length === 0}
            className="w-fit"
          >
            IMPORTAR {validRows.length > 0 ? `${validRows.length} PRODUCTOS` : ""}
          </Button>
        </Card>
      )}

      {importSummary && (
        <Card className="flex flex-col gap-2 p-6">
          <p className="font-semibold text-success">
            {importSummary.created} producto{importSummary.created === 1 ? "" : "s"}{" "}
            importado{importSummary.created === 1 ? "" : "s"} como borrador.
          </p>
          <p className="text-sm text-rossana-charcoal/60">
            Ahora entra a cada uno desde &quot;Mis productos&quot; para agregarle fotos y
            publicarlo.
          </p>
          {importSummary.failed.length > 0 && (
            <div className="mt-2 text-sm text-danger">
              No se pudieron crear: {importSummary.failed.map((f) => f.name).join(", ")}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
