import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/queries';
import { cn, formatINR } from '@/lib/utils';
import type { ProductFacets } from '@/types';

export interface FilterState {
  sizes: string[];
  colors: string[];
  price: [number, number] | null;
}

interface Props {
  facets?: ProductFacets;
  state: FilterState;
  onChange: (next: FilterState) => void;
  category?: string;
  /** Builds a link that swaps the category but keeps other URL params. */
  categoryHref: (slug?: string) => string;
}

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-line py-6 first:pt-0">
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.16em]">{title}</p>
      {children}
    </div>
  );
}

export function Filters({ facets, state, onChange, category, categoryHref }: Props) {
  const { data: categories } = useCategories();
  const min = facets?.minPrice ?? 0;
  const max = facets?.maxPrice ?? 25000;
  const [lo, hi] = state.price ?? [min, max];

  return (
    <div>
      <Group title="Category">
        <ul className="space-y-2.5 text-sm">
          {[{ name: 'All', slug: undefined as string | undefined }, ...(categories ?? [])].map((c) => {
            const active = category === c.slug;
            return (
              <li key={c.name}>
                <Link to={categoryHref(c.slug)} className={cn('flex items-center justify-between', active ? 'font-medium' : 'text-ink-soft hover:text-ink')} data-cursor="link">
                  <span className="flex items-center gap-2">
                    <span className={cn('h-1.5 w-1.5 rounded-full transition-colors', active ? 'bg-ember' : 'bg-transparent')} />
                    {c.name}
                  </span>
                  {'productCount' in c && <span className="text-xs text-muted">{(c as { productCount?: number }).productCount}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </Group>

      <Group title="Size">
        <div className="flex flex-wrap gap-1.5">
          {facets?.sizes.map((s) => (
            <button key={s} onClick={() => onChange({ ...state, sizes: toggle(state.sizes, s) })} className={cn('chip', state.sizes.includes(s) && 'chip-active')} aria-pressed={state.sizes.includes(s)}>
              {s}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Colour">
        <div className="grid grid-cols-5 gap-3">
          {facets?.colors.map((c) => {
            const on = state.colors.includes(c.name);
            return (
              <button key={c.name} onClick={() => onChange({ ...state, colors: toggle(state.colors, c.name) })} className="flex flex-col items-center gap-1.5" aria-pressed={on} aria-label={c.name} data-cursor="link">
                <span className={cn('relative grid h-8 w-8 place-items-center rounded-full ring-1 ring-offset-2 ring-offset-bone transition-all', on ? 'ring-ink' : 'ring-line')} style={{ background: c.hex }}>
                  {on && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Check className={cn('h-3.5 w-3.5', ['White', 'Neutral', 'Yellow'].includes(c.name) ? 'text-ink' : 'text-bone')} strokeWidth={3} />
                    </motion.span>
                  )}
                </span>
                <span className="text-[10px] text-muted">{c.name}</span>
              </button>
            );
          })}
        </div>
      </Group>

      <Group title="Price">
        <PriceRange min={min} max={max} value={[lo, hi]} onChange={(v) => onChange({ ...state, price: v[0] === min && v[1] === max ? null : v })} />
      </Group>
    </div>
  );
}

/** Dual-thumb range built from two native range inputs (keyboard accessible). */
function PriceRange({ min, max, value, onChange }: { min: number; max: number; value: [number, number]; onChange: (v: [number, number]) => void }) {
  const step = 100;
  const [lo, hi] = value;
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const thumb =
    'pointer-events-none absolute inset-0 h-1 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-ink [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-ink [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125';

  return (
    <div>
      <div className="relative mx-2 mt-2 h-1">
        <div className="absolute inset-0 rounded-full bg-line" />
        <div className="absolute h-1 rounded-full bg-ink" style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }} />
        <input type="range" min={min} max={max} step={step} value={lo} aria-label="Minimum price" onChange={(e) => onChange([Math.min(Number(e.target.value), hi - step), hi])} className={thumb} />
        <input type="range" min={min} max={max} step={step} value={hi} aria-label="Maximum price" onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + step)])} className={thumb} />
      </div>
      <div className="mt-5 flex justify-between text-sm tabular-nums">
        <span>{formatINR(lo)}</span>
        <span>{formatINR(hi)}</span>
      </div>
    </div>
  );
}
