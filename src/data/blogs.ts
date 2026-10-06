export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  image: string;
  author: string;
  category: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    title: "Understanding Bullion Fineness and the Dubai Good Delivery Standard",
    excerpt: "Physical precious metals represent timeless wealth preservation. Understanding refiner accreditation, assay fineness and serialised verification ensures complete allocation integrity.",
    content: `Physical precious metals represent timeless capital preservation. When allocating into investment-grade gold or silver, verifying mint accreditation and certified assay standards is paramount.

1. Assay Fineness: Investment-grade gold is minted to 999.9 parts per thousand (24 karat), while institutional silver bars trade at 999.0 purity. Every bar in our inventory carries assayer certification guaranteeing its elemental purity.

2. Dubai Good Delivery (DGD): Initiated by the Dubai Multi Commodities Centre (DMCC), the Dubai Good Delivery standard mirrors the international LBMA framework, providing global benchmark quality, verifiable ethical sourcing, and international liquidity.

3. Chain of Custody: From initial refinery melt to sealed CertiCard or armored depository intake, serialised identification ensures that your metal remains verifiably uncompromised throughout its lifecycle.

Montague Cole Bullion maintains direct supply relationships with accredited international and regional refineries, ensuring guaranteed provenance on every delivery.`,
    date: "October 02, 2026",
    image: "/uploads/assets/blog-1.webp",
    author: "Montague Cole Bullion Research",
    category: "Bullion Advisory"
  },
  {
    id: 2,
    title: "Allocated Vault Custody vs Insured Global Delivery",
    excerpt: "A structured assessment of holding physical bullion in allocated Dubai depository custody versus private physical possession via insured courier dispatch.",
    content: `When acquiring substantial physical gold or silver holdings, private clients evaluate the operational balance between direct possession and institutional vault custody.

1. Allocated and Segregated Depository: Under allocated custody inside our Dubai Free Zone facilities, physical bars remain your unencumbered legal property. Each piece is recorded by unique serial number and kept segregated from institutional balance sheets.

2. Global Insured Transport: For clients preferring private domestic custody, deliveries are executed via specialised armoured courier with comprehensive transit insurance. Shipments remain fully insured until personal signature confirmation.

3. Complete Liquidity & Buy-Back: Holders of Montague Cole certified bullion benefit from our transparent buy-back framework. Custodial assets can be liquidated directly upon quote confirmation, while physical returns undergo laboratory assay and settlement.

Clients may arrange private advisory appointments with our Dubai specialists to structure custody suited to their jurisdiction and family governance framework.`,
    date: "September 24, 2026",
    image: "/uploads/assets/blog-2.avif",
    author: "Depository Custody Team",
    category: "Custody & Vaulting"
  },
  {
    id: 3,
    title: "The Pricing Architecture of Physical Precious Metals",
    excerpt: "A transparent overview of how live spot valuations, manufacturing premiums, delivery logistics, and insurance combine to form our clear client pricing.",
    content: `Montague Cole Bullion operates on a transparent, institutional pricing framework. Clear mechanics govern every trade without speculative promises or urgency gimmicks.

1. Live Spot Value: Physical bullion is anchored to the global spot metal market. As global interbank benchmark rates fluctuate, indicative catalogue values reflect prevailing metal value.

2. Product Premium: Minting and fabrication require precise metallurgical engineering. Premiums cover accredited refining, stamping, assay certification, and tamper-resistant security packaging.

3. Delivery & Insurance: Physical bullion freight requires specialised transport logistics and underwriters. Every shipment includes comprehensive transit cover until signed handover.

Final invoice calculation formula: Sell Price = Live Metal Value + Product Premium + Delivery + Insurance + Applicable Taxes. We never promise returns or future appreciation; we deliver verified physical ownership.`,
    date: "September 15, 2026",
    image: "/uploads/assets/blog-3.jpg",
    author: "Trading & Execution Desk",
    category: "Market Standards"
  }
];
