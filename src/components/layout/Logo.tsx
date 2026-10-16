import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-baseline font-display text-[22px] font-semibold uppercase leading-none tracking-[-0.02em]', className)}>
      Sky<span className="mx-[0.12em] inline-block h-[0.28em] w-[0.28em] translate-y-[-0.05em] rounded-full bg-ember" />Forge
    </span>
  );
}
