"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Wordmark } from "@/components/shop/Wordmark";
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

  const navLinks = [
    STATIC_LINKS[0],
    ...categories.map((c) => ({ label: c.name, href: `/categorias/${c.slug}` })),
    ...STATIC_LINKS.slice(1),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-rossana-border bg-white">
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 md:px-8 md:py-4">
        <button
          type="button"
          className="md:hidden p-2 -ml-2 text-rossana-charcoal"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>

        <Link href="/" className="shrink-0" aria-label="Rossana — Bisutería y Más, ir al inicio">
          <Wordmark className="text-xl md:text-2xl" />
        </Link>

        <form
          action="/productos"
          className="hidden md:flex flex-1 items-center rounded-input border border-rossana-border px-4 h-11 mx-4 max-w-md"
        >
          <Search className="size-4 text-rossana-charcoal/50 shrink-0" aria-hidden />
          <input
            type="search"
            name="buscar"
            placeholder="Buscar productos..."
            className="ml-2 flex-1 bg-transparent text-sm outline-none placeholder:text-rossana-charcoal/40"
          />
        </form>

        <nav className="ml-auto flex items-center gap-1 md:gap-2">
          <Link
            href="/cuenta"
            className="p-2 text-rossana-charcoal hover:text-rossana-red"
            aria-label="Mi cuenta"
          >
            <User className="size-5 md:size-6" />
          </Link>
          <Link
            href="/cuenta/favoritos"
            className="p-2 text-rossana-charcoal hover:text-rossana-red hidden sm:inline-flex"
            aria-label="Favoritos"
          >
            <Heart className="size-5 md:size-6" />
          </Link>
          <Link
            href="/carrito"
            className="p-2 text-rossana-charcoal hover:text-rossana-red"
            aria-label="Carrito"
          >
            <ShoppingBag className="size-5 md:size-6" />
          </Link>
        </nav>
      </div>

      <nav className="hidden md:block border-t border-rossana-border">
        <div className="mx-auto flex max-w-[1440px] gap-6 px-8 py-2.5 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-rossana-charcoal hover:text-rossana-red transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {menuOpen && (
        <div className="md:hidden border-t border-rossana-border bg-white px-4 py-4">
          <form action="/productos" className="flex items-center rounded-input border border-rossana-border px-4 h-12 mb-4">
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
                  className="block py-3 text-base font-medium text-rossana-charcoal"
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
