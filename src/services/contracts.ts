import type {
  Address,
  AuthResponse,
  Category,
  Collection,
  CreateOrderRequest,
  LoginRequest,
  Order,
  PagedResult,
  Product,
  ProductFacets,
  ProductQuery,
  RegisterRequest,
  UgcPost,
  User,
} from '@/types';

// Each interface maps onto one ASP.NET Core controller. The mock and HTTP
// implementations both satisfy these, so swapping is a one-line config change.

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ProductService {
  /** GET /products?category=&collection=&tag=&sizes=&colors=&minPrice=&maxPrice=&search=&sort=&page=&pageSize= */
  list(query: ProductQuery): Promise<PagedResult<Product>>;
  /** GET /products/{slug} */
  getBySlug(slug: string): Promise<Product>;
  /** GET /products/{id}/related?type=similar|complete-the-look&limit= */
  related(productId: number, type: 'similar' | 'complete-the-look', limit?: number): Promise<Product[]>;
  /** GET /products/search?q=&limit= */
  search(term: string, limit?: number): Promise<Product[]>;
  /** GET /products/facets?category= */
  facets(category?: string): Promise<ProductFacets>;
}

export interface CatalogService {
  /** GET /categories */
  categories(): Promise<Category[]>;
  /** GET /collections */
  collections(): Promise<Collection[]>;
}

export interface OrderService {
  /** GET /orders (current user) */
  list(): Promise<Order[]>;
  /** POST /orders */
  create(request: CreateOrderRequest): Promise<Order>;
}

export interface AccountService {
  /** POST /auth/login */
  login(request: LoginRequest): Promise<AuthResponse>;
  /** POST /auth/register */
  register(request: RegisterRequest): Promise<AuthResponse>;
  /** GET /account/me */
  me(): Promise<User>;
  /** GET /account/addresses */
  addresses(): Promise<Address[]>;
}

export interface ContentService {
  /** GET /content/ugc */
  ugc(): Promise<UgcPost[]>;
  /** POST /newsletter { email } */
  subscribe(email: string): Promise<void>;
  /** POST /contact */
  contact(message: ContactMessage): Promise<void>;
}
