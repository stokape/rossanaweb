"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { HeroBanner } from "@/lib/queries/banners";

const AUTO_ADVANCE_MS = 5000;

/** Carrusel de fotos reales del Hero (Sección 14/22-style: secuencia
 * real, nunca inventada). Avanza sola cada 5s y se puede navegar con
 * los puntos. */
export function HeroCarousel({ banners }: { banners: HeroBanner[] }) {
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
      sizes="(max-width: 768px) 100vw, 50vw"
      priority
    />
  );

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card md:aspect-square">
      {banner.linkUrl ? <Link href={banner.linkUrl}>{image}</Link> : image}

      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
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
