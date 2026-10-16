import { useRef } from 'react';
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { cn } from '@/lib/utils';

/** Infinite marquee whose speed (and direction) follows scroll velocity. */
export function Marquee({
  items,
  className,
  speed = 40,
  separator = '✦',
}: {
  items: string[];
  className?: string;
  speed?: number; // seconds per loop
  separator?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const tween = gsap.to(track.current, { xPercent: -50, ease: 'none', duration: speed, repeat: -1 });
        let settle: gsap.core.Tween | undefined;
        const st = ScrollTrigger.create({
          trigger: root.current,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            const v = self.getVelocity() / 250;
            const boost = gsap.utils.clamp(-6, 6, v);
            settle?.kill();
            tween.timeScale(boost >= 0 ? 1 + boost : -1 + boost);
            settle = gsap.to(tween, { timeScale: boost >= 0 ? 1 : -1, duration: 0.8, ease: 'power2.out' });
          },
        });
        return () => {
          st.kill();
          settle?.kill();
        };
      });
    },
    { scope: root, dependencies: [speed] },
  );

  // Two identical halves so xPercent -50 loops seamlessly.
  const half = (key: string) => (
    <div key={key} className="flex shrink-0 items-center" aria-hidden={key === 'b'}>
      {items.map((t, i) => (
        <span key={i} className="flex items-center">
          <span className="px-6 md:px-10">{t}</span>
          <span className="text-ember">{separator}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div ref={root} className={cn('overflow-hidden whitespace-nowrap', className)}>
      <div ref={track} className="flex w-max will-change-transform">
        {half('a')}
        {half('b')}
      </div>
    </div>
  );
}
