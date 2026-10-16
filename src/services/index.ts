// The single entry point the UI uses for data. Flip VITE_USE_MOCK=false in
// .env to talk to the ASP.NET Core API instead of the in-browser mocks.
import { env } from '@/config/env';
import type { AccountService, CatalogService, ContentService, OrderService, ProductService } from './contracts';
import {
  httpAccountService,
  httpCatalogService,
  httpContentService,
  httpOrderService,
  httpProductService,
} from './http';
import {
  mockAccountService,
  mockCatalogService,
  mockContentService,
  mockOrderService,
  mockProductService,
} from './mock';

export const productService: ProductService = env.useMock ? mockProductService : httpProductService;
export const catalogService: CatalogService = env.useMock ? mockCatalogService : httpCatalogService;
export const orderService: OrderService = env.useMock ? mockOrderService : httpOrderService;
export const accountService: AccountService = env.useMock ? mockAccountService : httpAccountService;
export const contentService: ContentService = env.useMock ? mockContentService : httpContentService;

export { ApiError } from './http/client';
export type * from './contracts';
