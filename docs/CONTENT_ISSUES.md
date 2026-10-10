# Content Issues & Architecture Gaps — Montague Cole Bullion

**Client:** Montague Cole Bullion (Montague Cole Private Assets, Dubai, UAE)  
**Date:** October 6, 2026  
**Status:** Under Client & Engineering Review (Prior to Step 3 Replacement)

This document tracks all content mismatches, design-constraint limitations, and missing client data discovered during Step 1 (Audit) and Step 2 (Mapping), in strict accordance with the project's **Absolute Rules**.

---

## 1. Static Pricing vs. Live Metal Pricing Engine
- **Current Codebase State:** The existing e-commerce codebase uses static numbers (`price: number`, `regularPrice: number`, `priceDisplay: string`) and arithmetic calculated in local state.
- **Client Requirement:** Pricing rule: *sell price = live metal value + product premium + delivery + insurance + applicable taxes*. Never hardcode prices. Never promise returns or future value.
- **Resolution / Flag:** Per Rule 6 and the brief instructions, static prices cannot be converted into a real-time live API feed without adding new dependencies or refactoring core store architecture. Obvious placeholder prices (e.g., benchmark indicative rates `[INDICATIVE: $XXXX]` / obvious round figures) will be loaded, and every product description clearly states the client's mandatory pricing formula:
  > *"Indicative catalogue price only. Final invoice price is calculated at checkout based on: live metal value + product premium + delivery + insurance + applicable taxes."*

---

## 2. Currency Display & Component Hardcoding
- **Current Codebase State:** Several presentation templates (`CartPage.ts`, `CheckoutPage.ts`, `ProductDetailsPage.ts`, `main.ts`) have the Bangladeshi Taka symbol (`৳`) hardcoded directly inside template strings (e.g. `${product.price}৳`, `70৳`, `130৳`).
- **Client Requirement:** Client is a premium Dubai bullion house operating in USD ($) / AED (د.إ).
- **Resolution / Flag:** Absolute Rule 1 prohibits changing CSS, markup, or component structure, but allows replacing text inside template strings where content lives. Where currency symbols are embedded in user-facing text strings, they will be migrated to `$` (or AED equivalent where applicable), and delivery fees adapted to international courier tiers (e.g., UAE Domestic Vault Delivery / Insured Global Express).

---

## 3. Navigation Structure & Routes vs. Target Information Architecture
- **Current Codebase State:** The site has fixed routing handled via `main.ts` with exact paths:
  - `/` (Home)
  - `/shop` (Shop / Catalog with Filter Sidebar)
  - `/offers` (Offers)
  - `/new-arrivals` (New Arrivals)
  - `/login` (Customer Login)
  - `/cart` (Shopping Cart)
  - `/checkout` (Checkout)
  - `/wishlist` (Wishlist)
  - `/product/:slug` (Product Detail)
- **Client Target IA:**
  - Navigation: `Gold`, `Silver`, `Coins`, `Dubai Collection`, `Live Prices`, `Sell to Us`, `Storage`, `Private Assets`, `MC Reserve`.
- **Constraint:** Rule 2 prohibits adding, removing, or refactoring routes, hooks, or components.
- **Resolution:**
  - Primary category navigation (`NAV_CATEGORIES` and `CATEGORIES` in `src/data/categories.ts`, which is a pure data source) will map directly to the client's nine core divisions:
    1. `gold` (Gold Bars)
    2. `silver` (Silver Bars)
    3. `coins` (Gold & Silver Coins)
    4. `dubai-collection` (Dubai Collection)
    5. `live-prices` (Live Prices & Market Rates)
    6. `sell-to-us` (Sell to Us / Gold Depot)
    7. `storage` (Allocated Vault Storage)
    8. `private-assets` (Private Assets: High Jewellery, Watches, Art)
    9. `mc-reserve` (MC Reserve Private Client Portal)
  - Top header desktop links will map to high-level sections (`Home`, `Bullion Vault (Shop)`, `Market Allocations (Offers)`, `New Releases (New Arrivals)`), preserving layout and route handlers while accurately reflecting client branding.
  - The login view `/login` maps to the **MC Reserve Private Client Login**.

---

## 4. Private Assets: "Enquiry Only" with No Checkout
- **Current Codebase State:** All items rendered through `ProductCard.ts` and `ProductDetailsPage.ts` include an "Add to Cart" button.
- **Client Requirement:** *Private Assets: diamonds and gemstones, luxury watches, jewellery and bespoke, fine art, antiques and collectibles are ENQUIRY ONLY. They get no checkout and no fixed prices.*
- **Constraint:** Rule 1 & Rule 2 prevent altering component markup or conditionally hiding buttons via component structural refactoring.
- **Resolution:**
  - For Private Assets items, prices will be marked as `Price on Request [ENQUIRY ONLY]`.
  - Feature lists and descriptions will prominently state:
    > *"Private Asset Consultation Only. Direct purchase and automated checkout are disabled for this allocation. Inquire through MC Reserve private consultation."*
  - If added to cart, the checkout notes and terms state that private asset lines trigger a confidential broker callback rather than a standard card transaction.

---

## 5. Sell to Us (Gold Depot)
- **Current Codebase State:** No custom multi-step bullion buy-back assessment form exists; the existing site provides an e-commerce order checkout flow.
- **Client Requirement:** *Sell to Us: quote request only. No instant payout promises. Settlement happens after inspection or testing.*
- **Resolution:**
  - Content on the site (informational banners, blog articles, and catalog copy) clearly reinforces the required policy:
    > *"All buy-back transactions are indicative quote requests only. No instant payouts. Definitive settlement is executed strictly following laboratory assay, verification, and inspection at our Dubai depository."*

---

## 6. Legal Pages (Terms, Privacy, Cookies, Price-Lock, Complaints)
- **Current Codebase State:** No separate legal route pages exist in the application. Links in the footer (`Privacy Policy`, `Terms of Service`, etc.) currently route to `#`.
- **Client Requirement:** Terms, privacy, cookies, returns and cancellation, price-lock conditions, complaints — use existing structure with `[PENDING LEGAL REVIEW]` placeholders.
- **Resolution:**
  - In `Footer.ts` and modal disclosures, legal links and policy references are updated with compliant titles, and any expanded legal blurbs carry explicit `[PENDING LEGAL REVIEW]` tags.

---

## 7. Missing Client Details (`[PENDING CLIENT]` Placeholders)
The following specific data points are missing from client-supplied assets and will be safely preserved as `[PENDING CLIENT]` without inventing facts (per Rule 7):
1. **Coin Brand Selection:** Specific international mint brands for non-Dubai gold/silver coins (e.g. Britannia, Maple Leaf, Philharmonic) marked as `[PENDING CLIENT: brand selection]`.
2. **Dubai Collection Specifications:** Specific dimensions, weights, and certificates for the commemorative Dubai Skyline and Palm pieces marked as `[PENDING CLIENT]`.
3. **Refiner / Mint accreditations:** Marked as `[PENDING CLIENT: Dubai Good Delivery / LBMA Refiner]`.
4. **Physical Depository Address:** Dubai Free Zone / DMCC registry details marked as `[PENDING CLIENT: DMCC Vault Address]`.
5. **Exact Delivery Insurance Policy Underwriter:** Marked as `[PENDING CLIENT: Lloyd's of London / Specie Underwriter]`.

---

## 8. Images and Media Placeholders
- **Current Codebase State:** The site uses existing images in `/uploads/` and `/uploads/assets/`.
- **Client Requirement:** Do not use real third-party brand photos. Keep the existing image slots and use the current placeholder images, marked as placeholders in the data.
- **Resolution:** Existing image asset paths will be retained in all product objects and banners, with updated descriptive bullion alt tags reflecting Montague Cole Bullion products.

## 9. Shop Filter Product Taxonomy and Availability
- **Current Codebase State:** The legacy `/shop` filter previously rendered service navigation labels as product categories with fixed counts. Its 23 products now have structured category, metal, type, weight/unit, fine-weight (where supplied), price-source and stock-status fields. The three existing Private Assets products use a temporary seventh filter category, approved to avoid misrepresenting diamonds and timepieces as gifts.
- **Category confirmation required:** Confirm whether Private Assets should remain a separate filter category or be excluded/reclassified when the launch taxonomy is finalized. No Gift Range products currently exist in the legacy shop data, so its calculated count is zero.
- **Availability confirmation required:** Dubai prototype items are marked Pre-order and Private Assets enquiry-only. Other bullion products use existing listing labels as provisional availability, not verified inventory. Confirm real stock status for each SKU before launch.
- **Data conflict corrected:** The 0.5 Carat Diamond previously displayed a fixed AED 3,922 indicative price despite the enquiry-only rule. It now displays Price on Request; exact stone specifications and pricing remain `[PENDING CLIENT]`.
- **Legacy assignments corrected:** The 1/4 oz Gold Dubai Collection Coin is classified under Dubai Collection; gold and silver bars/coins are separated by metal. No products were removed.

## 10. Shared Catalogue Product Data
- Home featured products, category counts, Offers pre-orders, New Arrivals selection, Catalogue search suggestions, and `/shop` now read from `src/features/modern-data.ts`.
- The Catalogue records still need client-confirmed fineness/purity, mint/refiner, product specifications and descriptions, verified stock status, and a sellable price source. Current `demoPrice` values are not displayed as prices and are not used for checkout.
- The shared catalogue contains no `isNew`-flagged products; New Arrivals therefore has no product cards until the client identifies actual new releases.
- Add-to-cart remains disabled for all products pending verified price and inventory data. Dubai Collection entries are displayed as Pre-order in accordance with the supplied availability rule.
