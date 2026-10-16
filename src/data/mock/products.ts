import type { CategoryRef, Product, ProductColor, ProductSize, ProductTag } from '@/types';
import { productShot } from '@/config/media';

const MEN: CategoryRef = { id: 1, name: 'Men', slug: 'men' };
const WOMEN: CategoryRef = { id: 2, name: 'Women', slug: 'women' };
const ACC: CategoryRef = { id: 3, name: 'Accessories', slug: 'accessories' };

const sizes = (labels: string[], soldOut: string[] = []): ProductSize[] =>
  labels.map((label) => ({ label, inStock: !soldOut.includes(label) }));

const APPAREL = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const WAIST = ['28', '30', '32', '34', '36'];
const SHOES = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'];
const ONE = ['One Size'];

const CARE_COTTON = ['Machine wash cold, inside out', 'Do not bleach', 'Tumble dry low', 'Warm iron on reverse'];
const CARE_DELICATE = ['Hand wash cold or dry clean', 'Lay flat to dry', 'Cool iron', 'Store folded'];
const CARE_TAILORED = ['Dry clean only', 'Steam to refresh', 'Hang on a shaped hanger'];
const CARE_LEATHER = ['Wipe with a soft dry cloth', 'Condition every 6 months', 'Keep away from direct heat'];
const CARE_METAL = ['Avoid contact with perfume and water', 'Polish with a soft cloth', 'Store in the pouch provided'];

interface Seed {
  id: number;
  name: string;
  category: CategoryRef;
  price: number;
  compareAtPrice?: number;
  photos: string[];
  colors: [string, string, number][];
  sizes: ProductSize[];
  fabric: string;
  care: string[];
  tags?: ProductTag[];
  rating: number;
  reviewCount: number;
  createdAt: string;
  description: string;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const build = (s: Seed): Product => ({
  id: s.id,
  slug: slugify(s.name),
  name: s.name,
  description: s.description,
  category: s.category,
  price: s.price,
  compareAtPrice: s.compareAtPrice,
  images: s.photos.map((id, i) => ({ url: productShot(id), alt: `${s.name} — view ${i + 1}` })),
  colors: s.colors.map(([name, hex, imageIndex]): ProductColor => ({ name, hex, imageIndex })),
  sizes: s.sizes,
  fabric: s.fabric,
  care: s.care,
  tags: s.tags ?? [],
  rating: s.rating,
  reviewCount: s.reviewCount,
  createdAt: s.createdAt,
});

const seeds: Seed[] = [
  // ───────────── Men ─────────────
  {
    id: 1, name: 'Essential Heavyweight Tee', category: MEN, price: 1299,
    photos: ['1521572163474-6864f9cf17ab', '1586790170083-2f9ceadc732d', '1622445275463-afa2ab738c34'],
    colors: [['Optic White', '#F7F7F5', 0], ['Chalk', '#ECE8E0', 1], ['Mist', '#DADDE0', 2]],
    sizes: sizes(APPAREL, ['XS']), fabric: '100% organic cotton, 240 GSM single jersey',
    care: CARE_COTTON, tags: ['bestseller'], rating: 4.8, reviewCount: 412, createdAt: '2026-02-11T10:00:00Z',
    description: 'The tee we built the brand on. A dense 240 GSM organic cotton jersey with a slightly dropped shoulder, a ribbed collar that keeps its shape, and a hem that hits right at the hip.',
  },
  {
    id: 2, name: 'Shadow Boxy Tee', category: MEN, price: 1499,
    photos: ['1618517351616-38fb9c5210c6', '1618354691373-d851c5c3a990', '1622519407650-3df9883f76a5', '1583743814966-8936f5b7be1a'],
    colors: [['Jet Black', '#141414', 0], ['Washed Black', '#2E2E2E', 2]],
    sizes: sizes(APPAREL), fabric: '100% combed cotton, 260 GSM, garment dyed',
    care: CARE_COTTON, tags: ['new', 'bestseller'], rating: 4.7, reviewCount: 198, createdAt: '2026-10-02T10:00:00Z',
    description: 'A cropped, boxy silhouette cut from garment-dyed cotton for a soft, lived-in hand. Tonal Forge mark at the chest.',
  },
  {
    id: 3, name: 'Bone Skeleton Graphic Tee', category: MEN, price: 1599, compareAtPrice: 1999,
    photos: ['1503341504253-dff4815485f1', '1503342217505-b0a15ec3261c'],
    colors: [['Black', '#151515', 0]],
    sizes: sizes(APPAREL, ['XXL']), fabric: '100% cotton, 220 GSM, water-based print',
    care: CARE_COTTON, tags: ['sale'], rating: 4.5, reviewCount: 87, createdAt: '2026-05-19T10:00:00Z',
    description: 'Hand-drawn peace-sign skeleton graphic, screen printed with soft water-based inks that fade beautifully over time.',
  },
  {
    id: 4, name: 'Overdyed Pastel Tee', category: MEN, price: 1199,
    photos: ['1622470953794-aa9c70b0fb9d', '1564584217132-2271feaeb3c5'],
    colors: [['Lilac', '#D8B7D8', 0], ['Powder Blue', '#B9CBE0', 1]],
    sizes: sizes(APPAREL), fabric: '100% cotton, enzyme washed',
    care: CARE_COTTON, rating: 4.4, reviewCount: 64, createdAt: '2026-06-08T10:00:00Z',
    description: 'Each piece is overdyed in small batches so no two are exactly alike. Relaxed fit, soft as anything.',
  },
  {
    id: 5, name: 'Forge Rider Leather Jacket', category: MEN, price: 14999,
    photos: ['1551028719-00167b16eac5', '1487222477894-8943e31ef7b2', '1520975954732-35dd22299614'],
    colors: [['Black', '#121212', 0], ['Cognac', '#7A4A2E', 1]],
    sizes: sizes(['S', 'M', 'L', 'XL'], ['S']), fabric: 'Full-grain lambskin leather, viscose lining',
    care: CARE_LEATHER, tags: ['new'], rating: 4.9, reviewCount: 56, createdAt: '2026-09-28T10:00:00Z',
    description: 'A classic asymmetric rider in buttery lambskin. Antique silver hardware, quilted shoulders and a lining that slides on over a hoodie.',
  },
  {
    id: 6, name: 'Raw Selvedge Denim Jacket', category: MEN, price: 5499, compareAtPrice: 6999,
    photos: ['1611312449408-fcece27cdbb7', '1516257984-b1b4d707412e', '1495105787522-5334e3ffa0ef'],
    colors: [['Indigo Raw', '#1F2A44', 0], ['Light Wash', '#8FB0D0', 1]],
    sizes: sizes(APPAREL, ['XS', 'XXL']), fabric: '14 oz Japanese selvedge denim, corduroy collar',
    care: ['Wash rarely, inside out, cold', 'Line dry', 'Expect indigo transfer when new'],
    tags: ['sale'], rating: 4.7, reviewCount: 133, createdAt: '2026-03-14T10:00:00Z',
    description: 'A trucker jacket in unwashed Japanese selvedge that will fade to your life. Corduroy collar, copper rivets.',
  },
  {
    id: 7, name: 'Midnight Tailored Suit', category: MEN, price: 18999,
    photos: ['1617127365659-c47fa864d8bc', '1519085360753-af0119f7cbe7', '1507679799987-c73779587ccf'],
    colors: [['Midnight', '#14161C', 0], ['Navy', '#1C2540', 2]],
    sizes: sizes(['36', '38', '40', '42', '44'], ['44']), fabric: 'Super 120s wool, half-canvassed',
    care: CARE_TAILORED, tags: ['bestseller'], rating: 4.8, reviewCount: 71, createdAt: '2026-01-20T10:00:00Z',
    description: 'A soft-shouldered two-piece in Super 120s wool. Half-canvassed so it moulds to you, with a slim, tapered trouser.',
  },
  {
    id: 8, name: 'Windowpane Three-Piece Suit', category: MEN, price: 22999,
    photos: ['1594938298603-c8148c4dae35', '1617137968427-85924c800a22', '1593030761757-71fae45fa0e7'],
    colors: [['Cobalt Check', '#3D5A8C', 0], ['Royal', '#25407A', 1]],
    sizes: sizes(['36', '38', '40', '42', '44']), fabric: 'Wool-blend windowpane check',
    care: CARE_TAILORED, rating: 4.6, reviewCount: 28, createdAt: '2026-04-02T10:00:00Z',
    description: 'Jacket, waistcoat and trouser in a bold cobalt windowpane. Made for weddings you actually want to dress for.',
  },
  {
    id: 9, name: 'Oxford Poplin Shirt', category: MEN, price: 2499,
    photos: ['1620012253295-c15cc3e65df4', '1598033129183-c4f50c736f10', '1602810318383-e386cc2a3ccf'],
    colors: [['Sky', '#BFD3EA', 0], ['White', '#F5F5F3', 1], ['Mixed', '#7B5560', 2]],
    sizes: sizes(APPAREL), fabric: '100% cotton two-ply poplin',
    care: CARE_COTTON, tags: ['bestseller'], rating: 4.6, reviewCount: 244, createdAt: '2026-02-26T10:00:00Z',
    description: 'Crisp two-ply poplin with a semi-spread collar and mother-of-pearl buttons. The shirt that goes under everything.',
  },
  {
    id: 10, name: 'Dot Print Chambray Shirt', category: MEN, price: 2199,
    photos: ['1596755094514-f87e34085b2c', '1558171813-4c088753af8f'],
    colors: [['Chambray', '#5E7FA6', 0], ['Pale Chambray', '#A9C3DD', 1]],
    sizes: sizes(APPAREL, ['XL']), fabric: '100% cotton chambray, discharge printed',
    care: CARE_COTTON, rating: 4.3, reviewCount: 52, createdAt: '2026-07-01T10:00:00Z',
    description: 'A light chambray scattered with a tiny discharge-printed dot. Wear it buttoned or open over a tee.',
  },
  {
    id: 11, name: 'Heritage Tweed Blazer', category: MEN, price: 9999, compareAtPrice: 12999,
    photos: ['1505022610485-0249ba5b3675', '1488161628813-04466f872be2'],
    colors: [['Brown Herringbone', '#6B5444', 0]],
    sizes: sizes(['36', '38', '40', '42', '44'], ['36']), fabric: '100% wool tweed, cupro lining',
    care: CARE_TAILORED, tags: ['sale'], rating: 4.7, reviewCount: 39, createdAt: '2026-01-05T10:00:00Z',
    description: 'A herringbone tweed blazer with patch pockets and a natural shoulder. Equally at home with denim or flannel trousers.',
  },
  {
    id: 12, name: 'Distressed Straight Jeans', category: MEN, price: 3299,
    photos: ['1516826957135-700dedea698c', '1541099649105-f69ad21f3246', '1624378439575-d8705ad7ae80'],
    colors: [['Light Vintage', '#9DB7CF', 0], ['Patched Mid', '#5D7DA0', 1], ['Rinse', '#1E2433', 2]],
    sizes: sizes(WAIST, ['28']), fabric: '12 oz cotton denim with 1% elastane',
    care: CARE_COTTON, rating: 4.4, reviewCount: 176, createdAt: '2026-03-30T10:00:00Z',
    description: 'A straight leg with just-right distressing, hand-finished at the knee. A little stretch so you can actually sit down.',
  },
  {
    id: 13, name: 'Cloud Fleece Hoodie', category: MEN, price: 2999,
    photos: ['1556821840-3a63f95609a7', '1517841905240-472988babdf9'],
    colors: [['Heather Grey', '#9EA3A8', 0], ['Faded Denim', '#4E6E92', 1]],
    sizes: sizes(APPAREL), fabric: '80% cotton, 20% recycled polyester brushed fleece, 400 GSM',
    care: CARE_COTTON, tags: ['bestseller'], rating: 4.9, reviewCount: 521, createdAt: '2026-02-01T10:00:00Z',
    description: 'Heavy, brushed-back fleece with a double-layer hood and no drawcords to fuss with. Our most-reordered piece.',
  },
  {
    id: 14, name: 'Bone Crewneck Sweatshirt', category: MEN, price: 2599,
    photos: ['1620799140408-edc6dcb6d633', '1479064555552-3ef4979f8908'],
    colors: [['Bone', '#F1EEE8', 0]],
    sizes: sizes(APPAREL, ['XXL']), fabric: '100% organic loopback cotton, 380 GSM',
    care: CARE_COTTON, tags: ['new'], rating: 4.6, reviewCount: 44, createdAt: '2026-10-08T10:00:00Z',
    description: 'A clean, boxy crew in loopback organic cotton. Raglan sleeves, ribbed side gussets and nothing you don’t need.',
  },
  {
    id: 15, name: 'Rust Nylon Bomber', category: MEN, price: 5999,
    photos: ['1591047139829-d91aecb6caea', '1552374196-1ab2a1c593e8'],
    colors: [['Rust', '#B5653F', 0], ['Camel', '#B78A5E', 1]],
    sizes: sizes(APPAREL, ['XS']), fabric: 'Recycled nylon shell, padded lining',
    care: ['Machine wash cold, gentle', 'Do not tumble dry', 'Do not iron'],
    tags: ['new'], rating: 4.5, reviewCount: 23, createdAt: '2026-10-05T10:00:00Z',
    description: 'An MA-1 shape in rust recycled nylon with light padding. Made for the gap between monsoon and winter.',
  },

  // ───────────── Women ─────────────
  {
    id: 16, name: 'Sunday Off-Shoulder Dress', category: WOMEN, price: 3499,
    photos: ['1515372039744-b8f02a3ae446', '1490481651871-ab68de25d43d'],
    colors: [['Ivory', '#F4F0E8', 0]],
    sizes: sizes(APPAREL, ['XXL']), fabric: '100% cotton broderie anglaise',
    care: CARE_DELICATE, tags: ['bestseller'], rating: 4.7, reviewCount: 189, createdAt: '2026-04-12T10:00:00Z',
    description: 'A breezy off-shoulder mini in cotton broderie with a smocked bodice and a tiered skirt that swings when you walk.',
  },
  {
    id: 17, name: 'Scarlet Flow Maxi Dress', category: WOMEN, price: 5999,
    photos: ['1595777457583-95e059d581b8', '1612336307429-8a898d10e223'],
    colors: [['Scarlet', '#C62A2F', 0], ['Crimson', '#A11F2A', 1]],
    sizes: sizes(APPAREL), fabric: '100% viscose georgette, fully lined',
    care: CARE_DELICATE, tags: ['new'], rating: 4.8, reviewCount: 61, createdAt: '2026-10-10T10:00:00Z',
    description: 'Yards of fluid georgette cut on the bias so it moves like water. A dress for the moment you walk in.',
  },
  {
    id: 18, name: 'Poppy Wrap Midi Dress', category: WOMEN, price: 3999, compareAtPrice: 4999,
    photos: ['1572804013309-59a88b7e92f1', '1496747611176-843222e1e57c'],
    colors: [['Poppy Red', '#D23A33', 0], ['Floral Ivory', '#EDE3D6', 1]],
    sizes: sizes(APPAREL, ['XS']), fabric: '100% cotton poplin',
    care: CARE_COTTON, tags: ['sale'], rating: 4.6, reviewCount: 97, createdAt: '2026-05-03T10:00:00Z',
    description: 'A true wrap with a cinched waist and full skirt. Flutter sleeves, deep pockets and buttons that actually work.',
  },
  {
    id: 19, name: 'Chambray Shirt Dress', category: WOMEN, price: 2999,
    photos: ['1591369822096-ffd140ec948f', '1488426862026-3ee34a7d66df'],
    colors: [['Mid Chambray', '#6E8DB4', 0]],
    sizes: sizes(APPAREL), fabric: '100% cotton chambray',
    care: CARE_COTTON, rating: 4.4, reviewCount: 72, createdAt: '2026-06-17T10:00:00Z',
    description: 'A short-sleeved button-through in washed chambray with a fitted waist. Easy with sneakers, sharp with mules.',
  },
  {
    id: 20, name: 'Plum Off-Shoulder Gown', category: WOMEN, price: 8999,
    photos: ['1566174053879-31528523f8ae', '1550614000-4895a10e1bfd'],
    colors: [['Plum', '#6B1E45', 0], ['Garnet', '#8B1E2E', 1]],
    sizes: sizes(['XS', 'S', 'M', 'L', 'XL'], ['XL']), fabric: 'Stretch crepe, satin lining',
    care: CARE_TAILORED, rating: 4.9, reviewCount: 34, createdAt: '2026-08-22T10:00:00Z',
    description: 'A sculpted off-shoulder neckline in stretch crepe that holds its line. Floor length, with a discreet back slit.',
  },
  {
    id: 21, name: 'Camel Belted Trench', category: WOMEN, price: 9499,
    photos: ['1539533018447-63fcce2678e3', '1485462537746-965f33f7f6a7', '1483985988355-763728e1935b'],
    colors: [['Camel', '#B3814F', 0], ['Rose', '#D7A9A0', 1], ['Bordeaux', '#6B1F2A', 2]],
    sizes: sizes(APPAREL, ['XXL']), fabric: 'Water-repellent cotton gabardine',
    care: CARE_TAILORED, tags: ['new', 'bestseller'], rating: 4.8, reviewCount: 118, createdAt: '2026-09-30T10:00:00Z',
    description: 'An oversized trench in water-repellent gabardine. Storm flap, raglan sleeves and a belt you can tie however you like.',
  },
  {
    id: 22, name: 'Houndstooth Oversized Blazer', category: WOMEN, price: 6499,
    photos: ['1608234808654-2a8875faa7fd', '1525450824786-227cbef70703'],
    colors: [['Grey Houndstooth', '#8C8C8C', 0], ['Gingham', '#4A4A4A', 1]],
    sizes: sizes(APPAREL), fabric: 'Wool-blend houndstooth, satin lining',
    care: CARE_TAILORED, rating: 4.6, reviewCount: 66, createdAt: '2026-07-15T10:00:00Z',
    description: 'A borrowed-from-the-boys blazer with strong shoulders and a long line. Throw it over anything.',
  },
  {
    id: 23, name: 'Sunset Fleece Set', category: WOMEN, price: 4499,
    photos: ['1515886657613-9f3515b0c78f', '1578587018452-892bacefd3f2'],
    colors: [['Marigold', '#E8B22B', 0], ['Tangerine', '#E8822B', 1]],
    sizes: sizes(APPAREL, ['XS']), fabric: '100% cotton brushed fleece',
    care: CARE_COTTON, tags: ['new'], rating: 4.7, reviewCount: 49, createdAt: '2026-10-12T10:00:00Z',
    description: 'A matching cropped hoodie and jogger in saturated marigold. Comfort, but make it loud.',
  },
  {
    id: 24, name: 'Pleated Mini Skirt', category: WOMEN, price: 1999,
    photos: ['1583496661160-fb5886a0aaaa', '1542060748-10c28b62716f'],
    colors: [['Black', '#141414', 0]],
    sizes: sizes(['XS', 'S', 'M', 'L', 'XL']), fabric: 'Poly-viscose suiting with permanent pleats',
    care: CARE_DELICATE, tags: ['bestseller'], rating: 4.5, reviewCount: 143, createdAt: '2026-03-08T10:00:00Z',
    description: 'A high-waisted A-line mini with knife pleats that stay sharp wash after wash. Hidden side zip.',
  },
  {
    id: 25, name: 'Blush Cargo Joggers', category: WOMEN, price: 2799, compareAtPrice: 3499,
    photos: ['1594633312681-425c7b97ccd1', '1506629082955-511b1aa562c8'],
    colors: [['Blush', '#E3B8A8', 0], ['Powder Blue', '#9DB8D6', 1]],
    sizes: sizes(APPAREL), fabric: 'Cotton twill with 2% elastane',
    care: CARE_COTTON, tags: ['sale'], rating: 4.3, reviewCount: 58, createdAt: '2026-05-25T10:00:00Z',
    description: 'Relaxed cargo joggers with cuffed hems and snap pockets. Soft twill with a little stretch.',
  },
  {
    id: 26, name: 'Stripe Wide-Leg Trousers', category: WOMEN, price: 3299,
    photos: ['1509631179647-0177331693ae', '1512436991641-6745cdb1723f'],
    colors: [['Black / White Stripe', '#222222', 0]],
    sizes: sizes(APPAREL, ['XXL']), fabric: 'Crepe-back satin',
    care: CARE_DELICATE, rating: 4.5, reviewCount: 41, createdAt: '2026-08-05T10:00:00Z',
    description: 'Dramatic wide-leg trousers in a graphic vertical stripe. High waist, pressed crease, floor-skimming length.',
  },
  {
    id: 27, name: 'Plaid Wool Overcoat', category: WOMEN, price: 11999,
    photos: ['1485968579580-b6d095142e6e', '1533659828870-95ee305cee3e'],
    colors: [['Forest Plaid', '#2F3A34', 0], ['Charcoal', '#2B2B2E', 1]],
    sizes: sizes(['XS', 'S', 'M', 'L', 'XL'], ['XS']), fabric: '70% wool, 30% polyamide',
    care: CARE_TAILORED, tags: ['new'], rating: 4.8, reviewCount: 27, createdAt: '2026-10-01T10:00:00Z',
    description: 'A cocoon-shaped overcoat in a deep forest plaid. Dropped shoulders, welt pockets and a collar made for turning up.',
  },
  {
    id: 28, name: 'Mom-Fit Jeans', category: WOMEN, price: 2899,
    photos: ['1475178626620-a4d074967452', '1576995853123-5a10305d93c0'],
    colors: [['Mid Blue', '#7FA1C6', 0], ['Light Blue', '#A9C1DA', 1]],
    sizes: sizes(['24', '26', '28', '30', '32'], ['32']), fabric: '100% rigid cotton denim',
    care: CARE_COTTON, tags: ['bestseller'], rating: 4.6, reviewCount: 302, createdAt: '2026-02-18T10:00:00Z',
    description: 'A high-rise, tapered mom jean in rigid denim that softens with every wear. The fit everyone asks about.',
  },
  {
    id: 29, name: 'Fringed Knit Poncho', category: WOMEN, price: 3799, compareAtPrice: 4599,
    photos: ['1434389677669-e08b4cac3105', '1475180098004-ca77a66827be'],
    colors: [['Oat', '#EADFC9', 0], ['Rust Stripe', '#B76A44', 1]],
    sizes: sizes(ONE), fabric: '60% cotton, 40% acrylic open knit',
    care: CARE_DELICATE, tags: ['sale'], rating: 4.4, reviewCount: 36, createdAt: '2026-01-27T10:00:00Z',
    description: 'An open-knit V-neck poncho with a hand-knotted fringe. Layer it over a slip dress or a white tee.',
  },
  {
    id: 30, name: 'Utility Field Jacket', category: WOMEN, price: 5299,
    photos: ['1544022613-e87ca75a784a', '1445205170230-053b83016050'],
    colors: [['Olive', '#5B5A3C', 0]],
    sizes: sizes(APPAREL), fabric: 'Cotton ripstop, borg collar',
    care: CARE_COTTON, rating: 4.5, reviewCount: 45, createdAt: '2026-08-29T10:00:00Z',
    description: 'A four-pocket field jacket in olive ripstop with a cosy borg collar. Drawcord waist to shape it.',
  },

  // ───────────── Accessories ─────────────
  {
    id: 31, name: 'Washed Canvas Cap', category: ACC, price: 899,
    photos: ['1521369909029-2afed882baee', '1588850561407-ed78c282e89b'],
    colors: [['Washed Black', '#3A3B3D', 0], ['White', '#F2F2F0', 1]],
    sizes: sizes(ONE), fabric: '100% cotton canvas, brass adjuster',
    care: ['Spot clean only', 'Reshape while damp'], tags: ['bestseller'], rating: 4.6, reviewCount: 267, createdAt: '2026-02-09T10:00:00Z',
    description: 'A soft, unstructured six-panel cap in garment-washed canvas with a curved brim and brass strap buckle.',
  },
  {
    id: 32, name: 'Round Metal Sunglasses', category: ACC, price: 2499,
    photos: ['1511499767150-a48a237f0083', '1617922001439-4a2e6562f328'],
    colors: [['Gold / Green', '#B8995A', 0]],
    sizes: sizes(ONE), fabric: 'Stainless steel frame, polarised CR-39 lenses',
    care: ['Clean with the microfibre cloth provided', 'Store in the hard case'], tags: ['new'], rating: 4.7, reviewCount: 88, createdAt: '2026-09-25T10:00:00Z',
    description: 'A thin round frame in brushed gold with bottle-green polarised lenses. Adjustable nose pads for a perfect fit.',
  },
  {
    id: 33, name: 'Minimal Leather Watch', category: ACC, price: 6999,
    photos: ['1524592094714-0f0654e20314', '1523275335684-37898b6baf30'],
    colors: [['Tan / Rose Gold', '#A0724D', 0], ['White / Black', '#E9E9E9', 1]],
    sizes: sizes(ONE), fabric: '316L steel case, sapphire-coated glass, Italian leather strap',
    care: ['Splash resistant only — not for swimming', 'Wipe the strap dry'], rating: 4.8, reviewCount: 74, createdAt: '2026-04-21T10:00:00Z',
    description: 'A 38 mm Japanese-quartz watch with a clean dial and quick-release leather strap. Understated by design.',
  },
  {
    id: 34, name: 'Everyday Nylon Backpack', category: ACC, price: 3999,
    photos: ['1553062407-98eeb64c6a62', '1441986300917-64674bd600d8'],
    colors: [['Navy', '#1F2A44', 0]],
    sizes: sizes(ONE), fabric: 'Recycled ballistic nylon, 18 L',
    care: ['Wipe clean with a damp cloth', 'Air dry'], rating: 4.5, reviewCount: 112, createdAt: '2026-03-02T10:00:00Z',
    description: 'An 18 L daypack in recycled ballistic nylon with a padded 15" laptop sleeve and a hidden back pocket.',
  },
  {
    id: 35, name: 'Ember Top-Handle Bag', category: ACC, price: 7499,
    photos: ['1584917865442-de89df76afd3', '1590874103328-eac38a683ce7'],
    colors: [['Ember', '#C9452F', 0], ['Terracotta', '#D07A55', 1]],
    sizes: sizes(ONE), fabric: 'Pebbled cow leather, suede interior',
    care: CARE_LEATHER, tags: ['new'], rating: 4.9, reviewCount: 19, createdAt: '2026-10-11T10:00:00Z',
    description: 'A structured top-handle in our signature Ember red, with a polished turn-lock and detachable crossbody strap.',
  },
  {
    id: 36, name: 'Studded Silver Shoulder Bag', category: ACC, price: 5999, compareAtPrice: 7999,
    photos: ['1559563458-527698bf5295', '1492707892479-7bc8d5a4ee93'],
    colors: [['Silver', '#C8C9CC', 0], ['Black', '#1A1A1A', 1]],
    sizes: sizes(ONE), fabric: 'Metallic calf leather, light gold studs',
    care: CARE_LEATHER, tags: ['sale'], rating: 4.6, reviewCount: 31, createdAt: '2026-06-28T10:00:00Z',
    description: 'A compact flap bag in soft metallic leather with a pyramid-stud trim and chain-and-leather strap.',
  },
  {
    id: 37, name: 'Tan Leather Court Sneakers', category: ACC, price: 6499,
    photos: ['1549298916-b41d501d3772', '1525507119028-ed4c629a60a3'],
    colors: [['Tan', '#B07A3F', 0], ['Red', '#C7302F', 1]],
    sizes: sizes(SHOES, ['UK 11']), fabric: 'Nubuck leather upper, natural rubber cupsole',
    care: ['Brush off dirt when dry', 'Use a nubuck protector spray'], tags: ['new'], rating: 4.7, reviewCount: 92, createdAt: '2026-09-18T10:00:00Z',
    description: 'A low-top court shoe in tan nubuck with a padded collar and a stitched rubber cupsole that lasts years.',
  },
  {
    id: 38, name: 'Bifold Leather Wallet', category: ACC, price: 1999,
    photos: ['1627123424574-724758594e93', '1479064555552-3ef4979f8908'],
    colors: [['Chestnut', '#6B3E23', 0]],
    sizes: sizes(ONE), fabric: 'Vegetable-tanned full-grain leather',
    care: CARE_LEATHER, rating: 4.5, reviewCount: 156, createdAt: '2026-01-14T10:00:00Z',
    description: 'A slim bifold in vegetable-tanned leather that develops a deep patina. Six card slots, one note pocket.',
  },
  {
    id: 39, name: 'Moonstone Pendant', category: ACC, price: 3499,
    photos: ['1599643478518-a784e5dc4c8f', '1611591437281-460bfbe1220a'],
    colors: [['Gold', '#C9A45C', 0], ['Rose Gold', '#D9A88F', 1]],
    sizes: sizes(ONE), fabric: '18k gold-plated sterling silver, lab moonstone',
    care: CARE_METAL, tags: ['bestseller'], rating: 4.8, reviewCount: 83, createdAt: '2026-05-10T10:00:00Z',
    description: 'A crescent pendant and faceted moonstone on two delicate chains that layer perfectly.',
  },
  {
    id: 40, name: 'Pavé Halo Ring', category: ACC, price: 2999,
    photos: ['1605100804763-247f67b3557e', '1617038220319-276d3cfab638'],
    colors: [['Silver', '#D4D6D9', 0], ['Gold', '#C9A45C', 1]],
    sizes: sizes(['6', '7', '8', '9'], ['9']), fabric: 'Rhodium-plated sterling silver, cubic zirconia',
    care: CARE_METAL, rating: 4.6, reviewCount: 47, createdAt: '2026-07-22T10:00:00Z',
    description: 'A vintage-inspired halo ring with a pavé band. All the sparkle, none of the stress.',
  },
  {
    id: 41, name: 'Sun Straw Hat', category: ACC, price: 1799, compareAtPrice: 2299,
    photos: ['1572307480813-ceb0e59d8325', '1617922001439-4a2e6562f328'],
    colors: [['Blush / Natural', '#E7C2B0', 0]],
    sizes: sizes(['S/M', 'L/XL']), fabric: 'Natural paper straw, grosgrain band',
    care: ['Keep dry', 'Store flat or on a hat stand'], tags: ['sale'], rating: 4.4, reviewCount: 22, createdAt: '2026-04-30T10:00:00Z',
    description: 'A wide-brimmed straw hat with a blush grosgrain band and an inner sweatband for long, hot days.',
  },
];

export const mockProducts: Product[] = seeds.map(build);
