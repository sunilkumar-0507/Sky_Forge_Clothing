import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { RevealImage } from '@/components/ui/Reveal';
import { editorial } from '@/config/media';
import { gsap, MOTION_OK, useGSAP } from '@/lib/gsap';

const STORY =
  'We started SKY Forge in a one-room studio with a simple question: why can’t everyday clothes be built like they mean it? Heavier cottons. Honest prices. Cuts that respect your shape. Forged in small batches, made to outlast every trend.';

/** Words fill from faint to solid as the paragraph scrolls through the viewport. */
export function BrandStory() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          '[data-word]',
          { opacity: 0.12 },
          {
            opacity: 1,
            stagger: 0.08,
            ease: 'none',
            scrollTrigger: { trigger: '[data-story]', start: 'top 80%', end: 'bottom 45%', scrub: true },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="container-x grid grid-cols-1 gap-10 py-20 md:grid-cols-12 md:gap-12 md:py-40">
      <div className="md:col-span-4">
        <p className="eyebrow text-muted">Our story</p>
        <RevealImage src={editorial.story} alt="Rail of neutral-toned garments in the SKY Forge studio" className="mt-6 aspect-[4/5]" />
      </div>
      <div className="md:col-span-8 md:pl-10">
        <p data-story className="font-display text-[clamp(1.8rem,4vw,4rem)] font-medium leading-[1.08] tracking-[-0.02em]">
          {STORY.split(' ').map((w, i) => (
            <span key={i} data-word className="inline-block">
              {w}&nbsp;
            </span>
          ))}
        </p>
        <div className="mt-10 grid grid-cols-3 gap-4 border-t border-line pt-8 sm:gap-6">
          {[
            ['240+', 'GSM cotton, minimum'],
            ['12', 'Partner workshops'],
            ['0', 'Seasonal clearance burns'],
          ].map(([n, l]) => (
            <div key={l}>
              <p className="font-display text-3xl font-semibold sm:text-4xl md:text-5xl">{n}</p>
              <p className="mt-2 text-xs text-muted">{l}</p>
            </div>
          ))}
        </div>
        <Link to="/about" className="link-underline mt-10 inline-block text-xs font-medium uppercase tracking-[0.16em]" data-cursor="link">
          Read the full story
        </Link>
      </div>
    </section>
  );
}
