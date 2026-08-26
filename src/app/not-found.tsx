import Link from "next/link";
import { Sparkle } from "lucide-react";
import { Logo } from "@/components/shop/Logo";

// 404 raíz: cubre cualquier URL que no coincide con ninguna ruta en
// absoluto (typos, enlaces rotos externos). El 404 con Header/Footer
// completos vive en (shop)/not-found.tsx y cubre los casos más
// comunes (producto o categoría inexistente vía notFound()); este es
// una versión mínima autocontenida para cuando ni siquiera se llega a
// entrar al layout de la tienda.
export default function RootNotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 py-16 text-center md:px-8">
      <Link href="/" className="mb-8">
        <Logo className="h-10 w-auto" />
      </Link>
      <Sparkle className="size-8 text-rossana-gold" aria-hidden />
      <p className="mt-4 font-display text-7xl font-semibold text-rossana-red md:text-8xl">
        404
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-rossana-burgundy md:text-3xl">
        No encontramos esta página
      </h1>
      <p className="mt-3 max-w-md text-rossana-charcoal/70">
        Puede que el enlace esté mal escrito o que la página ya no exista.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center justify-center rounded-button bg-rossana-red px-6 font-semibold text-rossana-warm-white hover:bg-rossana-burgundy"
      >
        VOLVER AL INICIO
      </Link>
    </div>
  );
}
