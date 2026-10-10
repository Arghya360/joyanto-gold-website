# CONTENT MAP � Montague Cole Bullion Migration
**Audit date:** 2026-10-06
**Auditor:** Senior Front-End Engineer (content-only migration)
**Status:** STEP 1 COMPLETE � read-only audit, no edits beyond previous session commits

---

## 1. Project Structure

```
joyto da website/
+-- index.html                    <- SEO title, meta, OG tags
+-- public/
�   +-- logo.png                  <- Brand logo
�   +-- favicon.svg               <- Favicon
�   +-- icons.svg                 <- Sprite icons
�   +-- uploads/
�       +-- products/             <- Product images (see �6)
�       +-- assets/               <- Banner, blog, category, avatar images
+-- src/
�   +-- style.css                 <- LOCKED � design only, zero content edits
�   +-- main.ts                   <- Routing, UI strings, localStorage keys
�   +-- data/
�   �   +-- products.ts           <- Master product catalog (TypeScript, ACTIVE)
�   �   +-- products.json         <- LEGACY JSON � still contains all 16 old food items
�   �   +-- categories.ts         <- Navigation + filter sidebar categories
�   �   +-- blogs.ts              <- Market insight blog posts
�   �   +-- reviews.ts            <- Client testimonials
�   +-- components/
�   �   +-- Header.ts             <- Logo alt, search placeholder, nav labels
�   �   +-- Footer.ts             <- Brand copy, link columns, currency selector
�   �   +-- HomePage.ts           <- Hero slides, category cards, products grid, blogs, reviews
�   �   +-- FilterSidebar.ts      <- Filter labels (Weight/Denomination, Price AED)
�   �   +-- ProductCard.ts        <- Currency display
�   �   +-- ProductDetailsPage.ts <- Product spec labels, AED display
�   �   +-- CartPage.ts           <- Cart labels, delivery zone labels
�   �   +-- CheckoutPage.ts       <- Checkout labels, delivery zones
�   �   +-- OffersPage.ts         <- Page title, product selection
�   �   +-- NewArrivalsPage.ts    <- Page title, product selection
�   �   +-- LoginPage.ts          <- MC Reserve portal copy
�   �   +-- WishlistPage.ts       <- Saved allocations labels (not fully audited)
�   �   +-- PageBanner.ts         <- Generic banner component
�   +-- store/
�       +-- cart.ts               <- localStorage key 'falaqfood_cart_v1' (OLD BRAND)
�                                    DeliveryZone type: 'inside_dhaka' | 'outside_dhaka'
+-- docs/
    +-- CONTENT_MAP.md            <- This file
    +-- CONTENT_ISSUES.md         <- Issues log
    +-- MIGRATION_REPORT.md       <- Change summary
```

---

## 2. SEO / HTML Head � index.html

| Element | Current Value | Status |
|---|---|---|
| lang | en | DONE |
| title | Montague Cole Bullion or Dubai Bullion. Global Delivery | DONE |
| meta description | Certified gold and silver, Dubai Collection, MC Reserve | DONE |
| og:title | Montague Cole Bullion or A Higher Standard | DONE |
| og:description | Dubai bullion. Global delivery... | DONE |
| og:image | Not set | PENDING CLIENT: OG image asset |
| favicon | /logo.png | DONE � using brand logo |
| Google Fonts | Poppins, Hind Siliguri, Noto Sans | LOCKED � design |

---

## 3. Header Second Navigation Bar

Source: src/data/categories.ts -> NAV_CATEGORIES
Rendered by: src/components/Header.ts

| ID | Label | Status |
|---|---|---|
| prices | Live Prices | DONE |
| catalog | Catalogue | DONE |
| storage | Storage | DONE |
| mc-reserve | MC Reserve | DONE |
| sell | Sell to Us | DONE |
| about | About | DONE |
| contact | Contact | DONE |

NOTE: These 7 IDs route to the shop filtered by category ID. No dedicated /prices, /storage pages exist. Logged in CONTENT_ISSUES.md.

---

## 4. Top Navigation Bar � src/components/Header.ts

| Element | Current Value | Status |
|---|---|---|
| Logo alt | Montague Cole Bullion | DONE |
| Search placeholder | Search gold, silver, coins... | DONE |
| Desktop nav links | Home, Shop, Offers, New Arrivals | WARNING: "Offers" and "New Arrivals" are original site page names |
| Mobile drawer links | Home, Catalogue, Allocations, New Releases, MC Reserve Sign-In, Vault Order & Cart, Saved Allocations | DONE |
| Mobile drawer logo alt | Montague Cole Bullion | DONE |

---

## 5. Product Data � src/data/products.ts

21 products total. All old food items removed. Current catalog:

### Featured / Recent Products (IDs 1-8, shown on homepage grid)

| ID | Slug | Title | Category | Price | Badge | Image |
|---|---|---|---|---|---|---|
| 1 | gold-1oz-vault-bar | 1 oz Gold Vault Bar | bars | AED 2,364 | In stock | gold.avif |
| 2 | silver-britannia-coin | 1 oz Silver Britannia Coin | coins | AED 34 | 11% off | Silver coins.avif |
| 3 | dubai-burj-bar | 50 g Gold Dubai Burj Bar | dubai-collection | AED 3,980 | Awaiting delivery | Burj Khalifa-inspired bars.webp |
| 4 | gold-coin-collection | 1/4 oz Gold Dubai Collection Coin | coins | AED 790 | In stock | gold coin.avif |
| 5 | gold-investment-bar | 100 g Gold Investment Bar | bars | AED 7,590 | In stock | gold ber.avif |
| 6 | silver-investment-bar | 1 kg Silver Investment Bar | bars | AED 1,095 | In stock | Silver bars.avif |
| 7 | gold-bullion-coin | 1 oz Gold Bullion Coin | coins | AED 2,395 | Limited | gold coin.avif |
| 8 | dubai-burj-coin | 1/4 oz Gold Burj Khalifa Coin | dubai-collection | AED 825 | Limited | Burj Khalifa-inspired coins.webp |

### Gold Bars (IDs 9-13)

| ID | Slug | Title | Weight | Price |
|---|---|---|---|---|
| 9 | gold-1g-bar | 1 g Gold Bar | 1 g | AED 88 |
| 10 | gold-5g-bar | 5 g Gold Bar | 5 g | AED 412 |
| 11 | gold-10g-bar | 10 g Gold Bar | 10 g | AED 810 |
| 12 | gold-20g-bar | 20 g Gold Bar | 20 g | AED 1,590 |
| 13 | gold-1kg-bar | 1 kg Gold Bar | 1 kg | AED 74,500 |

MISSING FROM SPEC: Client brief requests a 50 g Gold Bar. Currently 50 g only exists as Dubai Collection. A standalone gold-50g-bar should be added. Requires client approval. See CONTENT_ISSUES.md.

### Coins (IDs 14, 18)

| ID | Slug | Title | Metal | Weight | Price |
|---|---|---|---|---|---|
| 14 | gold-1oz-dubai-coin | 1 oz Gold Dubai Coin | Gold | 1 oz | AED 2,410 |
| 18 | silver-1oz-dubai-coin | 1 oz Silver Dubai Coin | Silver | 1 oz | AED 36 |

PENDING: Internationally recognised gold coin slot and silver coin slot � [PENDING CLIENT: brand selection]

### Silver Bars (IDs 15-17, 6)

| ID | Slug | Title | Weight | Price |
|---|---|---|---|---|
| 15 | silver-100g-bar | 100 g Silver Bar | 100 g | AED 118 |
| 16 | silver-250g-bar | 250 g Silver Bar | 250 g | AED 285 |
| 17 | silver-500g-bar | 500 g Silver Bar | 500 g | AED 560 |
| 6 | silver-investment-bar | 1 kg Silver Investment Bar | 1 kg | AED 1,095 |

### Dubai Collection (IDs 3, 8, 19, 20)

| ID | Slug | Title | Weight | Price | Badge |
|---|---|---|---|---|---|
| 3 | dubai-burj-bar | 50 g Gold Dubai Burj Bar | 50 g | AED 3,980 | Awaiting delivery |
| 8 | dubai-burj-coin | 1/4 oz Gold Burj Khalifa Coin | 1/4 oz | AED 825 | Limited |
| 19 | dubai-skyline-bar | 100 g Gold Dubai Skyline Bar | 100 g | AED 7,750 | Pre-order |
| 20 | dubai-palm-bar | 50 g Gold Dubai Palm Bar | 50 g | AED 3,995 | Pre-order |

MISSING FROM SPEC: Palm-inspired coins, gift range (presentation boxes, certificates, commemorative pieces). Logged in CONTENT_ISSUES.md.

### Pending Data on All Products

Every product has these [PENDING CLIENT] placeholders in its features[] array:
- Exact physical dimensions
- Confirmed refiner/mint name (where not yet assigned)
- Real fineness values (editable defaults: 999.9 gold, 999.0 silver)
- Pricing uses indicative premiums only � no live pricing engine built

---

## 6. Product Images � public/uploads/products/

### Client-Provided Bullion Images (copied from src/assets/product picture/)

| File | Used By Product IDs |
|---|---|
| gold.avif | 1, 10, 12 |
| gold ber.avif | 5, 9, 11, 13 |
| gold coin.avif | 4, 7, 14 |
| Silver bars.avif | 6, 15, 16, 17 |
| Silver coins.avif | 2, 18 |
| Burj Khalifa-inspired bars.webp | 3, 19, 20 |
| Burj Khalifa-inspired coins.webp | 8 |

### Legacy Food Images (Present but Not Referenced)

product-1.png through product-16.png, product-khejurer-gur.jpg
These old food images are no longer referenced by any active product in products.ts. Safe to delete after client sign-off.

---

## 7. Category Data � src/data/categories.ts

CATEGORIES[] is used by FilterSidebar and the homepage carousel.

| ID | Name | nameBn field | Image Slot |
|---|---|---|---|
| prices | Live Prices | Bengali text (legacy) | Old product image |
| catalog | Catalogue | Bengali text (legacy) | Old asset image |
| storage | Storage | Bengali text (legacy) | Old asset image |
| mc-reserve | MC Reserve | Bengali text (legacy) | Old product image |
| sell | Sell to Us | Bengali text (legacy) | Old product image |
| about | About | Bengali text (legacy) | Old asset image |
| contact | Contact | Bengali text (legacy) | Old asset image |
| gold-bars | Gold Bars | Bengali text (legacy) | Old asset image |
| silver-bars | Silver Bars | Bengali text (legacy) | Old asset image |
| coins | Coins | Bengali text (legacy) | Old asset image |

Issues:
- nameBn field contains Bengali legacy text � not visible in current UI but should be cleared or updated
- Image slots reference old food category images (cat-honey.png, cat-dal.png, etc.)
- dubai-collection and private-assets categories exist in products.ts but NOT in CATEGORIES[], so they do not appear in the filter sidebar
All logged in CONTENT_ISSUES.md.

---

## 8. Blog Data � src/data/blogs.ts

3 posts, all updated:

| ID | Title | Category | Author |
|---|---|---|---|
| 1 | Understanding Bullion Fineness and the Dubai Good Delivery Standard | Bullion Advisory | Montague Cole Bullion Research |
| 2 | Allocated Vault Custody vs Insured Global Delivery | Custody & Vaulting | Depository Custody Team |
| 3 | The Pricing Architecture of Physical Precious Metals | Market Standards | Trading & Execution Desk |

Blog image slots (blog-1.webp, blog-2.avif, blog-3.jpg) still reference placeholder paths. [PENDING CLIENT: real blog imagery]

---

## 9. Reviews � src/data/reviews.ts

5 testimonials, all updated to bullion/depository client voice. No financial return promises.
Names and roles are fictional placeholders. [PENDING CLIENT: real testimonials or approval to use fictional ones]

---

## 10. Homepage � src/components/HomePage.ts

| Section | Current State | Status |
|---|---|---|
| Hero slides (4) | MC Bullion titles, placeholder banner images | Titles done; images are placeholders |
| Side promos (2) | Alt text updated | DONE |
| Category carousel | 12 categories, old food thumbnail images | WARNING: category images need replacing |
| Recent Products grid | 8 bullion products (IDs 1-8) | DONE |
| Shop All Products button | Present | DONE |
| Blog section heading | Market Insights & Depository Notes | DONE |
| Reviews section heading | Client Experiences & Allocations | DONE |
| Bottom promo banners (4) | Alt text updated to bullion copy | DONE |

---

## 11. Footer � src/components/Footer.ts

| Element | Current Value | Status |
|---|---|---|
| Logo alt | Montague Cole Bullion | DONE |
| Heading | DUBAI BULLION / GLOBAL DELIVERY | DONE |
| Newsletter toast | Depository dispatches copy | DONE |
| Column 1 BULLION | All Bullion, Gold Bars, Silver Bars, Sovereign Coins, Dubai Collection, Live Prices, Sell to Us | DONE |
| Column 2 SERVICES | About, MC Reserve, Allocated Storage, Private Assets, Depository Standards, Insured Transit, Private Consultation | DONE |
| Column 3 LEGAL AND TRUST | All 8 items marked [PENDING LEGAL REVIEW] | DONE |
| Currency selector | AED default, USD, GBP, EUR | DONE |
| Copyright | 2026 Montague Cole Bullion. All rights reserved. | DONE |
| Social links | Placeholder hrefs (instagram.com etc.) | PENDING CLIENT: real social URLs |
| App badges | Placeholder hrefs (#) | PENDING CLIENT: app store URLs, or remove if no app |
| Developer credit | Arghya Biswas | PENDING CLIENT: retain or remove? |

---

## 12. Cart and Checkout

| Element | Current Value | Status |
|---|---|---|
| Currency | AED throughout | DONE |
| Summary labels | Metal Value Subtotal, Order Valuation, Total Invoice | DONE |
| Delivery labels | UAE Domestic / Depository AED 70; International Insured Freight AED 130 | DONE |
| Delivery zone TypeScript type | 'inside_dhaka' or 'outside_dhaka' | WARNING: internal identifier only, not user-visible |
| Pricing note | Sell Price = Live Metal Value + Product Premium + Delivery + Insurance + Applicable Taxes | DONE |
| Privacy note | [PENDING LEGAL REVIEW] | DONE |
| Settlement method | Bank Wire / Secure Custodial Handover | DONE |

---

## 13. Cart Drawer and Modals � src/main.ts

| Element | Current Value | Status |
|---|---|---|
| Cart drawer heading | Shopping Cart | DONE (generic) |
| Empty cart message | No products in the cart. | DONE |
| Side-cart subtotal label | Metal Value Subtotal: | DONE |
| View cart button | View Allocation Cart | DONE |
| Checkout modal title | Direct Order & Allocation Settlement | DONE |
| Transit tier labels | UAE Domestic / Vault AED 70, International Insured AED 130 | DONE |
| Confirm order button | Confirm Allocation Order | DONE |
| Newsletter toast | Thank you for subscribing to depository dispatches. | DONE |

---

## 14. Other Pages

| Page | File | Status |
|---|---|---|
| Login / MC Reserve Portal | LoginPage.ts | DONE |
| Offers | OffersPage.ts | DONE � Special Allocations & Sovereign Coins |
| New Arrivals | NewArrivalsPage.ts | DONE � New Releases & Minted Bullion |
| Wishlist | WishlistPage.ts | Not fully audited � check for food-niche labels |
| Product Details | ProductDetailsPage.ts | DONE � spec labels updated to bullion terminology |

---

## 15. localStorage Keys

| Key | Current Value | Issue |
|---|---|---|
| Cart persistence | falaqfood_cart_v1 | OLD BRAND NAME � in cart.ts and main.ts |
| Wishlist persistence | falaqfood_wishlist_v1 | OLD BRAND NAME � in main.ts (9 occurrences) |
| Delivery zone type | inside_dhaka or outside_dhaka | Internal only, not user-visible |

Decision required: Renaming localStorage keys clears existing carts/wishlists on first load. Acceptable for pre-launch. Requires your approval before editing. See CONTENT_ISSUES.md.

---

## 16. Legacy Data File � src/data/products.json

STILL CONTAINS ALL 16 ORIGINAL FOOD PRODUCTS with Bengali text, food categories, and BDT prices.
This file is NOT imported anywhere in the current build (products.ts is the active source).
However it is misleading and should be cleared. See CONTENT_ISSUES.md.

---

## 17. Old Categories Removed from products.ts

honey, nuts-fruits, cooking-oil, dal-pulses, flour-atta, spices-masala, rice, sweeteners, superfoods, organic-foods
All product names contained Bengali characters.
Prices were in Bangladeshi Taka (95-690 BDT).
Old images: product-1.png through product-16.png.
None of these appear in the live render.

---

## 18. Files With Zero Content (Not Edited)

- src/style.css � design CSS only, LOCKED
- tsconfig.json, package.json, package-lock.json
- src/counter.ts � utility only
- All component event handler and routing logic
- src/store/cart.ts logic (storage key name is the only content item, flagged above)

---

## 19. Pending Items from Client

| # | Item | Location |
|---|---|---|
| 1 | Real sell prices | All 21 products in products.ts |
| 2 | Confirmed fineness values | All product features[] |
| 3 | Physical bar/coin dimensions | All product features[] |
| 4 | Confirmed refiner/mint names | All product features[] |
| 5 | Coin brand selection internationally recognised | Products 2 and 7 |
| 6 | Real contact address Dubai | Footer Dubai Depository Address link |
| 7 | Real social media URLs | Footer social icons |
| 8 | App Store / Google Play URLs or confirm no app | Footer app badges |
| 9 | Terms of Sale | Footer col 3 |
| 10 | Privacy Policy | Footer and checkout |
| 11 | Returns & Cancellation terms | Footer |
| 12 | Complaints Procedure | Footer |
| 13 | Cookie Policy | Footer |
| 14 | Price-Lock Terms | Footer |
| 15 | Regulatory Disclosures | Footer |
| 16 | OG image asset | index.html |
| 17 | Real client testimonials or approval to use fictional ones | reviews.ts |
| 18 | Blog images | public/uploads/assets/ |
| 19 | 50 g standalone Gold Bar (missing from spec) | products.ts |
| 20 | Dubai Collection gift range and Palm coin | products.ts |
| 21 | Retain or remove developer credit in footer | Footer.ts |

---

## 20. Build Verification

- npm run build (tsc + vite build): PASSES � 0 errors, 0 warnings
- Build output: dist/index.html 1.44 kB, CSS 68.50 kB, JS 137.48 kB
- Dev server: Running on http://localhost:5173/
- No CSS, Tailwind class, component structure, or config file changed

---

End of audit. Awaiting approval before proceeding to Steps 2 onwards.
