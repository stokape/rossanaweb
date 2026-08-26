import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/shop/catalog/Breadcrumb";
import { ProductGallery } from "@/components/shop/product/ProductGallery";
import { ProductInfoPanel } from "@/components/shop/product/ProductInfoPanel";
import { ProductActions } from "@/components/shop/product/ProductActions";
import { ProductGridSection } from "@/components/shop/home/ProductGridSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries/product-detail";
import { getSiteSettings } from "@/lib/queries/site";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };

  const title = product.seoTitle ?? product.name;
  const description = product.seoDescription ?? product.shortDescription ?? undefined;
  const image = product.galleryImages[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/productos/${product.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/productos/${product.slug}`,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

// Ficha de producto (Sección 21-23).
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSiteSettings()]);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categorySlug, product.id);
  const productUrl = `${SITE_URL}/productos/${product.slug}`;

  const breadcrumbItems = [
    { label: "Inicio", href: "/" },
    { label: "Productos", href: "/productos" },
    ...(product.categoryName
      ? [{ label: product.categoryName, href: `/categorias/${product.categorySlug}` }]
      : []),
    { label: product.name },
  ];

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: breadcrumbItems.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.label,
            ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          sku: product.sku,
          description: product.shortDescription ?? product.description ?? undefined,
          image: product.galleryImages.map((img) => img.url),
          offers: {
            "@type": "Offer",
            url: productUrl,
            priceCurrency: "PEN",
            price: product.price.toFixed(2),
            availability:
              product.stockAvailable > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
          },
        }}
      />
      <Breadcrumb items={breadcrumbItems} />

      <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-[55%_1fr]">
        <ProductGallery
          productName={product.name}
          galleryImages={product.galleryImages}
          spinImages={product.spinImages}
        />

        <div>
          <ProductInfoPanel product={product} />

          <div className="mt-6">
            <ProductActions
              productId={product.id}
              slug={product.slug}
              name={product.name}
              sku={product.sku}
              price={product.price}
              imageUrl={product.galleryImages[0]?.url ?? null}
              stockAvailable={product.stockAvailable}
              whatsappNumber={settings.whatsappNumber}
            />
          </div>
          {/* Bloque Envíos/Cambios/Cuidados oculto a pedido del usuario
              — el componente ProductPolicyInfo sigue existiendo por si
              se reactiva después. */}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <ProductGridSection
            title="También te puede gustar"
            products={related}
            emptyMessage=""
          />
        </div>
      )}
    </div>
  );
}
