import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { EASE } from '@/lib/utils';
import { useUI } from '@/store';

const WORD = ['S', 'K', 'Y', '•', 'F', 'O', 'R', 'G', 'E'];

/** Brand intro shown on the very first visit only (flag in localStorage). */
export function PageLoader() {
  const introDone = useUI((s) => s.introDone);
  const finishIntro = useUI((s) => s.finishIntro);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (introDone) return;
    document.documentElement.style.overflow = 'hidden';
    const start = performance.now();
    const duration = 1900;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setCount(Math.round((1 - Math.pow(1 - t, 3)) * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setTimeout(finishIntro, 350);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.style.overflow = '';
    };
  }, [introDone, finishIntro]);

  return (
    <AnimatePresence>
      {!introDone && (
        <motion.div
          className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-ink text-bone"
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          initial={{ clipPath: 'inset(0 0 0% 0)' }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          aria-label="Loading"
          role="status"
        >
          <div className="flex overflow-hidden font-display text-[16vw] font-semibold uppercase leading-none tracking-[-0.04em] md:text-[9vw]">
            {WORD.map((ch, i) => (
              <motion.span
                key={i}
                className={ch === '•' ? 'mx-[0.08em] self-center text-ember' : ''}
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                exit={{ y: '-110%' }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.1 + i * 0.05 }}
              >
                {ch === '•' ? <span className="inline-block h-[0.22em] w-[0.22em] rounded-full bg-ember" /> : ch}
              </motion.span>
            ))}
          </div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="eyebrow mt-6 text-bone/50">
            Forged in the city
          </motion.p>
          <div className="absolute bottom-8 left-0 right-0 flex items-end justify-between px-6 md:px-10">
            <span className="eyebrow text-bone/40">Est. 2026</span>
            <span className="font-display text-5xl font-medium tabular-nums md:text-7xl">{count}</span>
          </div>
          <motion.div className="absolute bottom-0 left-0 h-[3px] origin-left bg-ember" style={{ width: '100%', scaleX: count / 100 }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
