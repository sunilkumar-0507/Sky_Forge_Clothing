import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn, EASE } from '@/lib/utils';

const container = (stagger: number, delay: number): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

const piece: Variants = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: { duration: 0.9, ease: EASE } },
};

const tags = { h1: motion.h1, h2: motion.h2, h3: motion.h3, p: motion.p, span: motion.span, div: motion.div };

interface RevealTextProps {
  text: string;
  as?: keyof typeof tags;
  className?: string;
  by?: 'word' | 'char';
  stagger?: number;
  delay?: number;
  /** Animate immediately instead of on entering the viewport. */
  immediate?: boolean;
}

/** Splits text into masked words/characters that slide up into view, once. */
export function RevealText({ text, as = 'p', className, by = 'word', stagger, delay = 0, immediate }: RevealTextProps) {
  const words = text.split(' ');
  const MotionTag = tags[as];
  const viewProps = immediate
    ? { animate: 'show' }
    : { whileInView: 'show', viewport: { once: true, amount: 0.35 } };

  return (
    <MotionTag
      className={className}
      aria-label={text}
      initial="hidden"
      variants={container(stagger ?? (by === 'char' ? 0.025 : 0.06), delay)}
      {...viewProps}
    >
      {words.map((word, wi) => (
        <span key={wi} aria-hidden className={cn('inline-block whitespace-nowrap', wi < words.length - 1 && 'mr-[0.26em]')}>
          {by === 'word' ? (
            <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              <motion.span variants={piece} className="inline-block will-change-transform">
                {word}
              </motion.span>
            </span>
          ) : (
            [...word].map((ch, ci) => (
              <span key={ci} className="inline-block overflow-hidden pb-[0.06em] align-bottom">
                <motion.span variants={piece} className="inline-block">
                  {ch}
                </motion.span>
              </span>
            ))
          )}
        </span>
      )).flatMap((el, i) => (i < words.length - 1 ? [el, ' '] : [el]))}
    </MotionTag>
  );
}

/** Image that unmasks with a clip-path wipe while scaling down from 1.2. */
export function RevealImage({
  src,
  alt,
  className,
  imgClassName,
  delay = 0,
  direction = 'up',
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  delay?: number;
  direction?: 'up' | 'left';
}) {
  const hidden = direction === 'up' ? 'inset(100% 0% 0% 0%)' : 'inset(0% 100% 0% 0%)';
  return (
    <motion.div
      className={cn('relative overflow-hidden bg-bone-dark', className)}
      initial={{ clipPath: hidden }}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 1.2, ease: EASE, delay }}
    >
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={cn('h-full w-full object-cover', imgClassName)}
        initial={{ scale: 1.2 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 1.6, ease: EASE, delay }}
      />
    </motion.div>
  );
}

/** Generic fade-up wrapper for blocks of content. */
export function FadeUp({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
