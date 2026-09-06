"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { deleteAllProductsAction } from "@/lib/actions/admin/products";

const CONFIRM_WORD = "ELIMINAR";

/**
 * Zona de peligro (Sección 84 — acción muy sensible, queda auditada):
 * borra TODOS los productos de una sola vez, sin excepción — incluidos
 * los que ya tengan pedidos, movimientos de inventario o carritos
 * asociados (pedido explícito de Rossana: "SE DEBEN ELIMINAR TODO" /
 * "elimina todo", tras ver que la versión anterior archivaba esos
 * casos en vez de borrarlos). Por lo destructivo e irreversible que
 * es, pide escribir la palabra "ELIMINAR" antes de habilitar el botón
 * final — un solo clic de confirmación no alcanza para algo que afecta
 * todo el catálogo y el historial de pedidos que lo referencia.
 */
export function DeleteAllProductsSection({ totalProducts }: { totalProducts: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ deletedCount: number; failedCount: number } | null>(null);

  if (totalProducts === 0) return null;

  async function handleDeleteAll() {
    setDeleting(true);
    setError(null);
    const res = await deleteAllProductsAction();
    setDeleting(false);

    if (!res.ok) {
      setError(res.error ?? "No pudimos eliminar los productos.");
      return;
    }
    setResult({ deletedCount: res.deletedCount, failedCount: res.failedCount });
    setOpen(false);
    setConfirmText("");
    router.refresh();
  }

  return (
    <Card className="flex flex-col gap-4 border-danger/30 p-6">
      <div>
        <h2 className="text-lg font-semibold text-danger">Zona de peligro</h2>
        <p className="mt-1 text-sm text-rossana-charcoal/60">
          Elimina de una sola vez los {totalProducts} producto(s) de tu tienda — todos, sin
          excepción. Si alguno ya tiene pedidos, movimientos de inventario o carritos
          asociados, esas filas también se eliminan para poder borrar el producto. Esta acción
          no se puede deshacer.
        </p>
      </div>

      {result && (
        <p className="text-sm text-success transition-opacity duration-200 ease-[var(--ease-out)] starting:opacity-0 motion-reduce:transition-none">
          Listo: se eliminaron {result.deletedCount} producto(s)
          {result.failedCount > 0 && ` (${result.failedCount} no se pudieron eliminar)`}.
        </p>
      )}
      {error && (
        <p className="text-sm text-danger transition-opacity duration-200 ease-[var(--ease-out)] starting:opacity-0 motion-reduce:transition-none">
          {error}
        </p>
      )}

      {!open ? (
        <Button
          variant="secondary"
          size="sm"
          className="w-fit border-danger text-danger hover:bg-danger hover:text-rossana-warm-white"
          onClick={() => {
            setOpen(true);
            setResult(null);
            setError(null);
          }}
        >
          ELIMINAR TODOS LOS PRODUCTOS
        </Button>
      ) : (
        <div className="flex flex-col gap-3 rounded-card border border-danger/30 bg-danger/5 p-4 origin-left transition-[opacity,transform] duration-200 ease-[var(--ease-out)] starting:scale-95 starting:opacity-0 motion-reduce:transition-none">
          <p className="text-sm text-rossana-charcoal">
            Para confirmar, escribe <span className="font-semibold">{CONFIRM_WORD}</span> abajo:
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={CONFIRM_WORD}
            className="h-12 w-full max-w-xs rounded-input border border-rossana-border bg-rossana-warm-white px-4 text-base focus:outline-none focus:ring-2 focus:ring-danger/40 focus:border-danger"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setOpen(false);
                setConfirmText("");
              }}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              loading={deleting}
              disabled={confirmText.trim().toUpperCase() !== CONFIRM_WORD}
              onClick={handleDeleteAll}
              className="bg-danger text-rossana-warm-white hover:bg-danger/90"
            >
              Sí, eliminar todo
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
