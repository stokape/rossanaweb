import type { MetadataRoute } from "next";
import { getActiveCategories, getProducts } from "@/lib/queries/catalog";

// Sección 66-67. Se regenera en cada build/petición con lo que
// realmente está publicado — nunca una lista fija de rutas.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/productos`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/nosotros`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/contacto`, changeFrequency: "monthly", priority: 0.4 },
    // Rutas /politicas/* fuera del sitemap a pedido del usuario — de
    // momento no se usan (siguen existiendo, solo no enlazadas/indexadas).
  ];

  const [categories, { products }] = await Promise.all([
    getActiveCategories(),
    getProducts({ pageSize: 500 }),
  ]);

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${siteUrl}/categorias/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${siteUrl}/productos/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
