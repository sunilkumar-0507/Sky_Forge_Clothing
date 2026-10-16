import type { Category, Collection } from '@/types';
import { unsplash } from '@/config/media';

export const mockCategories: Category[] = [
  {
    id: 1,
    name: 'Men',
    slug: 'men',
    description: 'Tailoring, heavyweight basics and outerwear built to last.',
    image: unsplash('1487222477894-8943e31ef7b2', 900, 1200),
  },
  {
    id: 2,
    name: 'Women',
    slug: 'women',
    description: 'Fluid dresses, sharp layers and everyday statement pieces.',
    image: unsplash('1533659828870-95ee305cee3e', 900, 1200),
  },
  {
    id: 3,
    name: 'Accessories',
    slug: 'accessories',
    description: 'The finishing details: bags, caps, watches and jewellery.',
    image: unsplash('1524592094714-0f0654e20314', 900, 1200),
  },
];

export const mockCollections: Collection[] = [
  {
    id: 1,
    slug: 'ember-drop',
    name: 'The Ember Drop',
    description: 'Warm tones, sharp cuts. Our autumn capsule, out now.',
    image: unsplash('1520367445093-50dc08a59d9d', 1200, 1500),
    productIds: [2, 5, 15, 17, 21, 23, 27, 35, 37],
  },
  {
    id: 2,
    slug: 'monochrome',
    name: 'Monochrome',
    description: 'Black, white and everything in between.',
    image: unsplash('1618517351616-38fb9c5210c6', 1200, 1500),
    productIds: [1, 2, 7, 14, 24, 31, 33],
  },
  {
    id: 3,
    slug: 'tailoring',
    name: 'Modern Tailoring',
    description: 'Soft-structured suits and blazers for the new formal.',
    image: unsplash('1594938298603-c8148c4dae35', 1200, 1500),
    productIds: [7, 8, 9, 11, 22],
  },
];
