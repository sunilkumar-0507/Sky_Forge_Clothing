import { useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { RevealText } from '@/components/ui/Reveal';
import { editorial } from '@/config/media';
import { gsap, MOTION_OK, useGSAP } from '@/lib/gsap';
import { cn } from '@/lib/utils';

// Each frame drifts at its own speed for depth (negative = moves up faster).
const FRAMES = [
  { src: editorial.lookbook[0], speed: -0.25, className: 'col-span-7 md:col-span-5 md:col-start-1 aspect-[4/5]', caption: 'Look 01 — Rust bomber, raw denim' },
  { src: editorial.lookbook[1], speed: 0.35, className: 'col-span-5 md:col-span-3 md:col-start-7 mt-24 aspect-[3/4]', caption: 'Look 02 — Black wool coat' },
  { src: editorial.lookbook[2], speed: -0.5, className: 'col-span-6 md:col-span-3 md:col-start-10 mt-10 md:mt-56 aspect-[3/4]', caption: 'Look 03 — Prairie florals' },
  { src: editorial.lookbook[3], speed: 0.2, className: 'col-span-6 md:col-span-4 md:col-start-2 -mt-6 md:mt-10 aspect-[4/5]', caption: 'Look 04 — Summer tones' },
  { src: editorial.lookbook[4], speed: -0.35, className: 'hidden md:block md:col-span-4 md:col-start-8 md:-mt-24 aspect-[3/4]', caption: 'Look 05 — Off-duty' },
];

export function Lookbook() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.utils.toArray<HTMLElement>('[data-speed]').forEach((el) => {
          const speed = Number(el.dataset.speed);
          gsap.fromTo(
            el,
            { yPercent: speed * -30 },
            { yPercent: speed * 30, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } },
          );
          // Inner image counter-moves slightly for a parallax-within-frame effect.
          gsap.fromTo(
            el.querySelector('img'),
            { yPercent: -8, scale: 1.15 },
            { yPercent: 8, scale: 1.15, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
          );
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-ink py-20 text-bone md:py-40">
      <div className="container-x relative">
        <div className="pointer-events-none relative z-10 mx-auto mb-12 max-w-4xl text-center mix-blend-difference md:absolute md:inset-x-0 md:top-[38%] md:mb-0">
          <p className="eyebrow text-ember-light">Lookbook · AW26</p>
          <RevealText as="h2" text="Built for the long way home." className="h-display mt-4 text-[clamp(2.5rem,11vw,7vw)] md:text-[7vw]" />
        </div>
        <div className="grid grid-cols-12 gap-3 md:gap-8">
          {FRAMES.map((f) => (
            <figure key={f.src} data-speed={f.speed} className={cn('relative will-change-transform', f.className)}>
              <div className="h-full w-full overflow-hidden">
                <img src={f.src} alt={f.caption} loading="lazy" className="h-full w-full object-cover" />
              </div>
              <figcaption className="mt-3 text-[11px] uppercase tracking-[0.16em] text-bone/50">{f.caption}</figcaption>
            </figure>
          ))}
        </div>
        <div className="relative z-10 mt-20 flex justify-center">
          <Button to="/shop" variant="light" size="lg" magnetic>
            Shop the looks
          </Button>
        </div>
      </div>
    </section>
  );
}
