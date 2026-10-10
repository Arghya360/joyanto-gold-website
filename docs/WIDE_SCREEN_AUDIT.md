# Wide-Screen Layout Audit

**Status:** Baseline findings captured before Step 2. The implementation and verification record is appended below.

## 1. How page width is controlled today

This repository uses a custom TypeScript/Vite SPA and handwritten CSS. There is no Tailwind configuration or shared `Container` component. The current width system is a collection of independent CSS wrappers:

| Wrapper / selector | Current width and spacing | Where it is used |
| --- | --- | --- |
| `.shop-container` | `width: 100%`, `max-width: 1180px`, `margin: 0 auto`, `padding: 0 18px` | Header inner rows, footer shell, commerce/product pages and several other legacy pages. See [src/style.css](../src/style.css) and [src/components/Header.ts](../src/components/Header.ts). |
| `.elementor-container` | `width: 100%`, `max-width: 1200px`, centered, `15px` horizontal padding | Home hero and product sections. The Shop by Category section overrides the cap to `1400px` and padding to `20px`. See [src/style.css](../src/style.css) and [src/components/HomePage.ts](../src/components/HomePage.ts). |
| `.offers-container`, `.new-arrivals-container` | `max-width: 1240px`, centered, `20px` horizontal padding | Offers and New Arrivals pages. See [src/style.css](../src/style.css). |
| `.footer-container` | `max-width: 1240px`, centered, `24px` horizontal padding | Shared footer; it is nested with `.shop-container`. See [src/components/Footer.ts](../src/components/Footer.ts) and [src/style.css](../src/style.css). |
| `.commerce-page` | `max-width: 1180px`, centered, `18px` horizontal padding | Legacy product details, cart, checkout and not-found content. See [src/components/ProductDetailsPage.ts](../src/components/ProductDetailsPage.ts), [src/components/CartPage.ts](../src/components/CartPage.ts), [src/components/CheckoutPage.ts](../src/components/CheckoutPage.ts), and [src/style.css](../src/style.css). |
| `.mc-main` | `width: min(1180px, calc(100% - 40px))`, centered | Modern catalogue, product, price, storage, sell-to-us, About, Contact and MC Reserve content. See [src/features/modern-pages.ts](../src/features/modern-pages.ts) and [src/style.css](../src/style.css). |
| `.customer-login-container` | `max-width: 520px`, centered | Legacy MC Reserve sign-in. See [src/components/LoginPage.ts](../src/components/LoginPage.ts) and [src/style.css](../src/style.css). |

The main content wrappers are already horizontally centered in CSS. The large-screen symptom is primarily that their fixed maximum widths do not grow with the viewport, leaving unused space around the content. Full-width elements are generally the outer backgrounds (header bars, page backgrounds, ticker and footer); their children are separately constrained. There is no Tailwind screen configuration to extend: breakpoints are authored as CSS `@media` rules.

The header is shared across both the legacy and modern page renderers. Its top row and second navigation use `.shop-container`; the second row is a centered, non-wrapping flex list inside an `overflow-x: auto` wrapper. The modern price ticker is outside `.mc-main`, uses a full-width dark background, and centers/wraps its contents without an inner width wrapper.

## 2. Areas likely to need large-screen treatment

These are audit findings, not changes:

| Area | Current implementation and large-screen concern |
| --- | --- |
| Header and second navigation | The background bars span the page, but inner content is capped by `.shop-container` at `1180px`. The second row remains one line at desktop sizes but does not expand with page content; its overflow scroller can hide excess content if a narrower effective viewport or zoom forces wrapping pressure. |
| Price ticker | `.mc-ticker` is full-width and its inline content wraps and centers. It has no shared constrained inner wrapper, so ticker content will not share the page's left/right alignment. |
| Home hero and banners | The hero inner wrapper is capped at `1200px`; its main carousel and promo panels therefore stay relatively small on a wide display. The carousel is `16 / 9` with `object-fit: cover`, but has no maximum rendered height or responsive image sources. Category content has a separate `1400px` cap. See [src/components/HomePage.ts](../src/components/HomePage.ts). |
| Home product cards | `.products-loop-grid` uses a fixed column layout at desktop widths, with responsive changes only at the existing tablet/mobile breakpoints. The section wrapper stays at `1200px`, and there is no wide-screen card width cap or 2560px column rule. |
| Legacy Shop / Catalogue | `.shop-layout-grid` reserves a fixed `252px` sidebar and `.shop-products-grid` uses three equal columns (two under `980px`). The page container is `1180px`; cards cannot use extra monitor width and there is no large-screen auto-fill/capped-card layout. |
| Modern Catalogue | `.mc-main` is capped at `1180px`; `.mc-product-grid` has three equal `minmax(0, 1fr)` columns. On a wider shared container, those columns would grow with the available width unless separately capped or increased in count. Product art is either square or has a fixed `185px` minimum height. |
| Product detail | The legacy `.product-detail-layout` uses two equal flexible columns, a `430px` fixed image height and a `68px` maximum inter-column gap; the information column has no explicit `560px` cap. The modern detail layout is also a two-column grid within the same `1180px` main wrapper. |
| Live Prices and charts | Four metal cards already use a four-column grid. The illustrative SVG chart fills its parent width, but `.mc-chart` has a fixed `210px` height and no `aspect-ratio` or resize observer. |
| Tables | Modern comparison tables are placed in `.mc-table-wrap { overflow-x: auto; }`, which prevents a wide table from forcing the page wider. No sticky table header is defined. |
| Forms | Modern contact and appointment forms are placed in a two-column `.mc-contact-layout`; common fields use two-column grids and converter/catalogue tools use four columns. These currently inherit the `1180px` main cap, but do not define their own maximum widths for a wider container. Legacy login is intentionally narrow at `520px`; checkout uses a flexible form column plus a `330–380px` summary column. |
| MC Reserve | The modern demo dashboard has four equal summary tiles and panels; it has no sidebar, document grid, or dashboard tables in the current implementation. The legacy login card is centered and capped at `520px`. |
| Storage and Sell to Us | Storage option cards and the Sell to Us choice cards use fixed-count grids; storage comparison is a scroll-wrapped table. The quote wizard and storage/contact forms use the shared modern form grids and currently inherit the `1180px` cap. |
| About and Contact | These use split content layouts and multi-column cards inside the modern `1180px` wrapper. The content itself does not currently gain a wider maximum at large display widths. |
| Footer | The shared footer background spans the page, but `.footer-container` stops at `1240px`. Its 12-column parent reserves four columns for Brand and eight for the four configured link groups. The payment row and bottom bar inherit that same capped inner width. Modern routes also render a compact `.mc-modern-footer` inside the modern shell before the shared footer. |
| Offers and New Arrivals | Both wrappers stop at `1240px`; their grids have five columns by default, with existing rules reducing the count at narrower breakpoints. There is no 2560px-specific grid or card maximum. |
| Modals and drawers | Existing dialogs have explicit caps (including `640px` for a blog dialog and `520px` for the checkout modal) and a `90vh` maximum height. The cart drawer is capped around `380px`. The overlay layers are fixed to the viewport. No mega-menu component was found. |

## 3. Fixed dimensions, viewport units and image-resolution notes

### Layout dimensions that affect large screens

- Wrapper maximum widths are `1180px`, `1200px`, `1240px`, `1400px`, and `520px` (login), rather than one shared responsive width scale.
- The home hero ratio is `16 / 9`; product detail images are fixed at `430px` high (reduced at narrower breakpoints); the MC Reserve product-art placeholder uses `400px` minimum height; the chart is `210px` high.
- Product and category grids use fixed column counts in their base rules: commonly three columns for product grids, four for MC metal/dashboard cards, and five for Offers/New Arrivals. They do not consistently constrain individual card widths.
- Other fixed widths are local controls rather than page containers: header search `480px`, footer newsletter `360px`, product sidebar `252px`, modal caps `520–640px`, drawer caps `280–380px`.
- The sticky header is at `top: 0`; the filter sidebar is sticky at `top: 112px` with `max-height: calc(100vh - 130px)`; the checkout summary is sticky at `top: 20px`.
- Page wrappers use `min-height: 100vh`; the modal has `max-height: 90vh`; the mobile drawer uses `100dvh`. Some hero/type spacing uses `vw` inside bounded `clamp()` values, so those values stop growing at their `clamp()` maximum.
- No `100vw` declaration was found in `src/style.css`. The global `body { overflow-x: hidden; }` can conceal overflow rather than identify its source, so overflow should be checked at each target width.

### Images below 1200px wide or potentially undersized for 2560px

Measured source dimensions:

- Category icon PNGs in `src/assets/product icon/` are `100 × 100px`. These are small icon assets, not suitable as large product/gallery imagery.
- `src/assets/hero.png` is `343 × 361px`; it is not referenced by the current TypeScript source.
- `src/assets/product picture/Burj Khalifa-inspired bars.webp` is `800 × 1091px`.
- `src/assets/product picture/Burj Khalifa-inspired coins.webp` is `608 × 456px`.
- `src/assets/product picture/dimond.webp` is `630 × 360px`; it is imported in [src/data/products.ts](../src/data/products.ts).
- The homepage banners `ban1.png` through `ban4.png` are approximately `1671 × 941px`; `Montague_Cole_Homepage_Master_Concept.png` is `1536 × 831px`; `Montague Cole Private Assets Banner.png` is `1704 × 923px`. They are all below 1920px wide, so their sharpness should be checked at the 1920px and 2560px hero/promo render sizes.
- The modern catalogue's product PNGs are `1254 × 1254px`, except `1 oz Dubai Silver Coin.png` at `1312 × 1199px`; they are above the requested 1200px width threshold but are not 2560px source images.
- The Insights images are `1448 × 1086px`.
- The older product AVIF files (`gold.avif`, `gold coin.avif`, `gold ber.avif`, `Silver bars.avif`, `Silver coins.avif`) are `1470 × 980px`.

Current image markup uses individual `src` values; no `srcset`/`sizes` strategy was found. The 800px, 608px and 630px legacy product sources are the clearest pixelation risks if displayed in a large product-detail/gallery area. The 100px icon set should remain limited to icon-sized use.

## Audit conclusion

The code does not show a global left-aligned page container: the main wrappers use automatic horizontal margins. The consistent wide-screen limitation is the set of small, independent maximum widths; the resulting centered content occupies only part of a large monitor. The highest-impact candidates for Step 2 are the shared container scale, footer/header inner alignment, modern `.mc-main`, legacy `.shop-container`/`.elementor-container`, and the large fixed-count product grids. A CSS-only breakpoint approach fits the existing project; there is no Tailwind config to extend.

## Step 2 implementation and verification

- A shared `.wide-screen-container` utility is applied to the existing header, home, footer, commerce, and modern-page wrappers. It is intentionally inactive through `1536px` so existing layouts remain in place at those widths.
- Above `1536px`, the content max-width is `1440px` with `48px` side padding; at `1920px` and above it is `1600px` with `64px` padding; at `2560px` and above it is `1760px` with `64px` padding. The existing `1536px` layout was left unchanged to honor the request not to alter that size, despite the separate proposed `1440px` container value.
- Large-screen-only rules expand existing product grids, cap product-card widths, widen chart and product-detail areas, constrain forms, and increase spacing/type gradually. Height-limited sticky positioning is enabled for product details only above `1536px` width and `1440px` viewport height.
- The ticker wrapper uses `display: contents` through `1536px` so the new inner wrapper does not change the existing ticker flow; above that width it becomes a centered flex container.
- Browser checks covered 18 routes at `360`, `768`, `1024`, `1280`, `1536`, `1920`, `2560`, and `3440` CSS pixels. No horizontal document overflow was measured. The shared inner content was centered at the tested large widths, with its rendered container capped at `1728px` outer width at `1920px` and `1888px` outer width at `2560px` and `3440px`.
- `npm run build` passed (TypeScript and Vite). The project does not define lint or test scripts. `git diff --check` passed.
- Image-resolution risks remain as listed above: no responsive `srcset` variants were found. In particular, the legacy Dubai Collection bars (`800px` wide), Dubai Collection coins (`608px`), and diamond image (`630px`) are below `1200px`; homepage/banner sources are `1536–1704px` wide and may soften when rendered large. Higher-resolution originals are needed to eliminate that risk rather than upscaling the existing files.
