export interface Product {
  id: number;
  title: string;
  image: string;
  price: number;
  oldPrice?: number;
  priceDisplay: string;
  regularPrice: number;
  category: string;
  badge: string;
  packSize?: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  description?: string;
  features?: string[];
  slug?: string;
}

export const PRODUCTS: Product[] = [
  // ── 8 Featured Recent Products (Montague Cole Bullion Highlights) ──────────
  {
    id: 1,
    slug: "gold-1oz-vault-bar",
    title: "1 oz Gold Vault Bar",
    image: "/uploads/products/gold.avif",
    price: 2364,
    regularPrice: 2364,
    priceDisplay: "AED 2,364",
    category: "bars",
    badge: "In stock",
    packSize: "1 oz",
    rating: 4.9,
    reviewCount: 28,
    inStock: true,
    description: "London good delivery standard, secure storage ready. Indicative catalogue price based on live metal value + premium 4.8% + delivery and insurance.",
    features: [
      "Category: Bars",
      "Metal: Gold",
      "Fineness: 999.9 (24 Karat)",
      "Gross Weight: 31.1035 g",
      "Fine Weight: 1 oz (31.1035 g)",
      "Dimensions: [PENDING CLIENT]",
      "Refiner/Mint: London Good Delivery / Dubai Good Delivery Standard",
      "Packaging: Tamper-evident secure assay blister",
      "Certificate/Serial: Individually serial numbered with assayer certificate",
      "Stock Status: In stock",
      "Dispatch Expectation: 24–48 hours insured delivery or immediate vault allocation",
      "Buy-back Eligibility: Guaranteed buy-back eligible",
      "Pricing Note: Final invoice = live metal value + 4.8% premium + delivery + insurance + applicable taxes"
    ]
  },
  {
    id: 2,
    slug: "silver-britannia-coin",
    title: "1 oz Silver Britannia Coin",
    image: "/uploads/products/Silver coins.avif",
    price: 34,
    oldPrice: 38,
    regularPrice: 38,
    priceDisplay: "AED 34",
    category: "coins",
    badge: "11% off",
    packSize: "1 oz",
    rating: 4.8,
    reviewCount: 16,
    inStock: true,
    description: "Globally recognised silver coin, well suited to gifting and diversification. Indicative catalogue price based on live metal value + premium 8.6% + delivery and insurance.",
    features: [
      "Category: Coins",
      "Metal: Silver",
      "Fineness: 999.0 Fine Silver",
      "Gross Weight: 31.21 g",
      "Fine Weight: 1 oz (31.1035 g)",
      "Dimensions: 38.61 mm diameter [PENDING CLIENT]",
      "Refiner/Mint: Selected internationally recognised mint [PENDING CLIENT: brand selection]",
      "Packaging: Protective coin capsule",
      "Certificate/Serial: Sovereign government guaranteed weight and purity",
      "Stock Status: Limited allocation",
      "Dispatch Expectation: 24–48 hours insured dispatch",
      "Buy-back Eligibility: Guaranteed buy-back eligible",
      "Pricing Note: Final invoice = live metal value + 8.6% premium + delivery + insurance + applicable taxes"
    ]
  },
  {
    id: 3,
    slug: "dubai-burj-bar",
    title: "50 g Gold Dubai Burj Bar",
    image: "/uploads/products/Burj Khalifa-inspired bars.webp",
    price: 3980,
    regularPrice: 3980,
    priceDisplay: "AED 3,980",
    category: "dubai-collection",
    badge: "Awaiting delivery",
    packSize: "50 g",
    rating: 4.9,
    reviewCount: 9,
    inStock: true,
    description: "A limited Dubai-inspired design with architecture-led detailing. Indicative catalogue price based on live metal value + premium 10.2% + delivery and insurance.",
    features: [
      "Category: Dubai Collection (Prototype / Pre-order)",
      "Metal: Gold",
      "Fineness: 999.9 (24 Karat)",
      "Gross Weight: 50 g",
      "Fine Weight: 50 g",
      "Dimensions: [PENDING CLIENT: Architectural Bar Spec]",
      "Refiner/Mint: Montague Cole Dubai Signature Mint",
      "Packaging: Presentation box with velvet inlay and collector certificate",
      "Certificate/Serial: Numbered commemorative certificate",
      "Stock Status: Awaiting delivery (Pre-order)",
      "Dispatch Expectation: Allocated priority dispatch upon release",
      "Buy-back Eligibility: Guaranteed buy-back eligible",
      "Pricing Note: Final invoice = live metal value + 10.2% premium + delivery + insurance + applicable taxes"
    ]
  },
  {
    id: 4,
    slug: "gold-coin-collection",
    title: "1/4 oz Gold Dubai Collection Coin",
    image: "/uploads/products/gold coin.avif",
    price: 790,
    regularPrice: 790,
    priceDisplay: "AED 790",
    category: "coins",
    badge: "In stock",
    packSize: "1/4 oz",
    rating: 4.7,
    reviewCount: 12,
    inStock: true,
    description: "A refined coin for gifting, presentability and portfolio flexibility. Indicative catalogue price based on live metal value + premium 7.1% + delivery and insurance.",
    features: [
      "Category: Coins / Dubai Collection",
      "Metal: Gold",
      "Fineness: 999.9 (24 Karat)",
      "Gross Weight: 7.78 g",
      "Fine Weight: 1/4 oz (7.776 g)",
      "Dimensions: 22.0 mm diameter [PENDING CLIENT]",
      "Refiner/Mint: Montague Cole Dubai Signature Release",
      "Packaging: Airtight acrylic capsule with presentation pouch",
      "Certificate/Serial: Official certificate of authenticity",
      "Stock Status: In stock",
      "Dispatch Expectation: 24–48 hours insured dispatch",
      "Buy-back Eligibility: Guaranteed buy-back eligible",
      "Pricing Note: Final invoice = live metal value + 7.1% premium + delivery + insurance + applicable taxes"
    ]
  },
  {
    id: 5,
    slug: "gold-investment-bar",
    title: "100 g Gold Investment Bar",
    image: "/uploads/products/gold ber.avif",
    price: 7590,
    regularPrice: 7590,
    priceDisplay: "AED 7,590",
    category: "bars",
    badge: "In stock",
    packSize: "100 g",
    rating: 4.9,
    reviewCount: 21,
    inStock: true,
    description: "A substantial gold allocation with verified fineness and secure dispatch. Indicative catalogue price based on live metal value + premium 3.9% + delivery and insurance.",
    features: [
      "Category: Bars",
      "Metal: Gold",
      "Fineness: 999.9 (24 Karat)",
      "Gross Weight: 100 g",
      "Fine Weight: 100 g",
      "Dimensions: [PENDING CLIENT: Standard Cast Bar]",
      "Refiner/Mint: Dubai Good Delivery / LBMA Accredited Refiner",
      "Packaging: Sealed CertiCard with tamper-evident security foil",
      "Certificate/Serial: Individual serial number and assayer signature",
      "Stock Status: In stock",
      "Dispatch Expectation: 24–48 hours insured courier or Dubai vault custody",
      "Buy-back Eligibility: Guaranteed buy-back eligible",
      "Pricing Note: Final invoice = live metal value + 3.9% premium + delivery + insurance + applicable taxes"
    ]
  },
  {
    id: 6,
    slug: "silver-investment-bar",
    title: "1 kg Silver Investment Bar",
    image: "/uploads/products/Silver bars.avif",
    price: 1095,
    regularPrice: 1095,
    priceDisplay: "AED 1,095",
    category: "bars",
    badge: "In stock",
    packSize: "1 kg",
    rating: 4.8,
    reviewCount: 14,
    inStock: true,
    description: "A practical silver allocation in a recognised bar format. Indicative catalogue price based on live metal value + premium 6.2% + delivery and insurance.",
    features: [
      "Category: Bars",
      "Metal: Silver",
      "Fineness: 999.0 Fine Silver",
      "Gross Weight: 1000 g (1 kg)",
      "Fine Weight: 1 kg",
      "Dimensions: [PENDING CLIENT: Cast Ingot Dimensions]",
      "Refiner/Mint: London Good Delivery / Dubai Good Delivery Standard",
      "Packaging: Sealed heavy-gauge protective pouch",
      "Certificate/Serial: Stamped with purity, weight, and unique registration number",
      "Stock Status: In stock",
      "Dispatch Expectation: 24–48 hours insured delivery",
      "Buy-back Eligibility: Guaranteed buy-back eligible",
      "Pricing Note: Final invoice = live metal value + 6.2% premium + delivery + insurance + applicable taxes"
    ]
  },
  {
    id: 7,
    slug: "gold-bullion-coin",
    title: "1 oz Gold Bullion Coin",
    image: "/uploads/products/gold coin.avif",
    price: 2395,
    regularPrice: 2395,
    priceDisplay: "AED 2,395",
    category: "coins",
    badge: "Limited",
    packSize: "1 oz",
    rating: 4.8,
    reviewCount: 19,
    inStock: true,
    description: "A refined, portable gold coin for private collections and gifting. Indicative catalogue price based on live metal value + premium 5.4% + delivery and insurance.",
    features: [
      "Category: Coins",
      "Metal: Gold",
      "Fineness: 999.9 (24 Karat)",
      "Gross Weight: 31.1035 g",
      "Fine Weight: 1 oz (31.1035 g)",
      "Dimensions: 32.7 mm diameter [PENDING CLIENT]",
      "Refiner/Mint: Selected internationally recognised sovereign mint [PENDING CLIENT: brand selection]",
      "Packaging: Secure coin capsule",
      "Certificate/Serial: Sovereign legal tender backing",
      "Stock Status: Limited",
      "Dispatch Expectation: 24–48 hours insured dispatch",
      "Buy-back Eligibility: Guaranteed buy-back eligible",
      "Pricing Note: Final invoice = live metal value + 5.4% premium + delivery + insurance + applicable taxes"
    ]
  },
  {
    id: 8,
    slug: "dubai-burj-coin",
    title: "1/4 oz Gold Burj Khalifa Coin",
    image: "/uploads/products/Burj Khalifa-inspired coins.webp",
    price: 825,
    regularPrice: 825,
    priceDisplay: "AED 825",
    category: "dubai-collection",
    badge: "Limited",
    packSize: "1/4 oz",
    rating: 4.9,
    reviewCount: 11,
    inStock: true,
    description: "A Dubai-inspired commemorative coin with a skyline motif. Indicative catalogue price based on live metal value + premium 8.4% + delivery and insurance.",
    features: [
      "Category: Dubai Collection (Prototype / Pre-order)",
      "Metal: Gold",
      "Fineness: 999.9 (24 Karat)",
      "Gross Weight: 7.78 g",
      "Fine Weight: 1/4 oz (7.776 g)",
      "Dimensions: [PENDING CLIENT: Skyline Proof Relief]",
      "Refiner/Mint: Montague Cole Dubai Signature Mint",
      "Packaging: Commemorative presentation case and certificate",
      "Certificate/Serial: Numbered limited-run certificate",
      "Stock Status: Limited edition (Pre-order)",
      "Dispatch Expectation: Priority dispatch upon minting run completion",
      "Buy-back Eligibility: Guaranteed buy-back eligible",
      "Pricing Note: Final invoice = live metal value + 8.4% premium + delivery + insurance + applicable taxes"
    ]
  },

  // ── Complete Catalog Specifications (Gold Bars, Silver Bars, Coins & Private Assets) ─
  {
    id: 9,
    slug: "gold-1g-bar",
    title: "1 g Gold Bar",
    image: "/uploads/products/gold ber.avif",
    price: 88,
    regularPrice: 88,
    priceDisplay: "AED 88",
    category: "bars",
    badge: "In stock",
    packSize: "1 g",
    rating: 4.9,
    reviewCount: 34,
    inStock: true,
    description: "Entry bullion denomination struck in 999.9 pure gold. Indicative price based on live metal value + product premium + delivery and insurance.",
    features: [
      "Category: Bars",
      "Metal: Gold",
      "Fineness: 999.9",
      "Gross Weight: 1 g",
      "Fine Weight: 1 g",
      "Dimensions: [PENDING CLIENT]",
      "Refiner/Mint: Dubai Good Delivery / LBMA Refiner",
      "Packaging: CertiCard blister with assayer stamp",
      "Certificate/Serial: Individual serial number",
      "Stock Status: In stock",
      "Dispatch Expectation: 24–48 hours insured dispatch",
      "Buy-back Eligibility: Guaranteed buy-back eligible"
    ]
  },
  {
    id: 10,
    slug: "gold-5g-bar",
    title: "5 g Gold Bar",
    image: "/uploads/products/gold.avif",
    price: 412,
    regularPrice: 412,
    priceDisplay: "AED 412",
    category: "bars",
    badge: "In stock",
    packSize: "5 g",
    rating: 4.8,
    reviewCount: 22,
    inStock: true,
    description: "Compact 5 g investment gold bar with verified purity and tamper-evident packaging.",
    features: [
      "Category: Bars",
      "Metal: Gold",
      "Fineness: 999.9",
      "Gross Weight: 5 g",
      "Fine Weight: 5 g",
      "Dimensions: [PENDING CLIENT]",
      "Refiner/Mint: Dubai Good Delivery / LBMA Refiner",
      "Packaging: Tamper-evident blister pack",
      "Certificate/Serial: Serial numbered assay certificate",
      "Stock Status: In stock",
      "Dispatch Expectation: 24–48 hours insured dispatch",
      "Buy-back Eligibility: Guaranteed buy-back eligible"
    ]
  },
  {
    id: 11,
    slug: "gold-10g-bar",
    title: "10 g Gold Bar",
    image: "/uploads/products/gold ber.avif",
    price: 810,
    regularPrice: 810,
    priceDisplay: "AED 810",
    category: "bars",
    badge: "In stock",
    packSize: "10 g",
    rating: 4.9,
    reviewCount: 40,
    inStock: true,
    description: "Classic 10 g minted gold bar, combining portability, purity and liquid market recognition.",
    features: [
      "Category: Bars",
      "Metal: Gold",
      "Fineness: 999.9",
      "Gross Weight: 10 g",
      "Fine Weight: 10 g",
      "Dimensions: [PENDING CLIENT]",
      "Refiner/Mint: Dubai Good Delivery / LBMA Refiner",
      "Packaging: Tamper-evident blister pack",
      "Certificate/Serial: Serial numbered assay certificate",
      "Stock Status: In stock",
      "Dispatch Expectation: 24–48 hours insured dispatch",
      "Buy-back Eligibility: Guaranteed buy-back eligible"
    ]
  },
  {
    id: 12,
    slug: "gold-20g-bar",
    title: "20 g Gold Bar",
    image: "/uploads/products/gold.avif",
    price: 1590,
    regularPrice: 1590,
    priceDisplay: "AED 1,590",
    category: "bars",
    badge: "In stock",
    packSize: "20 g",
    rating: 4.8,
    reviewCount: 17,
    inStock: true,
    description: "20 g minted gold bar for disciplined portfolio accumulation with institutional-grade fineness.",
    features: [
      "Category: Bars",
      "Metal: Gold",
      "Fineness: 999.9",
      "Gross Weight: 20 g",
      "Fine Weight: 20 g",
      "Dimensions: [PENDING CLIENT]",
      "Refiner/Mint: Dubai Good Delivery / LBMA Refiner",
      "Packaging: Sealed assay card",
      "Certificate/Serial: Serial numbered assay certificate",
      "Stock Status: In stock",
      "Dispatch Expectation: 24–48 hours insured dispatch",
      "Buy-back Eligibility: Guaranteed buy-back eligible"
    ]
  },
  {
    id: 13,
    slug: "gold-1kg-bar",
    title: "1 kg Gold Bar",
    image: "/uploads/products/gold ber.avif",
    price: 74500,
    regularPrice: 74500,
    priceDisplay: "AED 74,500",
    category: "bars",
    badge: "In stock",
    packSize: "1 kg",
    rating: 5.0,
    reviewCount: 15,
    inStock: true,
    description: "Institutional 1 kilogram cast gold bar. Eligible for allocated custody inside our Dubai vault or insured global freight.",
    features: [
      "Category: Bars",
      "Metal: Gold",
      "Fineness: 999.9",
      "Gross Weight: 1000 g",
      "Fine Weight: 1000 g (1 kg)",
      "Dimensions: [PENDING CLIENT: Standard Cast Ingot]",
      "Refiner/Mint: London Good Delivery / Dubai Good Delivery Standard",
      "Packaging: Heavy-duty security sleeve and wooden depository box",
      "Certificate/Serial: Stamped assay certificate with assayer seal",
      "Stock Status: In stock",
      "Dispatch Expectation: Vault delivery or armoured courier transport",
      "Buy-back Eligibility: Guaranteed buy-back eligible"
    ]
  },
  {
    id: 14,
    slug: "gold-1oz-dubai-coin",
    title: "1 oz Gold Dubai Coin",
    image: "/uploads/products/gold coin.avif",
    price: 2410,
    regularPrice: 2410,
    priceDisplay: "AED 2,410",
    category: "coins",
    badge: "In stock",
    packSize: "1 oz",
    rating: 4.9,
    reviewCount: 26,
    inStock: true,
    description: "Proprietary Dubai 1 oz gold coin minted to 999.9 fineness, celebrating the emirate's heritage as the City of Gold.",
    features: [
      "Category: Coins",
      "Metal: Gold",
      "Fineness: 999.9",
      "Gross Weight: 31.1035 g",
      "Fine Weight: 1 oz",
      "Dimensions: 32.0 mm diameter [PENDING CLIENT]",
      "Refiner/Mint: Montague Cole Dubai Signature Mint",
      "Packaging: Acrylic capsule in presentation case",
      "Certificate/Serial: Official certificate of authenticity",
      "Stock Status: In stock",
      "Dispatch Expectation: 24–48 hours insured dispatch",
      "Buy-back Eligibility: Guaranteed buy-back eligible"
    ]
  },
  {
    id: 15,
    slug: "silver-100g-bar",
    title: "100 g Silver Bar",
    image: "/uploads/products/Silver bars.avif",
    price: 118,
    regularPrice: 118,
    priceDisplay: "AED 118",
    category: "bars",
    badge: "In stock",
    packSize: "100 g",
    rating: 4.8,
    reviewCount: 18,
    inStock: true,
    description: "100 g minted fine silver bar with 999.0 purity. Clean presentation and high liquidity.",
    features: [
      "Category: Bars",
      "Metal: Silver",
      "Fineness: 999.0",
      "Gross Weight: 100 g",
      "Fine Weight: 100 g",
      "Dimensions: [PENDING CLIENT]",
      "Refiner/Mint: Dubai Good Delivery / LBMA Refiner",
      "Packaging: Sealed blister assay packaging",
      "Certificate/Serial: Stamped serial number",
      "Stock Status: In stock",
      "Dispatch Expectation: 24–48 hours insured dispatch",
      "Buy-back Eligibility: Guaranteed buy-back eligible"
    ]
  },
  {
    id: 16,
    slug: "silver-250g-bar",
    title: "250 g Silver Bar",
    image: "/uploads/products/Silver bars.avif",
    price: 285,
    regularPrice: 285,
    priceDisplay: "AED 285",
    category: "bars",
    badge: "In stock",
    packSize: "250 g",
    rating: 4.8,
    reviewCount: 13,
    inStock: true,
    description: "250 g fine silver bar struck to 999.0 purity standard. Ideal for incremental physical asset accumulation.",
    features: [
      "Category: Bars",
      "Metal: Silver",
      "Fineness: 999.0",
      "Gross Weight: 250 g",
      "Fine Weight: 250 g",
      "Dimensions: [PENDING CLIENT]",
      "Refiner/Mint: Dubai Good Delivery / LBMA Refiner",
      "Packaging: Protective polymer seal",
      "Certificate/Serial: Individual serial stamp",
      "Stock Status: In stock",
      "Dispatch Expectation: 24–48 hours insured dispatch",
      "Buy-back Eligibility: Guaranteed buy-back eligible"
    ]
  },
  {
    id: 17,
    slug: "silver-500g-bar",
    title: "500 g Silver Bar",
    image: "/uploads/products/Silver bars.avif",
    price: 560,
    regularPrice: 560,
    priceDisplay: "AED 560",
    category: "bars",
    badge: "In stock",
    packSize: "500 g",
    rating: 4.9,
    reviewCount: 19,
    inStock: true,
    description: "Mid-tier physical silver bar format balancing volume, manageable unit size, and low minted premiums.",
    features: [
      "Category: Bars",
      "Metal: Silver",
      "Fineness: 999.0",
      "Gross Weight: 500 g",
      "Fine Weight: 500 g",
      "Dimensions: [PENDING CLIENT]",
      "Refiner/Mint: Dubai Good Delivery / LBMA Refiner",
      "Packaging: Protective polymer seal",
      "Certificate/Serial: Individual serial stamp",
      "Stock Status: In stock",
      "Dispatch Expectation: 24–48 hours insured dispatch",
      "Buy-back Eligibility: Guaranteed buy-back eligible"
    ]
  },
  {
    id: 18,
    slug: "silver-1oz-dubai-coin",
    title: "1 oz Silver Dubai Coin",
    image: "/uploads/products/Silver coins.avif",
    price: 36,
    regularPrice: 36,
    priceDisplay: "AED 36",
    category: "coins",
    badge: "In stock",
    packSize: "1 oz",
    rating: 4.8,
    reviewCount: 27,
    inStock: true,
    description: "1 oz Dubai commemorative silver coin struck in 999.0 pure silver, honoring Dubai architectural heritage.",
    features: [
      "Category: Coins",
      "Metal: Silver",
      "Fineness: 999.0",
      "Gross Weight: 31.1035 g",
      "Fine Weight: 1 oz",
      "Dimensions: 38.6 mm diameter [PENDING CLIENT]",
      "Refiner/Mint: Montague Cole Dubai Signature Release",
      "Packaging: Acrylic capsule",
      "Certificate/Serial: Certificate of authenticity",
      "Stock Status: In stock",
      "Dispatch Expectation: 24–48 hours insured dispatch",
      "Buy-back Eligibility: Guaranteed buy-back eligible"
    ]
  },
  {
    id: 19,
    slug: "dubai-skyline-bar",
    title: "100 g Gold Dubai Skyline Bar",
    image: "/uploads/products/Burj Khalifa-inspired bars.webp",
    price: 7750,
    regularPrice: 7750,
    priceDisplay: "AED 7,750",
    category: "dubai-collection",
    badge: "Pre-order",
    packSize: "100 g",
    rating: 4.9,
    reviewCount: 8,
    inStock: true,
    description: "Limited commemorative minted bar depicting the Dubai Skyline in frosted relief against mirror fields.",
    features: [
      "Category: Dubai Collection (Prototype / Pre-order)",
      "Metal: Gold",
      "Fineness: 999.9",
      "Gross Weight: 100 g",
      "Fine Weight: 100 g",
      "Dimensions: [PENDING CLIENT: Skyline Relief Dimension]",
      "Refiner/Mint: Montague Cole Dubai Signature Release",
      "Packaging: Handcrafted lacquered timber box",
      "Certificate/Serial: Commemorative numbered assay card",
      "Stock Status: Prototype / Pre-order",
      "Dispatch Expectation: Priority pre-order dispatch window",
      "Buy-back Eligibility: Guaranteed buy-back eligible"
    ]
  },
  {
    id: 20,
    slug: "dubai-palm-bar",
    title: "50 g Gold Dubai Palm Bar",
    image: "/uploads/products/Burj Khalifa-inspired bars.webp",
    price: 3995,
    regularPrice: 3995,
    priceDisplay: "AED 3,995",
    category: "dubai-collection",
    badge: "Pre-order",
    packSize: "50 g",
    rating: 4.9,
    reviewCount: 7,
    inStock: true,
    description: "Intricately minted 50 g gold bar inspired by the Palm Jumeirah coastline geometry.",
    features: [
      "Category: Dubai Collection (Prototype / Pre-order)",
      "Metal: Gold",
      "Fineness: 999.9",
      "Gross Weight: 50 g",
      "Fine Weight: 50 g",
      "Dimensions: [PENDING CLIENT]",
      "Refiner/Mint: Montague Cole Dubai Signature Release",
      "Packaging: Premium presentation case",
      "Certificate/Serial: Numbered certificate of authenticity",
      "Stock Status: Prototype / Pre-order",
      "Dispatch Expectation: Priority pre-order dispatch window",
      "Buy-back Eligibility: Guaranteed buy-back eligible"
    ]
  },
  {
    id: 21,
    slug: "private-assets-diamonds",
    title: "Investment Diamonds & Gemstones",
    image: "/uploads/products/product-8.png",
    price: 0,
    regularPrice: 0,
    priceDisplay: "Price on Request",
    category: "private-assets",
    badge: "Enquiry Only",
    packSize: "Private Allocation",
    rating: 5.0,
    reviewCount: 6,
    inStock: true,
    description: "GIA-certified natural diamonds and rare colored gemstones for private treasury diversification. Private consultation only — automated online checkout disabled.",
    features: [
      "Category: Private Assets (Montague Cole Private Assets, Dubai)",
      "Classification: Investment Grade Diamonds & Colored Gemstones",
      "Certification: GIA / Gübelin / SSEF certified [PENDING CLIENT: grading lab]",
      "Purchase Terms: ENQUIRY ONLY · No online card checkout",
      "Custody Options: Allocated bonded depository in Dubai Free Zone or international armored delivery",
      "Settlement: Direct private client broker consultation"
    ]
  },
  {
    id: 22,
    slug: "private-assets-horology",
    title: "High Horology & Rare Timepieces",
    image: "/uploads/products/product-2.png",
    price: 0,
    regularPrice: 0,
    priceDisplay: "Price on Request",
    category: "private-assets",
    badge: "Enquiry Only",
    packSize: "Private Allocation",
    rating: 5.0,
    reviewCount: 8,
    inStock: true,
    description: "Curated portfolio-grade haute horlogerie acquisitions. Fully authenticated provenance. Private consultation only — automated online checkout disabled.",
    features: [
      "Category: Private Assets (Montague Cole Private Assets, Dubai)",
      "Classification: Independent & Heritage High Horology",
      "Provenance: Verified archives & manufacturer extract",
      "Purchase Terms: ENQUIRY ONLY · No online card checkout",
      "Custody Options: Insured vault storage or personal broker handover in Dubai",
      "Settlement: Direct private client broker consultation"
    ]
  }
];

export function getProductById(id: number): Product | undefined {
  return PRODUCTS.find(p => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find(p => p.slug === slug);
}

export function getProductOriginalPrice(product: Product): number | undefined {
  if (product.oldPrice && product.oldPrice > product.price) return product.oldPrice;
  const discount = product.badge.match(/(\d+)%/);
  return discount ? Math.round(product.price / (1 - Number(discount[1]) / 100)) : undefined;
}

export function makeSlug(title: string, id: number): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
    .replace(/-$/, '') + '-' + id;
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return PRODUCTS.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q)
  );
}
