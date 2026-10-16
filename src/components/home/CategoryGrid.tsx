import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RevealText } from '@/components/ui/Reveal';
import { unsplash } from '@/config/media';
import { useCategories } from '@/hooks/queries';
import { EASE } from '@/lib/utils';

export function CategoryGrid() {
  const { data: categories } = useCategories();
  const tiles = [
    ...(categories ?? []).map((c) => ({ key: c.slug, name: c.name, to: `/shop?category=${c.slug}`, image: c.image, meta: `${c.productCount ?? ''} styles` })),
    { key: 'new', name: 'New Arrivals', to: '/shop?tag=new', image: unsplash('1520367445093-50dc08a59d9d', 900, 1200), meta: 'This week' },
  ];

  // Track the pointer so the clip-path circle grows from wherever you enter.
  const onEnter = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--x', `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty('--y', `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <section className="container-x py-20 md:py-32">
      <div className="mb-8 flex flex-col md:mb-12 justify-between gap-4 md:flex-row md:items-end">
        <RevealText as="h2" text="Shop by category" className="h-display text-5xl md:text-7xl" />
        <p className="max-w-xs text-sm text-muted">Four ways in. Everything ships free over ₹2,999.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
        {tiles.map((t, i) => (
          <motion.div
            key={t.key}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1, ease: EASE, delay: i * 0.1 }}
          >
            <Link
              to={t.to}
              onPointerEnter={onEnter}
              data-cursor="view"
              className="group relative block aspect-[3/4] overflow-hidden bg-bone-dark"
              style={{ '--x': '50%', '--y': '50%' } as React.CSSProperties}
            >
              {/* Base: muted greyscale */}
              <img src={t.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-50 grayscale" />
              {/* Reveal: full colour, masked by a circle that grows from the pointer */}
              <img
                src={t.image}
                alt={t.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full scale-110 object-cover transition-[clip-path,transform] duration-[900ms] ease-expo [clip-path:circle(0%_at_var(--x)_var(--y))] group-hover:scale-100 group-hover:[clip-path:circle(150%_at_var(--x)_var(--y))] [@media(hover:none)]:scale-100 [@media(hover:none)]:[clip-path:none]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 text-bone sm:p-4 md:p-6">
                <div className="min-w-0">
                  <p className="eyebrow text-[10px] text-bone/70 sm:text-[11px]">{t.meta}</p>
                  <p className="h-display mt-1 text-[clamp(1rem,4.4vw,1.5rem)] sm:text-2xl md:text-4xl">{t.name}</p>
                </div>
                <span className="hidden h-10 w-10 shrink-0 place-items-center sm:grid rounded-full bg-bone text-ink transition-transform duration-500 ease-expo group-hover:rotate-45">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
