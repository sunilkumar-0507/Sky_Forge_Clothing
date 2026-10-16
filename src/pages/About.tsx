import { useRef } from 'react';
import { PageTransition } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/Button';
import { Marquee } from '@/components/ui/Marquee';
import { FadeUp, RevealImage, RevealText } from '@/components/ui/Reveal';
import { editorial } from '@/config/media';
import { useDocumentTitle } from '@/hooks/dom';
import { gsap, MOTION_OK, useGSAP } from '@/lib/gsap';

const VALUES = [
  { n: '01', title: 'Heavier, by default', body: 'Our cotton starts at 240 GSM. It drapes better, lasts longer and still looks right after a hundred washes.' },
  { n: '02', title: 'Small batches', body: 'We cut in runs of a few hundred. Less waste, no clearance bonfires, and pieces that don’t feel like everyone else’s.' },
  { n: '03', title: 'Honest pricing', body: 'No inflated MRPs or permanent sales. Our prices are what the garment is worth, with the margin we need to keep going.' },
  { n: '04', title: 'Made in India', body: 'Twelve partner workshops across Tiruppur, Ludhiana and Bengaluru, each audited for fair wages and safe floors.' },
];

const TIMELINE = [
  ['2022', 'A single heavyweight tee, sold out of a Bengaluru flat.'],
  ['2023', 'First outerwear capsule; the Rider jacket waitlist hits 4,000.'],
  ['2024', 'Women’s line launches with the Sunday dress.'],
  ['2025', 'Twelve workshops, one standard. Repairs programme begins.'],
  ['2026', 'The Ember Drop — our biggest collection yet.'],
];

export default function About() {
  useDocumentTitle('Our story');
  const hero = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.to('[data-about-img]', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: hero.current, start: 'top top', end: 'bottom top', scrub: true } });
      });
    },
    { scope: hero },
  );

  return (
    <PageTransition>
      <section ref={hero} className="container-x pb-16 pt-28 md:pb-20 md:pt-44">
        <p className="eyebrow text-muted">About SKY Forge</p>
        <RevealText as="h1" text="Clothes built like they mean it." immediate delay={0.3} className="h-display mt-5 max-w-6xl text-[clamp(2.75rem,12vw,9vw)] md:text-[9vw]" />
        <div className="mt-10 overflow-hidden md:mt-16">
          <div data-about-img className="aspect-[4/3] will-change-transform sm:aspect-[16/8]">
            <RevealImage src={editorial.about[0]} alt="Rail of SKY Forge garments in the studio" className="h-full" />
          </div>
        </div>
      </section>

      <section className="container-x grid grid-cols-1 gap-10 py-20 md:grid-cols-12">
        <FadeUp className="md:col-span-5">
          <p className="h-display text-4xl md:text-5xl">Sky for the ambition. Forge for the work.</p>
        </FadeUp>
        <FadeUp className="space-y-5 text-[15px] leading-relaxed text-ink-soft md:col-span-6 md:col-start-7" delay={0.15}>
          <p>SKY Forge started in 2022 with a tee we couldn’t find anywhere: heavy, structured, fairly made and priced like a normal person might buy it. We sold the first 200 out of a one-bedroom flat in Indiranagar.</p>
          <p>Today we design everything in Bengaluru and make it with partner workshops across India. The idea hasn’t changed — fewer, better things, built to be worn hard and handed down.</p>
        </FadeUp>
      </section>

      <Marquee items={['Heavier cottons', 'Honest prices', 'Small batches', 'Made in India']} className="border-y border-line py-6 font-display text-4xl font-medium uppercase md:text-6xl" />

      <section className="container-x py-24 md:py-32">
        <div className="grid grid-cols-1 gap-px bg-line md:grid-cols-2">
          {VALUES.map((v, i) => (
            <FadeUp key={v.n} delay={(i % 2) * 0.1} className="bg-bone p-6 sm:p-8 md:p-12">
              <p className="font-display text-sm text-ember">{v.n}</p>
              <p className="h-display mt-4 text-3xl md:text-4xl">{v.title}</p>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">{v.body}</p>
            </FadeUp>
          ))}
        </div>
      </section>

      <section className="container-x grid grid-cols-1 gap-6 pb-24 md:grid-cols-2">
        <RevealImage src={editorial.about[1]} alt="Garments hanging in the studio" className="aspect-[4/5]" />
        <RevealImage src={editorial.about[2]} alt="Neutral knitwear on hangers" className="aspect-[4/5] md:mt-32" delay={0.15} direction="left" />
      </section>

      <section className="bg-ink py-24 text-bone md:py-32">
        <div className="container-x">
          <RevealText as="h2" text="The story so far" className="h-display text-5xl md:text-7xl" />
          <ol className="mt-14 border-t border-bone/15">
            {TIMELINE.map(([year, text], i) => (
              <FadeUp key={year} delay={i * 0.05}>
                <li className="grid grid-cols-[90px_1fr] gap-6 border-b border-bone/15 py-7 md:grid-cols-[200px_1fr]">
                  <span className="font-display text-3xl font-medium text-ember md:text-5xl">{year}</span>
                  <span className="self-center text-bone/80 md:text-lg">{text}</span>
                </li>
              </FadeUp>
            ))}
          </ol>
          <div className="mt-14">
            <Button to="/shop" variant="ember" size="lg" magnetic>
              Shop the collection
            </Button>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
