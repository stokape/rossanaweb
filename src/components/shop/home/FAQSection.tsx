import { JsonLd } from "@/components/seo/JsonLd";

interface FAQItem {
  question: string;
  answer: string;
}

// Solo hechos confirmados por Rossana (Sección 88: nunca prometer algo
// que el negocio no hace) — sirve tanto para SEO tradicional (rich
// snippet FAQPage) como para que los motores de IA (ChatGPT, Perplexity,
// Google AI Overviews) puedan citar respuestas correctas sobre la
// tienda. El contenido visible de abajo y el JSON-LD dicen lo mismo,
// como exige Google para no ser tratado como spam de datos estructurados.
const FAQS: FAQItem[] = [
  {
    question: "¿Cómo puedo pagar mi pedido?",
    answer:
      "Solo por Yape. Al finalizar tu compra te mostramos los datos para pagar; en cuanto envías tu comprobante, confirmamos tu pedido.",
  },
  {
    question: "¿Necesito crear una cuenta para comprar?",
    answer: "No. Puedes comprar como invitado, sin registrarte.",
  },
  {
    question: "¿Los productos son hechos a mano?",
    answer: "Sí, cada pieza es hecha a mano, con materiales seleccionados.",
  },
  {
    question: "¿Puedo pedir que me lo envuelvan para regalo?",
    answer: "Sí, todos los pedidos incluyen un empaque especial listo para regalar.",
  },
  {
    question: "¿Hacen envíos a todo el Perú?",
    answer:
      "Por ahora hacemos entrega personal en nuestra zona. Escríbenos por WhatsApp para confirmar si llegamos a la tuya.",
  },
];

/** Preguntas frecuentes (SEO + GEO): contenido real y visible, con su
 * JSON-LD FAQPage correspondiente. */
export function FAQSection() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }}
      />
      <h2 className="text-center font-display text-2xl font-semibold text-rossana-charcoal md:text-3xl">
        Preguntas frecuentes
      </h2>
      <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-3">
        {FAQS.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-card border border-rossana-border bg-rossana-white p-4 open:pb-4"
          >
            <summary className="cursor-pointer list-none font-semibold text-rossana-charcoal marker:content-none">
              <span className="flex items-center justify-between gap-4">
                {faq.question}
                <span className="shrink-0 text-rossana-red transition-transform group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className="mt-2 text-sm text-rossana-charcoal/70">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
