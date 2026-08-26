"use client";

import Image from "next/image";
import { useRef, useState, type PointerEvent } from "react";
import { RotateCw } from "lucide-react";
import type { ProductImageItem } from "@/lib/queries/product-detail";

/** Vista 360° (Sección 22): secuencia REAL de fotografías cargadas por
 * el admin, en orden. Arrastrar (mouse) o swipe (touch) para rotar.
 * Nunca se genera un 360° falso. */
export function Spin360Viewer({ images, alt }: { images: ProductImageItem[]; alt: string }) {
  const [frame, setFrame] = useState(0);
  const dragState = useRef<{ startX: number; startFrame: number } | null>(null);

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    dragState.current = { startX: e.clientX, startFrame: frame };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragState.current) return;
    const deltaX = e.clientX - dragState.current.startX;
    const framesPerSweep = images.length; // arrastrar todo el ancho ≈ una vuelta completa
    const step = Math.round((deltaX / 6) % framesPerSweep);
    let next = (dragState.current.startFrame + step) % images.length;
    if (next < 0) next += images.length;
    setFrame(next);
  }

  function handlePointerUp() {
    dragState.current = null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        className="relative aspect-square cursor-grab touch-pan-y select-none overflow-hidden rounded-card bg-rossana-ivory active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <Image
          src={images[frame].url}
          alt={images[frame].alt ?? alt}
          fill
          className="pointer-events-none object-contain p-6"
          sizes="(max-width: 768px) 100vw, 55vw"
          priority
        />
        {/* Overlay fijo sobre la foto: no usa el token --rossana-charcoal
            (se invierte en tema oscuro), necesita quedar siempre oscuro
            para que el texto blanco encima se siga leyendo. */}
        <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-badge bg-[#211a18]/70 px-3 py-1.5 text-xs text-white">
          <RotateCw className="size-3.5" /> Arrastra para rotar
        </div>
      </div>
    </div>
  );
}
