"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Logo } from "@/components/shop/Logo";
import { useCart } from "@/lib/cart/CartProvider";
import type { CategorySummary } from "@/lib/queries/catalog";

const STATIC_LINKS = [
  { label: "Inicio", href: "/" },
  { label: "Novedades", href: "/productos?orden=recientes" },
  { label: "Ofertas", href: "/productos?ofertas=1" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" },
];

export function Header({ categories }: { categories: CategorySummary[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalCount } = useCart();
  const pathname = usePathname();

  // Header sticky (Sección 7): floral rojo al tope, borgoña
  // translúcido + blur al desplazarse — nunca fondo claro, para que
  // siga sintiéndose "Rossana" en cualquier estado de scroll.
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    STATIC_LINKS[0],
    ...categories.map((c) => ({ label: c.name, href: `/categorias/${c.slug}` })),
    ...STATIC_LINKS.slice(1),
  ];

  return (
    <header
      data-scrolled={scrolled}
      className="header-brand-bg sticky top-0 z-40 border-b border-rossana-gold/20"
    >
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 md:px-8 md:py-4">
        <button
          type="button"
          className="-ml-2 flex size-11 items-center justify-center text-rossana-ivory hover:text-rossana-gold xl:hidden"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>

        <Link href="/" className="shrink-0" aria-label="Rossana — Bisutería y Más, ir al inicio">
          <Logo className="h-8 w-auto md:h-10" priority />
        </Link>

        <form
          action="/productos"
          role="search"
          className="mx-4 hidden h-11 max-w-md flex-1 items-center rounded-input border border-rossana-ivory/25 bg-rossana-warm-white/10 px-4 md:flex"
        >
          <Search className="size-4 text-rossana-ivory/70 shrink-0" aria-hidden />
          <input
            type="search"
            name="buscar"
            placeholder="Buscar productos..."
            className="ml-2 flex-1 bg-transparent text-sm text-rossana-ivory outline-none placeholder:text-rossana-ivory/50"
          />
        </form>

        <nav className="ml-auto flex items-center gap-1 md:gap-2">
          <Link
            href="/cuenta"
            className="hidden size-11 items-center justify-center text-rossana-ivory hover:text-rossana-gold sm:inline-flex"
            aria-label="Mi cuenta"
          >
            <User className="size-5 md:size-6" />
          </Link>
          <Link
            href="/cuenta/favoritos"
            className="hidden size-11 items-center justify-center text-rossana-ivory hover:text-rossana-gold sm:inline-flex"
            aria-label="Favoritos"
          >
            <Heart className="size-5 md:size-6" />
          </Link>
          <Link
            href="/carrito"
            className="relative flex size-11 items-center justify-center text-rossana-ivory hover:text-rossana-gold"
            aria-label={`Carrito${totalCount > 0 ? `, ${totalCount} productos` : ""}`}
          >
            <ShoppingBag className="size-5 md:size-6" />
            {totalCount > 0 && (
              <span className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-badge bg-rossana-gold text-[10px] font-semibold text-rossana-burgundy">
                {totalCount > 9 ? "9+" : totalCount}
              </span>
            )}
          </Link>
        </nav>
      </div>

      <nav className="hidden border-t border-rossana-gold/20 xl:block" aria-label="Navegación principal">
        <div className="mx-auto flex max-w-[1440px] items-center justify-center gap-4 px-8 py-2.5 text-[13px] font-medium 2xl:gap-6 2xl:text-sm">
          {navLinks.map((link) => {
            const active = pathname === link.href.split("?")[0];
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "border-b border-rossana-gold pb-1 font-semibold text-rossana-gold transition-colors"
                    : "border-b border-transparent pb-1 text-rossana-ivory transition-colors hover:border-rossana-gold/60 hover:text-rossana-gold"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-rossana-gold/20 bg-rossana-warm-white px-4 py-4 shadow-soft xl:hidden">
          <form action="/productos" role="search" className="mb-4 flex h-12 items-center rounded-input border border-rossana-border px-4">
            <Search className="size-4 text-rossana-charcoal/50 shrink-0" aria-hidden />
            <input
              type="search"
              name="buscar"
              placeholder="Buscar productos..."
              className="ml-2 flex-1 bg-transparent text-base outline-none placeholder:text-rossana-charcoal/40"
            />
          </form>
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-input px-2 py-3 text-base font-medium text-rossana-charcoal hover:bg-rossana-ivory hover:text-rossana-red"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
