import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Magnetic } from './Magnetic';

type Variant = 'primary' | 'ember' | 'outline' | 'light' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  to?: string;
  magnetic?: boolean;
  loading?: boolean;
  full?: boolean;
  icon?: ReactNode;
}

const base =
  'group relative inline-flex select-none items-center justify-center gap-2 overflow-hidden whitespace-nowrap font-medium uppercase tracking-[0.14em] transition-colors duration-500 ease-expo disabled:pointer-events-none disabled:opacity-50';

const variants: Record<Variant, { root: string; fill: string }> = {
  primary: { root: 'bg-ink text-bone', fill: 'bg-ember' },
  ember: { root: 'bg-ember text-bone', fill: 'bg-ink' },
  outline: { root: 'border border-ink text-ink hover:text-bone', fill: 'bg-ink' },
  light: { root: 'bg-bone text-ink hover:text-bone', fill: 'bg-ink' },
  ghost: { root: 'text-ink hover:text-bone', fill: 'bg-ink' },
};

const sizes: Record<Size, string> = {
  sm: 'h-10 px-5 text-[11px]',
  md: 'h-12 px-7 text-xs',
  lg: 'h-14 px-9 text-[13px]',
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size = 'md', to, magnetic, loading, full, icon, className, children, ...rest },
  ref,
) {
  const v = variants[variant];
  const classes = cn(base, v.root, sizes[size], full && 'w-full', className);
  const inner = (
    <>
      {/* Fill wipes up from the bottom on hover (transform only). */}
      <span
        aria-hidden
        className={cn(
          'absolute inset-0 translate-y-[101%] rounded-[inherit] transition-transform duration-500 ease-expo group-hover:translate-y-0',
          v.fill,
        )}
      />
      <span className="relative z-10 inline-flex items-center gap-2">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
        {children}
      </span>
    </>
  );

  const el = to ? (
    <Link to={to} className={classes} data-cursor="link">
      {inner}
    </Link>
  ) : (
    <button ref={ref} className={classes} disabled={loading || rest.disabled} data-cursor="link" {...rest}>
      {inner}
    </button>
  );

  return magnetic ? <Magnetic className={full ? 'block w-full' : 'inline-block'}>{el}</Magnetic> : el;
});
