import type { AccountService, CatalogService, ContentService, OrderService, ProductService } from '../contracts';
import { http } from './client';

export const httpProductService: ProductService = {
  list: (q) =>
    http.get('/products', {
      category: q.category,
      collection: q.collection,
      tag: q.tag,
      sizes: q.sizes,
      colors: q.colors,
      minPrice: q.minPrice,
      maxPrice: q.maxPrice,
      search: q.search,
      sort: q.sort,
      page: q.page,
      pageSize: q.pageSize,
    }),
  getBySlug: (slug) => http.get(`/products/${encodeURIComponent(slug)}`),
  related: (id, type, limit = 8) => http.get(`/products/${id}/related`, { type, limit }),
  search: (q, limit = 8) => http.get('/products/search', { q, limit }),
  facets: (category) => http.get('/products/facets', { category }),
};

export const httpCatalogService: CatalogService = {
  categories: () => http.get('/categories'),
  collections: () => http.get('/collections'),
};

export const httpOrderService: OrderService = {
  list: () => http.get('/orders'),
  create: (req) => http.post('/orders', req),
};

export const httpAccountService: AccountService = {
  login: (req) => http.post('/auth/login', req),
  register: (req) => http.post('/auth/register', req),
  me: () => http.get('/account/me'),
  addresses: () => http.get('/account/addresses'),
};

export const httpContentService: ContentService = {
  ugc: () => http.get('/content/ugc'),
  subscribe: (email) => http.post('/newsletter', { email }),
  contact: (msg) => http.post('/contact', msg),
};
