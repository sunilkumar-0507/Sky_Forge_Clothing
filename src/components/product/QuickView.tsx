import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Overlay } from '@/components/ui/Overlay';
import { useUI } from '@/store';
import { ProductPurchase } from './ProductPurchase';

export function QuickView() {
  const current = useUI((s) => s.quickView);
  // Keep rendering the last product while the overlay plays its exit animation.
  const lastRef = useRef(current);
  if (current) lastRef.current = current;
  const product = lastRef.current;
  const layoutKey = useUI((s) => s.quickViewKey);
  const setQuickView = useUI((s) => s.setQuickView);
  const [colorIndex, setColorIndex] = useState(0);
  const imgRef = useRef<HTMLDivElement>(null);
  const close = () => setQuickView(null);

  useEffect(() => setColorIndex(0), [product?.id]);

  return (
    <Overlay open={!!current} onClose={close} label={product ? `Quick view: ${product.name}` : 'Quick view'} className="max-w-5xl">
      {product && (
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div ref={imgRef} className="relative h-[46dvh] overflow-hidden bg-bone-dark sm:h-auto sm:aspect-[3/4] md:aspect-auto md:min-h-[600px]">
            <motion.div layoutId={layoutKey ?? undefined} className="absolute inset-0" transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.img
                  key={colorIndex}
                  src={product.images[product.colors[colorIndex]?.imageIndex ?? 0].url}
                  alt={product.name}
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              </AnimatePresence>
            </motion.div>
          </div>
          <div className="p-5 sm:p-6 md:p-10">
            <ProductPurchase
              key={product.id}
              product={product}
              colorIndex={colorIndex}
              onColorChange={setColorIndex}
              getImageRect={() => imgRef.current?.getBoundingClientRect() ?? null}
              compact
              onAdded={close}
            />
            <Link
              to={`/product/${product.slug}`}
              onClick={close}
              className="link-underline mt-8 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em]"
              data-cursor="link"
            >
              View full details <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </Overlay>
  );
}
