import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatea un monto en soles con 2 decimales, ej. "S/ 39.90". */
export function formatSoles(amount: number) {
  return `S/ ${amount.toFixed(2)}`;
}
