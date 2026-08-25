"use client";

import Image from "next/image";
import { useState } from "react";
import { X, ZoomIn } from "lucide-react";
import { Spin360Viewer } from "@/components/shop/product/Spin360Viewer";
import type { ProductImageItem } from "@/lib/queries/product-detail";

interface ProductGalleryProps {
  productName: string;
  galleryImages: ProductImageItem[];
  spinImages: ProductImageItem[];
}

// Con menos fotos que esto, la vista 360° no aporta (poco realista) —
// Sección 22 exige una secuencia real, no simularla.
const MIN_SPIN_FRAMES = 8;

export function ProductGallery({ productName, galleryImages, spinImages }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mode, setMode] = useState<"gallery" | "360">("gallery");
  const [zoomOpen, setZoomOpen] = useState(false);
  const hasSpin = spinImages.length >= MIN_SPIN_FRAMES;

  if (galleryImages.length === 0 && !hasSpin) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-card bg-rossana-ivory text-sm text-rossana-charcoal/40">
        Fotos próximamente
      </div>
    );
  }

  const activeImage = galleryImages[activeIndex] ?? galleryImages[0];

  return (
    <div className="flex flex-col gap-3">
      {hasSpin && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("gallery")}
            className={`rounded-badge px-3 py-1.5 text-xs font-semibold ${
              mode === "gallery" ? "bg-rossana-red text-white" : "bg-rossana-ivory text-rossana-charcoal"
            }`}
          >
            Fotos
          </button>
          <button
            type="button"
            onClick={() => setMode("360")}
            className={`rounded-badge px-3 py-1.5 text-xs font-semibold ${
              mode === "360" ? "bg-rossana-red text-white" : "bg-rossana-ivory text-rossana-charcoal"
            }`}
          >
            Vista 360°
          </button>
        </div>
      )}

      {mode === "360" && hasSpin ? (
        <Spin360Viewer images={spinImages} alt={productName} />
      ) : (
        <>
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            className="group relative aspect-square overflow-hidden rounded-card bg-rossana-ivory"
            aria-label="Ampliar imagen"
          >
            {activeImage && (
              <Image
                src={activeImage.url}
                alt={activeImage.alt ?? productName}
                fill
                className="object-contain p-6"
                sizes="(max-width: 768px) 100vw, 55vw"
                priority
              />
            )}
            <span className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-white/90 text-rossana-charcoal opacity-0 transition-opacity group-hover:opacity-100">
              <ZoomIn className="size-4" />
            </span>
          </button>

          {galleryImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {galleryImages.map((img, i) => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={`relative size-16 shrink-0 overflow-hidden rounded-[8px] border ${
                    i === activeIndex ? "border-rossana-red" : "border-rossana-border"
                  }`}
                  aria-label={`Ver foto ${i + 1}`}
                  aria-current={i === activeIndex}
                >
                  <Image src={img.url} alt={img.alt ?? productName} fill className="object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {zoomOpen && activeImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={() => setZoomOpen(false)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 text-white"
            aria-label="Cerrar"
            onClick={() => setZoomOpen(false)}
          >
            <X className="size-7" />
          </button>
          <div className="relative h-full w-full max-w-2xl">
            <Image
              src={activeImage.url}
              alt={activeImage.alt ?? productName}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </div>
  );
}
