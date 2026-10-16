import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, type ReactNode } from 'react';
import { ScrollTrigger } from '@/lib/gsap';
import { Footer } from './Footer';
import { Logo } from './Logo';

const CURTAIN = 'pointer-events-none fixed inset-0 z-[90] flex items-center justify-center bg-ink text-bone';
const ease = [0.76, 0, 0.24, 1] as const;

/**
 * Curtain-wipe route transition. The page itself only fades (no transform), so
 * GSAP pins inside it keep working — position: fixed breaks under a transformed parent.
 */
export function PageTransition({ children, footer = true }: { children: ReactNode; footer?: boolean }) {
  const reduce = useReducedMotion();

  // New page content changes document height — let ScrollTrigger re-measure.
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.5, delay: reduce ? 0 : 0.25 } }}
        exit={{ opacity: 0, transition: { duration: reduce ? 0.2 : 0.45 } }}
      >
        {children}
        {footer && <Footer />}
      </motion.main>
      {!reduce && (
        <>
          {/* Covers the old page on exit… */}
          <motion.div
            className={CURTAIN}
            style={{ transformOrigin: 'bottom' }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 0 }}
            exit={{ scaleY: 1 }}
            transition={{ duration: 0.55, ease }}
          />
          {/* …and lifts off the new one on enter. */}
          <motion.div
            className={CURTAIN}
            style={{ transformOrigin: 'top' }}
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            exit={{ scaleY: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.1 }}
          >
            <motion.span initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <Logo className="text-4xl" />
            </motion.span>
          </motion.div>
        </>
      )}
    </>
  );
}
