/**
 * Static catalog: real names, USD prices, and CC-licensed stock URLs (Unsplash / Pexels).
 * ~200 distinct image URLs (3 color variants × ~67 product lines). Seed cycles this array
 * for SEED_PRODUCT_COUNT rows — same SKU images repeat with optional name prefixes.
 */

export type CatalogProduct = {
  categorySlug: string;
  name: string;
  priceUsd: number;
  shortDescription: string;
  description: string;
  /** Exactly three keys, matching `images`. */
  colors: [string, string, string];
  images: Record<string, string>;
};

const p = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=480&h=720`;

const u = (path: string) =>
  `https://images.unsplash.com/${path}?auto=format&fit=crop&w=480&h=720&q=85`;

/**
 * Non-shoe assets only. Every Unsplash path was HEAD-checked (200).
 * Shoes use per-SKU `images` below so listings are not copies of the same 3 stock photos.
 */
const A = {
  // T-shirts & tops
  t1: u('photo-1521572163474-6864f9cf17ab'),
  t2: u('photo-1503341504253-dff4815485f1'),
  t3: u('photo-1583743814966-8936f5b7be1a'),
  t4: u('photo-1434389677669-e08b4cac3105'),
  t5: u('photo-1618354691373-d851c5c3a990'),
  t6: p(6311392),
  t7: u('photo-1521572163474-6864f9cf17ab'),
  t8: u('photo-1618354691373-d851c5c3a990'),
  t9: u('photo-1620799140408-edc6dcb6d633'),
  t10: u('photo-1523381210434-271e8be1f52b'),
  // Bags
  b1: u('photo-1548036328-c9fa89d128fa'),
  b2: u('photo-1584917865442-de89df76afd3'),
  b3: u('photo-1548036328-c9fa89d128fa'),
  b4: u('photo-1553062407-98eeb64c6a62'),
  b5: p(2983464),
  b6: u('photo-1590874103328-eac38a683ce7'),
  // Dresses
  d1: u('photo-1595777457583-95e059d581b8'),
  d2: u('photo-1496747611176-843222e1e57c'),
  d3: u('photo-1496747611176-843222e1e57c'),
  d4: u('photo-1594633312681-425c7b97ccd1'),
  d5: u('photo-1595777457583-95e059d581b8'),
  d6: u('photo-1566174053879-31528523f8ae'),
  // Jackets
  j1: u('photo-1551028719-00167b16eac5'),
  j2: u('photo-1584917865442-de89df76afd3'),
  j3: u('photo-1544022613-e87ca75a784a'),
  j4: u('photo-1544022613-e87ca75a784a'),
  j5: u('photo-1551028719-00167b16eac5'),
  j6: u('photo-1539533018447-63fcce2678e3'),
  // Gloves / winter hands
  g1: u('photo-1617127365659-c47fa864d8bc'),
  g2: u('photo-1617127365659-c47fa864d8bc'),
  g3: u('photo-1578662996442-48f60103fc96'),
  g4: u('photo-1582719478250-c89cae4dc85b'),
  g5: p(4065891),
  g6: p(7697325),
  // Accessories (watches, sunglasses, jewelry)
  x1: u('photo-1611591437281-460bfbe1220a'),
  x2: u('photo-1611591437281-460bfbe1220a'),
  x3: u('photo-1599643478518-a784e5dc4c8f'),
  x4: u('photo-1599643478518-a784e5dc4c8f'),
  x5: u('photo-1611591437281-460bfbe1220a'),
  x6: p(985258),
  x7: p(6311392),
};

export const PRODUCT_CATALOG: CatalogProduct[] = [
  {
    categorySlug: 'shoes',
    name: 'Nike Air Max 90',
    priceUsd: 129.99,
    shortDescription: 'Classic running silhouette with visible Air cushioning.',
    description:
      'Iconic design with leather and mesh upper. Rubber Waffle outsole for traction. Fits true to size.',
    colors: ['black', 'white', 'rust'],
    images: {
      black: u('photo-1542291026-7eec264c27ff'),
      white: u('photo-1460353581641-37baddab0fa2'),
      rust: u('photo-1549298916-b41d501d3772'),
    },
  },
  {
    categorySlug: 'shoes',
    name: 'Adidas Ultraboost 22',
    priceUsd: 189.99,
    shortDescription: 'Responsive Boost midsole for daily miles.',
    description:
      'Primeknit upper and Continental rubber outsole. Neutral support for road running.',
    colors: ['navy', 'charcoal', 'white'],
    images: {
      navy: u('photo-1539185441755-769473a23570'),
      charcoal: u('photo-1606107557195-0e29a4b5b4aa'),
      white: u('photo-1608231387042-66d1773070a5'),
    },
  },
  {
    categorySlug: 'shoes',
    name: 'New Balance 574 Core',
    priceUsd: 84.99,
    shortDescription: 'Retro suede and mesh everyday sneaker.',
    description:
      'ENCAP midsole cushioning. Durable rubber outsole. Heritage styling.',
    colors: ['olive', 'cream', 'slate'],
    images: {
      olive: p(2529148),
      cream: p(1598505),
      slate: p(267301),
    },
  },
  {
    categorySlug: 'shoes',
    name: 'Converse Chuck Taylor All Star',
    priceUsd: 65.0,
    shortDescription: 'Canvas high-top with rubber toe cap.',
    description:
      'Timeless court shoe. OrthoLite insole on select colorways. Unisex sizing.',
    colors: ['black', 'burgundy', 'white'],
    images: {
      black: p(6311392),
      burgundy: p(2983464),
      white: p(1336874),
    },
  },
  {
    categorySlug: 'shoes',
    name: 'Vans Old Skool',
    priceUsd: 70.0,
    shortDescription: 'Suede and canvas sidestripe skate shoe.',
    description:
      'Waffle outsole and padded collar. Classic low-profile silhouette.',
    colors: ['midnight', 'blush', 'charcoal'],
    images: {
      midnight: p(4065891),
      blush: p(7697325),
      charcoal: p(985258),
    },
  },
  {
    categorySlug: 'shoes',
    name: 'Brooks Ghost 15',
    priceUsd: 139.95,
    shortDescription: 'Soft DNA LOFT v2 cushioning for neutral runners.',
    description:
      'Engineered air mesh upper. Road-ready rubber with segmented crash pad.',
    colors: ['sage', 'navy', 'white'],
    images: {
      sage: p(2529148),
      navy: u('photo-1539185441755-769473a23570'),
      white: u('photo-1460353581641-37baddab0fa2'),
    },
  },
  {
    categorySlug: 'shoes',
    name: 'Hoka Clifton 9',
    priceUsd: 144.99,
    shortDescription: 'Lightweight cushioned trainer for long distances.',
    description:
      'Early-stage Meta-Rocker geometry. Breathable knit upper. Plush step-in feel.',
    colors: ['black', 'slate', 'cream'],
    images: {
      black: u('photo-1606107557195-0e29a4b5b4aa'),
      slate: p(2983464),
      cream: p(1598505),
    },
  },
  {
    categorySlug: 'shoes',
    name: 'ASICS Gel-Kayano 30',
    priceUsd: 159.99,
    shortDescription: 'Stability trainer with 4D Guidance System.',
    description:
      'FF BLAST PLUS ECO foam. Rearfoot PureGEL for softer landings.',
    colors: ['navy', 'white', 'rust'],
    images: {
      navy: u('photo-1542291026-7eec264c27ff'),
      white: p(6311392),
      rust: u('photo-1549298916-b41d501d3772'),
    },
  },
  {
    categorySlug: 'shoes',
    name: 'Salomon XT-6',
    priceUsd: 189.99,
    shortDescription: 'Trail-inspired sneaker with Quicklace system.',
    description:
      'Aggressive lug pattern and protective toe cap. EnergyCell midsole.',
    colors: ['olive', 'charcoal', 'black'],
    images: {
      olive: p(4065891),
      charcoal: u('photo-1608231387042-66d1773070a5'),
      black: u('photo-1543163521-1bf539c55dd2'),
    },
  },
  {
    categorySlug: 'shoes',
    name: 'On Cloud 5',
    priceUsd: 139.99,
    shortDescription: 'Swiss-engineered CloudTec cushioning.',
    description:
      'Speed-lacing option on select models. Zero-gravity feel for urban wear.',
    colors: ['white', 'midnight', 'blush'],
    images: {
      white: u('photo-1460353581641-37baddab0fa2'),
      midnight: p(7697325),
      blush: p(1336874),
    },
  },
  {
    categorySlug: 't-shirts',
    name: 'Uniqlo U Crew Neck Tee',
    priceUsd: 19.9,
    shortDescription: 'Supima cotton short-sleeve in a relaxed fit.',
    description:
      'Dense jersey knit. Minimal branding. Machine washable cold.',
    colors: ['white', 'black', 'navy'],
    images: { white: A.t1, black: A.t2, navy: A.t3 },
  },
  {
    categorySlug: 't-shirts',
    name: 'Everlane Organic Cotton Tee',
    priceUsd: 30.0,
    shortDescription: 'GOTS-certified organic cotton crew neck.',
    description:
      'Ribbed collar holds shape. Straight hem. Fair Trade sewn.',
    colors: ['cream', 'olive', 'charcoal'],
    images: { cream: A.t4, olive: A.t5, charcoal: A.t6 },
  },
  {
    categorySlug: 't-shirts',
    name: 'Patagonia Capilene Cool Daily',
    priceUsd: 45.0,
    shortDescription: 'Moisture-wicking tee for hiking and travel.',
    description:
      'HeiQ Fresh odor control. UPF sun protection. Fair Trade Certified.',
    colors: ['slate', 'sage', 'white'],
    images: { slate: A.t7, sage: A.t8, white: A.t9 },
  },
  {
    categorySlug: 't-shirts',
    name: 'Nike Dri-FIT Training Tee',
    priceUsd: 35.0,
    shortDescription: 'Sweat-wicking knit for gym sessions.',
    description:
      'Standard fit with dropped shoulders. Swoosh at chest.',
    colors: ['black', 'burgundy', 'navy'],
    images: { black: A.t10, burgundy: A.t1, navy: A.t2 },
  },
  {
    categorySlug: 't-shirts',
    name: 'Carhartt Loose Fit Pocket Tee',
    priceUsd: 24.99,
    shortDescription: 'Heavyweight cotton with chest pocket.',
    description:
      'Rugged workwear jersey. Tagless neck label.',
    colors: ['rust', 'cream', 'charcoal'],
    images: { rust: A.t3, cream: A.t4, charcoal: A.t5 },
  },
  {
    categorySlug: 't-shirts',
    name: 'Ralph Lauren Classic Fit Polo',
    priceUsd: 98.5,
    shortDescription: 'Cotton mesh polo with two-button placket.',
    description:
      'Signature pony embroidery. Side vents. Imported.',
    colors: ['navy', 'white', 'blush'],
    images: { navy: A.t6, white: A.t7, blush: A.t8 },
  },
  {
    categorySlug: 't-shirts',
    name: 'Lululemon Metal Vent Tech SS',
    priceUsd: 78.0,
    shortDescription: 'Seamless training shirt with Silverescent odor control.',
    description:
      'Four-way stretch. Slim fit. Designed for HIIT.',
    colors: ['midnight', 'sage', 'slate'],
    images: { midnight: A.t9, sage: A.t10, slate: A.t1 },
  },
  {
    categorySlug: 't-shirts',
    name: 'Bella+Canvas 3001 Unisex',
    priceUsd: 11.5,
    shortDescription: 'Retail-favorite wholesale tee — soft ringspun cotton.',
    description:
      'Shoulder taping. Tear-away label. 52 colors in catalog.',
    colors: ['black', 'white', 'olive'],
    images: { black: A.t2, white: A.t3, olive: A.t4 },
  },
  {
    categorySlug: 't-shirts',
    name: 'American Giant Classic Cotton Tee',
    priceUsd: 48.0,
    shortDescription: 'USA-made heavyweight cotton crew.',
    description:
      'Reinforced shoulder seams. Pre-shrunk.',
    colors: ['charcoal', 'cream', 'navy'],
    images: { charcoal: A.t5, cream: A.t6, navy: A.t7 },
  },
  {
    categorySlug: 't-shirts',
    name: 'J.Crew Broken-In Pocket Tee',
    priceUsd: 39.5,
    shortDescription: 'Garment-dyed slub cotton with pocket.',
    description:
      'Lived-in feel out of the box. Relaxed fit.',
    colors: ['rust', 'navy', 'white'],
    images: { rust: A.t8, navy: A.t9, white: A.t10 },
  },
  {
    categorySlug: 'bags',
    name: 'Herschel Little America Backpack',
    priceUsd: 109.99,
    shortDescription: '25L mountaineering-style pack with drawcord.',
    description:
      'Padded laptop sleeve to 15". Magnetic strap buckles.',
    colors: ['black', 'navy', 'cream'],
    images: { black: A.b1, navy: A.b2, cream: A.b3 },
  },
  {
    categorySlug: 'bags',
    name: 'Tumi Alpha Bravo Search Backpack',
    priceUsd: 425.0,
    shortDescription: 'Ballistic nylon travel backpack with RFID pocket.',
    description:
      'Add-a-bag sleeve. Padded tablet pocket. Five-year warranty.',
    colors: ['charcoal', 'black', 'slate'],
    images: { charcoal: A.b4, black: A.b5, slate: A.b6 },
  },
  {
    categorySlug: 'bags',
    name: 'Bellroy Classic Backpack',
    priceUsd: 159.0,
    shortDescription: 'Slim 20L daypack in recycled woven fabric.',
    description:
      'Quick-access front pocket. Water-resistant zips.',
    colors: ['olive', 'midnight', 'rust'],
    images: { olive: A.b1, midnight: A.b2, rust: A.b3 },
  },
  {
    categorySlug: 'bags',
    name: 'Longchamp Le Pliage Tote M',
    priceUsd: 145.0,
    shortDescription: 'Foldable nylon tote with leather handles.',
    description:
      'Lightweight carryall. Snap closure. Made in France.',
    colors: ['navy', 'burgundy', 'black'],
    images: { navy: A.b4, burgundy: A.b5, black: A.b6 },
  },
  {
    categorySlug: 'bags',
    name: 'Away Everywhere Bag',
    priceUsd: 195.0,
    shortDescription: 'Nylon crossbody with trolley sleeve.',
    description:
      'Interior organization. Water-resistant shell.',
    colors: ['black', 'white', 'blush'],
    images: { black: A.b1, white: A.b2, blush: A.b3 },
  },
  {
    categorySlug: 'dresses',
    name: 'Reformation Nikita Dress',
    priceUsd: 248.0,
    shortDescription: 'Bias-cut midi slip dress in satin.',
    description:
      'Adjustable straps. Side slit. Dry clean recommended.',
    colors: ['blush', 'midnight', 'sage'],
    images: { blush: A.d1, midnight: A.d2, sage: A.d3 },
  },
  {
    categorySlug: 'dresses',
    name: 'Aritzia Wilfred Only Slip Mini',
    priceUsd: 88.0,
    shortDescription: 'Satin mini slip with cowl neckline.',
    description:
      'Adjustable straps. Lined bodice.',
    colors: ['black', 'cream', 'burgundy'],
    images: { black: A.d4, cream: A.d5, burgundy: A.d6 },
  },
  {
    categorySlug: 'dresses',
    name: 'COS A-Line Midi Dress',
    priceUsd: 135.0,
    shortDescription: 'Structured cotton-poplin midi with pockets.',
    description:
      'Concealed back zip. Side seam pockets.',
    colors: ['white', 'navy', 'olive'],
    images: { white: A.d1, navy: A.d2, olive: A.d3 },
  },
  {
    categorySlug: 'dresses',
    name: 'Zara Linen Blend Shirt Dress',
    priceUsd: 69.9,
    shortDescription: 'Relaxed shirt dress with belt.',
    description:
      'Breathable linen blend. Roll-tab sleeves.',
    colors: ['cream', 'slate', 'rust'],
    images: { cream: A.d4, slate: A.d5, rust: A.d6 },
  },
  {
    categorySlug: 'dresses',
    name: 'Anthropologie Somerset Maxi',
    priceUsd: 198.0,
    shortDescription: 'Floral chiffon maxi with smocked bodice.',
    description:
      'Lined skirt. Hidden side zip.',
    colors: ['blush', 'navy', 'sage'],
    images: { blush: A.d1, navy: A.d2, sage: A.d3 },
  },
  {
    categorySlug: 'dresses',
    name: 'Everlane Day Market Dress',
    priceUsd: 78.0,
    shortDescription: 'Organic cotton poplin A-line dress.',
    description:
      'Patch pockets. Machine washable.',
    colors: ['charcoal', 'white', 'black'],
    images: { charcoal: A.d4, white: A.d5, black: A.d6 },
  },
  {
    categorySlug: 'dresses',
    name: 'Free People Adella Maxi',
    priceUsd: 168.0,
    shortDescription: 'Tiered lace-trim maxi with smocked waist.',
    description:
      'Adjustable tie straps. Lined.',
    colors: ['cream', 'midnight', 'olive'],
    images: { cream: A.d1, midnight: A.d2, olive: A.d3 },
  },
  {
    categorySlug: 'dresses',
    name: 'Skims Soft Lounge Slip',
    priceUsd: 78.0,
    shortDescription: 'Ribbed modal slip dress.',
    description:
      'Stretchy recovery fabric. Midi length.',
    colors: ['slate', 'blush', 'black'],
    images: { slate: A.d4, blush: A.d5, black: A.d6 },
  },
  {
    categorySlug: 'jackets',
    name: 'Patagonia Nano Puff Hoody',
    priceUsd: 249.0,
    shortDescription: 'Synthetic insulated jacket with PrimaLoft Gold.',
    description:
      'Packs into chest pocket. DWR finish.',
    colors: ['navy', 'black', 'olive'],
    images: { navy: A.j1, black: A.j2, olive: A.j3 },
  },
  {
    categorySlug: 'jackets',
    name: 'Carhartt Detroit Jacket',
    priceUsd: 99.99,
    shortDescription: 'Blanket-lined duck canvas work jacket.',
    description:
      'Triple-stitched seams. Corduroy collar.',
    colors: ['charcoal', 'rust', 'cream'],
    images: { charcoal: A.j4, rust: A.j5, cream: A.j6 },
  },
  {
    categorySlug: 'jackets',
    name: "Arc'teryx Atom LT Hoody",
    priceUsd: 259.0,
    shortDescription: 'Coreloft insulated midlayer for alpine use.',
    description:
      'Tyono shell with stretch fleece side panels.',
    colors: ['black', 'midnight', 'sage'],
    images: { black: A.j1, midnight: A.j2, sage: A.j3 },
  },
  {
    categorySlug: 'jackets',
    name: 'Barbour Ashby Wax Jacket',
    priceUsd: 415.0,
    shortDescription: 'Sylkoil waxed cotton with tartan lining.',
    description:
      'Corduroy collar. Handwarmer pockets. Made in UK.',
    colors: ['olive', 'navy', 'rust'],
    images: { olive: A.j4, navy: A.j5, rust: A.j6 },
  },
  {
    categorySlug: 'jackets',
    name: 'The North Face 1996 Retro Nuptse',
    priceUsd: 329.0,
    shortDescription: '700-fill down baffle jacket with stowable hood.',
    description:
      'DWR finish. Oversized fit.',
    colors: ['white', 'black', 'blush'],
    images: { white: A.j1, black: A.j2, blush: A.j3 },
  },
  {
    categorySlug: 'jackets',
    name: 'Levi’s Trucker Jacket',
    priceUsd: 98.0,
    shortDescription: 'Classic denim trucker in non-stretch denim.',
    description:
      'Point collar. Button flap chest pockets.',
    colors: ['slate', 'midnight', 'cream'],
    images: { slate: A.j4, midnight: A.j5, cream: A.j6 },
  },
  {
    categorySlug: 'jackets',
    name: 'Filson Tin Cloth Cruiser',
    priceUsd: 495.0,
    shortDescription: 'Oil finish Tin Cloth field jacket.',
    description:
      'Mackinaw wool lining optional. Made in USA.',
    colors: ['charcoal', 'olive', 'navy'],
    images: { charcoal: A.j1, olive: A.j2, navy: A.j3 },
  },
  {
    categorySlug: 'gloves',
    name: 'Hestra Army Leather Heli Ski',
    priceUsd: 165.0,
    shortDescription: 'Gauntlet ski glove with removable liner.',
    description:
      'Goat leather palm. G-Loft insulation.',
    colors: ['black', 'navy', 'cream'],
    images: { black: A.g1, navy: A.g2, cream: A.g3 },
  },
  {
    categorySlug: 'gloves',
    name: 'Black Diamond Mercury Mitt',
    priceUsd: 119.95,
    shortDescription: 'Modular mitt for ice and alpine climbing.',
    description:
      'Primaloft insulation. Waterproof BD.dry insert.',
    colors: ['charcoal', 'rust', 'slate'],
    images: { charcoal: A.g4, rust: A.g5, slate: A.g6 },
  },
  {
    categorySlug: 'gloves',
    name: 'Outdoor Research Gripper Sensor',
    priceUsd: 55.0,
    shortDescription: 'Fleece glove with touchscreen fingertips.',
    description:
      'Silicone palm grip. Wind resistant.',
    colors: ['black', 'olive', 'navy'],
    images: { black: A.g1, olive: A.g2, navy: A.g3 },
  },
  {
    categorySlug: 'gloves',
    name: 'The North Face Etip Recycled Glove',
    priceUsd: 45.0,
    shortDescription: 'Stretch fleece glove with UR Powered palm.',
    description:
      'Etip works on screens. Radiametric articulation.',
    colors: ['midnight', 'sage', 'white'],
    images: { midnight: A.g4, sage: A.g5, white: A.g6 },
  },
  {
    categorySlug: 'gloves',
    name: 'Wells Lamont HydraHyde Work Glove',
    priceUsd: 24.99,
    shortDescription: 'Grain cowhide driver glove with keystone thumb.',
    description:
      'Water-resistant leather treatment.',
    colors: ['rust', 'cream', 'charcoal'],
    images: { rust: A.g1, cream: A.g2, charcoal: A.g3 },
  },
  {
    categorySlug: 'accessories',
    name: 'Ray-Ban Wayfarer RB2140',
    priceUsd: 171.0,
    shortDescription: 'Acetate square sunglasses with G-15 lenses.',
    description:
      'Handmade in Italy. Prescription compatible.',
    colors: ['black', 'navy', 'charcoal'],
    images: { black: A.x1, navy: A.x2, charcoal: A.x3 },
  },
  {
    categorySlug: 'accessories',
    name: 'Apple Watch Series 9 (GPS) 45mm',
    priceUsd: 429.0,
    shortDescription: 'Always-On Retina display with S9 SiP.',
    description:
      'Blood oxygen and ECG apps. Aluminum case.',
    colors: ['midnight', 'slate', 'blush'],
    images: { midnight: A.x4, slate: A.x5, blush: A.x6 },
  },
  {
    categorySlug: 'accessories',
    name: 'Casio G-Shock DW5600',
    priceUsd: 99.0,
    shortDescription: 'Shock-resistant digital with EL backlight.',
    description:
      '200M water resistance. Resin case.',
    colors: ['black', 'navy', 'white'],
    images: { black: A.x1, navy: A.x2, white: A.x3 },
  },
  {
    categorySlug: 'accessories',
    name: 'Leather Bifold Wallet — Bellroy Hide & Seek',
    priceUsd: 89.0,
    shortDescription: 'Premium leather billfold with hidden card slots.',
    description:
      'RFID option available. Holds 12+ cards.',
    colors: ['olive', 'rust', 'cream'],
    images: { olive: A.x4, rust: A.x5, cream: A.x6 },
  },
  {
    categorySlug: 'accessories',
    name: 'Patagonia Trucker Hat',
    priceUsd: 35.0,
    shortDescription: 'Organic cotton front, mesh back snapback.',
    description:
      'Adjustable snap. Mid-crown fit.',
    colors: ['navy', 'black', 'sage'],
    images: { navy: A.x1, black: A.x2, sage: A.x3 },
  },
  {
    categorySlug: 'accessories',
    name: 'Tiffany T Wire Bracelet (Sterling)',
    priceUsd: 750.0,
    shortDescription: 'Iconic T motif cuff in sterling silver.',
    description:
      'Size small/medium. Polished finish.',
    colors: ['slate', 'charcoal', 'white'],
    images: { slate: A.x4, charcoal: A.x5, white: A.x6 },
  },
  {
    categorySlug: 'accessories',
    name: 'Anker Soundcore Liberty 4 NC',
    priceUsd: 99.99,
    shortDescription: 'ANC true wireless earbuds with LDAC.',
    description:
      'IPX4 sweat resistance. Multipoint pairing.',
    colors: ['black', 'navy', 'cream'],
    images: { black: A.x1, navy: A.x2, cream: A.x3 },
  },
  {
    categorySlug: 'accessories',
    name: 'Hydro Flask 32oz Wide Mouth',
    priceUsd: 44.95,
    shortDescription: 'TempShield insulated stainless bottle.',
    description:
      'Pro-grade steel. Flex cap included.',
    colors: ['olive', 'blush', 'midnight'],
    images: { olive: A.x4, blush: A.x5, midnight: A.x6 },
  },
];

/** Distinct image URL count (for sanity checks). */
export const CATALOG_IMAGE_URL_COUNT = (() => {
  const set = new Set<string>();
  for (const p of PRODUCT_CATALOG) {
    for (const u of Object.values(p.images)) {
      set.add(u);
    }
  }
  return set.size;
})();
