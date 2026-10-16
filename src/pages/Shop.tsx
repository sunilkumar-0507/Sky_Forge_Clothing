import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { Grid2x2, Grid3x3, LayoutGrid, SlidersHorizontal, Square, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageTransition } from '@/components/layout/PageTransition';
import { ProductCard } from '@/components/product/ProductCard';
import { Filters, type FilterState } from '@/components/shop/Filters';
import { Button } from '@/components/ui/Button';
import { ProductCardSkeleton } from '@/components/ui/Bits';
import { Overlay } from '@/components/ui/Overlay';
import { RevealText } from '@/components/ui/Reveal';
import { useDebounce, useDocumentTitle, useScrollDirection } from '@/hooks/dom';
import { useCategories, useCollections, useFacets, useInfiniteProducts } from '@/hooks/queries';
import { cn, EASE } from '@/lib/utils';
import type { ProductSort, ProductTag } from '@/types';

const SORTS: { value: ProductSort; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
];

const DENSITY = {
  1: 'grid-cols-1 sm:grid-cols-2',
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
} as const;
type Density = keyof typeof DENSITY;

const TAG_TITLES: Record<ProductTag, string> = { new: 'New arrivals', bestseller: 'Bestsellers', sale: 'On sale' };
const PAGE_SIZE = 9;

const readDensity = (): Density => {
  try {
    const v = Number(localStorage.getItem('skyforge-density'));
    return v === 1 || v === 2 || v === 3 || v === 4 ? v : 3;
  } catch {
    return 3;
  }
};

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') ?? undefined;
  const collection = params.get('collection') ?? undefined;
  const tag = (params.get('tag') as ProductTag | null) ?? undefined;
  const search = params.get('search') ?? undefined;
  const sort = (params.get('sort') as ProductSort | null) ?? 'featured';

  const [filters, setFilters] = useState<FilterState>({ sizes: [], colors: [], price: null });
  const [density, setDensity] = useState<Density>(readDensity);
  const [drawer, setDrawer] = useState(false);
  const debouncedPrice = useDebounce(filters.price, 300);
  // Mirror the navbar: when it hides on scroll-down, the toolbar slides up into its place.
  const { direction, scrolled } = useScrollDirection(60);
  const navHidden = direction === 'down' && scrolled;

  // Category switch invalidates size/price facets; reset the local filters.
  useEffect(() => setFilters({ sizes: [], colors: [], price: null }), [category]);
  useEffect(() => {
    try {
      localStorage.setItem('skyforge-density', String(density));
    } catch {
      // ignore
    }
  }, [density]);

  const query = useMemo(
    () => ({
      category,
      collection,
      tag,
      search,
      sort,
      sizes: filters.sizes,
      colors: filters.colors,
      minPrice: debouncedPrice?.[0],
      maxPrice: debouncedPrice?.[1],
      pageSize: PAGE_SIZE,
    }),
    [category, collection, tag, search, sort, filters.sizes, filters.colors, debouncedPrice],
  );

  const { data, isLoading, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage, isPlaceholderData } = useInfiniteProducts(query);
  const { data: facets } = useFacets(category);
  const { data: categories } = useCategories();
  const { data: collections } = useCollections();

  const products = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.totalCount ?? 0;

  const catName = categories?.find((c) => c.slug === category)?.name;
  const colName = collections?.find((c) => c.slug === collection)?.name;
  const title = search ? `“${search}”` : colName ?? [tag && TAG_TITLES[tag], catName].filter(Boolean).join(' · ') ?? '';
  const heading = title || 'All products';
  useDocumentTitle(search ? `Search: ${search}` : heading);

  const setParam = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: key === 'sort' });
  };

  const categoryHref = (slug?: string) => {
    const next = new URLSearchParams(params);
    if (slug) next.set('category', slug);
    else next.delete('category');
    next.delete('collection');
    const s = next.toString();
    return `/shop${s ? `?${s}` : ''}`;
  };

  const chips = [
    ...(tag ? [{ label: TAG_TITLES[tag], clear: () => setParam('tag') }] : []),
    ...(collection ? [{ label: colName ?? collection, clear: () => setParam('collection') }] : []),
    ...(search ? [{ label: `Search: ${search}`, clear: () => setParam('search') }] : []),
    ...filters.sizes.map((s) => ({ label: `Size ${s}`, clear: () => setFilters((f) => ({ ...f, sizes: f.sizes.filter((x) => x !== s) })) })),
    ...filters.colors.map((c) => ({ label: c, clear: () => setFilters((f) => ({ ...f, colors: f.colors.filter((x) => x !== c) })) })),
    ...(filters.price ? [{ label: `₹${filters.price[0].toLocaleString('en-IN')}–₹${filters.price[1].toLocaleString('en-IN')}`, clear: () => setFilters((f) => ({ ...f, price: null })) }] : []),
  ];
  const clearAll = () => {
    setFilters({ sizes: [], colors: [], price: null });
    const next = new URLSearchParams();
    if (category) next.set('category', category);
    setParams(next);
  };

  const filterPanel = <Filters facets={facets} state={filters} onChange={setFilters} category={category} categoryHref={categoryHref} />;

  return (
    <PageTransition>
      <section className="container-x pb-8 pt-24 md:pb-10 md:pt-36">
        <p className="eyebrow text-muted">Shop {catName && `/ ${catName}`}</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <RevealText key={heading} as="h1" text={heading} immediate delay={0.3} className="h-display text-[clamp(2.25rem,11vw,6rem)]" />
          <p className="text-sm text-muted">
            <motion.span key={total} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="inline-block tabular-nums text-ink">
              {total}
            </motion.span>{' '}
            products
          </p>
        </div>
      </section>

      {/* Toolbar */}
      <div
        className={cn(
          'sticky z-30 border-y border-line bg-bone/90 backdrop-blur transition-[top] duration-[600ms] ease-expo',
          navHidden ? 'top-0' : 'top-16 md:top-[72px]',
        )}
      >
        <div className="container-x flex h-14 items-center justify-between gap-4">
          <button onClick={() => setDrawer(true)} className="flex h-10 items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] lg:hidden" data-cursor="link">
            <SlidersHorizontal className="h-4 w-4" /> Filters {chips.length > 0 && <span className="grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] text-bone">{chips.length}</span>}
          </button>
          <p className="hidden text-xs font-medium uppercase tracking-[0.16em] lg:block">Filter</p>
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Phones: 1 or 2 columns */}
            <div className="flex items-center md:hidden" role="group" aria-label="Grid columns">
              <button onClick={() => setDensity(1)} aria-pressed={density === 1} aria-label="1 column" className={cn('grid h-9 w-9 place-items-center', density === 1 ? 'text-ink' : 'text-muted')}>
                <Square className="h-4 w-4" />
              </button>
              <button onClick={() => setDensity(2)} aria-pressed={density !== 1} aria-label="2 columns" className={cn('grid h-9 w-9 place-items-center', density !== 1 ? 'text-ink' : 'text-muted')}>
                <Grid2x2 className="h-4 w-4" />
              </button>
            </div>
            <label className="flex items-center gap-2 text-xs">
              <span className="hidden text-muted sm:inline">Sort</span>
              <select aria-label="Sort products" value={sort} onChange={(e) => setParam('sort', e.target.value === 'featured' ? undefined : e.target.value)} className="max-w-[9.5rem] cursor-pointer bg-transparent py-1 pr-1 text-xs font-medium uppercase tracking-wider focus:outline-none sm:max-w-none">
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="hidden items-center gap-1 border-l border-line pl-5 md:flex" role="group" aria-label="Grid density">
              {([2, 3, 4] as Density[]).map((d) => {
                const Icon = d === 2 ? Grid2x2 : d === 3 ? Grid3x3 : LayoutGrid;
                return (
                  <button key={d} onClick={() => setDensity(d)} aria-pressed={density === d} aria-label={`${d} columns`} className={cn('relative grid h-8 w-8 place-items-center transition-colors', density === d ? 'text-ink' : 'text-muted hover:text-ink')} data-cursor="link">
                    {density === d && <motion.span layoutId="density" className="absolute inset-0 bg-ink/5" />}
                    <Icon className="relative h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="container-x grid grid-cols-1 gap-10 py-6 md:py-10 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-[160px]">{filterPanel}</div>
        </aside>

        <div>
          <AnimatePresence initial={false}>
            {chips.length > 0 && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="mb-8 flex flex-wrap items-center gap-2">
                  <AnimatePresence>
                    {chips.map((c) => (
                      <motion.button key={c.label} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={c.clear} className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs text-bone">
                        {c.label} <X className="h-3 w-3" />
                      </motion.button>
                    ))}
                  </AnimatePresence>
                  <button onClick={clearAll} className="link-underline ml-2 text-xs">
                    Clear all
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={cn('transition-opacity duration-300', isPlaceholderData && isFetching && 'opacity-50')}>
            {isLoading ? (
              <div className={cn('grid gap-x-3 gap-y-10 sm:gap-x-4 md:gap-x-6 md:gap-y-12', DENSITY[density])}>
                {Array.from({ length: PAGE_SIZE }, (_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-24 text-center">
                <p className="h-display text-4xl">Nothing matches — yet.</p>
                <p className="mt-3 text-sm text-muted">Try removing a filter or two.</p>
                <Button onClick={clearAll} variant="outline" className="mt-8">
                  Clear filters
                </Button>
              </motion.div>
            ) : (
              <LayoutGroup>
                <motion.div layout className={cn('grid gap-x-3 gap-y-10 sm:gap-x-4 md:gap-x-6 md:gap-y-12', DENSITY[density])}>
                  <AnimatePresence mode="popLayout">
                    {products.map((p, i) => (
                      <motion.div
                        key={p.id}
                        layout
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.3 } }}
                        transition={{ duration: 0.7, ease: EASE, delay: (i % PAGE_SIZE) * 0.05, layout: { duration: 0.6, ease: EASE } }}
                      >
                        <ProductCard product={p} priority={i < 3} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </LayoutGroup>
            )}

            {isFetchingNextPage && (
              <div className={cn('mt-10 grid gap-x-3 gap-y-10 sm:gap-x-4 md:gap-x-6 md:gap-y-12', DENSITY[density])}>
                {Array.from({ length: 3 }, (_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            )}

            {products.length > 0 && (
              <div className="mt-16 flex flex-col items-center gap-4">
                <p className="text-xs text-muted">
                  Showing {products.length} of {total}
                </p>
                <div className="h-px w-40 bg-line">
                  <motion.div className="h-px origin-left bg-ink" animate={{ scaleX: total ? products.length / total : 0 }} transition={{ duration: 0.6, ease: EASE }} />
                </div>
                {hasNextPage && (
                  <Button onClick={() => fetchNextPage()} loading={isFetchingNextPage} variant="outline" magnetic className="mt-2">
                    Load more
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Overlay open={drawer} onClose={() => setDrawer(false)} placement="left" label="Filters">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <p className="h-display text-2xl">Filters</p>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">{filterPanel}</div>
        <div className="grid grid-cols-2 gap-2 border-t border-line p-4">
          <Button variant="outline" onClick={clearAll}>
            Clear
          </Button>
          <Button onClick={() => setDrawer(false)}>Show {total}</Button>
        </div>
      </Overlay>
    </PageTransition>
  );
}
