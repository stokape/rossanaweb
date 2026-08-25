import { cn } from "@/lib/utils";

/**
 * Placeholder temporal de marca — Sección 5 exige usar el logo oficial
 * (con diamante y destello) como asset de imagen, nunca recrearlo en
 * HTML. Este wordmark de texto es solo un stand-in mientras se reciben
 * los archivos reales (`logo-primary`, `isotipo`, `favicon`, etc.);
 * reemplazar por <Image> en cuanto lleguen (ver PROJECT_STATUS.md).
 */
export function Wordmark({ tone = "red", className }: { tone?: "red" | "white"; className?: string }) {
  return (
    <span
      className={cn(
        "font-display italic font-semibold leading-none tracking-tight",
        tone === "red" ? "text-rossana-red" : "text-white",
        className,
      )}
    >
      Rossana
      <span className="block font-sans not-italic text-[0.28em] font-semibold tracking-[0.2em] text-rossana-gold">
        BISUTERÍA Y MÁS
      </span>
    </span>
  );
}
