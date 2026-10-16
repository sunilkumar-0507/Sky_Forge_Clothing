import { motion } from 'framer-motion';
import { Eye, Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/hooks/queries';
import { Price } from '@/components/ui/Bits';
import { WishlistButton } from '@/components/ui/WishlistButton';
import { flyToCart } from '@/lib/flyToCart';
import { cn, discountPercent, EASE } from '@/lib/utils';
import { toast, useCart, useUI } from '@/store';
import type { Product } from '@/types';

interface Props {
  product: Product;
  /** Distinguishes card instances so Framer layoutIds stay unique per page. */
  context?: string;
  className?: string;
  priority?: boolean;
}

export function ProductBadges({ product }: { product: Product }) {
  const off = discountPercent(product.price, product.compareAtPrice);
  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
      {product.tags.includes('new') && <span className="bg-bone px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em]">New</span>}
      {off > 0 && <span className="bg-ember px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-bone">−{off}%</span>}
      {product.tags.includes('bestseller') && !product.tags.includes('new') && (
        <span className="bg-ink px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-bone">Bestseller</span>
      )}
    </div>
  );
}

export function ProductCard({ product, context = 'grid', className, priority }: Props) {
  const [imageIndex, setImageIndex] = useState(0);
  const mediaRef = useRef<HTMLAnchorElement>(null);
  const add = useCart((s) => s.add);
  const setSharedImage = useUI((s) => s.setSharedImage);
  const setQuickView = useUI((s) => s.setQuickView);
  const layoutKey = `card-${context}-${product.id}`;

  const primary = product.images[imageIndex] ?? product.images[0];
  const secondary = product.images.find((_, i) => i !== imageIndex) ?? primary;

  // Capture the image position so the detail page can fly it into place.
  const qc = useQueryClient();
  const onNavigate = () => {
    // Seed the detail query so the PDP renders instantly (the API can refine it later).
    if (!qc.getQueryData(queryKeys.product(product.slug))) qc.setQueryData(queryKeys.product(product.slug), product);
    const r = mediaRef.current?.getBoundingClientRect();
    if (r) setSharedImage({ slug: product.slug, src: primary.url, from: { top: r.top, left: r.left, width: r.width, height: r.height } });
  };

  const quickAdd = (size: string) => {
    add(product, { color: product.colors.find((c) => c.imageIndex === imageIndex)?.name, size });
    flyToCart(primary.url, mediaRef.current?.getBoundingClientRect() ?? null);
    toast({ title: 'Added to bag', description: `${product.name} · ${size}`, image: primary.url, variant: 'success' });
  };

  const openQuickView = () => setQuickView(product, layoutKey);

  return (
    <article className={cn('group/card relative', className)}>
      <div className="relative overflow-hidden">
        <Link
          ref={mediaRef}
          to={`/product/${product.slug}`}
          onClick={onNavigate}
          data-cursor="view"
          className="relative block aspect-[3/4] overflow-hidden bg-bone-dark"
          aria-label={product.name}
        >
          <motion.div layoutId={layoutKey} className="absolute inset-0">
            <div className="absolute inset-0 transition-transform duration-[1.2s] ease-expo group-hover/card:scale-[1.04]">
            <img
              src={primary.url}
              alt={primary.alt}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            {secondary !== primary && (
              <img
                src={secondary.url}
                alt=""
                aria-hidden
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 ease-expo group-hover/card:opacity-100"
              />
            )}
            </div>
          </motion.div>
          <ProductBadges product={product} />
        </Link>

        <WishlistButton product={product} size="sm" className="absolute right-2 top-2 z-10 rounded-full bg-bone/80 backdrop-blur" />

        {/* Desktop: quick view + quick add slide in on hover. */}
        <button
          onClick={openQuickView}
          aria-label={`Quick view ${product.name}`}
          data-cursor="link"
          className="absolute right-2 top-[52px] z-10 hidden h-9 w-9 translate-x-3 place-items-center rounded-full bg-bone/80 opacity-0 backdrop-blur transition-all duration-500 ease-expo group-hover/card:translate-x-0 group-hover/card:opacity-100 [@media(hover:hover)]:grid"
        >
          <Eye className="h-4 w-4" />
        </button>

        <div className="absolute inset-x-2 bottom-2 z-10 hidden translate-y-[calc(100%+8px)] bg-bone/95 p-3 backdrop-blur transition-transform duration-500 ease-expo group-hover/card:translate-y-0 [@media(hover:hover)]:block">
          <p className="eyebrow mb-2 text-muted">Quick add</p>
          <div className="flex flex-wrap gap-1.5">
            {product.sizes.map((s) => (
              <button
                key={s.label}
                disabled={!s.inStock}
                onClick={() => quickAdd(s.label)}
                data-cursor="link"
                className="chip min-w-[38px] px-2 py-1.5 disabled:cursor-not-allowed disabled:text-line disabled:line-through disabled:hover:border-line"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Touch: one button opens quick view (sizes need a deliberate choice). */}
        <button
          onClick={openQuickView}
          aria-label={`Add ${product.name} to bag`}
          className="absolute bottom-2 right-2 z-10 grid h-9 w-9 place-items-center rounded-full bg-bone [@media(hover:hover)]:hidden"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-1 sm:mt-4 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[13px] font-medium sm:text-sm">
            <Link to={`/product/${product.slug}`} onClick={onNavigate} className="link-underline">
              {product.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-xs text-muted">{product.category.name}</p>
        </div>
        <Price price={product.price} compareAt={product.compareAtPrice} className="shrink-0 flex-wrap text-[13px] sm:text-sm" />
      </div>
      {product.colors.length > 1 && (
        <div className="mt-2.5 flex gap-1.5">
          {product.colors.map((c) => (
            <button
              key={c.name}
              aria-label={c.name}
              title={c.name}
              onMouseEnter={() => setImageIndex(c.imageIndex)}
              onClick={() => setImageIndex(c.imageIndex)}
              className={cn(
                'h-3.5 w-3.5 rounded-full ring-1 ring-offset-2 ring-offset-bone transition-all duration-300',
                imageIndex === c.imageIndex ? 'ring-ink' : 'ring-line',
              )}
              style={{ background: c.hex }}
            />
          ))}
        </div>
      )}
    </article>
  );
}

export const cardMotion = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96 },
  transition: { duration: 0.7, ease: EASE },
};
