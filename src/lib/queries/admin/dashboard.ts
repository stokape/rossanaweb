import { createClient } from "@/lib/supabase/server";
import { ROSSANA_STORE_ID } from "@/lib/queries/site";

export interface DashboardStats {
  paymentsToReview: number;
  ordersToPrepare: number;
  lowStockCount: number;
  todaySales: number;
  todayOrders: number;
}

/** Datos del "Inicio" del panel (Sección 39). Todo cuenta simple, sin
 * gráficos — el emprendedor solo necesita saber qué atender hoy. */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [paymentsToReview, ordersToPrepare, products, materials, todayOrders] = await Promise.all([
    supabase
      .from("payments")
      .select("id, orders!inner(store_id)", { count: "exact", head: true })
      .eq("status", "submitted")
      .eq("orders.store_id", ROSSANA_STORE_ID),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("store_id", ROSSANA_STORE_ID)
      .eq("status", "en_preparacion"),
    // stock_available <= minimum_stock no se puede filtrar directo en
    // PostgREST (comparación entre dos columnas): se trae lo mínimo y
    // se compara en JS.
    supabase
      .from("products")
      .select("stock_available, minimum_stock")
      .eq("store_id", ROSSANA_STORE_ID)
      .eq("status", "published"),
    supabase
      .from("materials")
      .select("current_stock, minimum_stock")
      .eq("store_id", ROSSANA_STORE_ID)
      .eq("active", true),
    supabase
      .from("orders")
      .select("total", { count: "exact" })
      .eq("store_id", ROSSANA_STORE_ID)
      .neq("status", "cancelado")
      .gte("created_at", startOfToday.toISOString()),
  ]);

  const lowStockProducts = (products.data ?? []).filter(
    (p) => p.stock_available <= p.minimum_stock,
  ).length;
  const lowStockMaterials = (materials.data ?? []).filter(
    (m) => Number(m.current_stock) <= Number(m.minimum_stock),
  ).length;

  const todaySales = (todayOrders.data ?? []).reduce((sum, o) => sum + Number(o.total), 0);

  return {
    paymentsToReview: paymentsToReview.count ?? 0,
    ordersToPrepare: ordersToPrepare.count ?? 0,
    lowStockCount: lowStockProducts + lowStockMaterials,
    todaySales,
    todayOrders: todayOrders.count ?? 0,
  };
}
