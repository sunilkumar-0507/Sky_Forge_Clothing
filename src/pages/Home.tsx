import { BrandStory } from '@/components/home/BrandStory';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { Featured } from '@/components/home/Featured';
import { Hero } from '@/components/home/Hero';
import { Lookbook } from '@/components/home/Lookbook';
import { NewDrop } from '@/components/home/NewDrop';
import { Newsletter } from '@/components/home/Newsletter';
import { UgcGrid } from '@/components/home/UgcGrid';
import { PageTransition } from '@/components/layout/PageTransition';
import { Marquee } from '@/components/ui/Marquee';
import { useDocumentTitle } from '@/hooks/dom';

const PHRASES = ['Forged in the city', 'Free shipping over ₹2,999', 'AW26 — out now', 'Made in India', '15-day easy returns', 'Small batch, built to last'];

export default function Home() {
  useDocumentTitle('SKY Forge — Forged in the city');
  return (
    <PageTransition>
      <Hero />
      <Marquee items={PHRASES} className="border-y border-ink bg-ember py-5 font-display text-2xl font-medium uppercase text-bone md:py-7 md:text-5xl" />
      <NewDrop />
      <CategoryGrid />
      <Lookbook />
      <Featured />
      <BrandStory />
      <Marquee items={['SKY Forge', 'Wear it in', 'SKY Forge', 'Wear it out']} speed={60} separator="●" className="py-6 font-display text-[12vw] font-semibold uppercase leading-none text-outline md:text-[8vw]" />
      <UgcGrid />
      <Newsletter />
    </PageTransition>
  );
}
