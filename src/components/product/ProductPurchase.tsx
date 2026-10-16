import { AnimatePresence, motion } from 'framer-motion';
import { Ruler, ShoppingBag, Truck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Price, QuantityStepper, Stars } from '@/components/ui/Bits';
import { WishlistButton } from '@/components/ui/WishlistButton';
import { SHOP } from '@/config/env';
import { useLenis } from '@/providers/SmoothScroll';
import { flyToCart } from '@/lib/flyToCart';
import { cn, formatINR } from '@/lib/utils';
import { toast, useCart } from '@/store';
import type { Product } from '@/types';
import { SizeGuide } from './SizeGuide';

interface Props {
  product: Product;
  colorIndex: number;
  onColorChange: (index: number) => void;
  /** Where the fly-to-cart animation starts. */
  getImageRect: () => DOMRect | null;
  compact?: boolean;
  onAdded?: () => void;
  /** Show a sticky add-to-bag bar on mobile once the main button scrolls out of view. */
  sticky?: boolean;
}

/** Colour, size, quantity and add-to-bag controls (shared by PDP and quick view). */
export function ProductPurchase({ product, colorIndex, onColorChange, getImageRect, compact, onAdded, sticky }: Props) {
  const add = useCart((s) => s.add);
  const oneSize = product.sizes.length === 1;
  const [size, setSize] = useState<string | null>(oneSize ? product.sizes[0].label : null);
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const color = product.colors[colorIndex] ?? product.colors[0];
  const addRowRef = useRef<HTMLDivElement>(null);
  const sizesRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    if (!sticky || !addRowRef.current) return;
    const io = new IntersectionObserver(([entry]) => setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    io.observe(addRowRef.current);
    return () => io.disconnect();
  }, [sticky]);

  const addToBag = () => {
    if (!size) {
      setSizeError(true);
      if (sizesRef.current && sticky) {
        if (lenis) lenis.scrollTo(sizesRef.current, { offset: -window.innerHeight / 3 });
        else sizesRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    add(product, { color: color?.name, size, quantity: qty });
    const img = product.images[color?.imageIndex ?? 0]?.url ?? product.images[0].url;
    flyToCart(img, getImageRect());
    toast({ title: 'Added to bag', description: `${product.name} · ${size} × ${qty}`, image: img, variant: 'success' });
    onAdded?.();
  };

  return (
    <div>
      <p className="eyebrow text-muted">{product.category.name}</p>
      <h1 className={cn('h-display mt-3', compact ? 'text-2xl sm:text-3xl' : 'text-[clamp(2rem,9vw,3rem)]')}>{product.name}</h1>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <Price price={product.price} compareAt={product.compareAtPrice} className="text-xl" />
        <Stars rating={product.rating} count={product.reviewCount} />
      </div>
      <p className="mt-1 text-xs text-muted">Inclusive of all taxes</p>

      {!compact && <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-ink-soft">{product.description}</p>}

      {/* Colour */}
      <div className="mt-8">
        <p className="text-xs uppercase tracking-[0.16em]">
          Colour — <span className="text-muted">{color?.name}</span>
        </p>
        <div className="mt-3 flex gap-2.5">
          {product.colors.map((c, i) => (
            <button
              key={c.name}
              onClick={() => onColorChange(i)}
              aria-label={c.name}
              aria-pressed={i === colorIndex}
              data-cursor="link"
              className={cn(
                'relative h-9 w-9 rounded-full ring-1 ring-offset-[3px] ring-offset-bone transition-all duration-300',
                i === colorIndex ? 'ring-ink' : 'ring-line hover:ring-muted',
              )}
              style={{ background: c.hex }}
            />
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="mt-7" ref={sizesRef}>
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.16em]">
            Size {size && <span className="text-muted">— {size}</span>}
          </p>
          {!oneSize && (
            <button onClick={() => setGuideOpen(true)} className="link-underline inline-flex items-center gap-1.5 text-xs" data-cursor="link">
              <Ruler className="h-3.5 w-3.5" /> Size guide
            </button>
          )}
        </div>
        <motion.div
          className="mt-3 flex flex-wrap gap-2"
          animate={sizeError ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
          transition={{ duration: 0.45 }}
          onAnimationComplete={() => setSizeError(false)}
        >
          {product.sizes.map((s) => (
            <button
              key={s.label}
              disabled={!s.inStock}
              onClick={() => {
                setSize(s.label);
                setSizeError(false);
              }}
              data-cursor="link"
              className={cn(
                'chip relative h-11 min-w-[52px]',
                size === s.label && 'chip-active',
                !s.inStock && 'cursor-not-allowed text-line line-through hover:border-line',
              )}
            >
              {s.label}
            </button>
          ))}
        </motion.div>
        <AnimatePresence>
          {sizeError && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="field-error">
              Please choose a size
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Quantity + add */}
      <div ref={addRowRef} className="mt-8 flex items-stretch gap-2 sm:gap-3">
        <QuantityStepper value={qty} onChange={setQty} />
        <Button onClick={addToBag} size="lg" className="h-12 min-w-0 flex-1 px-4 sm:px-9" icon={<ShoppingBag className="h-4 w-4" />}>
          Add to bag
        </Button>
        <WishlistButton product={product} className="shrink-0 border border-line" />
      </div>

      <p className="mt-5 flex items-start gap-2 text-xs text-muted">
        <Truck className="h-4 w-4 shrink-0" /> Free shipping on orders over {formatINR(SHOP.freeShippingThreshold)} · Easy 15-day returns
      </p>

      <SizeGuide open={guideOpen} onClose={() => setGuideOpen(false)} product={product} />

      {sticky &&
        createPortal(
          <AnimatePresence>
            {showSticky && (
              <motion.div
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                exit={{ y: '110%' }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="pb-safe fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-line bg-bone/95 px-4 pt-3 backdrop-blur lg:hidden"
              >
                <img src={product.images[color?.imageIndex ?? 0].url} alt="" className="h-14 w-11 object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-muted">
                    {formatINR(product.price)} {size ? `· ${size}` : '· Select size'}
                  </p>
                </div>
                <Button onClick={addToBag} size="md" icon={<ShoppingBag className="h-4 w-4" />}>
                  Add
                </Button>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
