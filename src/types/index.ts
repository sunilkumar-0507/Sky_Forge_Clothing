// Domain types. Property names are camelCase to match ASP.NET Core's default
// System.Text.Json serialization, so API responses map 1:1 onto these.

export interface CategoryRef {
  id: number;
  name: string;
  slug: string;
}

export interface Category extends CategoryRef {
  description: string;
  image: string;
  productCount?: number;
}

export interface ProductImage {
  url: string;
  alt: string;
}

export interface ProductColor {
  name: string;
  hex: string;
  imageIndex: number;
}

export interface ProductSize {
  label: string;
  inStock: boolean;
}

export type ProductTag = 'new' | 'bestseller' | 'sale';

export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: CategoryRef;
  price: number; // in INR
  compareAtPrice?: number; // for sale badge
  images: ProductImage[];
  colors: ProductColor[];
  sizes: ProductSize[];
  fabric: string;
  care: string[];
  tags: ProductTag[];
  rating: number;
  reviewCount: number;
  createdAt: string; // ISO date
}

export interface Collection {
  id: number;
  slug: string;
  name: string;
  description: string;
  image: string;
  productIds: number[];
}

export type ProductSort = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating';

export interface ProductQuery {
  category?: string; // category slug
  collection?: string; // collection slug
  tag?: ProductTag;
  sizes?: string[];
  colors?: string[]; // color names
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: ProductSort;
  page?: number; // 1-based
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ProductFacets {
  sizes: string[];
  colors: { name: string; hex: string }[];
  minPrice: number;
  maxPrice: number;
}

export interface Address {
  id?: number;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  productId: number;
  slug: string;
  name: string;
  image: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: Address;
  shippingMethod: string;
  createdAt: string;
  /** Courier AWB, once shipped. */
  trackingNumber?: string;
  trackingUrl?: string;
}

export interface CreateOrderRequest {
  items: Omit<OrderItem, 'name' | 'image' | 'slug'>[];
  shippingAddress: Address;
  shippingMethod: string;
  paymentMethod: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UgcPost {
  id: number;
  handle: string;
  image: string;
  likes: number;
}
