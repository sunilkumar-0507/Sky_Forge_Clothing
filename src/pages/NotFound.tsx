import { motion } from 'framer-motion';
import { useRef } from 'react';
import { PageTransition } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/Button';
import { useDocumentTitle } from '@/hooks/dom';
import { EASE } from '@/lib/utils';

/** Swinging hanger + draggable digits. Reused for unknown products. */
export function NotFoundContent({ title = 'This page went out of stock.', message = 'The link might be broken, or the page has moved. Toss the numbers around while you’re here.' }: { title?: string; message?: string }) {
  const area = useRef<HTMLDivElement>(null);
  return (
    <section ref={area} className="container-x relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden pb-16 pt-24 text-center">
      <motion.svg
        viewBox="0 0 120 80"
        className="h-24 w-36 text-ink md:h-32 md:w-48"
        style={{ transformOrigin: '60px 0px' }}
        animate={{ rotate: [-9, 9, -9] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      >
        <path d="M60 4 a8 8 0 1 1 8 8 c-4 0-8 2-8 7 v4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M60 23 L8 62 a4 4 0 0 0 2.4 7.2 h99.2 a4 4 0 0 0 2.4-7.2 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      </motion.svg>

      <div className="mt-2 flex select-none gap-2 md:gap-4" aria-label="404">
        {['4', '0', '4'].map((d, i) => (
          <motion.span
            key={i}
            drag
            dragConstraints={area}
            dragElastic={0.4}
            whileDrag={{ scale: 1.1, rotate: i === 1 ? 20 : -12 }}
            whileHover={{ y: -12 }}
            initial={{ y: 120, opacity: 0, rotate: i === 1 ? 10 : -6 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 160, damping: 12, delay: 0.3 + i * 0.12 }}
            className={`cursor-grab font-display text-[min(34vw,32svh)] font-semibold leading-none tracking-[-0.06em] active:cursor-grabbing md:text-[min(22vw,32svh)] ${i === 1 ? 'text-ember' : ''}`}
            data-cursor="drag"
          >
            {d}
          </motion.span>
        ))}
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.8 }}>
        <h1 className="h-display mt-6 text-[clamp(1.75rem,7vw,3rem)] md:mt-8">{title}</h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted">{message}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to="/" magnetic>
            Back home
          </Button>
          <Button to="/shop" variant="outline" magnetic>
            Browse the shop
          </Button>
        </div>
      </motion.div>
    </section>
  );
}

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <PageTransition>
      <NotFoundContent />
    </PageTransition>
  );
}
