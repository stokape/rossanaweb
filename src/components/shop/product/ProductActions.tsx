"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Minus, MessageCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart/CartProvider";
import { formatSoles } from "@/lib/utils";

interface ProductActionsProps {
  productId: string;
  slug: string;
  name: string;
  sku: string;
  price: number;
  imageUrl: string | null;
  stockAvailable: number;
  whatsappNumber: string | null;
}

/** Sección 21/25/65: cantidad, agregar al carrito, comprar ahora,
 * consultar por WhatsApp con el mensaje pre-armado. */
export function ProductActions({
  productId,
  slug,
  name,
  sku,
  price,
  imageUrl,
  stockAvailable,
  whatsappNumber,
}: ProductActionsProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const outOfStock = stockAvailable <= 0;

  function handleAddToCart() {
    addItem({ productId, slug, name, price, imageUrl, stockAvailable }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    addItem({ productId, slug, name, price, imageUrl, stockAvailable }, quantity);
    router.push("/carrito");
  }

  function handleWhatsApp() {
    if (!whatsappNumber) return;
    const url = typeof window !== "undefined" ? window.location.href : "";
    const message =
      `Hola Rossana, estoy interesado/a en:\n\n` +
      `Producto: ${name}\n` +
      `SKU: ${sku}\n` +
      `Precio: S/${price.toFixed(2)}\n` +
      `Cantidad: ${quantity}\n` +
      `Enlace: ${url}`;
    const digits = whatsappNumber.replace(/\D/g, "");
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(message)}`, "_blank");
  }

  return (
    <div className="flex flex-col gap-4">
      {!outOfStock && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-rossana-charcoal">Cantidad</span>
          <div className="flex items-center rounded-input border border-rossana-border">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex size-11 items-center justify-center text-rossana-charcoal disabled:opacity-30"
              disabled={quantity <= 1}
              aria-label="Disminuir cantidad"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-10 text-center text-base font-medium">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(stockAvailable, q + 1))}
              className="flex size-11 items-center justify-center text-rossana-charcoal disabled:opacity-30"
              disabled={quantity >= stockAvailable}
              aria-label="Aumentar cantidad"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={handleAddToCart}
          disabled={outOfStock}
        >
          {added ? "¡Agregado!" : outOfStock ? "Agotado" : "AGREGAR AL CARRITO"}
        </Button>
        <Button variant="primary" className="flex-1" onClick={handleBuyNow} disabled={outOfStock}>
          COMPRAR AHORA
        </Button>
      </div>

      {whatsappNumber && (
        <Button
          variant="tertiary"
          onClick={handleWhatsApp}
          className="justify-center gap-2 border border-rossana-border"
        >
          <MessageCircle className="size-4" /> CONSULTAR POR WHATSAPP
        </Button>
      )}

      <p className="text-xs text-rossana-charcoal/50">
        Total: {formatSoles(price * quantity)}
      </p>
    </div>
  );
}
