import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { isFinePointer } from '@/lib/utils';

/** Pulls its child toward the pointer while hovered. Inert on touch and reduced motion. */
export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.4 });

  const onMove = (e: React.PointerEvent) => {
    if (reduce || !isFinePointer() || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div ref={ref} onPointerMove={onMove} onPointerLeave={reset} style={{ x, y }} className={className ?? 'inline-block'}>
      {children}
    </motion.div>
  );
}
