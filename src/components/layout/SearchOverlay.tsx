import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Loader2, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Price } from '@/components/ui/Bits';
import { useDebounce, useLockBodyScroll } from '@/hooks/dom';
import { useProductSearch } from '@/hooks/queries';
import { EASE } from '@/lib/utils';
import { useUI } from '@/store';

const POPULAR = ['Hoodie', 'Denim', 'Black', 'Dress', 'Leather', 'Tee', 'Sneakers'];

export function SearchOverlay() {
  const open = useUI((s) => s.searchOpen);
  const setOpen = useUI((s) => s.setSearchOpen);
  const [term, setTerm] = useState('');
  const debounced = useDebounce(term, 220);
  const { data: results, isFetching } = useProductSearch(debounced);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, setOpen]);

  // Global ⌘K / Ctrl+K and "/" shortcut.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName);
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpen]);

  const close = () => setOpen(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim()) return;
    close();
    navigate(`/shop?search=${encodeURIComponent(term.trim())}`);
  };

  const showResults = debounced.trim().length > 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[85]" role="dialog" aria-modal="true" aria-label="Search">
          <motion.div className="absolute inset-0 bg-ink/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} />
          <motion.div
            className="relative max-h-[100dvh] overflow-y-auto bg-bone"
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.7, ease: EASE }}
            data-lenis-prevent
          >
            <div className="container-x pb-12 pt-4 sm:pt-6">
              <div className="flex justify-end">
                <button onClick={close} aria-label="Close search" className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5" data-cursor="link">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={submit} className="mt-2 flex items-center gap-3 border-b border-ink pb-4 sm:mt-4 sm:gap-4">
                <Search className="h-6 w-6 shrink-0 md:h-8 md:w-8" strokeWidth={1.5} />
                <input
                  ref={inputRef}
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Search the collection"
                  data-display
                  enterKeyHint="search"
                  className="w-full min-w-0 bg-transparent font-display text-2xl font-medium uppercase placeholder:text-line focus:outline-none sm:text-3xl md:text-6xl"
                  aria-label="Search products"
                />
                {isFetching && <Loader2 className="h-5 w-5 shrink-0 animate-spin text-muted" />}
              </form>

              {!showResults && (
                <div className="mt-8">
                  <p className="eyebrow text-muted">Popular searches</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {POPULAR.map((p, i) => (
                      <motion.button
                        key={p}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.04 }}
                        onClick={() => setTerm(p)}
                        className="chip rounded-full px-4"
                        data-cursor="link"
                      >
                        {p}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {showResults && (
                <div className="mt-8">
                  <div className="flex items-center justify-between">
                    <p className="eyebrow text-muted">{results?.length ? `${results.length} results` : isFetching ? 'Searching…' : 'No matches'}</p>
                    {!!results?.length && (
                      <Link to={`/shop?search=${encodeURIComponent(debounced)}`} onClick={close} className="link-underline inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em]">
                        See all <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
                    <AnimatePresence mode="popLayout">
                      {results?.map((p, i) => (
                        <motion.div
                          key={p.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5, ease: EASE, delay: i * 0.04 }}
                        >
                          <Link to={`/product/${p.slug}`} onClick={close} className="group block" data-cursor="view">
                            <div className="aspect-[3/4] overflow-hidden bg-bone-dark">
                              <img src={p.images[0].url} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 ease-expo group-hover:scale-105" />
                            </div>
                            <p className="mt-2 truncate text-xs font-medium">{p.name}</p>
                            <Price price={p.price} compareAt={p.compareAtPrice} className="text-xs" />
                          </Link>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
