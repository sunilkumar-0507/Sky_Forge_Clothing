import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Bits';
import { RevealText } from '@/components/ui/Reveal';
import { useProducts } from '@/hooks/queries';
import { gsap, useGSAP } from '@/lib/gsap';
import { cn } from '@/lib/utils';

/** Pinned section whose product track scrolls horizontally as you scroll down (desktop). */
export function NewDrop() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useProducts({ tag: 'new', sort: 'newest', pageSize: 8 });
  const products = data?.items ?? [];

  useGSAP(
    () => {
      if (!products.length) return;
      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        const distance = () => track.current!.scrollWidth - window.innerWidth;
        gsap.to(track.current, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
        gsap.to('[data-drop-progress]', {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${distance()}`, scrub: true },
        });
      });
    },
    { scope: root, dependencies: [products.length], revertOnUpdate: true },
  );


  const intro = (
    <>
      <div>
        <p className="eyebrow text-ember">The new drop · {products.length || '—'} pieces</p>
        <RevealText as="h2" text="Fresh off the anvil." className="h-display mt-4 text-[clamp(2.5rem,11vw,6.5vw)] md:text-[6.5vw]" />
        <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-ink-soft md:mt-6">
          Ember tones, heavier fabrics, sharper cuts. Limited runs — once a size is gone, it’s gone.
        </p>
      </div>
      <Link to="/shop?tag=new" className="link-underline mt-6 inline-flex w-max items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] md:mt-10" data-cursor="link">
        Shop all new <ArrowRight className="h-4 w-4" />
      </Link>
    </>
  );

  const slide = 'w-[64vw] shrink-0 snap-start sm:w-[280px] md:w-[min(22vw,calc((100vh-14rem)*0.75))] md:min-w-[220px]';

  return (
    <section ref={root} className="relative overflow-hidden bg-bone py-16 md:flex md:h-screen md:items-center md:py-0">
      {/* Phones/tablets: intro above a native swipe row */}
      <div className="container-x mb-8 flex flex-col md:hidden">{intro}</div>
      <div
        ref={track}
        className="no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto overscroll-x-contain px-4 will-change-transform md:w-max md:snap-none md:gap-8 md:overflow-visible md:px-10"
      >
        {/* Desktop: intro is the first panel of the pinned track */}
        <div className="hidden w-[38vw] shrink-0 flex-col justify-between pr-10 md:flex">{intro}</div>

        {isLoading
          ? Array.from({ length: 4 }, (_, i) => (
              <div key={i} className={slide}>
                <ProductCardSkeleton />
              </div>
            ))
          : products.map((p, i) => (
              <div key={p.id} className={cn(slide, i % 2 === 1 && 'md:mt-12')}>
                <span className="mb-3 block font-display text-sm text-muted">{String(i + 1).padStart(2, '0')}</span>
                <ProductCard product={p} context="drop" />
              </div>
            ))}

        <Link
          to="/shop?tag=new"
          className="group grid w-[48vw] shrink-0 snap-start place-items-center bg-ink text-bone sm:w-[240px] md:w-[min(22vw,calc((100vh-14rem)*0.75))] md:min-w-[220px]"
          data-cursor="link"
        >
          <span className="text-center">
            <span className="h-display block text-3xl md:text-4xl">View all</span>
            <span className="mx-auto mt-4 grid h-14 w-14 place-items-center rounded-full border border-bone/30 transition-transform duration-500 ease-expo group-hover:rotate-[-45deg]">
              <ArrowRight className="h-5 w-5" />
            </span>
          </span>
        </Link>
      </div>
      <div className="absolute bottom-10 left-10 right-10 hidden h-px bg-line md:block">
        <div data-drop-progress className="h-px origin-left scale-x-0 bg-ink" />
      </div>
    </section>
  );
}
