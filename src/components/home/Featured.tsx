import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Bits';
import { Carousel } from '@/components/ui/Carousel';
import { RevealText } from '@/components/ui/Reveal';
import { useProducts } from '@/hooks/queries';

export function Featured() {
  const { data, isLoading } = useProducts({ tag: 'bestseller', sort: 'rating', pageSize: 10 });
  const slides = isLoading
    ? Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={i} />)
    : (data?.items ?? []).map((p) => <ProductCard key={p.id} product={p} context="featured" />);

  return (
    <section className="container-x py-20 md:py-32">
      <Carousel
        title={
          <>
            <p className="eyebrow text-muted">Bestsellers</p>
            <RevealText as="h2" text="Most wanted" className="h-display mt-3 text-5xl md:text-7xl" />
          </>
        }
      >
        {slides}
      </Carousel>
    </section>
  );
}
