import { motion } from 'framer-motion';
import { Heart, Instagram } from 'lucide-react';
import { Skeleton } from '@/components/ui/Bits';
import { RevealText } from '@/components/ui/Reveal';
import { useUgc } from '@/hooks/queries';
import { cn, EASE } from '@/lib/utils';

export function UgcGrid() {
  const { data: posts, isLoading } = useUgc();

  return (
    <section className="py-20 md:py-32">
      <div className="container-x mb-8 flex flex-col md:mb-12 justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="eyebrow text-muted">Worn by you</p>
          <RevealText as="h2" text="#ForgedInTheCity" className="h-display mt-3 text-[clamp(1.75rem,8.4vw,4.5rem)]" />
        </div>
        <a href="#" className="link-underline inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em]" data-cursor="link">
          <Instagram className="h-4 w-4" /> Follow @skyforge
        </a>
      </div>
      <div className="grid grid-cols-2 gap-1 md:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="aspect-square" />)
          : posts?.map((p, i) => (
              <motion.a
                key={p.id}
                href="#"
                aria-label={`Post by ${p.handle}`}
                data-cursor="link"
                className={cn('group relative block aspect-square overflow-hidden bg-bone-dark')}
                initial={{ opacity: 0, scale: 0.94 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, ease: EASE, delay: (i % 4) * 0.08 }}
              >
                <img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] ease-expo group-hover:scale-110" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/55 text-bone opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <Instagram className="h-6 w-6 translate-y-3 transition-transform duration-500 ease-expo group-hover:translate-y-0" />
                  <p className="text-sm font-medium">{p.handle}</p>
                  <p className="flex items-center gap-1 text-xs text-bone/70">
                    <Heart className="h-3 w-3 fill-current" /> {p.likes.toLocaleString('en-IN')}
                  </p>
                </div>
              </motion.a>
            ))}
      </div>
    </section>
  );
}
