import Lenis from 'lenis';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/utils';

const LenisContext = createContext<Lenis | null>(null);

export const useLenis = () => useContext(LenisContext);

/** Jump to the top without smooth scrolling (used between route transitions). */
export function resetScroll(lenis: Lenis | null) {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    // Reduced motion: native scrolling only.
    if (prefersReducedMotion()) return;

    const instance = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    instance.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Modals/drawers broadcast this so the page behind them stops scrolling.
    const onLock = (e: Event) => ((e as CustomEvent<boolean>).detail ? instance.stop() : instance.start());
    window.addEventListener('skyforge:scroll-lock', onLock);

    setLenis(instance);
    return () => {
      window.removeEventListener('skyforge:scroll-lock', onLock);
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
