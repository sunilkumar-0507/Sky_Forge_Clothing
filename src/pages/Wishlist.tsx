import { AnimatePresence, motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { RevealText } from '@/components/ui/Reveal';
import { useDocumentTitle } from '@/hooks/dom';
import { EASE } from '@/lib/utils';
import { useWishlist } from '@/store';

export default function Wishlist() {
  useDocumentTitle('Wishlist');
  const items = useWishlist((s) => s.items);

  return (
    <PageTransition>
      <section className="container-x min-h-[70vh] pb-20 pt-24 md:pb-28 md:pt-36">
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <RevealText as="h1" text="Wishlist" immediate delay={0.3} className="h-display text-[clamp(2.75rem,13vw,6rem)]" />
          <p className="text-sm text-muted">{items.length} saved</p>
        </div>
        {items.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col items-center py-24 text-center">
            <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.6 }}>
              <Heart className="h-14 w-14 text-ember" strokeWidth={1.2} />
            </motion.div>
            <p className="h-display mt-6 text-3xl">Nothing saved yet</p>
            <p className="mt-2 max-w-xs text-sm text-muted">Tap the heart on anything you love and it’ll wait for you here.</p>
            <Button to="/shop" className="mt-8" magnetic>
              Start browsing
            </Button>
          </motion.div>
        ) : (
          <motion.div layout className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-4 md:gap-y-12 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {items.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.35 } }}
                  transition={{ duration: 0.7, ease: EASE, delay: i * 0.05 }}
                >
                  <ProductCard product={p} context="wishlist" />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </PageTransition>
  );
}
