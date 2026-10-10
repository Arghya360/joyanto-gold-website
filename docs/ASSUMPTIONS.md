# Implementation assumptions

- The repository is a plain TypeScript/Vite single-page application with custom history routing, not React. The new pages therefore use the existing DOM-template and event-listener architecture. No framework or dependency was added.
- The existing storefront header, footer, and design tokens remain in use. The new pages add scoped styles only; the legacy home and storefront pages are not intentionally restyled.
- Price and FX figures, chart paths, catalogue entries, and account state are mock demonstration data. They are not live market data, a quote, an offer, or a production service.
- Since no backend exists, contact, storage, appointment, sign-in, and sell-to-us form actions confirm only a local demo interaction. A visible reference does not mean a real request was transmitted or a booking made.
- Production authentication, private data isolation, appointment availability, file upload handling, saved requests, and service integrations require server-side implementations.
- [PENDING CLIENT] and [PENDING LEGAL REVIEW] markers are intentionally retained wherever business or legal facts are unconfirmed.
- Home featured selection is explicitly configured in `src/features/modern-data.ts`: 1 g, 10 g, 50 g, 100 g and 1 kg Gold Bars; 100 g and 1 kg Silver Bars; and the 1 oz Dubai Gold Coin. The client can adjust the `featured` and `featuredOrder` fields there.
- No Catalogue products are currently flagged `isNew`, so the New Arrivals page does not show the old demo-product selection.
- Catalogue data remains placeholder/demo data. Add-to-cart is paused until the client confirms sellable prices and availability for each item.
