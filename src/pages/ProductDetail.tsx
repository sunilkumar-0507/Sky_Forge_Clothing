import { ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageTransition } from '@/components/layout/PageTransition';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductPurchase } from '@/components/product/ProductPurchase';
import { Accordion, ProductCardSkeleton, Skeleton } from '@/components/ui/Bits';
import { Carousel } from '@/components/ui/Carousel';
import { RevealText } from '@/components/ui/Reveal';
import { SHOP } from '@/config/env';
import { useDocumentTitle } from '@/hooks/dom';
import { useProduct, useRelatedProducts } from '@/hooks/queries';
import { formatINR } from '@/lib/utils';
import { NotFoundContent } from './NotFound';

export default function ProductDetail() {
  const { slug = '' } = useParams();
  const { data: product, isLoading, isError } = useProduct(slug);
  const [colorIndex, setColorIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);
  const similar = useRelatedProducts(product?.id, 'similar');
  const look = useRelatedProducts(product?.id, 'complete-the-look');
  useDocumentTitle(product?.name ?? 'Product');

  if (isError) {
    return (
      <PageTransition>
        <NotFoundContent title="Sold out of existence." message="We couldn’t find that product. It may have been retired from the collection." />
      </PageTransition>
    );
  }

  const onColorChange = (i: number) => {
    setColorIndex(i);
    if (product) setImageIndex(product.colors[i]?.imageIndex ?? 0);
  };

  return (
    <PageTransition>
      <div className="container-x pt-[76px] md:pt-28">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-muted">
          <Link to="/" className="hover:text-ink">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link to={product ? `/shop?category=${product.category.slug}` : '/shop'} className="hover:text-ink">
            {product?.category.name ?? 'Shop'}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate text-ink">{product?.name ?? '…'}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            {isLoading || !product ? (
              <Skeleton className="aspect-[3/4] w-full" />
            ) : (
              <ProductGallery ref={galleryRef} product={product} index={imageIndex} onIndexChange={setImageIndex} />
            )}
          </div>
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              {isLoading || !product ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-12 w-3/4" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="mt-8 h-24 w-full" />
                </div>
              ) : (
                <>
                  <ProductPurchase
                    product={product}
                    colorIndex={colorIndex}
                    onColorChange={onColorChange}
                    getImageRect={() => {
                      const desktop = galleryRef.current;
                      const el = desktop && desktop.offsetParent !== null ? desktop : document.getElementById('pdp-mobile-main');
                      return el?.getBoundingClientRect() ?? null;
                    }}
                    sticky
                  />
                  <div className="mt-10">
                    <Accordion
                      items={[
                        {
                          title: 'Description',
                          content: (
                            <>
                              <p>{product.description}</p>
                              <ul className="mt-3 list-inside list-disc space-y-1 text-muted">
                                <li>Style code: SF-{String(product.id).padStart(4, '0')}</li>
                                <li>Designed in Bengaluru, made in India</li>
                              </ul>
                            </>
                          ),
                        },
                        {
                          title: 'Fabric & care',
                          content: (
                            <>
                              <p className="font-medium text-ink">{product.fabric}</p>
                              <ul className="mt-3 space-y-1.5">
                                {product.care.map((c) => (
                                  <li key={c} className="flex gap-2">
                                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ember" />
                                    {c}
                                  </li>
                                ))}
                              </ul>
                            </>
                          ),
                        },
                        {
                          title: 'Shipping & returns',
                          content: (
                            <ul className="space-y-2">
                              <li>Free standard shipping on orders over {formatINR(SHOP.freeShippingThreshold)} (otherwise {formatINR(SHOP.standardShipping)}).</li>
                              <li>Express delivery in 1–2 days for {formatINR(SHOP.expressShipping)} in metro cities.</li>
                              <li>Free returns and exchanges within 15 days of delivery. Items must be unworn with tags attached.</li>
                              <li>Cash on delivery available on orders up to {formatINR(10000)}.</li>
                            </ul>
                          ),
                        },
                      ]}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="container-x mt-20 md:mt-40">
        <Carousel
          title={
            <>
              <p className="eyebrow text-muted">Style it with</p>
              <RevealText as="h2" text="Complete the look" className="h-display mt-3 text-4xl md:text-6xl" />
            </>
          }
        >
          {look.isLoading
            ? Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={i} />)
            : (look.data ?? []).map((p) => <ProductCard key={p.id} product={p} context="look" />)}
        </Carousel>
      </section>

      <section className="container-x my-20 md:my-40">
        <Carousel
          title={
            <>
              <p className="eyebrow text-muted">More from {product?.category.name}</p>
              <RevealText as="h2" text="You may also like" className="h-display mt-3 text-4xl md:text-6xl" />
            </>
          }
        >
          {similar.isLoading
            ? Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={i} />)
            : (similar.data ?? []).map((p) => <ProductCard key={p.id} product={p} context="similar" />)}
        </Carousel>
      </section>
    </PageTransition>
  );
}
