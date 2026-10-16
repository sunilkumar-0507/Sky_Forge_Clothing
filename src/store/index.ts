import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types';

// ───────────── Cart ─────────────
export interface CartLine {
  key: string; // productId|color|size
  productId: number;
  slug: string;
  name: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  color: string;
  size: string;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  add: (product: Product, opts: { color?: string; size: string; quantity?: number }) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (product, { color, size, quantity = 1 }) =>
        set((s) => {
          const c = product.colors.find((x) => x.name === color) ?? product.colors[0];
          const key = `${product.id}|${c?.name ?? ''}|${size}`;
          const existing = s.lines.find((l) => l.key === key);
          if (existing) {
            return {
              lines: s.lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(10, l.quantity + quantity) } : l)),
            };
          }
          return {
            lines: [
              {
                key,
                productId: product.id,
                slug: product.slug,
                name: product.name,
                image: product.images[c?.imageIndex ?? 0]?.url ?? product.images[0].url,
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                color: c?.name ?? '',
                size,
                quantity,
              },
              ...s.lines,
            ],
          };
        }),
      setQuantity: (key, quantity) =>
        set((s) => ({ lines: s.lines.map((l) => (l.key === key ? { ...l, quantity: Math.max(1, Math.min(10, quantity)) } : l)) })),
      remove: (key) => set((s) => ({ lines: s.lines.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [] }),
    }),
    { name: 'skyforge-cart', version: 1 },
  ),
);

export const cartCount = (s: CartState) => s.lines.reduce((n, l) => n + l.quantity, 0);
export const cartSubtotal = (s: CartState) => s.lines.reduce((n, l) => n + l.price * l.quantity, 0);

// ───────────── Wishlist ─────────────
interface WishlistState {
  items: Product[];
  toggle: (product: Product) => boolean; // returns true if now wishlisted
  remove: (id: number) => void;
  has: (id: number) => boolean;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) => {
        const exists = get().items.some((p) => p.id === product.id);
        set((s) => ({ items: exists ? s.items.filter((p) => p.id !== product.id) : [product, ...s.items] }));
        return !exists;
      },
      remove: (id) => set((s) => ({ items: s.items.filter((p) => p.id !== id) })),
      has: (id) => get().items.some((p) => p.id === id),
    }),
    { name: 'skyforge-wishlist', version: 1 },
  ),
);

// ───────────── UI ─────────────
export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const VISITED_KEY = 'skyforge-visited';
const hasVisited = () => {
  try {
    return localStorage.getItem(VISITED_KEY) === '1';
  } catch {
    return true;
  }
};

interface UIState {
  /** False while the first-visit brand loader is on screen. */
  introDone: boolean;
  finishIntro: () => void;
  cartOpen: boolean;
  searchOpen: boolean;
  menuOpen: boolean;
  quickView: Product | null;
  /** layoutId of the card that opened quick view (shared-element animation). */
  quickViewKey: string | null;
  /** Card → detail shared-element transition payload. */
  sharedImage: { slug: string; src: string; from: Rect; to?: Rect } | null;
  setCartOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  setMenuOpen: (v: boolean) => void;
  setQuickView: (p: Product | null, layoutKey?: string) => void;
  setSharedImage: (v: UIState['sharedImage']) => void;
  setSharedTarget: (to: Rect) => void;
}

export const useUI = create<UIState>()((set) => ({
  introDone: hasVisited(),
  finishIntro: () => {
    try {
      localStorage.setItem(VISITED_KEY, '1');
    } catch {
      // storage unavailable (private mode) — loader will simply show again next time
    }
    set({ introDone: true });
  },
  cartOpen: false,
  searchOpen: false,
  menuOpen: false,
  quickView: null,
  quickViewKey: null,
  sharedImage: null,
  setCartOpen: (cartOpen) => set({ cartOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  setQuickView: (quickView, layoutKey) => set((s) => ({ quickView, quickViewKey: quickView ? layoutKey ?? null : s.quickViewKey })),
  setSharedImage: (sharedImage) => set({ sharedImage }),
  setSharedTarget: (to) => set((s) => (s.sharedImage ? { sharedImage: { ...s.sharedImage, to } } : s)),
}));

// ───────────── Auth (UI only) ─────────────
interface AuthState {
  user: { firstName: string; lastName: string; email: string } | null;
  signIn: (user: AuthState['user'], token: string) => void;
  signOut: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      signIn: (user, token) => {
        localStorage.setItem('skyforge-token', token);
        set({ user });
      },
      signOut: () => {
        localStorage.removeItem('skyforge-token');
        set({ user: null });
      },
    }),
    { name: 'skyforge-auth' },
  ),
);

// ───────────── Toasts ─────────────
export interface Toast {
  id: number;
  title: string;
  description?: string;
  image?: string;
  variant?: 'default' | 'success' | 'error';
  action?: { label: string; onClick: () => void };
}

interface ToastState {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: number) => void;
}

let toastId = 0;
export const useToasts = create<ToastState>()((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts.slice(-2), { ...t, id }] }));
    setTimeout(() => get().dismiss(id), 3800);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = (t: Omit<Toast, 'id'>) => useToasts.getState().push(t);
