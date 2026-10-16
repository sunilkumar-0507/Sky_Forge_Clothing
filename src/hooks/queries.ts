import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountService, catalogService, contentService, orderService, productService } from '@/services';
import type { CreateOrderRequest, ProductQuery } from '@/types';

export const queryKeys = {
  products: (q: ProductQuery) => ['products', q] as const,
  product: (slug: string) => ['product', slug] as const,
  related: (id: number, type: string) => ['related', id, type] as const,
  search: (term: string) => ['search', term] as const,
  facets: (category?: string) => ['facets', category ?? 'all'] as const,
  categories: ['categories'] as const,
  collections: ['collections'] as const,
  orders: ['orders'] as const,
  addresses: ['addresses'] as const,
  me: ['me'] as const,
  ugc: ['ugc'] as const,
};

export const useProducts = (q: ProductQuery) =>
  useQuery({ queryKey: queryKeys.products(q), queryFn: () => productService.list(q) });

export const useInfiniteProducts = (q: Omit<ProductQuery, 'page'>) =>
  useInfiniteQuery({
    queryKey: ['products-infinite', q],
    queryFn: ({ pageParam }) => productService.list({ ...q, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    placeholderData: keepPreviousData,
  });

export const useProduct = (slug: string) =>
  useQuery({ queryKey: queryKeys.product(slug), queryFn: () => productService.getBySlug(slug), retry: false });

export const useRelatedProducts = (id: number | undefined, type: 'similar' | 'complete-the-look') =>
  useQuery({
    queryKey: queryKeys.related(id ?? 0, type),
    queryFn: () => productService.related(id!, type),
    enabled: id !== undefined,
  });

export const useProductSearch = (term: string) =>
  useQuery({
    queryKey: queryKeys.search(term),
    queryFn: () => productService.search(term),
    enabled: term.trim().length > 0,
    placeholderData: keepPreviousData,
  });

export const useFacets = (category?: string) =>
  useQuery({ queryKey: queryKeys.facets(category), queryFn: () => productService.facets(category) });

export const useCategories = () => useQuery({ queryKey: queryKeys.categories, queryFn: catalogService.categories });
export const useCollections = () => useQuery({ queryKey: queryKeys.collections, queryFn: catalogService.collections });
export const useUgc = () => useQuery({ queryKey: queryKeys.ugc, queryFn: contentService.ugc });
export const useOrders = () => useQuery({ queryKey: queryKeys.orders, queryFn: orderService.list });
export const useAddresses = () => useQuery({ queryKey: queryKeys.addresses, queryFn: accountService.addresses });
export const useMe = () => useQuery({ queryKey: queryKeys.me, queryFn: accountService.me });

export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateOrderRequest) => orderService.create(req),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.orders }),
  });
};

export const useSubscribe = () => useMutation({ mutationFn: (email: string) => contentService.subscribe(email) });
export const useContact = () => useMutation({ mutationFn: contentService.contact });
export const useLogin = () => useMutation({ mutationFn: accountService.login });
export const useRegister = () => useMutation({ mutationFn: accountService.register });
