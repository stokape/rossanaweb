import Link from "next/link";
import { AlertTriangle, ClipboardCheck, Package2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { getCurrentAdminProfile } from "@/lib/queries/admin/profile";
import { getDashboardStats } from "@/lib/queries/admin/dashboard";
import { formatSoles } from "@/lib/utils";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

// Inicio del panel (Sección 39). Nada de gráficos: primero lo que hay
// que atender, en lenguaje cotidiano.
export default async function AdminHomePage() {
  const [profile, stats] = await Promise.all([getCurrentAdminProfile(), getDashboardStats()]);

  const pendingCount = stats.paymentsToReview + stats.ordersToPrepare + stats.lowStockCount;
  const name = profile?.fullName ?? "";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-rossana-charcoal md:text-3xl">
          {greeting()}{name ? `, ${name}` : ""}
        </h1>
        <p className="mt-1 text-rossana-charcoal/60">
          {pendingCount === 0
            ? "No tienes nada urgente por atender. ✨"
            : `Tienes ${pendingCount} ${pendingCount === 1 ? "cosa" : "cosas"} por atender.`}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/admin/pedidos?filtro=por_revisar">
          <Card className="flex items-center gap-4 p-5 hover:border-rossana-red">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-rossana-red/10 text-rossana-red">
              <ClipboardCheck className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-rossana-charcoal">
                {stats.paymentsToReview}
              </p>
              <p className="text-sm text-rossana-charcoal/60">Pagos por revisar</p>
            </div>
          </Card>
        </Link>

        <Link href="/admin/pedidos?filtro=preparando">
          <Card className="flex items-center gap-4 p-5 hover:border-rossana-red">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-rossana-gold/10 text-rossana-gold">
              <Package2 className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-rossana-charcoal">
                {stats.ordersToPrepare}
              </p>
              <p className="text-sm text-rossana-charcoal/60">Pedidos por preparar</p>
            </div>
          </Card>
        </Link>

        <Link href="/admin/productos?stock=bajo">
          <Card className="flex items-center gap-4 p-5 hover:border-rossana-red">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning">
              <AlertTriangle className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-rossana-charcoal">{stats.lowStockCount}</p>
              <p className="text-sm text-rossana-charcoal/60">Con poco stock</p>
            </div>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm text-rossana-charcoal/60">Ventas de hoy</p>
          <p className="mt-1 text-2xl font-semibold text-rossana-red">
            {formatSoles(stats.todaySales)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-rossana-charcoal/60">Pedidos de hoy</p>
          <p className="mt-1 text-2xl font-semibold text-rossana-charcoal">{stats.todayOrders}</p>
        </Card>
      </div>
    </div>
  );
}
