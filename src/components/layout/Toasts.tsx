import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { EASE } from '@/lib/utils';
import { useToasts } from '@/store';

export function Toasts() {
  const toasts = useToasts((s) => s.toasts);
  const dismiss = useToasts((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed left-3 right-3 top-[72px] z-[110] flex flex-col items-center gap-2 sm:bottom-4 sm:left-auto sm:right-6 sm:top-auto sm:items-end" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, transition: { duration: 0.3 } }}
            transition={{ duration: 0.5, ease: EASE }}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 bg-ink p-3 pr-2 text-bone shadow-2xl shadow-ink/30"
            role="status"
          >
            {t.image ? (
              <img src={t.image} alt="" className="h-14 w-11 shrink-0 object-cover" />
            ) : t.variant === 'error' ? (
              <AlertCircle className="ml-1 h-5 w-5 shrink-0 text-ember" />
            ) : (
              <CheckCircle2 className="ml-1 h-5 w-5 shrink-0 text-ember" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{t.title}</p>
              {t.description && <p className="truncate text-xs text-bone/60">{t.description}</p>}
            </div>
            {t.action && (
              <button onClick={t.action.onClick} className="shrink-0 text-xs font-medium uppercase tracking-wider text-ember-light">
                {t.action.label}
              </button>
            )}
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="grid h-8 w-8 shrink-0 place-items-center text-bone/60 hover:text-bone">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
