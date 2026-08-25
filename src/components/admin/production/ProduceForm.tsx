"use client";

import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  fetchProductComponentsAction,
  registerProductionAction,
} from "@/lib/actions/admin/production";
import type { ProducibleProduct, ProductComponentRequirement } from "@/lib/queries/admin/production";

interface ProduceFormProps {
  products: ProducibleProduct[];
}

/** "Hacer productos" (Sección 52-53). */
export function ProduceForm({ products }: ProduceFormProps) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [components, setComponents] = useState<ProductComponentRequirement[]>([]);
  const [loadingComponents, setLoadingComponents] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!productId) return;
    // Carga los componentes al cambiar de producto seleccionado — no
    // hay forma de evitar el setState aquí sin duplicar la consulta
    // en el server component padre.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingComponents(true);
    setSuccess(null);
    fetchProductComponentsAction(productId)
      .then(setComponents)
      .finally(() => setLoadingComponents(false));
  }, [productId]);

  const selectedProduct = products.find((p) => p.id === productId);

  async function handleSubmit() {
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    const result = await registerProductionAction(productId, quantity);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? "No pudimos registrar la fabricación.");
      return;
    }
    setSuccess(`Registraste ${quantity} ${selectedProduct?.name ?? "producto(s)"}.`);
    // refrescar disponibilidad de materiales tras consumir stock
    fetchProductComponentsAction(productId).then(setComponents);
  }

  if (products.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-rossana-border bg-white px-6 py-16 text-center text-rossana-charcoal/50">
        Todavía no tienes productos con componentes definidos. Agrega los componentes desde
        &ldquo;Mis productos&rdquo; para poder fabricar.
      </p>
    );
  }

  return (
    <Card className="flex max-w-lg flex-col gap-5 p-6">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-rossana-charcoal">
          ¿Qué producto hiciste?
        </label>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="h-12 w-full rounded-input border border-rossana-border px-4 text-base"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-rossana-charcoal">
          ¿Cuántos hiciste?
        </label>
        <div className="flex items-center rounded-input border border-rossana-border w-fit">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex size-12 items-center justify-center text-rossana-charcoal"
            aria-label="Disminuir"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-12 text-center text-base font-medium">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="flex size-12 items-center justify-center text-rossana-charcoal"
            aria-label="Aumentar"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      {loadingComponents ? (
        <p className="text-sm text-rossana-charcoal/50">Calculando...</p>
      ) : components.length > 0 ? (
        <div className="rounded-card bg-rossana-ivory p-4">
          <p className="mb-2 text-sm font-medium text-rossana-charcoal">
            Para hacer {quantity} necesitas:
          </p>
          <ul className="flex flex-col gap-1 text-sm">
            {components.map((c) => {
              const needed = c.quantityRequired * quantity;
              const enough = c.currentStock >= needed;
              return (
                <li
                  key={c.materialId}
                  className={enough ? "text-rossana-charcoal" : "text-danger"}
                >
                  {enough ? "✓" : "✗"} {Math.round(needed * 100) / 100} {c.unit} de {c.materialName}
                  {!enough &&
                    ` (te faltan ${Math.round((needed - c.currentStock) * 100) / 100})`}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {error && <p className="text-sm text-danger">{error}</p>}
      {success && <p className="text-sm text-success">{success}</p>}

      <Button variant="primary" onClick={handleSubmit} loading={submitting} className="w-full">
        REGISTRAR {quantity} {selectedProduct?.name?.toUpperCase() ?? ""}
      </Button>
    </Card>
  );
}
