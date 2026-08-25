"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";
import { Star, Trash2, UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  addProductImageAction,
  deleteProductImageAction,
  setPrimaryImageAction,
} from "@/lib/actions/admin/products";
import type { AdminProductImage } from "@/lib/queries/admin/product-detail";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

interface PhotoUploaderProps {
  productId: string;
  images: AdminProductImage[];
  imageType: "gallery" | "360";
  label: string;
  hint?: string;
}

/** Fotos (Sección 45) y secuencia 360° (Sección 22) — se suben directo
 * a Supabase Storage (bucket `product-images`, público) y se registran
 * en `product_images`. */
export function PhotoUploader({ productId, images, imageType, label, hint }: PhotoUploaderProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const relevant = images.filter((i) => i.imageType === imageType).sort((a, b) => a.displayOrder - b.displayOrder);

  async function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setError(null);
    setUploading(true);

    try {
      const supabase = createClient();
      let nextOrder = relevant.length;

      for (const file of files) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          setError("Solo se aceptan JPG, PNG o WEBP.");
          continue;
        }
        const ext = file.name.split(".").pop() || "jpg";
        // Nombre de archivo único — corre dentro del handler de "onChange"
        // del input de archivo, nunca durante el render.
        // eslint-disable-next-line react-hooks/purity
        const path = `${productId}/${imageType}-${Date.now()}-${nextOrder}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, file, { contentType: file.type });
        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(path);

        await addProductImageAction(productId, publicUrl, imageType, nextOrder);
        nextOrder += 1;
      }

      router.refresh();
    } catch (err) {
      console.error("Error subiendo fotos:", err);
      setError("No pudimos subir alguna foto. Inténtalo nuevamente.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(imageId: string) {
    await deleteProductImageAction(imageId, productId);
    router.refresh();
  }

  async function handleSetPrimary(imageId: string) {
    await setPrimaryImageAction(imageId, productId);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-rossana-charcoal">{label}</p>
      {hint && <p className="-mt-2 text-xs text-rossana-charcoal/50">{hint}</p>}

      {relevant.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {relevant.map((img) => (
            <div
              key={img.id}
              className="group relative size-24 overflow-hidden rounded-[10px] border border-rossana-border"
            >
              <Image src={img.url} alt="" fill className="object-contain p-1" />
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/0 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
                {imageType === "gallery" && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(img.id)}
                    aria-label="Marcar como principal"
                    className="rounded-full bg-white p-1.5 text-rossana-gold"
                  >
                    <Star className={img.isPrimary ? "size-4 fill-current" : "size-4"} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  aria-label="Eliminar foto"
                  className="rounded-full bg-white p-1.5 text-danger"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              {img.isPrimary && (
                <span className="absolute left-1 top-1 rounded-badge bg-rossana-gold px-1.5 py-0.5 text-[9px] font-semibold text-rossana-charcoal">
                  Principal
                </span>
              )}
            </div>
          ))}
        </div>
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

      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
