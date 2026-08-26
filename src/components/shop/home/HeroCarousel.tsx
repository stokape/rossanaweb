"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { HeroBanner } from "@/lib/queries/banners";

const AUTO_ADVANCE_MS = 5000;

interface HeroCarouselProps {
  banners: HeroBanner[];
  /** true: cubre todo el contenedor padre (fondo de sección) — el
   * padre debe ser `relative`. false: caja independiente con su
   * propia relación de aspecto (uso original en tarjeta). */
  fill?: boolean;
}

/** Carrusel de fotos reales del Hero (nunca inventadas). Avanza sola
 * cada 5s y se puede navegar con los puntos. */
export function HeroCarousel({ banners, fill = false }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % banners.length), AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const banner = banners[index];
  const image = (
    <Image
      key={banner.id}
      src={banner.imageUrl}
      alt={banner.title ?? "Rossana — Bisutería y Más"}
      fill
      className="object-cover"
      sizes={fill ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
      priority
    />
  );

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        fill ? "absolute inset-0 h-full" : "aspect-[4/3] rounded-card md:aspect-square",
      )}
    >
      {banner.linkUrl ? <Link href={banner.linkUrl}>{image}</Link> : image}

      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === index}
              className={`size-2 rounded-full transition-colors ${
                i === index ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
