interface PromoBarProps {
  messages: string[];
}

/** Barra promocional (Sección 12). Mensajes 100% configurables desde
 * `site_settings.promo_bar_messages` — nunca hardcodeados, para no
 * afirmar servicios que Rossana no haya confirmado operativamente. */
export function PromoBar({ messages }: PromoBarProps) {
  if (messages.length === 0) return null;

  return (
    <div className="bg-rossana-red text-rossana-warm-white">
      <div className="mx-auto flex max-w-[1440px] items-center justify-center gap-6 px-4 py-2 text-xs font-medium tracking-wide md:text-sm">
        {messages.map((msg, i) => (
          <span key={i} className="whitespace-nowrap">
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
}
