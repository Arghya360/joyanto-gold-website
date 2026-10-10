import { catalogueImages, catalogueItems, formatCataloguePriceAed } from './modern-data';
import catalogueBanner from '../assets/Catalogue banner.png';
import livePricesBanner from '../assets/live-prices banner.png';
import storageBanner from '../assets/Storage banner.png';
import sellToUsBanner from '../assets/Sell to Us.png';
import aboutBanner from '../assets/about.png';
import privateAssetsBanner from '../assets/main header logo/Montague Cole Private Assets Banner.png';
import { SHOW_BRAND_FILTER } from '../config/catalogue';
import {
  computeCatalogueFacets,
  createEmptyCatalogueFilters,
} from './catalogue-filters';

export type ModernNavigation = (path: string) => void;

type Metal = 'Gold' | 'Silver' | 'Platinum' | 'Palladium';
type Currency = 'AED' | 'USD' | 'EUR' | 'GBP' | 'INR' | 'SAR';

const metals: Metal[] = ['Gold', 'Silver', 'Platinum', 'Palladium'];
const currencies: Currency[] = ['AED', 'USD', 'EUR', 'GBP', 'INR', 'SAR'];
const fx: Record<Currency, number> = { AED: 3.6725, USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.1, SAR: 3.75 };
const mockUsdPerOz: Record<Metal, number> = { Gold: 2320, Silver: 29, Platinum: 990, Palladium: 1010 };
const formatMoney = (value: number, currency = getCurrency()) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);
const getCurrency = (): Currency => {
  const saved = localStorage.getItem('mc-currency');
  return currencies.includes(saved as Currency) ? saved as Currency : 'AED';
};
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character] ?? character));

const pageTitles: Record<string, string> = {
  '/live-prices': 'Live Prices', '/catalogue': 'Catalogue', '/storage': 'Storage',
  '/mc-reserve': 'MC Reserve', '/sell-to-us': 'Sell to Us', '/about': 'About Montague Cole',
  '/contact': 'Contact',
};

function pricePerGram(metal: Metal, currency = getCurrency()): number {
  return mockUsdPerOz[metal] * fx[currency] / 31.1035;
}

function priceTicker(): string {
  const currency = getCurrency();
  return `<aside class="mc-ticker" aria-label="Indicative demonstration metal prices">
    <div class="mc-ticker-inner wide-screen-container">
      <span class="mc-ticker-label" id="ticker-health">Indicative demonstration feed</span>
      ${metals.map(metal => `<span><b>${metal}</b> ${formatMoney(pricePerGram(metal, currency) * 31.1035, currency)} / oz</span>`).join('')}
      <a href="/live-prices" data-modern-path="/live-prices">View prices</a>
    </div>
  </aside>`;
}

function shell(path: string, body: string): string {
  const title = pageTitles[path] ?? (path.startsWith('/catalogue/') ? 'Product details' : 'Page not found');
  document.title = `${title} | Montague Cole Bullion`;
  const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (description) description.content = `${title} from Montague Cole Bullion.`;
  if (path.startsWith('/mc-reserve')) {
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.append(robots);
    }
    robots.content = 'noindex, nofollow';
  } else {
    document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.remove();
  }
  return `<div class="mc-modern">${priceTicker()}<main class="mc-main wide-screen-container">${body}</main></div>`;
}

function section(label: string, heading: string, copy = ''): string {
  return `<header class="mc-section-heading"><span>${label}</span><h2>${heading}</h2>${copy ? `<p>${copy}</p>` : ''}</header>`;
}

function cta(title: string, link = '/catalogue', label = 'Browse the Catalogue'): string {
  return `<section class="mc-cta"><div><span>Montague Cole Bullion</span><h2>${title}</h2></div><a class="mc-button mc-button-light" href="${link}" data-modern-path="${link}">${label}</a></section>`;
}

function metalCard(metal: Metal): string {
  const perOz = pricePerGram(metal) * 31.1035;
  return `<article class="mc-metal-card"><div><span>${metal}</span><span class="mc-status">Indicative</span></div>
    <strong class="mc-price">${formatMoney(perOz)}<small> / troy oz</small></strong>
    <p>${formatMoney(pricePerGram(metal))} per gram</p><p>24h change unavailable · demo data</p>
    <div class="mc-sparkline" aria-hidden="true">╱╲╱╱╲╱╲╱╱</div>
    <small>Demo snapshot · not a live quote</small></article>`;
}

function pricePage(): string {
  return `<section class="mc-hero mc-price-hero"><img class="mc-price-hero-image" src="${livePricesBanner}" alt="" aria-hidden="true"><div class="mc-price-hero-content"><span class="mc-eyebrow">Market reference · Demonstration data</span>
    <h1>Live Prices</h1><p>Gold, silver, platinum and palladium, updated continuously.</p>
    <span class="mc-status" id="feed-health" role="status">Indicative only · mock feed</span></div>
  </section>
  <div class="mc-notice" id="price-notice" role="status">Demonstration prices only. This mock feed is not connected to a live market source and cannot be used to place an order.</div>
  <section class="mc-metal-grid" id="metal-cards">${metals.map(metalCard).join('')}</section>
  ${section('Market reference', 'Price chart', 'Candlestick history is simulated for demonstration and is not a live market feed.')}
  <section class="mc-panel mc-chart-panel">
    <div class="mc-chart-top">
      <label for="chart-metal">Material<select id="chart-metal">${['Gold', 'Silver', 'Platinum', 'Diamond'].map(material => `<option>${material}</option>`).join('')}</select></label>
      <div class="mc-tabs" role="group" aria-label="Chart range">${['1D', '5D', '1M', '3M', '1Y'].map((range, index) => `<button type="button" aria-pressed="${index === 0}" aria-controls="market-chart" data-market-range="${range}">${range}</button>`).join('')}</div>
    </div>
    <div class="mc-market-chart" id="market-chart" data-range="1D" aria-live="polite" aria-label="Simulated price chart"></div>
    <p id="chart-value" class="mc-chart-caption">Loading simulated price history…</p>
  </section>
  ${section('Indicative tool', 'Metal value converter', 'A metal-value estimate only. Product premium, delivery, insurance and taxes are not included.')}
  <form class="mc-panel mc-converter" id="price-converter"><label>Metal<select id="convert-metal">${metals.map(m => `<option>${m}</option>`).join('')}</select></label>
    <label>Weight<input id="convert-weight" type="number" min="0.001" step="any" value="10" required></label>
    <label>Unit<select id="convert-unit"><option value="g">Grams</option><option value="oz">Troy ounces</option><option value="kg">Kilograms</option><option value="tola">Tola</option></select></label>
    <output id="convert-result" aria-live="polite">${formatMoney(pricePerGram('Gold') * 10)} indicative metal value</output>
  </form>
  ${section('Pricing, explained', 'How a product price is built', 'The final order total must show every applicable component.')}
  <section class="mc-formula">${[['01', 'Live metal value'], ['02', 'Product premium'], ['03', 'Delivery'], ['04', 'Insurance'], ['05', 'Applicable taxes']].map(([n, t]) => `<article><span>${n}</span><h3>${t}</h3><p>Shown separately at the time of a confirmed order.</p></article>`).join('')}</section>
  <p class="mc-disclaimer">Prices are indicative until an order is confirmed and price-locked. Prices can go down as well as up. This is not investment advice.</p>
  ${cta('Explore the catalogue')}`;
}

function cataloguePage(heading = 'Catalogue'): string {
  const facets = computeCatalogueFacets(catalogueItems, createEmptyCatalogueFilters());
  const categoryButtons = [
    `<button type="button" class="mc-category-pill is-active" data-catalogue-category="" aria-pressed="true">All <span>${catalogueItems.length}</span></button>`,
    ...facets.categories.map(category => `<button type="button" class="mc-category-pill" data-catalogue-category="${category.value}" aria-pressed="false"${category.count ? '' : ' disabled'}>${category.label} <span>${category.count}</span></button>`),
  ].join('');
  const viewButton = (view: 'grid' | 'list', label: string, icon: string) =>
    `<button type="button" class="mc-view-button${view === 'grid' ? ' is-active' : ''}" data-catalogue-view="${view}" aria-label="${label}" aria-pressed="${view === 'grid'}">${icon}</button>`;
  const typeLabels = { bar: 'Bar', coin: 'Coin', gift: 'Gift item' };
  const stockLabels = { in_stock: 'In stock', pre_order: 'Pre-order', enquire: 'Enquire only', out_of_stock: 'Out of stock' };
  return `<section class="mc-hero mc-catalogue-hero"><img class="mc-price-hero-image" src="${catalogueBanner}" alt="" aria-hidden="true"><div class="mc-price-hero-content"><span class="mc-eyebrow">Physical precious metals · Placeholder catalogue</span><h1>${heading}</h1>
    <p>Explore a planned selection of gold and silver bars and coins. Prices are client-provided Dubai prices; product details and availability are pending confirmation.</p></div></section>
    <section class="mc-catalogue-filter-card" aria-label="Catalogue filters">
      <div class="mc-catalogue-toolbar">
        <div class="mc-catalogue-search-row">
          <label class="mc-catalogue-search" for="catalogue-search">
            <span class="mc-catalogue-search-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m16 16 4 4"></path></svg></span>
            <span class="mc-visually-hidden">Search products</span>
            <input id="catalogue-search" type="search" placeholder="Search by metal, type or weight" autocomplete="off">
            <button type="button" id="catalogue-search-clear" aria-label="Clear search" hidden>×</button>
          </label>
          <button type="button" class="mc-filter-open-button" id="catalogue-filter-open" aria-haspopup="dialog" aria-controls="catalogue-filter-sheet" aria-expanded="false">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M7 12h10m-7 6h4"></path></svg><span>Filters</span><span class="mc-filter-badge" id="catalogue-filter-count" hidden>0</span>
          </button>
        </div>
        <label class="mc-catalogue-sort" for="catalogue-sort"><span>Sort by</span>
          <select id="catalogue-sort">
            <option value="featured">Featured</option>
            <option value="price-asc" disabled>Price low to high · unavailable</option>
            <option value="price-desc" disabled>Price high to low · unavailable</option>
            <option value="weight-asc">Weight low to high</option>
            <option value="weight-desc">Weight high to low</option>
            <option value="newest" disabled>Newest · date unavailable</option>
          </select>
        </label>
        <div class="mc-view-toggle" role="group" aria-label="Catalogue view">
          ${viewButton('grid', 'Grid view', '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"></rect><rect x="14" y="4" width="6" height="6" rx="1"></rect><rect x="4" y="14" width="6" height="6" rx="1"></rect><rect x="14" y="14" width="6" height="6" rx="1"></rect></svg>')}
          ${viewButton('list', 'List view', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11"></path><circle cx="4" cy="6" r="1"></circle><circle cx="4" cy="12" r="1"></circle><circle cx="4" cy="18" r="1"></circle></svg>')}
        </div>
      </div>
      <div class="mc-catalogue-categories">
        <div class="mc-category-pills" role="group" aria-label="Product category">${categoryButtons}</div>
      </div>
      <div class="mc-catalogue-sheet-overlay" id="catalogue-filter-overlay" hidden></div>
      <section class="mc-catalogue-detail-filters" id="catalogue-filter-sheet" role="dialog" aria-modal="true" aria-labelledby="catalogue-filter-heading">
        <div class="mc-catalogue-sheet-heading"><h2 id="catalogue-filter-heading">Filters</h2><button type="button" id="catalogue-filter-close" aria-label="Close filters">×</button></div>
        <div class="mc-catalogue-detail-grid">
          <label class="mc-catalogue-field" for="filter-metal"><span>Metal</span>
            <select id="filter-metal"><option value="">Any metal</option>${facets.metals.map(option => `<option value="${option.value}">${option.value} (${option.count})</option>`).join('')}</select>
          </label>
          <label class="mc-catalogue-field" for="filter-type"><span>Type</span>
            <select id="filter-type"><option value="">Any type</option>${facets.types.map(option => `<option value="${option.value}"${option.count ? '' : ' disabled'}>${typeLabels[option.value]} (${option.count})</option>`).join('')}</select>
          </label>
          <label class="mc-catalogue-field" for="filter-availability"><span>Availability</span>
            <select id="filter-availability"><option value="">Any availability</option>${facets.availability.map(option => `<option value="${option.value}"${option.count ? '' : ' disabled'}>${stockLabels[option.value]} (${option.count})</option>`).join('')}</select>
          </label>
          <fieldset class="mc-catalogue-field mc-weight-field">
            <legend>Weight</legend>
            <div class="mc-weight-range">
              <label for="filter-weight-min"><span class="mc-visually-hidden">Minimum weight</span><input id="filter-weight-min" type="number" min="0" step="any" inputmode="decimal" placeholder="Min"></label>
              <span aria-hidden="true">to</span>
              <label for="filter-weight-max"><span class="mc-visually-hidden">Maximum weight</span><input id="filter-weight-max" type="number" min="0" step="any" inputmode="decimal" placeholder="Max"></label>
              <select id="filter-weight-unit" aria-label="Weight unit"><option value="g">g</option><option value="oz">oz</option><option value="kg">kg</option></select>
            </div>
            <span class="mc-weight-error" id="filter-weight-error" role="alert" hidden>Minimum must be less than maximum</span>
            <div class="mc-weight-presets" aria-label="Weight presets">
              <button type="button" data-weight-preset="up-to-10">Up to 10 g</button>
              <button type="button" data-weight-preset="10-to-100">10 to 100 g</button>
              <button type="button" data-weight-preset="100-to-1000">100 g to 1 kg</button>
              <button type="button" data-weight-preset="1000-plus">1 kg and above</button>
            </div>
          </fieldset>
          <fieldset class="mc-catalogue-field mc-price-field">
            <legend>Max price</legend>
            <div class="mc-catalogue-price-control"><span>AED</span><input id="filter-price-max" type="number" min="0" disabled aria-describedby="catalogue-price-note" placeholder="Unavailable"></div>
            <small id="catalogue-price-note">Price filtering is unavailable in this catalogue view.</small>
          </fieldset>
          ${SHOW_BRAND_FILTER ? `<label class="mc-catalogue-field" for="filter-brand"><span>Brand / mint</span><select id="filter-brand"><option value="">Any brand</option></select></label>` : ''}
        </div>
        <div class="mc-catalogue-sheet-footer">
          <button type="button" class="mc-catalogue-clear" id="clear-filters">Clear all filters</button>
          <button type="button" class="mc-button" id="catalogue-filter-apply">Show ${catalogueItems.length} products</button>
        </div>
      </section>
      <div class="mc-catalogue-filter-footer">
        <p class="mc-result-count" id="catalogue-result-count">Showing ${catalogueItems.length} of ${catalogueItems.length} products</p>
        <button type="button" class="mc-catalogue-clear" id="catalogue-clear-desktop" hidden>Clear all filters</button>
      </div>
    </section>
    <div class="mc-active-filters" id="active-filters" aria-label="Active filters"></div>
    <p class="mc-visually-hidden" id="catalogue-live-count" aria-live="polite"></p>
    <section class="mc-catalogue-empty" id="catalogue-empty-state" hidden>
      <h2>No products match your filters.</h2>
      <div><button type="button" class="mc-catalogue-clear" data-clear-all-filters>Clear all filters</button><a class="mc-button mc-button-outline" href="/contact?type=buying" data-modern-path="/contact?type=buying">Request a private quote</a></div>
    </section>
    <section class="mc-product-grid" id="catalogue-grid">${catalogueItems.map(productCard).join('')}</section>
    <p class="mc-disclaimer">All listed products are placeholder data. Live prices are unavailable in this demo. Purchasing is paused. Product premiums, delivery, insurance and applicable taxes must be disclosed separately.</p>`;
}

function productCard(item: typeof catalogueItems[number]): string {
  const preOrder = item.category === 'Dubai Collection';
  const image = catalogueImages[item.slug];
  const artwork = image
    ? `<div class="mc-product-art mc-product-art-image"><img src="${image}" alt="${item.name}" loading="lazy"></div>`
    : `<div class="mc-product-art" role="img" aria-label="Neutral placeholder for ${item.name}"><span>${item.metal}</span><b>${item.grams} g</b></div>`;
  const actions = preOrder
    ? `<span class="mc-status">Pre-order</span><a class="mc-button mc-button-outline" href="/contact?type=buying" data-modern-path="/contact?type=buying">Enquire</a>`
    : `<button type="button" class="mc-button" data-catalogue-add="${item.slug}" aria-label="Add ${item.name} to cart">Add to Cart</button>`;
  const displayPrice = item.priceAed === undefined
    ? 'Price unavailable'
    : formatCataloguePriceAed(item.priceAed);
  return `<article class="mc-product-card" data-product-card data-slug="${item.slug}" data-category="${item.category}" data-name="${item.name.toLowerCase()}" data-price="${item.priceAed ?? ''}" data-weight="${item.grams}">
    ${artwork}
    <div class="mc-product-copy"><span class="mc-eyebrow">${item.metal} · ${item.fineness}</span><h2><a href="/catalogue/${item.slug}" data-modern-path="/catalogue/${item.slug}">${item.name}</a></h2>
    <p>${preOrder ? 'Prototype / Pre-order' : 'Placeholder product · details pending'}</p><strong>${displayPrice}</strong>
    <div class="mc-card-actions">${actions}<a class="mc-button mc-button-outline" href="/catalogue/${item.slug}" data-modern-path="/catalogue/${item.slug}">View Details</a></div>
    </div></article>`;
}

function productDetailsPage(path: string): string {
  const slug = path.split('/').filter(Boolean).at(-1) ?? '';
  const item = catalogueItems.find(product => product.slug === slug);
  if (!item) return `<section class="mc-hero"><span class="mc-eyebrow">Catalogue</span><h1>Product not found</h1><p>We could not find that placeholder product.</p><a class="mc-button" href="/catalogue" data-modern-path="/catalogue">Back to Catalogue</a></section>`;
  const image = catalogueImages[item.slug];
  const imageMarkup = image
    ? `<div class="mc-product-art mc-product-art-image mc-product-art-large mc-detail-image"><img src="${image}" alt="${item.name}" fetchpriority="high"></div>`
    : `<div class="mc-product-art mc-product-art-large" role="img" aria-label="Product image unavailable"><span>Product image unavailable</span></div>`;
  const productType = item.category.endsWith('Bars') ? 'Bar'
    : item.category.endsWith('Coins') ? 'Coin'
      : item.category === 'Gift Range' ? 'Gift item'
        : 'Prototype';
  const weight = item.category === 'Gift Range' ? 'Not specified'
    : item.category === 'Dubai Collection' ? 'Awaiting confirmation'
      : item.name.includes(' oz ') ? item.name.match(/[\d.]+ oz/)?.[0] ?? 'Awaiting confirmation'
        : `${item.grams.toLocaleString('en-US')} g`;
  const isPreOrder = item.category === 'Dubai Collection';
  const contactHref = `/contact?type=buying&product=${encodeURIComponent(item.slug)}`;
  const price = item.priceAed === undefined ? 'Price unavailable' : formatCataloguePriceAed(item.priceAed);
  return `<nav class="mc-breadcrumbs" aria-label="Breadcrumb"><a href="/catalogue" data-modern-path="/catalogue">Catalogue</a><span aria-hidden="true">/</span><span aria-current="page">${item.name}</span></nav>
    <section class="mc-detail-layout">
      ${imageMarkup}
      <div class="mc-panel mc-detail-panel">
        <span class="mc-eyebrow">${item.category} · ${item.metal}</span>
        <h1>${item.name}</h1>
        <p class="mc-detail-intro">${isPreOrder ? 'Dubai Collection prototype. Enquire for current development and pre-order information.' : `${productType} from the Montague Cole Bullion catalogue.`}</p>
        <p class="mc-detail-price">${price}</p>
        ${item.priceAed === undefined ? '' : '<p class="mc-detail-price-note">Client-provided indicative Dubai price · not an order quote</p>'}
        <dl class="mc-specs">
          <dt>Product</dt><dd>${productType}</dd>
          <dt>Category</dt><dd>${item.category}</dd>
          <dt>Metal</dt><dd>${item.metal}</dd>
          <dt>Weight</dt><dd>${weight}</dd>
          <dt>Fineness</dt><dd>Awaiting confirmation</dd>
          <dt>Availability</dt><dd>${isPreOrder ? 'Prototype / Pre-order' : 'Awaiting confirmation'}</dd>
          <dt>Fine weight</dt><dd>Awaiting confirmation</dd>
          <dt>Dimensions</dt><dd>Awaiting confirmation</dd>
          <dt>Refiner / mint</dt><dd>Awaiting confirmation</dd>
          <dt>Packaging</dt><dd>Awaiting confirmation</dd>
          <dt>Certificate / serial</dt><dd>Awaiting confirmation</dd>
          <dt>Dispatch</dt><dd>Awaiting confirmation</dd>
          <dt>Buy-back eligibility</dt><dd>Awaiting confirmation</dd>
        </dl>
        <p class="mc-disclaimer">Specifications and availability are pending confirmation. Product premium, delivery, insurance and applicable taxes are not included in the displayed price.</p>
        <div class="mc-detail-actions">
          <a class="mc-button" href="${contactHref}" data-modern-path="${contactHref}">${isPreOrder ? 'Enquire about pre-order' : 'Enquire about this product'}</a>
          ${!isPreOrder && item.priceAed !== undefined
            ? `<button type="button" class="mc-button mc-button-outline" data-catalogue-add="${item.slug}" aria-label="Add ${item.name} to cart at the indicative price">Add to cart · indicative</button>`
            : ''}
          ${isPreOrder ? '' : '<button type="button" class="mc-button mc-button-outline" data-purchase-paused aria-expanded="false" aria-controls="purchase-paused-note">Purchasing paused · why?</button>'}
          <a class="mc-button mc-button-outline" href="/catalogue" data-modern-path="/catalogue">Back to Catalogue</a>
        </div>
        ${isPreOrder ? '' : '<p id="purchase-paused-note" class="mc-detail-price-note" role="status" hidden>Checkout is paused until this product’s price, availability and delivery terms are confirmed. You can still add it to your cart to review the indicative value.</p>'}
      </div>
    </section>
    ${section('Product information', 'Details and availability', 'Confirmed specifications, dispatch, packaging and documentation will be added when supplied.')}
    <p class="mc-disclaimer">Prices can go down as well as up. This is not investment advice.</p>`;
}

function storagePage(): string {
  const options = [
    ['Delivered to you', 'For clients who prefer to take physical delivery.', 'Delivery coverage and insurance: [PENDING LEGAL REVIEW]'],
    ['Collect in Dubai', 'Collection by private appointment.', 'Collection location and process: [PENDING CLIENT]'],
    ['Stored in Dubai', 'Ask us about potential storage arrangements.', 'Custody and ownership terms: [PENDING LEGAL REVIEW]'],
  ];
  return `<section class="mc-hero mc-storage-hero"><img class="mc-price-hero-image" src="${storageBanner}" alt="" aria-hidden="true"><div class="mc-price-hero-content"><span class="mc-eyebrow">Options for physical metal</span><h1>Storage</h1><p>Secure options for your physical metal. Terms and availability are subject to confirmation.</p></div></section>
  <section class="mc-option-grid">${options.map(([title, copy, note]) => `<article class="mc-panel"><span class="mc-eyebrow">Storage option</span><h2>${title}</h2><p>${copy}</p><p class="mc-placeholder">${note}</p><details><summary>Learn more</summary><p>[PENDING CLIENT: confirmed service scope and terms]</p></details></article>`).join('')}</section>
  ${section('At a glance', 'Compare your options')}
  <div class="mc-table-wrap"><table class="mc-table"><thead><tr><th>Option</th><th>Where held</th><th>Access</th><th>Insurance</th><th>Fees</th><th>MC Reserve records</th></tr></thead><tbody>
  <tr><th>Delivered to you</th><td>Client address [PENDING CLIENT]</td><td>Following delivery</td><td>[PENDING LEGAL REVIEW]</td><td>[PENDING CLIENT]</td><td>Order records only</td></tr>
  <tr><th>Collect in Dubai</th><td>[PENDING CLIENT]</td><td>By appointment</td><td>[PENDING LEGAL REVIEW]</td><td>[PENDING CLIENT]</td><td>Order records only</td></tr>
  <tr><th>Stored in Dubai</th><td>[PENDING LEGAL REVIEW]</td><td>[PENDING LEGAL REVIEW]</td><td>[PENDING LEGAL REVIEW]</td><td>[PENDING CLIENT]</td><td>Subject to confirmed service</td></tr></tbody></table></div>
  <section class="mc-timeline">${['Purchase', 'Allocation', 'Secure holding', 'Access or sale'].map((t, i) => `<article><span>0${i + 1}</span><h3>${t}</h3><p>Process details: [PENDING CLIENT]</p></article>`).join('')}</section>
  ${section('Illustrative only', 'Storage fee estimator')}
  <form id="storage-estimator" class="mc-panel mc-converter"><label>Metal<select id="storage-metal"><option>Gold</option><option>Silver</option></select></label><label>Total weight (g)<input id="storage-weight" type="number" min="1" value="100" required></label>
  <label>Years<input id="storage-years" type="number" min="1" max="50" value="1" required></label><output id="storage-estimate">Illustrative estimate only · [PENDING CLIENT: fee schedule]</output></form>
  <div class="mc-info-box"><h2>Your records</h2><p>MC Reserve may provide access to order documents and asset records. Availability depends on the final service scope.</p><a href="/mc-reserve" data-modern-path="/mc-reserve">Visit MC Reserve</a></div>
  ${section('Common questions', 'Storage FAQs')}
  <div class="mc-faq">${[['Can I collect my purchase?', '[PENDING CLIENT: collection terms]'], ['Can I sell stored metal?', '[PENDING CLIENT: sale and inspection process]'], ['Is stored metal insured?', '[PENDING LEGAL REVIEW]'], ['Who owns stored metal?', '[PENDING LEGAL REVIEW]'], ['How do I access stored metal?', '[PENDING LEGAL REVIEW]'], ['What records are provided?', '[PENDING CLIENT: available records]'], ['Can I change storage options?', '[PENDING CLIENT: process and fees]'], ['What are the storage fees?', '[PENDING CLIENT: fee schedule]']].map(([q,a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>
  ${section('Start a conversation', 'Storage enquiry')}
  <form class="mc-panel mc-form-grid" data-contact-form><label>Name<input name="name" autocomplete="name" required></label><label>Email<input name="email" type="email" autocomplete="email" required></label>
  <label>Phone<input name="phone" type="tel" autocomplete="tel" placeholder="+[country code]" required></label><label>Country<input name="country" autocomplete="country-name" required></label>
  <label>Metal<select name="metal"><option>Gold</option><option>Silver</option></select></label><label>Approximate value band<select name="value"><option>Select a range</option><option>Prefer to discuss</option></select></label>
  <label>Preferred option<select name="option">${options.map(([title]) => `<option>${title}</option>`).join('')}</select></label><label class="mc-form-full">Message<textarea name="message" rows="3"></textarea></label>
  <label class="mc-check mc-form-full"><input type="checkbox" required> I agree to be contacted about this enquiry.</label><button class="mc-button mc-form-full">Send enquiry</button><p class="mc-form-status mc-form-full" aria-live="polite"></p></form>
  <p class="mc-disclaimer">Storage terms, including insurance, fees, ownership and custody, are subject to final terms [PENDING LEGAL REVIEW].</p>`;
}

function sellPage(): string {
  return `<section class="mc-hero mc-sell-hero"><img class="mc-price-hero-image" src="${sellToUsBanner}" alt="" aria-hidden="true"><div class="mc-price-hero-content"><span class="mc-eyebrow">Gold Depot · Quote requests</span><h1>Sell to Us</h1><p>A private, transparent route to sell your gold and silver.</p></div></section>
  <section class="mc-timeline">${['Request a quote', 'Bring your metal for inspection', 'Testing and valuation', 'Settlement'].map((label, i) => `<article><span>0${i + 1}</span><h3>${label}</h3><p>${i === 3 ? '[PENDING LEGAL REVIEW]' : 'The next step will be confirmed with you.'}</p></article>`).join('')}</section>
  ${section('What we consider', 'Gold and silver items', 'Eligibility is confirmed after inspection and testing.')}
  <section class="mc-option-grid">${[['Gold bars and coins', 'Bring any available purchase or product documentation.'], ['Silver bars and coins', 'Bring the item and any available product details.'], ['Scrap gold and jewellery', 'Metal content is assessed after inspection.'], ['Scrap silver', 'Metal content is assessed after inspection.']].map(([a,b]) => `<article class="mc-panel"><h2>${a}</h2><p>${b}</p></article>`).join('')}</section>
  ${section('Indicative only', 'Estimate a metal value', 'The demo price feed and buy-back rate are placeholders; no offer or payout is generated.')}
  <form class="mc-panel mc-converter" id="sell-calculator"><label>Metal<select id="sell-metal"><option>Gold</option><option>Silver</option></select></label><label>Item type<select><option>Bar or coin</option><option>Scrap jewellery</option><option>Other</option></select></label>
  <label>Weight<input id="sell-weight" type="number" min="0.001" step="any" value="10"></label><label>Unit<select id="sell-unit"><option value="g">Grams</option><option value="oz">Troy ounces</option><option value="kg">Kilograms</option><option value="tola">Tola</option></select></label>
  <label>Purity<select><option>Not sure</option><option>24 karat</option><option>22 karat</option><option>18 karat</option><option>Fineness not known</option></select></label><output id="sell-estimate">Live pricing unavailable · indicative only</output></form>
  ${section('Get in touch', 'Request a quote', 'No instant payout. Any settlement follows inspection and testing.')}
  <section class="mc-panel mc-sell-quote-panel"><div class="mc-wizard-progress" aria-label="Quote request progress"><span id="quote-step-label">Step 1 of 4 · Item details</span><progress id="quote-progress" max="4" value="1"></progress></div>
  <form id="sell-quote-form" class="mc-form-grid">
  <fieldset data-quote-panel><legend>1. Item details</legend><label>Metal<select name="metal" required><option>Gold</option><option>Silver</option></select></label><label>Item type<select name="type"><option>Bar</option><option>Coin</option><option>Scrap</option></select></label><label>Estimated weight (g)<input name="weight" type="number" min="0.001" required></label><label>Purity<input name="purity" placeholder="Not sure"></label><label>Quantity<input name="quantity" type="number" min="1" value="1"></label><label>Photos (up to 5, max 5 MB each)<input name="photos" type="file" accept="image/*" multiple></label></fieldset>
  <fieldset data-quote-panel hidden><legend>2. Your details</legend><label>Name<input name="name" autocomplete="name" required></label><label>Email<input name="email" type="email" autocomplete="email" required></label><label>Phone<input name="phone" type="tel" required></label><label>Country<input name="country" autocomplete="country-name" required></label><label>Preferred contact<select name="preferred"><option>Email</option><option>Phone</option></select></label></fieldset>
  <fieldset data-quote-panel hidden><legend>3. Preferred route</legend><label>Route<select name="route"><option>Visit by appointment</option><option>Insured shipping [PENDING CLIENT]</option></select></label><label>Preferred date<input type="date" name="date" id="quote-date"></label><label>Preferred time<input type="time" name="time"></label><p>Appointment availability will be confirmed by our team. Slots shown here are not a booking.</p></fieldset>
  <fieldset data-quote-panel hidden><legend>4. Review and consent</legend><p>Your request is not an offer to buy or a commitment to pay.</p><label class="mc-check"><input type="checkbox" name="accuracy" required> I confirm the details are accurate.</label><label class="mc-check"><input type="checkbox" name="verification" required> I understand identity verification may be required.</label></fieldset>
  <div class="mc-form-actions mc-form-full"><button type="button" class="mc-button mc-button-outline" id="quote-back" disabled>Back</button><button type="button" class="mc-button" id="quote-next">Next</button><button type="submit" class="mc-button" id="quote-submit" hidden>Submit quote request</button><button type="button" class="mc-text-button" id="quote-clear">Clear draft</button></div><p id="quote-status" class="mc-form-status mc-form-full" aria-live="polite"></p></form></section>
  ${section('Prepare for an appointment', 'What to bring')}
  <div class="mc-info-box"><ul><li>The items you want assessed</li><li>Any available purchase or product documents</li><li>Photo identification if requested [PENDING LEGAL REVIEW]</li></ul></div>
  <p class="mc-disclaimer">Identity verification and source-of-funds checks may apply [PENDING LEGAL REVIEW]. No instant payouts. Settlement follows inspection and testing.</p>`;
}

function contactPage(): string {
  const details = [['Phone', '[PENDING CLIENT]'], ['Email', '[PENDING CLIENT]'], ['WhatsApp', '[PENDING CLIENT]'], ['Address', '[PENDING CLIENT]'], ['Opening hours', '[PENDING CLIENT]']];
  const requestedProduct = catalogueItems.find(product => product.slug === new URLSearchParams(location.search).get('product'));
  const requestedType = requestedProduct?.category === 'Dubai Collection' ? 'Dubai Collection' : 'Buying';
  const initialMessage = requestedProduct ? `I am enquiring about ${requestedProduct.name}.` : '';
  return `<section class="mc-hero"><span class="mc-eyebrow">Private client team</span><h1>Contact</h1><p>Speak to a member of our private-client team.</p></section>
  <section class="mc-contact-cards">${details.map(([name, value]) => `<article class="mc-panel"><span class="mc-eyebrow">${name}</span><h2>${value}</h2></article>`).join('')}</section>
  <section class="mc-contact-layout"><div>${section('Send us a note', 'Contact form')}
  <form class="mc-panel mc-form-grid" data-contact-form><label>Name<input name="name" autocomplete="name" required></label><label>Email<input name="email" type="email" autocomplete="email" required></label><label>Phone<input name="phone" type="tel" required></label><label>Country<input name="country" autocomplete="country-name"></label>
  <label>Enquiry type<select name="type">${['General', 'Buying', 'Selling', 'Storage', 'MC Reserve', 'Private Assets', 'Corporate gifting', 'Dubai Collection', 'Complaint'].map(x => `<option${requestedProduct && x === requestedType ? ' selected' : ''}>${x}</option>`).join('')}</select></label>
  <label>Preferred contact<select name="contact"><option>Email</option><option>Phone</option><option>WhatsApp</option></select></label><label class="mc-form-full">Message <span id="message-count">0 / 1000</span><textarea name="message" minlength="20" maxlength="1000" rows="5" required>${escapeHtml(initialMessage)}</textarea></label>
  <label class="mc-check mc-form-full"><input type="checkbox" required> I agree to be contacted regarding this enquiry.</label><label class="mc-honeypot" aria-hidden="true">Leave this empty<input name="website" tabindex="-1" autocomplete="off"></label>
  <button class="mc-button mc-form-full">Send enquiry</button><p class="mc-form-status mc-form-full" aria-live="polite"></p></form></div>
  <div>${section('By appointment', 'Book a private meeting', 'This request is subject to confirmation.')}
  <form class="mc-panel mc-form-grid" id="appointment-form"><label>Date<input type="date" name="date" id="appointment-date" required></label><label>Time preference<select name="time"><option>Morning [PENDING CLIENT]</option><option>Afternoon [PENDING CLIENT]</option></select></label><label>Purpose<select name="purpose"><option>Buying</option><option>Selling</option><option>Storage</option><option>Other</option></select></label><label>Meeting format<select name="format"><option>In person [PENDING CLIENT]</option><option>Video [PENDING CLIENT]</option></select></label><button class="mc-button mc-form-full">Request appointment</button><p class="mc-form-status mc-form-full" aria-live="polite"></p></form>
  <div class="mc-map-placeholder"><span>Location details pending confirmation</span><button type="button" class="mc-button mc-button-outline" id="load-map">Load map</button><div id="map-slot"></div></div></div></section>
  <p class="mc-disclaimer">Contact details, address, hours and complaint process are pending confirmation. Complaints procedure: [PENDING LEGAL REVIEW].</p>`;
}

function aboutPage(): string {
  return `<section class="mc-hero mc-about-hero"><img class="mc-price-hero-image" src="${aboutBanner}" alt="" aria-hidden="true"><div class="mc-price-hero-content"><span class="mc-eyebrow">Montague Cole Bullion</span><h1>About Montague Cole</h1></div></section>
  <section class="mc-about-intro"><div><span class="mc-eyebrow">Our story</span><h2>A Dubai house for physical precious metals.</h2><p>Montague Cole Bullion is the online precious-metals arm of Montague Cole Private Assets. It is being developed to serve retail investors, international buyers, collectors, Dubai visitors, corporate gifting buyers and private clients.</p><p>Founded [PENDING CLIENT]. Founders and team [PENDING CLIENT].</p></div><img class="mc-about-image" src="${privateAssetsBanner}" alt="Montague Cole Private Assets banner showcasing precious metals, diamonds, fine art and luxury watches"></section>
  ${section('Our proposition', 'A considered service', 'Built around practical needs, with details subject to confirmation.')}
  <section class="mc-formula">${[['Buy','Explore physical gold and silver.'],['Sell','Request a quote through Gold Depot.'],['Store','Discuss available storage options.'],['Document','Keep order records in MC Reserve.'],['Manage','Enquire about private tangible assets.']].map(([h,p]) => `<article><span>MC</span><h3>${h}</h3><p>${p}</p></article>`).join('')}</section>
  ${section('Our brands', 'A connected house')}
  <section class="mc-option-grid">${[['Private Assets','A private-asset enquiry channel.'],['Bullion','Physical gold and silver.'],['Dubai Collection','Prototype / Pre-order designs inspired by Dubai.'],['MC Reserve','Private client records and requests.'],['Gold Depot','Sell-to-us quote requests.']].map(([h,p]) => `<article class="mc-panel"><h2>${h}</h2><p>${p}</p></article>`).join('')}</section>
  <section class="mc-info-box"><span class="mc-eyebrow">Prototype / Pre-order</span><h2>The Dubai Collection</h2><p>Design concepts draw inspiration from Dubai’s skyline, Burj Khalifa and palm forms. These are prototypes, not in-stock products.</p></section>
  ${section('Our approach', 'Standards we are working toward')}
  <section class="mc-formula">${[['Product details','Clear specifications, once confirmed.'],['Pricing','A transparent breakdown of price components.'],['Packaging','Packaging information [PENDING CLIENT].'],['Delivery','Delivery and insurance terms [PENDING LEGAL REVIEW].'],['Storage','Storage options subject to final terms.'],['Support','Private client support. Contact details [PENDING CLIENT].']].map(([h,p]) => `<article><span>MC</span><h3>${h}</h3><p>${p}</p></article>`).join('')}</section>
  <div class="mc-info-box"><h2>Private Assets</h2><p>Diamonds, gemstones, watches, jewellery, fine art and antiques are enquiry-only. No fixed prices or checkout.</p><a href="/contact" data-modern-path="/contact">Request a private consultation</a></div>
  <section class="mc-team-placeholder"><h2>Our team</h2><p>Team profiles [PENDING CLIENT]</p></section>
  <p class="mc-disclaimer">Licences and compliance disclosures: [PENDING LEGAL REVIEW].</p>${cta('A private conversation, at your pace.', '/contact', 'Contact the team')}`;
}

function reservePage(): string {
  const email = sessionStorage.getItem('mc-demo-user') ?? '';
  if (email) return `<section class="mc-hero"><span class="mc-eyebrow">Private client area · Demo</span><h1>Welcome to MC Reserve</h1><p>Signed in as ${escapeHtml(email)} · Demo data only.</p><span class="mc-status">Indicative valuations are not shown in this release.</span></section>
    <section class="mc-dashboard-grid">${[['Orders','No demo orders'],['Documents','No demo documents'],['Owned products','No demo products'],['Open requests','No demo requests']].map(([a,b]) => `<article class="mc-panel"><span class="mc-eyebrow">${a}</span><h2>0</h2><p>${b}</p></article>`).join('')}</section>
    <section class="mc-panel"><h2>Total purchase value</h2><p>Purchase value [PENDING CLIENT]. Indicative valuations are not shown in this release.</p></section>
    <section class="mc-panel"><h2>Demo account</h2><p>This private area is a frontend demonstration; it does not provide real authentication or private records.</p><button type="button" class="mc-button mc-button-outline" id="reserve-logout">Sign out</button></section>`;
  return `<section class="mc-hero"><span class="mc-eyebrow">Private client area</span><h1>MC Reserve</h1><p>A place for documents, order and delivery tracking, and asset records.</p></section>
  <section class="mc-reserve-login"><div class="mc-reserve-benefits">${[['Documents in one place','A demo space for order documents.'],['Order and delivery tracking','View order milestones when available.'],['Asset records','Keep personal records together.']].map(([h,p]) => `<article class="mc-panel"><h2>${h}</h2><p>${p}</p></article>`).join('')}</div>
  <form class="mc-panel mc-login-form" id="reserve-login"><span class="mc-eyebrow">Demo access</span><h2>Sign in</h2><p>Use the demo account shown below. This is not production authentication.</p>
  <label>Email<input name="email" type="email" autocomplete="email" value="demo@montaguecole.example" required></label><label>Password<input name="password" type="password" minlength="12" required></label>
  <button class="mc-button">Continue to demo</button><p class="mc-form-status" aria-live="polite"></p><small>Demo account: demo@montaguecole.example · Demo data only</small></form></section>
  <p class="mc-disclaimer">No real-time valuation or custody claims are made. This route is noindex and the demo sign-in is not secure authentication.</p>`;
}

export function renderModernPage(path: string): string {
  let body: string;
  switch (path) {
    case '/live-prices': body = pricePage(); break;
    case '/catalogue': body = cataloguePage(); break;
    case '/shop': body = cataloguePage('Shop'); break;
    case '/storage': body = storagePage(); break;
    case '/sell-to-us': body = sellPage(); break;
    case '/contact': body = contactPage(); break;
    case '/about': body = aboutPage(); break;
    case '/mc-reserve': case '/mc-reserve/dashboard': body = reservePage(); break;
    default: body = path.startsWith('/catalogue/') ? productDetailsPage(path) : `<section class="mc-hero"><span class="mc-eyebrow">Montague Cole Bullion</span><h1>Page not found</h1><p>The page you requested is not available.</p><a class="mc-button" href="/" data-modern-path="/">Return home</a></section>`;
  }
  return shell(path, body);
}

export { attachModernPageHandlers } from './modern-page-interactions';
