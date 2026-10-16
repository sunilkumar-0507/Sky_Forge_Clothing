import { AnimatePresence, motion } from 'framer-motion';
import { Instagram, Twitter, X, Youtube } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLockBodyScroll } from '@/hooks/dom';
import { EASE } from '@/lib/utils';
import { useUI } from '@/store';
import { Logo } from './Logo';

const LINKS = [
  { label: 'Shop all', to: '/shop' },
  { label: 'Men', to: '/shop?category=men' },
  { label: 'Women', to: '/shop?category=women' },
  { label: 'Accessories', to: '/shop?category=accessories' },
  { label: 'New drop', to: '/shop?tag=new' },
  { label: 'About', to: '/about' },
];

const SECONDARY = [
  { label: 'Account', to: '/account' },
  { label: 'Wishlist', to: '/wishlist' },
  { label: 'Contact', to: '/contact' },
];

export function MobileMenu() {
  const open = useUI((s) => s.menuOpen);
  const setOpen = useUI((s) => s.setMenuOpen);
  const location = useLocation();
  useLockBodyScroll(open);

  useEffect(() => setOpen(false), [location.pathname, location.search, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex flex-col bg-ink text-bone"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.6, ease: EASE, delay: 0.15 } }}
          transition={{ duration: 0.8, ease: EASE }}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          data-lenis-prevent
        >
          <div className="container-x flex h-16 shrink-0 items-center justify-between">
            <Logo />
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="grid h-10 w-10 place-items-center rounded-full border border-bone/20">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="container-x flex flex-1 flex-col justify-center overflow-y-auto">
            <ul>
              {LINKS.map((l, i) => (
                <li key={l.to} className="overflow-hidden">
                  <motion.div
                    initial={{ y: '105%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '105%', transition: { duration: 0.4, ease: EASE, delay: 0.03 * (LINKS.length - i) } }}
                    transition={{ duration: 0.8, ease: EASE, delay: 0.25 + i * 0.06 }}
                  >
                    <Link to={l.to} className="flex items-baseline gap-4 py-1.5 font-display text-[11vw] font-semibold uppercase leading-[0.95] sm:text-7xl">
                      <span className="font-sans text-xs font-normal text-bone/40">0{i + 1}</span>
                      {l.label}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </nav>
          <motion.div
            className="container-x pb-safe flex flex-wrap items-center justify-between gap-4 border-t border-bone/10 pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.7 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <div className="flex gap-5 text-xs uppercase tracking-[0.16em] text-bone/70">
              {SECONDARY.map((l) => (
                <Link key={l.to} to={l.to}>
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="flex gap-3">
              {[Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" aria-label="Social link" className="text-bone/70">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
