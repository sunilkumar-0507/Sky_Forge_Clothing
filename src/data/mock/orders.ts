import type { Address, Order, User } from '@/types';
import { mockProducts } from './products';

export const mockUser: User = {
  id: 1,
  firstName: 'Aarav',
  lastName: 'Mehta',
  email: 'aarav@example.com',
  phone: '+91 98765 43210',
};

export const mockAddresses: Address[] = [
  {
    id: 1,
    fullName: 'Aarav Mehta',
    phone: '+91 98765 43210',
    line1: '42, 3rd Cross, Indiranagar',
    line2: 'Near 100 Feet Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    isDefault: true,
  },
  {
    id: 2,
    fullName: 'Aarav Mehta',
    phone: '+91 98765 43210',
    line1: 'Flat 1204, Sea Breeze Towers, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
  },
];

const item = (productId: number, size: string, quantity: number, colorIndex = 0) => {
  const p = mockProducts.find((x) => x.id === productId)!;
  return {
    productId,
    slug: p.slug,
    name: p.name,
    image: p.images[p.colors[colorIndex]?.imageIndex ?? 0].url,
    color: p.colors[colorIndex]?.name ?? '',
    size,
    quantity,
    unitPrice: p.price,
  };
};

const makeOrder = (
  id: number,
  orderNumber: string,
  status: Order['status'],
  createdAt: string,
  items: ReturnType<typeof item>[],
  shippingMethod = 'Standard (3–5 days)',
): Order => {
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const shipping = subtotal >= 2999 ? 0 : 149;
  return {
    id,
    orderNumber,
    status,
    items,
    subtotal,
    shipping,
    total: subtotal + shipping,
    shippingAddress: mockAddresses[0],
    shippingMethod,
    createdAt,
  };
};

export const mockOrders: Order[] = [
  makeOrder(1003, 'SKY-240318', 'Processing', '2026-10-12T14:22:00Z', [item(2, 'M', 2), item(31, 'One Size', 1)]),
  makeOrder(1002, 'SKY-238871', 'Shipped', '2026-09-27T09:05:00Z', [item(21, 'S', 1, 0), item(39, 'One Size', 1)], 'Express (1–2 days)'),
  makeOrder(1001, 'SKY-231004', 'Delivered', '2026-08-14T18:40:00Z', [item(13, 'L', 1), item(12, '32', 1, 2), item(1, 'L', 3)]),
];
