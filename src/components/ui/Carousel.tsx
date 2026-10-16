import useEmblaCarousel from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CarouselProps {
  children: ReactNode[];
  title?: ReactNode;
  /** Tailwind width classes for each slide. */
  slideClassName?: string;
  className?: string;
}

/** Draggable Embla carousel with arrow controls and a scroll progress bar. */
export function Carousel({ children, title, slideClassName = 'basis-[72%] sm:basis-[45%] lg:basis-[28%]', className }: CarouselProps) {
  const [ref, api] = useEmblaCarousel({ align: 'start', dragFree: true, containScroll: 'trimSnaps' });
  const [progress, setProgress] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const onScroll = useCallback(() => {
    if (!api) return;
    setProgress(Math.max(0, Math.min(1, api.scrollProgress())));
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onScroll();
    api.on('scroll', onScroll).on('reInit', onScroll).on('select', onScroll);
    return () => {
      api.off('scroll', onScroll).off('reInit', onScroll).off('select', onScroll);
    };
  }, [api, onScroll]);

  return (
    <div className={className}>
      <div className="mb-6 flex items-end justify-between gap-4 md:mb-8 md:gap-6">
        <div className="min-w-0">{title}</div>
        <div className="hidden shrink-0 gap-2 sm:flex">
          {[
            { dir: 'prev', can: canPrev, Icon: ArrowLeft, fn: () => api?.scrollPrev() },
            { dir: 'next', can: canNext, Icon: ArrowRight, fn: () => api?.scrollNext() },
          ].map(({ dir, can, Icon, fn }) => (
            <button
              key={dir}
              onClick={fn}
              disabled={!can}
              aria-label={dir === 'prev' ? 'Previous' : 'Next'}
              data-cursor="link"
              className="grid h-11 w-11 place-items-center rounded-full border border-ink transition-all duration-500 ease-expo hover:bg-ink hover:text-bone disabled:border-line disabled:text-line disabled:hover:bg-transparent"
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>
      <div ref={ref} className="overflow-hidden" data-cursor="drag">
        <div className="-ml-4 flex touch-pan-y md:-ml-6">
          {children.map((child, i) => (
            <div key={i} className={cn('min-w-0 shrink-0 grow-0 pl-4 md:pl-6', slideClassName)}>
              {child}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 h-px w-full bg-line md:mt-8">
        <div className="h-px origin-left bg-ink transition-transform duration-150" style={{ transform: `scaleX(${Math.max(0.08, progress)})` }} />
      </div>
    </div>
  );
}
