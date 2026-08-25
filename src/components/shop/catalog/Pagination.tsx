import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  basePath: string;
  searchParams: URLSearchParams;
  currentPage: number;
  totalPages: number;
}

export function Pagination({ basePath, searchParams, currentPage, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;

  function hrefForPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pagina", String(page));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <nav className="mt-10 flex items-center justify-center gap-4" aria-label="Paginación">
      <Link
        href={hrefForPage(currentPage - 1)}
        aria-disabled={currentPage <= 1}
        className={`flex size-10 items-center justify-center rounded-full border border-rossana-border ${
          currentPage <= 1 ? "pointer-events-none opacity-30" : "hover:border-rossana-red hover:text-rossana-red"
        }`}
      >
        <ChevronLeft className="size-4" />
      </Link>
      <span className="text-sm text-rossana-charcoal/70">
        Página {currentPage} de {totalPages}
      </span>
      <Link
        href={hrefForPage(currentPage + 1)}
        aria-disabled={currentPage >= totalPages}
        className={`flex size-10 items-center justify-center rounded-full border border-rossana-border ${
          currentPage >= totalPages ? "pointer-events-none opacity-30" : "hover:border-rossana-red hover:text-rossana-red"
        }`}
      >
        <ChevronRight className="size-4" />
      </Link>
    </nav>
  );
}
