import { AnimatePresence, motion, type Variant } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useLockBodyScroll, useMediaQuery } from '@/hooks/dom';
import { cn, EASE } from '@/lib/utils';

type Placement = 'center' | 'right' | 'left' | 'full';

interface OverlayProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  placement?: Placement;
  className?: string;
  label: string;
  showClose?: boolean;
}

const panel: Record<Placement | 'sheet', { initial: Variant; animate: Variant; exit: Variant; className: string }> = {
  center: {
    initial: { opacity: 0, y: 40, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 24, scale: 0.98 },
    className: 'relative m-auto max-h-[92vh] w-[min(100%-2rem,960px)] overflow-y-auto bg-bone',
  },
  // Phones: centered modals become bottom sheets.
  sheet: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
    className: 'relative mt-auto max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-bone pb-safe',
  },
  right: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    className: 'ml-auto flex h-full w-full max-w-[460px] flex-col bg-bone',
  },
  left: {
    initial: { x: '-100%' },
    animate: { x: 0 },
    exit: { x: '-100%' },
    className: 'mr-auto flex h-full w-full max-w-[400px] flex-col bg-bone',
  },
  full: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    className: 'h-full w-full',
  },
};

/** Portal-based modal/drawer with backdrop, Escape-to-close, focus handoff and scroll lock. */
export function Overlay({ open, onClose, children, placement = 'center', className, label, showClose = true }: OverlayProps) {
  useLockBodyScroll(open);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current();
    window.addEventListener('keydown', onKey);
    requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [open]);

  const isPhone = !useMediaQuery('(min-width: 640px)');
  const variant = placement === 'center' && isPhone ? 'sheet' : placement;
  const p = panel[variant];

  return createPortal(
    <AnimatePresence>
      {open && (
        <div key="overlay" className="fixed inset-0 z-[80] flex" role="dialog" aria-modal="true" aria-label={label}>
          <motion.div
            className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            data-lenis-prevent
            className={cn('relative z-10 outline-none', p.className, className)}
            variants={{ initial: p.initial, animate: p.animate, exit: p.exit }}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: variant === 'center' ? 0.5 : 0.6, ease: EASE }}
          >
            {variant === 'sheet' && <div aria-hidden className="sticky top-0 z-20 mx-auto h-1 w-10 translate-y-2 rounded-full bg-ink/20" />}
            {showClose && (
              <button
                onClick={onClose}
                aria-label="Close"
                data-cursor="link"
                className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full bg-bone/80 transition-transform duration-500 ease-expo hover:rotate-90"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
