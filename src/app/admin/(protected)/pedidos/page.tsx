import Link from "next/link";
import { cn } from "@/lib/utils";
import { OrderCard } from "@/components/admin/OrderCard";
import { getOrdersForAdmin, type OrderFilter } from "@/lib/queries/admin/orders";

const TABS: { value: OrderFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "por_revisar", label: "Por revisar" },
  { value: "preparando", label: "Preparando" },
  { value: "enviados", label: "Enviados" },
  { value: "entregados", label: "Entregados" },
];

interface PedidosPageProps {
  searchParams: Promise<{ filtro?: string }>;
}

// Pedidos (Sección 40).
export default async function PedidosPage({ searchParams }: PedidosPageProps) {
  const { filtro } = await searchParams;
  const activeFilter: OrderFilter = TABS.some((t) => t.value === filtro)
    ? (filtro as OrderFilter)
    : "todos";

  const orders = await getOrdersForAdmin(activeFilter);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-rossana-charcoal md:text-3xl">
        Pedidos
      </h1>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "todos" ? "/admin/pedidos" : `/admin/pedidos?filtro=${tab.value}`}
            className={cn(
              "rounded-badge px-4 py-2 text-sm font-medium",
              activeFilter === tab.value
                ? "bg-rossana-red text-white"
                : "bg-white text-rossana-charcoal border border-rossana-border",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="rounded-card border border-dashed border-rossana-border bg-white px-6 py-16 text-center text-rossana-charcoal/50">
          No hay pedidos en esta categoría todavía.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
