const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

/** ₹1,299 / ₹1,29,999 (Indian digit grouping). */
export const formatINR = (amount: number) => inr.format(amount);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');

export const discountPercent = (price: number, compareAt?: number) =>
  compareAt && compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Shared easing for Framer Motion (matches Tailwind's ease-expo). */
export const EASE = [0.16, 1, 0.3, 1] as const;
