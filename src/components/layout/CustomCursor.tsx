import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/dom';
import { cn } from '@/lib/utils';

type Mode = 'default' | 'link' | 'view' | 'drag' | 'zoom' | 'hidden';

const LABEL: Partial<Record<Mode, string>> = { view: 'View', drag: 'Drag', zoom: 'Zoom' };

/**
 * Desktop-only cursor: a dot that tracks the pointer exactly and a ring that follows
 * with lag. Elements opt into states via data-cursor="link|view|drag|zoom".
 */
export function CustomCursor() {
  const enabled = useMediaQuery('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>('hidden');
  const { pathname } = useLocation();

  useEffect(() => setMode((m) => (m === 'hidden' ? m : 'default')), [pathname]);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add('has-custom-cursor');
    const target = { x: -100, y: -100 };
    const pos = { x: -100, y: -100 };
    let raf = 0;

    const loop = () => {
      pos.x += (target.x - pos.x) * 0.16;
      pos.y += (target.y - pos.y) * 0.16;
      if (ring.current) ring.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (dot.current) dot.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      setMode((m) => (m === 'hidden' ? 'default' : m));
    };
    const onOver = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor], a, button, input, textarea, select, label');
      if (!el) return setMode('default');
      const tag = el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return setMode('hidden');
      setMode((el.dataset.cursor as Mode) || 'link');
    };
    const onLeave = () => setMode('hidden');

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;
  const label = LABEL[mode];

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[200]">
      <div ref={ring} className="absolute left-0 top-0 will-change-transform">
        <div
          className={cn(
            // Fixed 88px circle; states change scale only (transform + opacity).
            '-ml-[44px] -mt-[44px] grid h-[88px] w-[88px] place-items-center rounded-full border-2 transition-[transform,background-color,border-color,opacity] duration-500 ease-expo',
            mode === 'default' && 'scale-[0.4] border-ink/30',
            mode === 'link' && 'scale-[0.64] border-ember bg-ember/10',
            label && 'scale-100 border-ink bg-ink text-bone',
            mode === 'hidden' && 'scale-[0.2] border-transparent opacity-0',
          )}
        >
          <span className={cn('text-[11px] font-medium uppercase tracking-[0.18em] transition-opacity duration-300', label ? 'opacity-100' : 'opacity-0')}>{label}</span>
        </div>
      </div>
      <div ref={dot} className="absolute left-0 top-0">
        <div className={cn('-ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-ember transition-opacity duration-200', mode === 'default' || mode === 'link' ? 'opacity-100' : 'opacity-0')} />
      </div>
    </div>
  );
}
