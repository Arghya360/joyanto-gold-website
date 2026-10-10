# Montague Cole Bullion — Implementation Plan

## Phase 0: Audit and approval gate

This document records the audited state of the existing project and sets expectations for the build-out.

### Completed in this step
- Reviewed the project architecture and page structure
- Identified the current routing model and existing storefront components
- Confirmed the project is not yet using React Router and does not yet include the 7 required pages
- Wrote the audit summary in `docs/AUDIT.md`

### Planned next step after approval
- Build the routing and shared foundation without changing the current design language
- Add mock service layer and shared content files
- Begin the actual pages in the required order:
  1. Live Prices
  2. Catalogue
  3. Storage
  4. Sell to Us
  5. Contact
  6. About
  7. MC Reserve

## Foundation requirements

### Route setup
- Add the required navbar items in order:
  - Live Prices
  - Catalogue
  - Storage
  - MC Reserve
  - Sell to Us
  - About
  - Contact
- Add matching route paths under the current SPA navigation model
- Keep existing navbar items and elements unless a new item is genuinely missing
- Ensure active state and mobile navigation stay consistent with current patterns

### Shared infrastructure
- Create `src/services/` with typed mock implementations for:
  - `pricesService`
  - `catalogueService`
  - `storageService`
  - `authService`
  - `reserveService`
  - `sellQuoteService`
  - `contactService`
  - `appointmentService`
- Create `src/content/*.ts` files for page copy so content is not hard-coded in JSX/HTML strings
- Add `docs/PLACEHOLDERS.md` with every client/legal/insurance/licensing placeholder requirement from the brief
- Keep all unverified business facts behind placeholder labels

### UX consistency
- Reuse the existing design language and page tokens rather than introducing a new visual system
- Preserve the current storefront patterns in headers, drawers, cards, CTA patterns, and footer layout
- Treat this as a luxury-goods extension rather than a redesign of the whole site

## Page build order

### 1) Live Prices
- Add page header, metal cards, chart, converter, health indicator, formula section, disclaimer, CTA row
- Implement mock live-feed polling with staleness handling and fail mode
- Ensure stale/indicative pricing disables buy states

### 2) Catalogue
- Add category tabs, filter sidebar/sheet, sorting, grid/list mode, compare drawer, and product detail view
- Add pricing and premium-breakdown logic in `src/lib/pricing.ts`
- Add cart/checkout extension if needed

### 3) Storage
- Create storage options comparison, estimator, FAQ, and enquiry form
- Include placeholder disclaimer wording for legal/fee terms

### 4) Sell to Us
- Create quote wizard, calculator, booking flow, and review/confirmation states
- Keep all payout language appropriately non-committal

### 5) Contact
- Add contact cards, contact form, private appointment booking, map placeholder, and complaint guidance

### 6) About
- Add story/proposition/brand family/standards/private assets/team placeholders and compliance block

### 7) MC Reserve
- Add logged-out auth screen and logged-in dashboard
- Add protected route handling, order/documents/owned assets/service requests/account settings
- Add demo account and access controls

## Verification gates

After each page or major milestone:
- run build
- run type-check or compile validation
- run tests where logic-heavy work is added
- review for no unexpected global style drift
- confirm all required placeholders are documented

## Implementation status

The user approved proceeding by requesting that the pages be built. The seven routes and shared navigation are now implemented in the existing TypeScript/Vite SPA (the repository is not a React application). The work uses scoped styles and does not replace the legacy storefront architecture.

- Implemented routes: Live Prices, Catalogue, product detail, Storage, MC Reserve demo, Sell to Us, About, Contact, and not-found.
- Implemented shared navigation, indicative-price ticker, currency persistence, product filtering/compare, price conversion, storage enquiry, quote-request wizard, contact/appointment forms, and demo MC Reserve sign-in.
- Added pure pricing and staleness helpers plus placeholder and assumption registers.
- Frontend-only interactions are demonstrations. Real prices, business details, production authentication, appointments, uploads, enquiry transmission, payment, insurance, custody, and legal terms remain unimplemented or pending confirmation.
- Verification: `npm run build` and `git diff --check`.

## Approval gate (completed)

The user requested implementation after the audit, so the approval gate is complete. Continue only with any additional requested refinements.
