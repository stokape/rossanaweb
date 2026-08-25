import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatea un monto en soles con 2 decimales, ej. "S/ 39.90". */
export function formatSoles(amount: number) {
  return `S/ ${amount.toFixed(2)}`;
}

/** Slug URL-friendly a partir de un nombre (Sección 67: /productos/pulsera-cuarzo-azul, nunca ?id=). */
export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quitar tildes (marcas diacríticas tras NFD)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
