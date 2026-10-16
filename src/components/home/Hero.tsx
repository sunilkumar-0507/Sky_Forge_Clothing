import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { RevealText } from '@/components/ui/Reveal';
import { editorial } from '@/config/media';
import { gsap, MOTION_OK, useGSAP } from '@/lib/gsap';
import { EASE } from '@/lib/utils';
import { useUI } from '@/store';

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const introDone = useUI((s) => s.introDone);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const st = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true };
        gsap.to('[data-hero-bg]', { yPercent: 22, ease: 'none', scrollTrigger: st });
        gsap.to('[data-hero-copy]', { yPercent: -35, opacity: 0, ease: 'none', scrollTrigger: { ...st, end: '80% top' } });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative h-[100svh] min-h-[600px] overflow-hidden bg-ink text-bone">
      <div data-hero-bg className="absolute inset-0 will-change-transform">
        <img
          src={editorial.hero}
          alt="Model in an oversized coat walking through a city square"
          className="h-full w-full animate-slow-zoom object-cover object-[50%_30%]"
          {...{ fetchpriority: "high" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-ink/10 to-ink/70" />
      </div>

      <div data-hero-copy className="container-x relative flex h-full flex-col justify-end pb-20 pt-24 md:pb-24">
        {introDone && (
          <>
            <motion.p
              className="eyebrow mb-5 flex items-center gap-3 text-bone/80"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
            >
              <span className="h-px w-10 bg-ember" /> Autumn / Winter ’26
            </motion.p>
            <h1 className="h-display text-mega">
              <RevealText as="span" text="Forged in" by="char" immediate delay={0.55} className="block" />
              <RevealText as="span" text="the city." by="char" immediate delay={0.8} className="block text-ember" />
            </h1>
            <motion.div
              className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE, delay: 1.2 }}
            >
              <p className="max-w-md text-[15px] leading-relaxed text-bone/80">
                Heavyweight basics, sharp tailoring and outerwear built to outlast the season. Made in small batches in India.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button to="/shop?tag=new" variant="ember" size="lg" magnetic>
                  Shop the drop
                </Button>
                <Button to="/shop" variant="light" size="lg" magnetic>
                  Explore all
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </div>

      <motion.div
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: introDone ? 1 : 0 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        aria-hidden
      >
        <span className="relative h-9 w-[22px] rounded-full border border-bone/50">
          <span className="absolute left-1/2 top-1.5 h-1.5 w-1 -translate-x-1/2 animate-scroll-dot rounded-full bg-bone" />
        </span>
        <span className="eyebrow text-[10px] text-bone/60">Scroll</span>
      </motion.div>
      <div className="absolute bottom-6 right-4 flex items-center gap-2 md:hidden" aria-hidden>
        <ArrowDown className="h-4 w-4 animate-bounce" />
      </div>
    </section>
  );
}
