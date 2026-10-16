import useEmblaCarousel from 'embla-carousel-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Overlay } from '@/components/ui/Overlay';
import { cn, EASE } from '@/lib/utils';
import { useUI } from '@/store';
import type { Product } from '@/types';
import { ProductBadges } from './ProductCard';

interface Props {
  product: Product;
  index: number;
  onIndexChange: (i: number) => void;
}

/** PDP gallery: vertical thumbs + hover-zoom main image (desktop), swipe (mobile), fullscreen lightbox. */
export const ProductGallery = forwardRef<HTMLDivElement, Props>(function ProductGallery({ product, index, onIndexChange }, mainRef) {
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [emblaRef, embla] = useEmblaCarousel({ loop: false });
  const localMain = useRef<HTMLDivElement | null>(null);
  const shared = useUI((s) => s.sharedImage);
  const setSharedTarget = useUI((s) => s.setSharedTarget);
  const awaitingShared = shared?.slug === product.slug;

  // Report where the main image sits so the shared-element overlay can fly into it.
  useLayoutEffect(() => {
    if (!awaitingShared || shared?.to) return;
    const el = [localMain.current, document.getElementById('pdp-mobile-main')].find(
      (e): e is HTMLElement => !!e && e.offsetParent !== null,
    );
    if (!el) return;
    const r = el.getBoundingClientRect();
    setSharedTarget({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [awaitingShared, shared?.to, setSharedTarget]);

  // Keep the mobile carousel in sync with colour changes.
  useEffect(() => {
    if (embla && embla.selectedScrollSnap() !== index) embla.scrollTo(index);
  }, [embla, index]);

  const onSelect = useCallback(() => embla && onIndexChange(embla.selectedScrollSnap()), [embla, onIndexChange]);
  useEffect(() => {
    if (!embla) return;
    embla.on('select', onSelect);
    return () => {
      embla.off('select', onSelect);
    };
  }, [embla, onSelect]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const setRefs = (el: HTMLDivElement | null) => {
    localMain.current = el;
    if (typeof mainRef === 'function') mainRef(el);
    else if (mainRef) mainRef.current = el;
  };

  const img = product.images[index] ?? product.images[0];

  return (
    <>
      {/* Desktop */}
      <div className="hidden gap-4 lg:flex">
        <div className="flex w-20 shrink-0 flex-col gap-3">
          {product.images.map((im, i) => (
            <button
              key={im.url}
              onClick={() => onIndexChange(i)}
              aria-label={`View image ${i + 1}`}
              data-cursor="link"
              className={cn(
                'relative aspect-[3/4] overflow-hidden bg-bone-dark transition-opacity duration-300',
                i === index ? 'opacity-100' : 'opacity-50 hover:opacity-80',
              )}
            >
              <img src={im.url.replace('w=900', 'w=200').replace('h=1200', 'h=266')} alt="" className="h-full w-full object-cover" />
              {i === index && <motion.span layoutId="thumb-indicator" className="absolute inset-0 ring-2 ring-inset ring-ink" />}
            </button>
          ))}
        </div>
        <div
          ref={setRefs}
          className={cn('relative aspect-[3/4] flex-1 overflow-hidden bg-bone-dark', awaitingShared && 'opacity-0')}
          onMouseMove={onMove}
          onMouseLeave={() => setZoom(null)}
          onClick={() => setLightbox(true)}
          data-cursor="zoom"
        >
          <AnimatePresence initial={false}>
            <motion.img
              key={img.url}
              src={img.url}
              alt={img.alt}
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, scale: zoom ? 2 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 0.5 }, scale: { duration: 0.6, ease: EASE } }}
              style={{ transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : 'center' }}
            />
          </AnimatePresence>
          <ProductBadges product={product} />
          <span className="pointer-events-none absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-bone/80 backdrop-blur">
            <Expand className="h-4 w-4" />
          </span>
        </div>
      </div>

      {/* Mobile */}
      <div className="-mx-4 sm:mx-0 lg:hidden">
        <div ref={emblaRef} className={cn('overflow-hidden', awaitingShared && 'opacity-0')} id="pdp-mobile-main">
          <div className="flex touch-pan-y sm:-ml-3">
            {product.images.map((im) => (
              <button key={im.url} className="relative min-w-0 shrink-0 grow-0 basis-full sm:basis-1/2 sm:pl-3" onClick={() => setLightbox(true)} aria-label="Open fullscreen gallery">
                <span className="block aspect-[3/4] overflow-hidden bg-bone-dark">
                <img src={im.url} alt={im.alt} className="h-full w-full object-cover" />
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex justify-center gap-1.5">
          {product.images.map((_, i) => (
            <span key={i} className={cn('h-1 rounded-full transition-all duration-500', i === index ? 'w-6 bg-ink' : 'w-1.5 bg-line')} />
          ))}
        </div>
      </div>

      <Lightbox open={lightbox} onClose={() => setLightbox(false)} product={product} start={index} />
    </>
  );
});

function Lightbox({ open, onClose, product, start }: { open: boolean; onClose: () => void; product: Product; start: number }) {
  const [ref, api] = useEmblaCarousel({ loop: true, startIndex: start });
  const [current, setCurrent] = useState(start);

  useEffect(() => {
    if (!api) return;
    const s = () => setCurrent(api.selectedScrollSnap());
    api.on('select', s);
    return () => {
      api.off('select', s);
    };
  }, [api]);

  useEffect(() => {
    if (!open || !api) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') api.scrollNext();
      if (e.key === 'ArrowLeft') api.scrollPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, api]);

  return (
    <Overlay open={open} onClose={onClose} placement="full" label="Image gallery" className="bg-ink">
      <div className="relative flex h-full flex-col bg-ink text-bone">
        <div ref={ref} className="h-full overflow-hidden">
          <div className="flex h-full">
            {product.images.map((im) => (
              <div key={im.url} className="flex h-full min-w-0 shrink-0 grow-0 basis-full items-center justify-center p-4 md:p-12">
                <img src={im.url.replace('w=900', 'w=1600').replace('h=1200', 'h=2133')} alt={im.alt} className="max-h-full max-w-full object-contain" />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.2em]">
          {String(current + 1).padStart(2, '0')} / {String(product.images.length).padStart(2, '0')}
        </div>
        {product.images.length > 1 && (
          <>
            <button
              className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-bone/30 hover:bg-bone hover:text-ink"
              onClick={() => api?.scrollPrev()}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-bone/30 hover:bg-bone hover:text-ink"
              onClick={() => api?.scrollNext()}
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </Overlay>
  );
}
