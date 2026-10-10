---
mode: agent
description: Build the Catalogue, product page, cart and checkout
---

Build the **Catalogue** at /catalogue and the product page at /catalogue/:slug. Follow .github/copilot-instructions.md. If a cart or checkout already exists, reuse and extend it instead of rebuilding.

Catalogue page:
- H1 "Catalogue" with a short intro. Category chips: All, Gold Bars, Gold Coins, Silver Bars, Silver Coins, Dubai Collection, Gift Range.
- Filters (sidebar on desktop, sheet on mobile): metal, type (bar or coin), weight range, availability (In stock, Pre-order, Enquire), price range, brand/mint (placeholder list). "Clear all" plus active-filter chips.
- Toolbar: result count, sort (Featured, Price low to high, Price high to low, Weight, Newest), grid/list toggle, compare toggle. Debounced search.
- Product cards: placeholder image, name, metal and fineness tag, weight, live total price (or "Indicative" if the feed is stale), availability badge, Add to cart (disabled when indicative or pre-order), Compare checkbox. Dubai Collection cards show "Prototype / Pre-order" and an Enquire button.
- Compare drawer for up to 3 products with side-by-side specs.
- Filters and sort sync to the URL query string.
- Seed 12 to 15 products from the launch list in catalogueService, all marked placeholder.

Product page:
- Zoomable gallery, spec table (metal, fineness, gross and fine weight, dimensions, refiner/mint, packaging, certificate/serial, availability, dispatch, buy-back eligibility). Unknown values use the placeholder markers.
- Premium breakdown table: metal value, product premium, delivery, insurance, tax line, total, all from computeSellPrice.
- Quantity stepper with min and max, gift packaging add-on, tabs (Specifications, Description, Delivery, Buy-back), related products, "Request a private quote" for large quantities.

Cart and checkout:
- Cart drawer and /cart with quantity edit, removal, and price breakdown.
- Price lock of 10 minutes (configurable) starting at "Proceed to checkout", visible countdown, repricing and reconfirmation on expiry. Announce the timer to screen readers only at key moments.
- Checkout stepper: Details, Delivery or Dubai collection, Insurance and signature, Payment instructions (bank transfer, other methods mocked behind an adapter), Review, Confirmation.
- Orders above a configurable threshold go to "Awaiting compliance review".
- Confirmation page with a mock downloadable invoice.

Tests: pricing, filters, price-lock expiry. Run build, lint, typecheck and tests. Commit "feat: catalogue, product page, checkout".
