import { AnimatePresence, motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { toast, useWishlist } from '@/store';
import type { Product } from '@/types';
import { cn } from '@/lib/utils';

const PARTICLES = 10;

/** Heart toggle with a particle burst when an item is added. */
export function WishlistButton({ product, className, size = 'md' }: { product: Product; className?: string; size?: 'sm' | 'md' }) {
  const active = useWishlist((s) => s.items.some((p) => p.id === product.id));
  const toggle = useWishlist((s) => s.toggle);
  const [burst, setBurst] = useState(0);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggle(product);
    if (added) setBurst((b) => b + 1);
    toast({
      title: added ? 'Saved to wishlist' : 'Removed from wishlist',
      description: product.name,
      image: product.images[0].url,
    });
  };

  const dim = size === 'sm' ? 'h-9 w-9' : 'h-12 w-12';

  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
      data-cursor="link"
      className={cn('grid place-items-center', !/(absolute|fixed)/.test(className ?? '') && 'relative', dim, className)}
    >
      <motion.span
        key={active ? `on-${burst}` : 'off'}
        initial={{ scale: active ? 0.4 : 1 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 12 }}
      >
        <Heart
          className={cn('h-[18px] w-[18px] transition-colors', active ? 'fill-ember text-ember' : 'text-ink')}
          strokeWidth={1.6}
        />
      </motion.span>
      <AnimatePresence>
        {burst > 0 && active && (
          <motion.span key={burst} className="pointer-events-none absolute inset-0" initial="a" animate="b" exit={{ opacity: 0 }}>
            <motion.span
              className="absolute inset-1 rounded-full border-2 border-ember"
              variants={{ a: { scale: 0.2, opacity: 1 }, b: { scale: 1.6, opacity: 0 } }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
            {Array.from({ length: PARTICLES }, (_, i) => {
              const angle = (i / PARTICLES) * Math.PI * 2;
              return (
                <motion.span
                  key={i}
                  className={cn('absolute left-1/2 top-1/2 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full', i % 2 ? 'bg-ember' : 'bg-ink')}
                  variants={{
                    a: { x: 0, y: 0, scale: 1, opacity: 1 },
                    b: { x: Math.cos(angle) * 24, y: Math.sin(angle) * 24, scale: 0, opacity: 0 },
                  }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                />
              );
            })}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
