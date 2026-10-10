# Montague Cole Bullion — Audit

## 1. Project architecture

- Stack: Vite + TypeScript, plain DOM rendering, no React or React Router.
- Entry app: `src/main.ts`
- Routing is custom `window.history.pushState` navigation, not a router library.
- Pages are rendered as string templates inside functions like `renderHomePage()`, `renderOffersPage()`, etc.
- State is managed mostly in module-level variables and small storefront store logic (`src/store/cart.ts`).

## 2. Current SPA structure

### Core app shell
- `src/main.ts`
  - Owns the SPA page state (`home`, `shop`, `offers`, `new-arrivals`, `login`, `product`, `cart`, `checkout`, `wishlist`)
  - Handles navigation, popstate-like route changes, and the main render loop
  - Manages global UI state such as cart drawer, filter state, checkout draft, and home slideshow

### Global layout
- `src/components/Header.ts`
  - Header, nav links, search box, user/cart controls, mobile drawer, and category nav
  - Uses custom data attributes and DOM listeners instead of React components
  - Existing nav labels are generic storefront terms: Home, Shop, Offers, New Arrivals, Login, Cart, Wishlist
- `src/components/Footer.ts`
  - Footer rendering only; currently not aligned to the 7-page Montague Cole structure

### Page modules already present
- `src/components/HomePage.ts`
- `src/components/OffersPage.ts`
- `src/components/NewArrivalsPage.ts`
- `src/components/LoginPage.ts`
- `src/components/ProductDetailsPage.ts`
- `src/components/CartPage.ts`
- `src/components/CheckoutPage.ts`
- `src/components/WishlistPage.ts`

These are page templates rather than React page components. They are built using string interpolation and DOM-driven patterns.

## 3. Design system and styling

- Main stylesheet: `src/style.css`
- Existing visual system is a green-and-white ecommerce storefront theme
- Tokens currently in use:
  - `--green`, `--green-dark`, `--green-pale`, `--red`, `--text-dark`, `--text-mid`, `--text-light`, `--border`, `--bg-page`, `--white`
  - Typography uses a sans-serif storefront stack; no explicit luxury serif system yet
  - Cards, pills, buttons, drawers, toast notifications, and mobile nav are already established
- The current design is a commerce UI, not a luxury bullion brand aesthetic; the next phase should preserve this aesthetic without replacing it wholesale.

## 4. Shared data layer

- `src/data/products.ts`
  - Product catalog and pricing data
- `src/data/categories.ts`
  - Category list used by nav and filtering
- `src/data/blogs.ts`
  - Blog content and cards
- `src/data/reviews.ts`
  - Review content
- `src/store/cart.ts`
  - Cart state and related utility logic

## 5. Existing overlap with the requested mandate

The current app already has overlap in a few areas:

- Product catalog and product detail flows
- Cart and checkout flows
- Login/account flow
- Home and category navigation
- Search/filter UI

But it does not yet include any of the requested Montague Cole pages or the required organisation:

- Live Prices
- Catalogue
- Storage
- MC Reserve
- Sell to Us
- About
- Contact

It also does not yet include:
- a proper 7-item navbar hierarchy
- multi-page routing for the new paths
- mock services layer
- content files for copy
- placeholder policy tracking
- price-feed staleness logic
- compliance/placeholder documentation

## 6. Risks and constraints

- The project is not a React app today; the requested build-out is a larger architectural shift than a simple page addition.
- The existing storefront UI and route model are tightly coupled to the current page functions and string-output rendering approach.
- The new requirements include stricter compliance language, pricing logic, mock service contracts, and placeholder tracking, which should be introduced in a controlled foundation phase before new pages are built.
- Existing styling should be preserved and extended rather than replaced, per the prompt.

## 7. Recommended execution approach

| Phase | Goal |
|---|---|
| Foundation | Add routing hooks, shared content model, design token alignment, and mock service contracts |
| Core pages | Build Live Prices, Catalogue, Storage, Sell to Us, Contact, About |
| Private client area | Build MC Reserve auth/dashboard flows |
| Validation | Build/test/type-check for each page and final verification |

## 8. Audit conclusion

The project is a workable but non-React storefront template with existing header, product, cart, and checkout patterns. The right next step is not to start writing page UI yet; it is to establish a minimal, project-safe foundation that adds the requested routes, shared data services, and page content structure without disturbing the existing storefront design.

## Implementation update

The user subsequently requested that all pages be implemented. The seven requested pages, catalogue product details, page navigation, demonstration pricing and frontend form flows have since been added using the existing TypeScript/Vite SPA architecture. They are intentionally not described as production integrations: backend services, real market feeds, authentication, appointment booking, and confirmed legal/business details remain pending.
