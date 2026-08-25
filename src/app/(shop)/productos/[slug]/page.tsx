import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/shop/catalog/Breadcrumb";
import { ProductGallery } from "@/components/shop/product/ProductGallery";
import { ProductInfoPanel } from "@/components/shop/product/ProductInfoPanel";
import { ProductActions } from "@/components/shop/product/ProductActions";
import { ProductPolicyInfo } from "@/components/shop/product/ProductPolicyInfo";
import { ProductGridSection } from "@/components/shop/home/ProductGridSection";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries/product-detail";
import { getSiteSettings } from "@/lib/queries/site";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };

  return {
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? product.shortDescription ?? undefined,
  };
}

// Ficha de producto (Sección 21-23).
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSiteSettings()]);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categorySlug, product.id);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
      <Breadcrumb
        items={[
          { label: "Inicio", href: "/" },
          { label: "Productos", href: "/productos" },
          ...(product.categoryName
            ? [{ label: product.categoryName, href: `/categorias/${product.categorySlug}` }]
            : []),
          { label: product.name },
        ]}
      />

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

          <ProductPolicyInfo
            shippingPolicy={settings.policies.envios ?? null}
            returnsPolicy={settings.policies["cambios-devoluciones"] ?? null}
          />
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
