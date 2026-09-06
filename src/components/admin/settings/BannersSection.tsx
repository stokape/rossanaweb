"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";
import { ArrowDown, ArrowUp, Trash2, UploadCloud } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";
import {
  createBannerAction,
  deleteBannerAction,
  moveBannerAction,
  toggleBannerActiveAction,
} from "@/lib/actions/admin/banners";
import type { AdminBanner } from "@/lib/queries/admin/banners";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/**
 * Fotos del inicio (Sección 14): el lado derecho del Hero muestra
 * fotos reales de Rossana en vez del motivo decorativo, en cuanto haya
 * al menos una acá. Se recomienda una relación ancha (≈2:1, como
 * 1800×850) para que se vea completa sin recortes feos.
 */
export function BannersSection({ banners }: { banners: AdminBanner[] }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setError(null);
    setUploading(true);

    try {
      const supabase = createClient();
      for (const file of files) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          setError("Solo se aceptan JPG, PNG o WEBP.");
          continue;
        }
        const ext = file.name.split(".").pop() || "jpg";
        const path = `banners/hero-${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("branding")
          .upload(path, file, { contentType: file.type });
        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("branding").getPublicUrl(path);

        await createBannerAction(publicUrl, "hero");
      }
      router.refresh();
    } catch (err) {
      console.error("Error subiendo imagen del inicio:", err);
      setError("No pudimos subir alguna imagen. Inténtalo nuevamente.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(id: string) {
    await deleteBannerAction(id);
    router.refresh();
  }

  async function handleToggle(id: string, active: boolean) {
    await toggleBannerActiveAction(id, !active);
    router.refresh();
  }

  async function handleMove(id: string, direction: "up" | "down") {
    await moveBannerAction(id, direction, "hero");
    router.refresh();
  }

  return (
    <Card className="flex flex-col gap-4 p-6">
      <h2 className="text-lg font-semibold text-rossana-charcoal">Fotos del inicio</h2>
      <p className="-mt-2 text-xs text-rossana-charcoal/50">
        Se muestran rotando en la portada de tu tienda. Funcionan mejor las fotos anchas (formato
        panorámico, como 1800×850).
      </p>

      {banners.length > 0 && (
        <ul className="flex flex-col gap-3">
          {banners.map((banner, i) => (
            <li key={banner.id} className="flex items-center gap-3 rounded-card border border-rossana-border p-2">
              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-[8px] bg-rossana-ivory">
                <Image src={banner.imageUrl} alt="" fill className="object-cover" />
              </div>
              <div className="flex flex-1 items-center gap-2">
                <Badge tone={banner.active ? "success" : "neutral"}>
                  {banner.active ? "Visible" : "Oculta"}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleMove(banner.id, "up")}
                  disabled={i === 0}
                  aria-label="Subir"
                  className="p-1.5 text-rossana-charcoal/50 hover:text-rossana-red disabled:opacity-20"
                >
                  <ArrowUp className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(banner.id, "down")}
                  disabled={i === banners.length - 1}
                  aria-label="Bajar"
                  className="p-1.5 text-rossana-charcoal/50 hover:text-rossana-red disabled:opacity-20"
                >
                  <ArrowDown className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle(banner.id, banner.active)}
                  className="px-2 text-xs font-medium text-rossana-red hover:underline"
                >
                  {banner.active ? "Ocultar" : "Mostrar"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(banner.id)}
                  aria-label="Eliminar"
                  className="p-1.5 text-rossana-charcoal/40 hover:text-danger"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <label className="flex w-fit cursor-pointer items-center gap-2 rounded-button border border-dashed border-rossana-border px-4 py-2.5 text-sm text-rossana-charcoal/60 hover:border-rossana-red">
        <UploadCloud className="size-4" />
        {uploading ? "Subiendo..." : "Subir fotos"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          disabled={uploading}
          onChange={handleFiles}
        />
      </label>

      {error && (
        <p className="text-sm text-danger transition-opacity duration-200 ease-[var(--ease-out)] starting:opacity-0 motion-reduce:transition-none">
          {error}
        </p>
      )}
    </Card>
  );
}
