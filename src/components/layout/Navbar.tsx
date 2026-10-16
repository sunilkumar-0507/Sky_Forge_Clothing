import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Heart, Menu, Search, ShoppingBag, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { CountBadge } from '@/components/ui/Bits';
import { useCategories, useCollections } from '@/hooks/queries';
import { useScrollDirection } from '@/hooks/dom';
import { cn, EASE } from '@/lib/utils';
import { cartCount, useCart, useUI, useWishlist } from '@/store';
import { Logo } from './Logo';

const NAV = [
  { label: 'Men', slug: 'men' },
  { label: 'Women', slug: 'women' },
  { label: 'Accessories', slug: 'accessories' },
];

export function Navbar() {
  const { pathname } = useLocation();
  const { direction, scrolled } = useScrollDirection(60);
  const [mega, setMega] = useState<string | null>(null);
  const cart = useCart(cartCount);
  const wish = useWishlist((s) => s.items.length);
  const { setCartOpen, setSearchOpen, setMenuOpen, menuOpen } = useUI();

  useEffect(() => setMega(null), [pathname]);

  const overHero = pathname === '/' && !scrolled && !mega;
  const hidden = direction === 'down' && scrolled && !mega && !menuOpen;

  const iconBtn = 'relative grid h-10 w-10 place-items-center rounded-full transition-colors duration-300 hover:bg-ink/5';

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50"
      animate={{ y: hidden ? '-100%' : '0%' }}
      transition={{ duration: 0.6, ease: EASE }}
      onMouseLeave={() => setMega(null)}
    >
      <div
        className={cn(
          'relative transition-[background-color,color,border-color,backdrop-filter] duration-500',
          overHero ? 'border-b border-transparent text-bone' : 'border-b border-line/70 bg-bone/80 text-ink backdrop-blur-xl',
        )}
      >
        <nav className="container-x grid h-16 grid-cols-[1fr_auto_1fr] items-center md:h-[72px]" aria-label="Main">
          <div className="flex items-center gap-1">
            <button className={cn(iconBtn, 'lg:hidden')} onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <ul className="hidden items-center gap-7 lg:flex">
              <li>
                <NavLink to="/shop" className="link-underline text-xs font-medium uppercase tracking-[0.16em]" data-cursor="link" onMouseEnter={() => setMega(null)}>
                  Shop all
                </NavLink>
              </li>
              {NAV.map((n) => (
                <li key={n.slug} onMouseEnter={() => setMega(n.slug)}>
                  <Link
                    to={`/shop?category=${n.slug}`}
                    className={cn('link-underline text-xs font-medium uppercase tracking-[0.16em]', mega === n.slug && 'after:scale-x-100')}
                    data-cursor="link"
                    aria-expanded={mega === n.slug}
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
              <li onMouseEnter={() => setMega(null)}>
                <Link to="/shop?tag=new" className="link-underline text-xs font-medium uppercase tracking-[0.16em] text-ember" data-cursor="link">
                  New drop
                </Link>
              </li>
            </ul>
          </div>

          <Link to="/" aria-label="SKY Forge home" data-cursor="link">
            <Logo />
          </Link>

          <div className="flex items-center justify-end gap-0.5">
            <button className={iconBtn} onClick={() => setSearchOpen(true)} aria-label="Search" data-cursor="link">
              <Search className="h-[19px] w-[19px]" strokeWidth={1.7} />
            </button>
            <Link to="/account" className={cn(iconBtn, 'hidden sm:grid')} aria-label="Account" data-cursor="link">
              <User className="h-[19px] w-[19px]" strokeWidth={1.7} />
            </Link>
            <Link to="/wishlist" className={cn(iconBtn, 'hidden sm:grid')} aria-label={`Wishlist (${wish})`} data-cursor="link">
              <Heart className="h-[19px] w-[19px]" strokeWidth={1.7} />
              <CountBadge count={wish} />
            </Link>
            <button className={iconBtn} onClick={() => setCartOpen(true)} aria-label={`Bag (${cart} items)`} data-cart-target data-cursor="link">
              <ShoppingBag className="h-[19px] w-[19px]" strokeWidth={1.7} />
              <CountBadge count={cart} />
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>{mega && <MegaMenu category={mega} onNavigate={() => setMega(null)} />}</AnimatePresence>
    </motion.header>
  );
}

function MegaMenu({ category, onNavigate }: { category: string; onNavigate: () => void }) {
  const { data: categories } = useCategories();
  const { data: collections } = useCollections();
  const cat = categories?.find((c) => c.slug === category);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => setPreview(null), [category]);

  const links = [
    { label: `All ${cat?.name ?? ''}`, to: `/shop?category=${category}` },
    { label: 'New arrivals', to: `/shop?category=${category}&tag=new` },
    { label: 'Bestsellers', to: `/shop?category=${category}&tag=bestseller` },
    { label: 'On sale', to: `/shop?category=${category}&tag=sale` },
  ];

  const image = preview ?? cat?.image;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.25 } }}
      transition={{ duration: 0.5, ease: EASE }}
      className="absolute inset-x-0 top-full hidden border-b border-line bg-bone lg:block"
    >
      <div className="container-x grid grid-cols-12 gap-10 py-10">
        <div className="col-span-3">
          <p className="eyebrow text-muted">{cat?.name}</p>
          <ul className="mt-5 space-y-3">
            {links.map((l, i) => (
              <motion.li key={l.to} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i + 0.1, duration: 0.5, ease: EASE }}>
                <Link to={l.to} onClick={onNavigate} className="group inline-flex items-center gap-2 font-display text-2xl font-medium uppercase" data-cursor="link">
                  <span className="link-underline">{l.label}</span>
                  <ArrowUpRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
              </motion.li>
            ))}
          </ul>
        </div>
        <div className="col-span-3">
          <p className="eyebrow text-muted">Collections</p>
          <ul className="mt-5 space-y-3">
            {collections?.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/shop?collection=${c.slug}`}
                  onClick={onNavigate}
                  onMouseEnter={() => setPreview(c.image)}
                  onMouseLeave={() => setPreview(null)}
                  className="link-underline text-sm"
                  data-cursor="link"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-[240px] text-sm text-muted">{cat?.description}</p>
        </div>
        <div className="col-span-6 grid grid-cols-2 gap-4">
          <Link to={`/shop?category=${category}`} onClick={onNavigate} className="relative aspect-[4/3] overflow-hidden bg-bone-dark" data-cursor="view">
            <AnimatePresence initial={false}>
              {image && (
                <motion.img
                  key={image}
                  src={image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={{ clipPath: 'inset(0 0 100% 0)', scale: 1.15 }}
                  animate={{ clipPath: 'inset(0 0 0% 0)', scale: 1 }}
                  exit={{ opacity: 0, transition: { delay: 0.3 } }}
                  transition={{ duration: 0.8, ease: EASE }}
                />
              )}
            </AnimatePresence>
            <span className="absolute bottom-4 left-4 bg-bone px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em]">Shop {cat?.name}</span>
          </Link>
          <Link to="/shop?tag=new" onClick={onNavigate} className="relative aspect-[4/3] overflow-hidden bg-ink text-bone" data-cursor="view">
            {collections?.[0] && <img src={collections[0].image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />}
            <div className="absolute inset-0 flex flex-col justify-end p-5">
              <p className="eyebrow text-ember-light">Just landed</p>
              <p className="h-display mt-1 text-3xl">{collections?.[0]?.name}</p>
            </div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
