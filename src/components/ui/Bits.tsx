import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, Star } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { cn, discountPercent, EASE, formatINR } from '@/lib/utils';

export function Price({ price, compareAt, className }: { price: number; compareAt?: number; className?: string }) {
  const off = discountPercent(price, compareAt);
  return (
    <span className={cn('inline-flex items-baseline gap-2', className)}>
      <span className={cn(off > 0 && 'text-ember-dark')}>{formatINR(price)}</span>
      {off > 0 && (
        <>
          <s className="text-[0.85em] text-muted">{formatINR(compareAt!)}</s>
          <span className="text-[0.75em] font-medium text-ember-dark">−{off}%</span>
        </>
      )}
    </span>
  );
}

export function Stars({ rating, count, className }: { rating: number; count?: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs', className)} aria-label={`Rated ${rating} out of 5`}>
      <span className="flex">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cn('h-3.5 w-3.5', i < Math.round(rating) ? 'fill-ink text-ink' : 'fill-transparent text-line')}
            strokeWidth={1.5}
          />
        ))}
      </span>
      <span className="text-muted">
        {rating.toFixed(1)}
        {count !== undefined && ` (${count})`}
      </span>
    </span>
  );
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  size = 'md',
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
}) {
  const h = size === 'sm' ? 'h-9' : 'h-12';
  return (
    <div className={cn('inline-flex items-center border border-line', h)}>
      <button
        type="button"
        aria-label="Decrease quantity"
        className={cn('grid w-9 place-items-center disabled:opacity-30', h)}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="relative w-8 overflow-hidden text-center text-sm tabular-nums">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            className="block"
            initial={{ y: -14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 14, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        className={cn('grid w-9 place-items-center disabled:opacity-30', h)}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden bg-bone-dark', className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[3/4] w-full" />
      <Skeleton className="mt-4 h-4 w-3/4" />
      <Skeleton className="mt-2 h-4 w-1/3" />
    </div>
  );
}

export function Accordion({ items, defaultOpen = 0 }: { items: { title: string; content: ReactNode }[]; defaultOpen?: number }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  return (
    <div className="border-t border-line">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.title} className="border-b border-line">
            <button
              className="flex w-full items-center justify-between py-5 text-left text-sm font-medium uppercase tracking-[0.14em]"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
              data-cursor="link"
            >
              {item.title}
              <span className="relative h-3 w-3">
                <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-ink" />
                <motion.span
                  className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-ink"
                  animate={{ rotate: isOpen ? 0 : 90 }}
                  transition={{ duration: 0.4, ease: EASE }}
                />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="pb-6 text-sm leading-relaxed text-ink-soft">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/** Animated count badge — remounts (and bounces) whenever the count changes. */
export function CountBadge({ count, className }: { count: number; className?: string }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0.4 }}
          animate={{ scale: [0.4, 1.35, 1] }}
          exit={{ scale: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className={cn(
            'absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-ember px-1 text-[10px] font-bold leading-none text-bone',
            className,
          )}
        >
          {count}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
