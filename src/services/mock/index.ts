// In-browser stand-ins for the ASP.NET Core API. They mimic the server's
// behaviour (filtering, paging, 404s) and add latency so loading states show.
import {
  mockAddresses,
  mockCategories,
  mockCollections,
  mockOrders,
  mockProducts,
  mockUgc,
  mockUser,
} from '@/data/mock';
import type { Order, PagedResult, Product, ProductQuery } from '@/types';
import type { AccountService, CatalogService, ContentService, OrderService, ProductService } from '../contracts';
import { ApiError } from '../http/client';

const delay = <T>(value: T, ms = 250 + Math.random() * 350): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), ms));

const matchesSearch = (p: Product, term: string) => {
  const t = term.trim().toLowerCase();
  if (!t) return true;
  return [p.name, p.category.name, p.fabric, ...p.tags, ...p.colors.map((c) => c.name)]
    .join(' ')
    .toLowerCase()
    .includes(t);
};

const sorters: Record<NonNullable<ProductQuery['sort']>, (a: Product, b: Product) => number> = {
  featured: (a, b) =>
    Number(b.tags.includes('bestseller')) - Number(a.tags.includes('bestseller')) || b.rating - a.rating,
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
};

const filterProducts = (q: ProductQuery) => {
  const collection = q.collection ? mockCollections.find((c) => c.slug === q.collection) : undefined;
  return mockProducts
    .filter((p) => !q.category || p.category.slug === q.category)
    .filter((p) => !collection || collection.productIds.includes(p.id))
    .filter((p) => !q.tag || p.tags.includes(q.tag))
    .filter((p) => !q.sizes?.length || p.sizes.some((s) => s.inStock && q.sizes!.includes(s.label)))
    .filter((p) => !q.colors?.length || p.colors.some((c) => q.colors!.includes(colorFamily(c.hex))))
    .filter((p) => q.minPrice === undefined || p.price >= q.minPrice)
    .filter((p) => q.maxPrice === undefined || p.price <= q.maxPrice)
    .filter((p) => !q.search || matchesSearch(p, q.search));
};

/** Groups exact product hexes into a handful of filterable colour families. */
export function colorFamily(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2 / 255;
  const s = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255));
  if (l < 0.2) return 'Black';
  if (s < 0.15) return l > 0.82 ? 'White' : 'Grey';
  let h = 0;
  if (max === r) h = ((g - b) / (max - min)) % 6;
  else if (max === g) h = (b - r) / (max - min) + 2;
  else h = (r - g) / (max - min) + 4;
  h = (h * 60 + 360) % 360;
  if (l > 0.8 && s < 0.5) return 'Neutral';
  if (h < 15 || h >= 335) return 'Red';
  if (h < 45) return l < 0.45 ? 'Brown' : 'Orange';
  if (h < 70) return 'Yellow';
  if (h < 170) return 'Green';
  if (h < 260) return 'Blue';
  return 'Purple';
}

export const COLOR_FAMILY_HEX: Record<string, string> = {
  Black: '#141414',
  White: '#F7F7F5',
  Grey: '#9A9A9A',
  Neutral: '#E7DCC8',
  Brown: '#7A4A2E',
  Red: '#C62A2F',
  Orange: '#E07B39',
  Yellow: '#E8B22B',
  Green: '#5B6B3C',
  Blue: '#4E6E92',
  Purple: '#7B3F6E',
};

export const mockProductService: ProductService = {
  async list(q) {
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 12;
    const all = filterProducts(q).sort(sorters[q.sort ?? 'featured']);
    const result: PagedResult<Product> = {
      items: all.slice((page - 1) * pageSize, page * pageSize),
      page,
      pageSize,
      totalCount: all.length,
      totalPages: Math.max(1, Math.ceil(all.length / pageSize)),
    };
    return delay(result);
  },

  async getBySlug(slug) {
    const product = mockProducts.find((p) => p.slug === slug);
    if (!product) {
      await delay(null, 200);
      throw new ApiError(404, { title: 'Not Found', status: 404, detail: `No product with slug "${slug}".` });
    }
    return delay(product);
  },

  async related(productId, type, limit = 8) {
    const self = mockProducts.find((p) => p.id === productId);
    if (!self) return delay([]);
    const pool =
      type === 'similar'
        ? mockProducts
            .filter((p) => p.id !== productId && p.category.id === self.category.id)
            .sort(
              (a, b) =>
                b.tags.filter((t) => self.tags.includes(t)).length - a.tags.filter((t) => self.tags.includes(t)).length ||
                Math.abs(a.price - self.price) - Math.abs(b.price - self.price),
            )
        : mockProducts
            .filter((p) => p.id !== productId && p.category.id !== self.category.id)
            .filter((p) => self.category.slug === 'accessories' || p.category.slug === 'accessories' || p.id % 3 === productId % 3);
    return delay(pool.slice(0, limit));
  },

  async search(term, limit = 8) {
    if (!term.trim()) return delay([], 80);
    return delay(mockProducts.filter((p) => matchesSearch(p, term)).slice(0, limit), 150);
  },

  async facets(category) {
    const products = mockProducts.filter((p) => !category || p.category.slug === category);
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const sizes = [...new Set(products.flatMap((p) => p.sizes.map((s) => s.label)))].sort((a, b) => {
      const ia = sizeOrder.indexOf(a), ib = sizeOrder.indexOf(b);
      if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      return a.localeCompare(b, undefined, { numeric: true });
    });
    const families = [...new Set(products.flatMap((p) => p.colors.map((c) => colorFamily(c.hex))))];
    const prices = products.map((p) => p.price);
    return delay(
      {
        sizes,
        colors: Object.keys(COLOR_FAMILY_HEX)
          .filter((f) => families.includes(f))
          .map((name) => ({ name, hex: COLOR_FAMILY_HEX[name] })),
        minPrice: Math.floor(Math.min(...prices) / 100) * 100,
        maxPrice: Math.ceil(Math.max(...prices) / 1000) * 1000,
      },
      120,
    );
  },
};

export const mockCatalogService: CatalogService = {
  categories: () =>
    delay(
      mockCategories.map((c) => ({ ...c, productCount: mockProducts.filter((p) => p.category.id === c.id).length })),
      150,
    ),
  collections: () => delay(mockCollections, 150),
};

const placedOrders: Order[] = [];

export const mockOrderService: OrderService = {
  list: () => delay([...placedOrders, ...mockOrders]),
  async create(req) {
    const items = req.items.map((i) => {
      const p = mockProducts.find((x) => x.id === i.productId)!;
      const color = p.colors.find((c) => c.name === i.color);
      return { ...i, name: p.name, slug: p.slug, image: p.images[color?.imageIndex ?? 0].url };
    });
    const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const shipping = req.shippingMethod.startsWith('Express') ? 299 : subtotal >= 2999 ? 0 : 149;
    const order: Order = {
      id: 2000 + placedOrders.length,
      orderNumber: `SKY-${Math.floor(240000 + Math.random() * 9999)}`,
      status: 'Processing',
      items,
      subtotal,
      shipping,
      total: subtotal + shipping,
      shippingAddress: req.shippingAddress,
      shippingMethod: req.shippingMethod,
      createdAt: new Date().toISOString(),
    };
    placedOrders.unshift(order);
    return delay(order, 900);
  },
};

export const mockAccountService: AccountService = {
  login: ({ email }) => delay({ token: 'demo-token', user: { ...mockUser, email } }, 700),
  register: ({ firstName, lastName, email }) =>
    delay({ token: 'demo-token', user: { ...mockUser, firstName, lastName, email } }, 800),
  me: () => delay(mockUser, 150),
  addresses: () => delay(mockAddresses, 150),
};

export const mockContentService: ContentService = {
  ugc: () => delay(mockUgc, 200),
  subscribe: () => delay(undefined, 700),
  contact: () => delay(undefined, 800),
};
