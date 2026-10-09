# Placeholder register

All products and values below are demonstration data. Replace them only after the client confirms the source information. Legal, financial, custody, insurance and tax text requires legal review.

## Client information

- Business contact details: phone, email, WhatsApp, address and hours — `src/features/modern-pages.ts` (Contact).
- Company founding year, founders, team profiles and bios — `src/features/modern-pages.ts` (About).
- Collection location, appointment availability, hours, video meeting arrangement and contact process — `src/features/modern-pages.ts` (Storage, Sell to Us, Contact).
- Product dimensions, fine weights, fineness, refiner/mint, packaging, certificates/serials, dispatch, stock status and buy-back eligibility — `src/features/modern-pages.ts` (Catalogue product details).
- Product catalogue seed, weights, fineness, categories and displayed prototype names — `src/features/modern-data.ts`.
- Storage service scope, collection process, records, availability and fee schedule — `src/features/modern-pages.ts` (Storage).
- Buy-back rate, route and appointment process — `src/features/modern-pages.ts` (Sell to Us).
- Product imagery — product cards currently use generated neutral artwork; approved product photography remains pending.

## Legal review

- Storage insurance, custody, ownership, access, storage terms and disclaimer — `src/features/modern-pages.ts` (Storage).
- Delivery coverage and insurance, tax treatment, fees and applicable legal terms — `src/features/modern-pages.ts` (Storage and price disclosures).
- Settlement terms, identification requirements, source-of-funds checks and privacy notice — `src/features/modern-pages.ts` (Sell to Us).
- Complaints procedure and legal contact disclosures — `src/features/modern-pages.ts` (Contact).
- Licences and compliance disclosures — `src/features/modern-pages.ts` (About).
- Terms of sale, privacy, price-lock, returns, cancellation and regulatory disclosures — `src/components/Footer.ts`.
- Footer legal pages are not implemented; legal labels are intentionally non-linked until approved routes and copy exist — `src/config/footer.ts`.

## Footer launch details

- Confirm the four social account URLs — `src/config/footer.ts` (`SOCIAL_LINKS`).
- Confirm accepted card payment methods; bank transfer is the only currently unmarked method — `src/config/footer.ts` (`ACCEPTED_PAYMENTS`).
- Confirm whether App Store and Google Play apps exist and provide their URLs before enabling `SHOW_APP_BADGES` — `src/config/footer.ts`.
- Confirm the newsletter provider, consent wording and privacy destination; the footer currently simulates submission only — `src/components/Footer.ts`, `src/services/footer-newsletter.ts`.
- Confirm depository standards, insured transit terms, Dubai depository address and private-assets page anchor — `src/config/footer.ts`.

## Demonstration data (not a price feed)

- Mock USD per troy-ounce values for four metals, approximate FX values other than the specified AED/USD reference, and generated chart values — `src/features/modern-pages.ts`.
- Product demo prices and catalogue seed data — `src/features/modern-data.ts`.
- Values are clearly labelled indicative/demo data. The mock feed is not live, never enables purchasing, and must be replaced by a verified data service before launch.

## Live price terminal

- Licensed market data provider and production API/WebSocket contract — `src/features/market-terminal/data/http-provider.ts` (`[PENDING CLIENT: licensed live market data provider]`).
- Licensed foreign-exchange source for EUR, GBP, INR and SAR; AED/USD is configured at 3.6725 for demonstration — `src/features/market-terminal/config.ts` (`[PENDING CLIENT: licensed live FX source]`).
- Bid/ask spreads by material — `src/features/market-terminal/config.ts` (`[PENDING CLIENT: spreads]`).
- Mock base prices are simulation seeds only and require client-approved reference values — `src/features/market-terminal/config.ts` (`[PENDING CLIENT: confirm base prices]`).
- Diamond reference-index source, pricing list, and grading multipliers — `src/features/market-terminal/config.ts` (`[PENDING CLIENT: licensed diamond price source]`, `[PENDING CLIENT: licensed diamond price list]`).
- Tael gram definition varies by region; confirm the definition to use — `src/features/market-terminal/units.ts` (`[PENDING CLIENT: confirm tael definition]`).
