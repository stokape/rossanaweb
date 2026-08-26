import Image from "next/image";

/**
 * Logo oficial de Rossana (Sección 5): script dorado + "BISUTERÍA Y
 * MÁS" + diamante con destello, como asset de imagen — nunca recreado
 * en HTML. Fondo transparente: funciona igual sobre blanco/marfil
 * (header, catálogo) que sobre Rossana Red (footer, hero).
 */
export function Logo({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/brand/logo_rossana.png"
      alt="Rossana — Bisutería y Más"
      width={2172}
      height={724}
      priority={priority}
      className={className}
    />
  );
}
