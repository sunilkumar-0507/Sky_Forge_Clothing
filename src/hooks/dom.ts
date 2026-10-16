import { useEffect, useState } from 'react';

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export function useDebounce<T>(value: T, ms = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

/** Returns 'down' | 'up' and whether the page has scrolled past `threshold`. */
export function useScrollDirection(threshold = 40) {
  const [state, setState] = useState({ direction: 'up' as 'up' | 'down', scrolled: false });
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      const delta = y - last;
      if (Math.abs(delta) > 6) {
        setState({ direction: delta > 0 && y > 120 ? 'down' : 'up', scrolled: y > threshold });
        last = y;
      } else {
        setState((s) => (s.scrolled === y > threshold ? s : { ...s, scrolled: y > threshold }));
      }
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return state;
}

let lockCount = 0;

/** Locks page scroll (native + Lenis) while active. Ref-counted so nested overlays work. */
export function useLockBodyScroll(active: boolean) {
  useEffect(() => {
    if (!active) return;
    if (lockCount++ === 0) {
      document.documentElement.style.overflow = 'hidden';
      window.dispatchEvent(new CustomEvent('skyforge:scroll-lock', { detail: true }));
    }
    return () => {
      if (--lockCount === 0) {
        document.documentElement.style.overflow = '';
        window.dispatchEvent(new CustomEvent('skyforge:scroll-lock', { detail: false }));
      }
    };
  }, [active]);
}

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title.includes('SKY Forge') ? title : `${title} — SKY Forge`;
  }, [title]);
}
