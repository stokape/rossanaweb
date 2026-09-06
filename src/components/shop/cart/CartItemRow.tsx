"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatSoles } from "@/lib/utils";
import { useCart } from "@/lib/cart/CartProvider";
import type { CartItem } from "@/lib/cart/types";

// Duración del fundido de salida al borrar (ver handleRemove) — se
// reusa como el retraso antes de sacar el ítem del array de verdad.
const REMOVE_DURATION_MS = 200;

export function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();
  const [removing, setRemoving] = useState(false);

  // El array del carrito quita el ítem al instante si no hacemos este
  // paso intermedio: no hay forma de animar una salida sobre un
  // elemento que React ya desmontó en el mismo tick. `removing`
  // mantiene el renglón montado el tiempo justo para que se vea el
  // fundido antes de desaparecer de verdad.
  function handleRemove() {
    setRemoving(true);
    setTimeout(() => removeItem(item.productId), REMOVE_DURATION_MS);
  }

  return (
    <div
      className={`flex gap-4 border-b border-rossana-border py-5 last:border-b-0 transition-[opacity,transform] duration-200 ease-[var(--ease-out)] motion-reduce:transition-none ${
        removing ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
    >
      <Link
        href={`/productos/${item.slug}`}
        className="relative size-20 shrink-0 overflow-hidden rounded-[10px] bg-rossana-ivory sm:size-24"
      >
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.name} fill className="object-contain p-2" />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-rossana-charcoal/30">
            Sin foto
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between gap-2">
        <div className="flex justify-between gap-2">
          <Link
            href={`/productos/${item.slug}`}
            className="text-sm font-medium text-rossana-charcoal hover:text-rossana-red sm:text-base"
          >
            {item.name}
          </Link>
          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            aria-label={`Eliminar ${item.name} del carrito`}
            className="text-rossana-charcoal/40 hover:text-rossana-red disabled:opacity-50"
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center rounded-input border border-rossana-border">
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              className="flex size-9 items-center justify-center text-rossana-charcoal"
              aria-label="Disminuir cantidad"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              disabled={item.quantity >= item.stockAvailable}
              className="flex size-9 items-center justify-center text-rossana-charcoal disabled:opacity-30"
              aria-label="Aumentar cantidad"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          <span className="text-sm font-semibold text-rossana-red sm:text-base">
            {formatSoles(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
