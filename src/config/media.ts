// Static brand/editorial imagery (would live in the CDN or CMS later). Unsplash IDs verified to resolve.
export const unsplash = (id: string, w = 900, h?: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ''}&q=75`;

// Product images use a fixed 3:4 crop so cards and galleries line up.
export const productShot = (id: string) => unsplash(id, 900, 1200);

export const editorial = {
  hero: unsplash('1539109136881-3be0616acf4b', 2000),
  heroAlt: unsplash('1520367445093-50dc08a59d9d', 1400),
  story: unsplash('1558769132-cb1aea458c5e', 1400),
  lookbook: [
    unsplash('1520367445093-50dc08a59d9d', 1000, 1300),
    unsplash('1554412933-514a83d2f3c8', 900, 1200),
    unsplash('1581044777550-4cfa60707c03', 900, 1200),
    unsplash('1469334031218-e382a71b716b', 900, 1100),
    unsplash('1529139574466-a303027c1d8b', 900, 1200),
  ],
  about: [
    unsplash('1445205170230-053b83016050', 1400),
    unsplash('1556905055-8f358a7a47b2', 1000, 1200),
    unsplash('1490481651871-ab68de25d43d', 1000, 1200),
  ],
  contact: unsplash('1441986300917-64674bd600d8', 1400),
  auth: unsplash('1485968579580-b6d095142e6e', 1200, 1600),
};
