import './style.css';
import { PRODUCTS, getProductById, makeSlug } from './data/products';
import type { Product } from './data/products';
import { BLOG_POSTS } from './data/blogs';
import type { BlogPost } from './data/blogs';
import { REVIEWS } from './data/reviews';
import { cartStore } from './store/cart';
import { renderHeader } from './components/Header';
import { renderPageBanner } from './components/PageBanner';
import { renderProductCard } from './components/ProductCard';
import { filterActiveCount, filtersActive, renderFilterChips, renderFilterEmptyState, renderFilterSidebar } from './components/FilterSidebar';
import { renderHomePage } from './components/HomePage';
import { renderFalaqFooter } from './components/Footer';
import { renderOffersPage } from './components/OffersPage';
import { renderNewArrivalsPage } from './components/NewArrivalsPage';
import { renderLoginPage } from './components/LoginPage';
import { renderProductDetailsPage } from './components/ProductDetailsPage';
import { renderCartPage } from './components/CartPage';
import { renderCheckoutPage } from './components/CheckoutPage';
import type { CheckoutFormDraft } from './components/CheckoutPage';
import { renderWishlistPage } from './components/WishlistPage';
import { attachModernPageHandlers, renderModernPage } from './features/modern-pages';
import { catalogueItems } from './features/modern-data';
import { toStorefrontProduct } from './features/catalogue-product-adapter';
import { createEmptyCatalogueFilters, filterCatalogueProducts } from './features/catalogue-filters';
import {
  cloneFilters,
  computeFacets,
  createEmptyFilters,
  filterProducts,
  filtersEqual,
  serializeFilterUrl,
  SHOP_CATEGORIES,
  STOCK_STATUSES,
} from './features/shop-filters';
import type { ProductFilters } from './features/shop-filters';
import { convertPriceCurrency } from './features/shop-filters';
import type { Currency } from './features/currency';
import { getSelectedCurrency } from './features/currency';
import { submitFooterNewsletter } from './services/footer-newsletter';
import {
  checkoutService,
  isMockOrder,
  isPriceFeedStale,
  isPriceLockExpired,
  orderService,
  validateInternationalPhone,
} from './services/checkout';
import type { MockOrder, PriceLock } from './services/checkout';
import { checkoutContent } from './content/checkout';
import { PRICE_LOCK_DURATION_MS, RESTRICTED_COUNTRY_CODES } from './config/checkout';

// ═══════════════════════════════════════════════════════════════
// ROUTER STATE
// ═══════════════════════════════════════════════════════════════
type Page = 'home' | 'shop' | 'offers' | 'new-arrivals' | 'login' | 'product' | 'cart' | 'checkout' | 'confirmation' | 'wishlist' | 'modern';

let currentPage: Page = 'home';
let selectedProductSlug = '';
let detailQuantity = 1;
let detailTab: 'description' | 'reviews' = 'description';
let modernPath = '';

// ── Modals & Drawer state ────────────────────────────────────
let isCartOpen = false;
let isCheckoutOpen = false;
let selectedBlog: BlogPost | null = null;
let couponFeedback = '';
let couponInputDraft = '';
let couponFeedbackType: 'success' | 'error' = 'success';
let isSubmittingOrder = false;
let checkoutFormDraft: CheckoutFormDraft = {
  fullName: '',
  email: '',
  phoneCode: '+971',
  phone: '',
  deliveryPhoneCode: '+971',
  deliveryPhone: '',
  appointmentDate: '',
  appointmentTime: '',
  country: '',
  city: '',
  street: '',
  postalCode: '',
  notes: '',
};
let checkoutDeliveryMethod: 'collection' | 'uae' | 'international' = 'collection';
let checkoutPriceLock: PriceLock | null = null;
let checkoutLockConfirmed = false;
let checkoutLockInterval: ReturnType<typeof setInterval> | null = null;
let checkoutFeedUpdatedAt: number | null = null;
let checkoutOrder: MockOrder | null = null;
let checkoutOrderPersistenceWarning = false;
let checkoutInvalidCartNotice = false;
let checkoutIdempotencyKey = '';

// ── Home slider state ────────────────────────────────────────
let currentSlide = 0;
let slideInterval: ReturnType<typeof setInterval> | null = null;
let reviewsInterval: ReturnType<typeof setInterval> | null = null;

// ── Shop filter state ────────────────────────────────────────
let selectedNavCategory: string = '';
let topSearchQuery: string = '';

let filters: ProductFilters = createEmptyFilters();
let pendingFilters: ProductFilters = cloneFilters(filters);
let invalidPriceRange = false;
let searchDebounce: ReturnType<typeof setTimeout> | null = null;

let expandedSections: string[] = ['categories'];
let mobileFilterOpen = false;
let mobileWeightsExpanded = false;

const app = document.getElementById('app')!;

function normalizeCatalogueWishlistIds(saved: unknown): number[] {
  if (!Array.isArray(saved)) return [];
  return [...new Set(saved.flatMap(value => {
    const id = Number(value);
    if (!Number.isInteger(id)) return [];
    const legacyProduct = getProductById(id);
    const product = catalogueItems.find(candidate => candidate.id === id)
      ?? catalogueItems.find(candidate => candidate.name === legacyProduct?.title);
    return product ? [product.id] : [];
  }))];
}

function addProductToCart(product: Product, quantity = 1): boolean {
  if (!cartStore.addItem(product, quantity)) {
    showToast(product.stockStatus === 'pre_order'
      ? 'This product is available for pre-order enquiry only.'
      : product.stockStatus === 'enquire'
        ? 'Please enquire about this product.'
        : 'This product is out of stock.');
    return false;
  }
  showToast(`"${product.title}" added to cart!`);
  return true;
}

function addCatalogueProductToCart(slug: string): void {
  const item = catalogueItems.find(product => product.slug === slug);
  if (!item || !addProductToCart(toStorefrontProduct(item))) return;
  isCartOpen = true;
  render();
}

app.addEventListener('click', event => {
  const target = event.target as HTMLElement;
  const accordion = target.closest<HTMLButtonElement>('.footer-accordion-trigger');
  if (accordion) {
    const listId = accordion.getAttribute('aria-controls');
    const list = listId ? document.getElementById(listId) : null;
    if (list) {
      const expanded = accordion.getAttribute('aria-expanded') === 'true';
      accordion.setAttribute('aria-expanded', String(!expanded));
      list.hidden = expanded;
    }
    return;
  }
  const modernLink = target.closest<HTMLElement>('[data-modern-path]');
  if (modernLink?.dataset.modernPath) {
    event.preventDefault();
    navigateModern(modernLink.dataset.modernPath);
    return;
  }
  const routeElement = target.closest<HTMLElement>('[data-route]');
  if (routeElement) {
    event.preventDefault();
    const route = routeElement.dataset.route;
    if (route === 'product') {
      const product = getProductById(Number(routeElement.dataset.productId));
      if (product) navigateToProduct(product);
    } else if (route === 'home' || route === 'shop' || route === 'offers' || route === 'new-arrivals' || route === 'login' || route === 'cart' || route === 'checkout' || route === 'wishlist') {
      navigateTo(route);
    }
    return;
  }
  const productCard = target.closest<HTMLElement>('[data-product-id]');
  if (!productCard || target.closest('button,[data-action="add-to-cart"],[data-add]')) return;
  const product = getProductById(Number(productCard.dataset.productId));
  if (product) {
    event.preventDefault();
    navigateToProduct(product);
  }
});

app.addEventListener('submit', event => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || form.id !== 'footer-newsletter-form') return;
  event.preventDefault();
  if (!form.reportValidity()) return;
  const emailInput = form.querySelector<HTMLInputElement>('#footer-newsletter-email');
  const submitButton = form.querySelector<HTMLButtonElement>('.footer-inbox-submit-btn');
  const status = form.querySelector<HTMLElement>('.footer-newsletter-status');
  if (!emailInput || !submitButton || !status) {
    console.error('Newsletter form is missing a required control.');
    return;
  }
  submitButton.disabled = true;
  status.textContent = 'Submitting…';
  void submitFooterNewsletter(emailInput.value).then(() => {
    status.textContent = 'Thank you. This demo submission did not update a mailing list.';
    form.reset();
  }).catch((error: unknown) => {
    console.error('Newsletter demo submission failed.', error);
    status.textContent = 'We could not submit your request. Please try again.';
  }).finally(() => {
    submitButton.disabled = false;
  });
});

app.addEventListener('invalid', event => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.id !== 'footer-newsletter-email') return;
  const status = input.form?.querySelector<HTMLElement>('.footer-newsletter-status');
  if (status) status.textContent = 'Enter a valid email address.';
}, true);

app.addEventListener('input', event => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.id !== 'footer-newsletter-email') return;
  const status = input.form?.querySelector<HTMLElement>('.footer-newsletter-status');
  if (status && input.validity.valid) status.textContent = '';
});

app.addEventListener('change', event => {
  const target = event.target;
  if (target instanceof HTMLSelectElement && target.matches('.footer-currency-dropdown')) {
    const previousCurrency = getSelectedCurrency();
    const nextCurrency = getCurrencyFromValue(target.value);
    if (!nextCurrency) {
      console.error(`Unsupported site currency selected: ${target.value}`);
      target.value = previousCurrency;
      return;
    }
    localStorage.setItem('mc-currency', target.value);
    if (currentPage === 'shop') {
      filters = convertFilterCurrency(filters, previousCurrency, nextCurrency);
      pendingFilters = convertFilterCurrency(pendingFilters, previousCurrency, nextCurrency);
      updateFilterUrl();
      render();
    } else if (currentPage === 'modern') {
      render();
    }
  }
});

app.addEventListener('keydown', event => {
  const keyEvent = event as KeyboardEvent;
  if (keyEvent.key === 'Escape' && mobileFilterOpen) {
    closeMobileFilters();
    return;
  }
  if (keyEvent.key !== 'Enter' && keyEvent.key !== ' ') return;
  const target = event.target as HTMLElement;
  const productCard = target.closest<HTMLElement>('[data-product-id][role="link"]');
  if (!productCard || target !== productCard) return;
  keyEvent.preventDefault();
  const product = getProductById(Number(productCard.dataset.productId));
  if (product) navigateToProduct(product);
});

// ═══════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════
function navigateTo(page: Page, cat?: string) {
  if (page === 'shop') {
    const params = new URLSearchParams(window.location.search);
    if (cat) params.set('category', cat === 'bars' ? 'gold-bars' : cat);
    const query = params.toString();
    navigateModern(`/shop${query ? `?${query}` : ''}`);
    return;
  }
  currentPage = page;
  const paths: Record<Page, string> = {
    home: '/',
    shop: '/catalogue',
    offers: '/offers',
    'new-arrivals': '/new-arrivals',
    login: '/login',
    product: `/product/${selectedProductSlug}`,
    cart: '/cart',
    checkout: '/checkout',
    confirmation: checkoutOrder ? `/checkout/confirmation/${checkoutOrder.reference}` : '/checkout',
    wishlist: '/wishlist',
    modern: modernPath,
  };
  const nextPath = paths[page];
  if (window.location.pathname !== nextPath) {
    window.history.pushState({}, '', nextPath);
  }
  if (page === 'offers') {
    selectedNavCategory = '';
    stopSlideshow();
  } else if (page === 'new-arrivals') {
    selectedNavCategory = '';
    stopSlideshow();
  } else if (page === 'login') {
    selectedNavCategory = '';
    stopSlideshow();
  } else if (page === 'home') {
    startSlideshow();
  } else {
    stopSlideshow();
  }
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navigateModern(path: string) {
  if (path === '/') {
    navigateTo('home');
    return;
  }
  const destination = new URL(path, window.location.origin);
  modernPath = destination.pathname;
  currentPage = 'modern';
  stopSlideshow();
  const destinationPath = `${destination.pathname}${destination.search}${destination.hash}`;
  if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== destinationPath) {
    window.history.pushState({}, '', destinationPath);
  }
  render();
  if (destination.hash) {
    document.getElementById(decodeURIComponent(destination.hash.slice(1)))?.scrollIntoView({ behavior: 'smooth' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function navigateToProduct(product: Product) {
  const catalogueProduct = catalogueItems.find(item => item.id === product.id)
    ?? catalogueItems.find(item => item.slug === product.slug || item.name === product.title);
  selectedProductSlug = catalogueProduct?.slug || product.slug || makeSlug(product.title, product.id);
  detailQuantity = 1;
  detailTab = 'description';
  navigateModern(`/catalogue/${selectedProductSlug}`);
}

function renderFromLocation() {
  const pathname = decodeURIComponent(window.location.pathname).replace(/\/+$/, '') || '/';
  const productMatch = pathname.match(/^\/product\/(.+)$/);
  const modernMatch = /^\/(live-prices|shop|catalogue(?:\/.*)?|storage|mc-reserve(?:\/.*)?|sell-to-us|about|contact)$/.test(pathname);
  if (modernMatch) {
    modernPath = pathname;
    currentPage = 'modern';
    stopSlideshow();
  } else if (productMatch) {
    const legacyProduct = PRODUCTS.find(product => makeSlug(product.title, product.id) === productMatch[1]);
    const catalogueProduct = catalogueItems.find(product => product.slug === productMatch[1])
      ?? catalogueItems.find(product => product.name === legacyProduct?.title);
    if (catalogueProduct) {
      modernPath = `/catalogue/${catalogueProduct.slug}`;
      window.history.replaceState({}, '', modernPath);
      currentPage = 'modern';
    } else {
      selectedProductSlug = productMatch[1];
      currentPage = 'product';
    }
    stopSlideshow();
  } else if (pathname === '/cart') {
    currentPage = 'cart';
    stopSlideshow();
  } else if (pathname === '/checkout') {
    currentPage = 'checkout';
    stopSlideshow();
  } else if (/^\/checkout\/confirmation\/[^/]+$/.test(pathname)) {
    currentPage = 'confirmation';
    stopSlideshow();
  } else if (pathname === '/wishlist') {
    currentPage = 'wishlist';
    stopSlideshow();
  } else if (pathname === '/offers') {
    currentPage = 'offers';
    stopSlideshow();
  } else if (pathname === '/new-arrivals') {
    currentPage = 'new-arrivals';
    stopSlideshow();
  } else if (pathname === '/login') {
    currentPage = 'login';
    stopSlideshow();
  } else if (pathname === '/') {
    currentPage = 'home';
    startSlideshow();
  } else {
    modernPath = pathname;
    currentPage = 'modern';
    stopSlideshow();
  }
  render();
}

// ═══════════════════════════════════════════════════════════════
// TOAST NOTIFICATION
// ═══════════════════════════════════════════════════════════════
function showToast(msg: string) {
  const el = document.getElementById('shop-toast');
  if (el) {
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2500);
  }
}

// ═══════════════════════════════════════════════════════════════
// HOME SLIDER
// ═══════════════════════════════════════════════════════════════
function startSlideshow() {
  stopSlideshow();
  slideInterval = setInterval(() => {
    currentSlide = (currentSlide + 1) % 4;
    updateHeroTrack();
  }, 4000);
}

function stopSlideshow() {
  if (slideInterval) {
    clearInterval(slideInterval);
    slideInterval = null;
  }
}

function updateHeroTrack() {
  const track = document.getElementById('hero-track');
  if (track) {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
  }
  document.querySelectorAll('.hero-dot').forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentSlide);
  });
}

// ═══════════════════════════════════════════════════════════════
// SHOP FILTERING
// ═══════════════════════════════════════════════════════════════
function getFilteredProducts(): Product[] {
  return filterProducts(PRODUCTS, filters, getSelectedCurrency());
}

function renderProductGrid(products: Product[]): string {
  if (products.length === 0) {
    return renderFilterEmptyState();
  }
  return products.map(p => renderProductCard(p)).join('');
}

// ═══════════════════════════════════════════════════════════════
// RENDER MODALS & CART DRAWER
// ═══════════════════════════════════════════════════════════════
function renderCartDrawerAndModals(): string {
  const cartItems = cartStore.getItems();
  const cartSubtotal = cartStore.getSubtotal();
  const hasKnownPrice = (product: Product) =>
    (product.priceSource === 'indicative' || product.priceSource === 'verified')
    && Number.isFinite(product.price) && product.price > 0;
  const hasAllCartPrices = cartItems.every(({ product }) => hasKnownPrice(product));
  const pricedSubtotal = cartItems.reduce(
    (sum, { product, quantity }) => sum + (hasKnownPrice(product) ? product.price * quantity : 0),
    0,
  );
  const formatAed = (amount: number) =>
    `AED ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const cartPricesVerified = cartItems.length > 0 && cartItems.every(({ product }) =>
    product.priceSource === 'verified' && product.stockStatus === 'in_stock');

  return `
    <!-- Toast Notification -->
    <div id="shop-toast" class="shop-toast-notification"></div>

    <!-- SIDE-CART DRAWER -->
    <div class="side-cart-backdrop ${isCartOpen ? 'open' : ''}" id="cart-backdrop"></div>
    <div class="side-cart-drawer ${isCartOpen ? 'open' : ''}" id="cart-drawer">
      <div class="side-cart-header">
        <h3>Shopping Cart</h3>
        <button class="side-cart-close" id="btn-cart-close" aria-label="Close cart">&times;</button>
      </div>
      <div class="side-cart-body">
        ${cartItems.length === 0 ? `
          <div style="text-align: center; padding: 48px 0; color: #6B7280;">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#ccc" stroke-width="1.5" style="margin: 0 auto 12px; display:block;">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <p style="font-size: 15px; margin-bottom: 16px;">No products in the cart.</p>
            <button class="side-cart-checkout-btn" id="btn-return-shop" style="display:inline-block; width:auto; padding: 9px 24px; font-size:13.5px;">
              Return to shop
            </button>
          </div>
        ` : cartItems.map(item => `
          <div class="side-cart-item">
            <img src="${item.product.image}" alt="${item.product.title}" />
            <div class="side-cart-item-info">
              <div class="side-cart-item-title">${item.product.title}</div>
              <div class="side-cart-item-price">${hasKnownPrice(item.product) ? `${item.product.priceDisplay || formatAed(item.product.price)} × ${item.quantity} = ${formatAed(item.product.price * item.quantity)} · indicative` : 'Price unavailable'}</div>
              <div class="side-cart-qty-ctrl">
                <button data-dec="${item.product.id}">-</button>
                <span>${item.quantity}</span>
                <button data-inc="${item.product.id}">+</button>
              </div>
            </div>
            <button class="side-cart-item-del" data-del="${item.product.id}" aria-label="Remove item">&times;</button>
          </div>
        `).join('')}
      </div>

      ${cartItems.length > 0 ? `
        <div class="side-cart-footer">
          <div class="side-cart-subtotal-row">
            <span>Indicative product subtotal:</span>
            <span style="color: #0d874c;">${hasAllCartPrices ? formatAed(cartSubtotal) : `${formatAed(pricedSubtotal)} · partial`}</span>
          </div>
          <button class="side-cart-checkout-btn" id="btn-open-cart-page">
            View Allocation Cart
          </button>
        </div>
      ` : ''}
    </div>

    <!-- CASH ON DELIVERY CHECKOUT MODAL -->
    <div class="checkout-modal-backdrop ${isCheckoutOpen ? 'open' : ''}" id="checkout-modal">
      <div class="checkout-modal-box">
        <div class="checkout-modal-header">
          <h3 style="font-size: 17px; font-weight: 700; color: #111827;">Direct Order &amp; Allocation Settlement</h3>
          <button id="btn-close-checkout-modal" style="font-size: 22px; cursor: pointer; border: none; background: none; color: #6b7280;">&times;</button>
        </div>
        <div class="checkout-modal-body" id="checkout-body-content">
          <form id="order-form">
            <div class="checkout-input-group">
              <label class="checkout-label">Full Legal Name *</label>
              <input type="text" id="order-name" class="checkout-input" placeholder="Enter your full legal name" required />
            </div>
            <div class="checkout-input-group">
              <label class="checkout-label">Contact Number *</label>
              <input type="tel" id="order-phone" class="checkout-input" placeholder="+971 XX XXX XXXX" required />
            </div>
            <div class="checkout-input-group">
              <label class="checkout-label">Delivery / Depository Address *</label>
              <textarea id="order-address" class="checkout-input" rows="2" placeholder="Building, suite, street or depository box" required></textarea>
            </div>
            <div class="checkout-input-group">
              <label class="checkout-label">Transit Tier</label>
              <div style="display: flex; gap: 16px; margin-top: 4px;">
                <label style="display:flex; align-items:center; gap: 6px; font-size: 13.5px; cursor: pointer;">
                  <input type="radio" name="area" value="inside" checked /> UAE Domestic / Vault (AED 70)
                </label>
                <label style="display:flex; align-items:center; gap: 6px; font-size: 13.5px; cursor: pointer;">
                  <input type="radio" name="area" value="outside" /> International Insured (AED 130)
                </label>
              </div>
            </div>

            <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 6px; padding: 14px; margin: 16px 0; font-size: 14px;">
              <div style="display:flex; justify-content:space-between; margin-bottom: 6px; color: #4b5563;">
                <span>Metal Value Subtotal:</span>
                <span>${cartPricesVerified ? `AED ${cartSubtotal}` : 'Unavailable'}</span>
              </div>
              <div style="display:flex; justify-content:space-between; margin-bottom: 6px; color: #4b5563;">
                <span>Insured Freight:</span>
                <span id="display-delivery-fee">AED 70</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-weight:700; color:#0d874c; font-size:16px; border-top:1px dashed #D1D5DB; padding-top:8px;">
                <span>Total Invoice:</span>
                <span id="display-grand-total">${cartPricesVerified ? `AED ${cartSubtotal + 70}` : 'Unavailable'}</span>
              </div>
            </div>

            <button type="submit" class="side-cart-checkout-btn" style="padding: 13px;" ${cartPricesVerified ? '' : 'disabled'}>
              ${cartPricesVerified ? 'Confirm Allocation Order' : 'Purchasing paused'}
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- BLOG DETAIL MODAL -->
    <div class="checkout-modal-backdrop ${selectedBlog ? 'open' : ''}" id="blog-modal">
      ${selectedBlog ? `
        <div class="checkout-modal-box" style="max-width: 640px;">
          <div class="checkout-modal-header">
            <h3 style="font-size: 17px; font-weight: 700; color: #111827;">${selectedBlog.title}</h3>
            <button id="btn-close-blog-modal" style="font-size: 22px; cursor: pointer; border: none; background: none; color: #6b7280;">&times;</button>
          </div>
          <div class="checkout-modal-body">
            <img src="${selectedBlog.image}" alt="${selectedBlog.title}" style="width: 100%; height: 260px; object-fit: cover; border-radius: 8px; margin-bottom: 14px;" />
            <div style="font-size: 12px; color: #6B7280; margin-bottom: 12px;">${selectedBlog.date} • ${selectedBlog.author} • ${selectedBlog.category}</div>
            <div style="font-size: 14.5px; line-height: 1.8; color: #374151; white-space: pre-line;">${selectedBlog.content}</div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════
// MAIN RENDER
// ═══════════════════════════════════════════════════════════════
function render() {
  if (currentPage !== 'home' && reviewsInterval) {
    clearInterval(reviewsInterval);
    reviewsInterval = null;
  }
  if (currentPage !== 'checkout' && currentPage !== 'confirmation') {
    document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.remove();
  }
  const cartCount = cartStore.getItemCount();

  if (currentPage === 'modern') {
    renderModern(cartCount);
  } else if (currentPage === 'home') {
    renderHome(cartCount);
  } else if (currentPage === 'offers') {
    renderOffers(cartCount);
  } else if (currentPage === 'new-arrivals') {
    renderNewArrivals(cartCount);
  } else if (currentPage === 'login') {
    renderLogin(cartCount);
  } else if (currentPage === 'product') {
    renderProductDetails(cartCount);
  } else if (currentPage === 'cart') {
    renderCart(cartCount);
  } else if (currentPage === 'checkout') {
    renderCheckout(cartCount);
  } else if (currentPage === 'confirmation') {
    renderCheckout(cartCount);
  } else if (currentPage === 'wishlist') {
    renderWishlist(cartCount);
  } else {
    renderShop(cartCount);
  }
}

function renderModern(cartCount: number) {
  app.innerHTML = `
    ${renderCartDrawerAndModals()}
    ${renderHeader({ activeNav: 'Shop', cartCount, searchQuery: '', selectedNavCategory: '' })}
    ${renderModernPage(modernPath)}
    ${renderFalaqFooter()}
  `;
  const currencySelect = app.querySelector<HTMLSelectElement>('.footer-currency-dropdown');
  if (currencySelect) currencySelect.value = localStorage.getItem('mc-currency') || 'AED';
  attachHeaderListeners();
  const modernRoot = app.querySelector<HTMLElement>('.mc-modern');
  if (modernRoot) attachModernPageHandlers(modernRoot, navigateModern, addCatalogueProductToCart);
  attachCartAndModalListeners();
}

function renderHome(cartCount: number) {
  document.title = 'Montague Cole Bullion';
  app.innerHTML = `
    ${renderCartDrawerAndModals()}
    ${renderHeader({ activeNav: 'Home', cartCount, searchQuery: '', selectedNavCategory: '' })}
    <main>
      ${renderHomePage({ currentSlide })}
    </main>
  `;
  attachHeaderListeners();
  attachHomeListeners();
  attachCartAndModalListeners();
}

function renderWishlist(cartCount: number) {
  let productIds: number[] = [];
  try {
    const saved = JSON.parse(localStorage.getItem('falaqfood_wishlist_v1') || '[]');
    productIds = normalizeCatalogueWishlistIds(saved);
    if (JSON.stringify(productIds) !== JSON.stringify(saved)) {
      localStorage.setItem('falaqfood_wishlist_v1', JSON.stringify(productIds));
    }
  } catch (error) {
    console.error('Failed to read wishlist', error);
    showToast('Unable to load wishlist. Please check browser storage settings.');
  }
  app.innerHTML = `
    ${renderCartDrawerAndModals()}
    ${renderHeader({ activeNav: 'Wishlist', cartCount, searchQuery: topSearchQuery, selectedNavCategory })}
    ${renderWishlistPage(productIds)}
    ${renderFalaqFooter()}
  `;
  attachHeaderListeners();
  document.querySelectorAll<HTMLButtonElement>('[data-wishlist-remove]').forEach(button => {
    button.addEventListener('click', () => {
      const productId = Number(button.dataset.wishlistRemove);
      try {
        const storedIds: number[] = JSON.parse(localStorage.getItem('falaqfood_wishlist_v1') || '[]');
        localStorage.setItem('falaqfood_wishlist_v1', JSON.stringify(storedIds.filter(id => id !== productId)));
      } catch (error) {
        console.error('Failed to update wishlist', error);
        showToast('Unable to update wishlist. Please check browser storage settings.');
        return;
      }
      render();
    });
  });
  document.querySelectorAll<HTMLButtonElement>('[data-action="add-to-cart"]').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      const product = getProductById(Number(button.dataset.id));
      if (!product) return;
      if (addProductToCart(product)) navigateTo('cart');
    });
  });
  attachCartAndModalListeners();
}

function renderOffers(cartCount: number) {
  app.innerHTML = `
    ${renderCartDrawerAndModals()}
    ${renderOffersPage({
      cartCount,
      topSearchQuery,
      selectedNavCategory,
    })}
  `;
  attachHeaderListeners();
  attachOffersListeners();
  attachCartAndModalListeners();
}

function attachOffersListeners() {
  // Add to cart buttons in offers grid
  document.querySelectorAll('[data-action="add-to-cart"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt((btn as HTMLElement).dataset.id || '0', 10);
      const product = PRODUCTS.find(p => p.id === id);
      if (product) {
        if (!addProductToCart(product, 1)) return;
        isCartOpen = true;
        render();
      }
    });
  });

  // More Products button
  document.getElementById('btn-offers-more-products')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('shop');
  });
}

function renderNewArrivals(cartCount: number) {
  app.innerHTML = `
    ${renderCartDrawerAndModals()}
    ${renderNewArrivalsPage({
      cartCount,
      topSearchQuery,
      selectedNavCategory,
    })}
  `;
  attachHeaderListeners();
  attachNewArrivalsListeners();
  attachCartAndModalListeners();
}

function attachNewArrivalsListeners() {
  // Add to cart buttons in new arrivals grid
  document.querySelectorAll('[data-action="add-to-cart"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt((btn as HTMLElement).dataset.id || '0', 10);
      const product = PRODUCTS.find(p => p.id === id);
      if (product) {
        if (!addProductToCart(product, 1)) return;
        isCartOpen = true;
        render();
      }
    });
  });

  // More Products button
  document.getElementById('btn-new-arrivals-more-products')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('shop');
  });
}

function renderLogin(cartCount: number) {
  app.innerHTML = `
    ${renderCartDrawerAndModals()}
    ${renderLoginPage({
      cartCount,
      topSearchQuery,
      selectedNavCategory,
    })}
  `;
  attachHeaderListeners();
  attachLoginListeners();
  attachCartAndModalListeners();
}

function renderProductDetails(cartCount: number) {
  const catalogueProduct = catalogueItems.find(item => item.slug === selectedProductSlug);
  const product = catalogueProduct ? toStorefrontProduct(catalogueProduct) : undefined;
  let wishlisted = false;
  try {
    const savedIds = normalizeCatalogueWishlistIds(JSON.parse(localStorage.getItem('falaqfood_wishlist_v1') || '[]'));
    wishlisted = product ? savedIds.includes(product.id) : false;
  } catch (error) {
    console.error('Failed to read wishlist', error);
  }

  app.innerHTML = `
    ${renderCartDrawerAndModals()}
    ${renderHeader({ activeNav: 'Shop', cartCount, searchQuery: topSearchQuery, selectedNavCategory })}
    ${renderProductDetailsPage({ product, reviews: REVIEWS, wishlisted, activeTab: detailTab })}
    ${renderFalaqFooter()}
  `;
  attachHeaderListeners();
  attachProductDetailsListeners(product);
  attachCartAndModalListeners();
}

function renderCart(cartCount: number) {
  document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.remove();
  app.innerHTML = `
    ${renderCartDrawerAndModals()}
    ${renderHeader({ activeNav: 'Cart', cartCount, searchQuery: topSearchQuery, selectedNavCategory })}
    ${renderCartPage({
      items: cartStore.getItems(),
      subtotal: cartStore.getSubtotal(),
      discountTotal: cartStore.getCouponDiscountTotal(),
      deliveryFee: cartStore.getDeliveryFee(),
      total: cartStore.getTotal(),
      deliveryZone: cartStore.getDeliveryZone(),
      couponCode: cartStore.getCouponCode(),
      couponInputValue: couponInputDraft || cartStore.getCouponCode(),
      couponMessage: couponFeedback,
      couponMessageType: couponFeedbackType,
    })}
    ${renderFalaqFooter()}
  `;
  attachHeaderListeners();
  attachCartAndModalListeners();
}

function renderCheckout(cartCount: number) {
  const confirmationPage = currentPage === 'confirmation';
  if (!confirmationPage) {
    if (!checkoutPriceLock || checkoutPriceLock.totalAed !== cartStore.getSubtotal()) {
      checkoutPriceLock = checkoutService.lockPrice(cartStore.getSubtotal());
      checkoutLockConfirmed = true;
    }
    if (!checkoutIdempotencyKey) checkoutIdempotencyKey = crypto.randomUUID();
    if (!checkoutLockInterval) checkoutLockInterval = setInterval(updateCheckoutLockDisplay, 1000);
  } else if (checkoutLockInterval) {
    clearInterval(checkoutLockInterval);
    checkoutLockInterval = null;
  }
  document.title = confirmationPage ? 'Order received | Montague Cole Bullion' : 'Checkout | Montague Cole Bullion';
  let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (!robots) {
    robots = document.createElement('meta');
    robots.name = 'robots';
    document.head.append(robots);
  }
  robots.content = 'noindex, nofollow';
  const validItems = cartStore.getItems().filter(({ product }) =>
    product.stockStatus !== 'pre_order'
      && product.stockStatus !== 'enquire'
      && product.stockStatus !== 'out_of_stock');
  if (validItems.length !== cartStore.getItems().length) {
    checkoutInvalidCartNotice = true;
    cartStore.getItems()
      .filter(({ product }) => product.stockStatus === 'pre_order'
        || product.stockStatus === 'enquire'
        || product.stockStatus === 'out_of_stock')
      .forEach(({ product }) => cartStore.removeItem(product.id));
  }
  app.innerHTML = `
    ${renderCartDrawerAndModals()}
    ${renderHeader({ activeNav: 'Cart', cartCount, searchQuery: topSearchQuery, selectedNavCategory })}
    ${renderCheckoutPage({
      items: cartStore.getItems(),
      subtotalAed: cartStore.getSubtotal(),
      deliveryMethod: checkoutDeliveryMethod,
      formValues: checkoutFormDraft,
      priceLock: checkoutPriceLock,
      lockConfirmed: checkoutLockConfirmed,
      feedIsStale: isPriceFeedStale(checkoutFeedUpdatedAt),
      invalidCartNotice: checkoutInvalidCartNotice,
      order: checkoutOrder,
      orderPersistenceWarning: checkoutOrderPersistenceWarning,
    })}
    ${renderFalaqFooter()}
  `;
  attachHeaderListeners();
  attachCartAndModalListeners();
  attachCheckoutPageListeners();
}

const CHECKOUT_DRAFT_KEY = 'mc-checkout-draft';
const CHECKOUT_ORDER_KEY = 'mc-checkout-order';
const EMPTY_CHECKOUT_DRAFT: CheckoutFormDraft = {
  fullName: '',
  email: '',
  phoneCode: '+971',
  phone: '',
  deliveryPhoneCode: '+971',
  deliveryPhone: '',
  appointmentDate: '',
  appointmentTime: '',
  country: '',
  city: '',
  street: '',
  postalCode: '',
  notes: '',
};
let checkoutLockPreviousRemaining = 10 * 60 * 1000;

function restoreCheckoutDraft() {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_DRAFT_KEY);
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return;
    const stored = parsed as Partial<Record<keyof CheckoutFormDraft | 'deliveryMethod', unknown>>;
    for (const key of [
      'fullName', 'email', 'phoneCode', 'phone', 'deliveryPhoneCode', 'deliveryPhone',
      'country', 'city', 'street', 'postalCode',
    ] as const) {
      if (typeof stored[key] === 'string') checkoutFormDraft[key] = stored[key];
    }
    if (stored.deliveryMethod === 'collection' || stored.deliveryMethod === 'uae' || stored.deliveryMethod === 'international') {
      checkoutDeliveryMethod = stored.deliveryMethod;
    }
  } catch (error) {
    console.error('Failed to restore checkout contact and address details', error);
  }
}

function persistCheckoutDraft() {
  const safeDraft = {
    fullName: checkoutFormDraft.fullName,
    email: checkoutFormDraft.email,
    phoneCode: checkoutFormDraft.phoneCode,
    phone: checkoutFormDraft.phone,
    deliveryPhoneCode: checkoutFormDraft.deliveryPhoneCode,
    deliveryPhone: checkoutFormDraft.deliveryPhone,
    deliveryMethod: checkoutDeliveryMethod,
    country: checkoutFormDraft.country,
    city: checkoutFormDraft.city,
    street: checkoutFormDraft.street,
    postalCode: checkoutFormDraft.postalCode,
  };
  try {
    sessionStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(safeDraft));
  } catch (error) {
    console.error('Failed to save checkout contact and address details', error);
  }
}

function restoreCheckoutOrder() {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_ORDER_KEY);
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);
    if (!isMockOrder(parsed)) {
      sessionStorage.removeItem(CHECKOUT_ORDER_KEY);
      console.warn('Discarded invalid mock checkout confirmation data.');
      return;
    }
    checkoutOrder = parsed;
  } catch (error) {
    console.error('Failed to restore checkout confirmation data', error);
  }
}

function canSubmitCheckoutOrder(): boolean {
  const lock = checkoutPriceLock;
  return currentPage === 'checkout'
    && !isSubmittingOrder
    && !isPriceFeedStale(checkoutFeedUpdatedAt)
    && lock !== null
    && !isPriceLockExpired(lock)
    && checkoutLockConfirmed
    && cartStore.getItems().length > 0
    && cartStore.getItems().every(({ product }) => product.priceSource === 'verified' && product.stockStatus === 'in_stock');
}

function updateCheckoutLockDisplay() {
  if (currentPage !== 'checkout' || !checkoutPriceLock) return;
  const remaining = Math.max(0, checkoutPriceLock.expiresAt - Date.now());
  const seconds = Math.ceil(remaining / 1000);
  const minutesText = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secondsText = (seconds % 60).toString().padStart(2, '0');
  const time = document.querySelector<HTMLElement>('[data-price-lock-status] time');
  if (time) time.textContent = `${minutesText}:${secondsText}`;
  const progress = document.querySelector<HTMLElement>('.checkout-price-lock-progress');
  if (progress) {
    const value = Math.round(remaining / PRICE_LOCK_DURATION_MS * 100);
    progress.setAttribute('aria-valuenow', String(value));
    const bar = progress.querySelector<HTMLElement>('span');
    if (bar) bar.style.width = `${value}%`;
  }
  const warning = document.getElementById('checkout-lock-warning');
  if (warning) warning.hidden = remaining > 60_000 || remaining === 0;
  const expired = document.querySelector<HTMLElement>('.checkout-lock-expired');
  if (expired) expired.hidden = remaining > 0;
  const liveRegion = document.getElementById('checkout-lock-live');
  if (remaining <= 0) {
    checkoutLockConfirmed = false;
    if (checkoutLockPreviousRemaining > 0 && liveRegion) liveRegion.textContent = checkoutContent.validation.expiredAnnouncement;
  } else if (checkoutLockPreviousRemaining > 300_000 && remaining <= 300_000 && liveRegion) {
    liveRegion.textContent = checkoutContent.validation.fiveMinuteAnnouncement;
  } else if (checkoutLockPreviousRemaining > 60_000 && remaining <= 60_000 && liveRegion) {
    liveRegion.textContent = checkoutContent.validation.oneMinuteAnnouncement;
  }
  const submitButton = document.querySelector<HTMLButtonElement>('.checkout-submit-button');
  if (submitButton) submitButton.disabled = !canSubmitCheckoutOrder();
  checkoutLockPreviousRemaining = remaining;
}

function updateCheckoutSectionIndicators(form: HTMLFormElement) {
  const field = (name: string) => form.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${name}"]`);
  const name = field('fullName');
  const email = field('email');
  const appointmentDate = form.querySelector<HTMLInputElement>('[name="appointmentDate"]');
  const appointmentTime = field('appointmentTime');
  const contactValid = Boolean(name?.value.trim() && name.value.trim().length >= 2)
    && Boolean(email?.value && email.checkValidity())
    && validateInternationalPhone(checkoutFormDraft.phoneCode, checkoutFormDraft.phone);
  const deliveryValid = checkoutDeliveryMethod === 'collection'
    ? Boolean(appointmentDate?.value && appointmentDate.value >= appointmentDate.min && appointmentTime?.value)
    : Boolean(field('country')?.value && field('city')?.value.trim() && field('street')?.value.trim())
      && !(checkoutDeliveryMethod === 'international' && RESTRICTED_COUNTRY_CODES.includes(checkoutFormDraft.country))
      && validateInternationalPhone(checkoutFormDraft.deliveryPhoneCode, checkoutFormDraft.deliveryPhone);
  const paymentValid = Boolean(form.querySelector<HTMLInputElement>('[name="terms"]')?.checked);
  const states: Record<string, boolean> = { contact: contactValid, delivery: deliveryValid, payment: paymentValid };
  for (const badge of form.querySelectorAll<HTMLElement>('[data-checkout-section]')) {
    const section = badge.dataset.checkoutSection;
    const number = badge.getAttribute('aria-label')?.replace('Section ', '') ?? '';
    const complete = section ? states[section] === true : false;
    badge.textContent = complete ? '✓' : number;
    badge.setAttribute('aria-label', complete ? `${section} section complete` : `Section ${number}`);
  }
}

function attachCheckoutPageListeners() {
  if (currentPage === 'confirmation') {
    document.querySelector('[data-print-order]')?.addEventListener('click', () => window.print());
    return;
  }
  const form = document.getElementById('checkout-page-form');
  if (!(form instanceof HTMLFormElement)) return;
  const summaryDetails = document.querySelector<HTMLDetailsElement>('.checkout-summary-details');
  if (summaryDetails) summaryDetails.open = window.matchMedia('(min-width: 801px)').matches;
  updateCheckoutSectionIndicators(form);

  form.addEventListener('input', event => {
    const field = event.target;
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) return;
    if (field.name in checkoutFormDraft) {
      checkoutFormDraft[field.name as keyof CheckoutFormDraft] = field.value;
      persistCheckoutDraft();
    }
    if (field.id) {
      field.removeAttribute('aria-invalid');
      const error = document.getElementById(`${field.id}-error`);
      if (error) error.textContent = '';
    }
    const noteCounter = document.getElementById('checkout-notes-count');
    if (field.name === 'notes' && noteCounter) noteCounter.textContent = `${field.value.length}/500`;
    updateCheckoutSectionIndicators(form);
  });
  form.addEventListener('change', () => updateCheckoutSectionIndicators(form));

  form.querySelectorAll<HTMLInputElement>('input[name="deliveryMethod"]').forEach(input => {
    input.addEventListener('change', () => {
      checkoutDeliveryMethod = input.value as typeof checkoutDeliveryMethod;
      persistCheckoutDraft();
      if (checkoutDeliveryMethod !== 'collection' && !checkoutFormDraft.deliveryPhone && checkoutFormDraft.phone) {
        checkoutFormDraft.deliveryPhoneCode = checkoutFormDraft.phoneCode;
        checkoutFormDraft.deliveryPhone = checkoutFormDraft.phone;
        persistCheckoutDraft();
      }
      render();
    });
  });

  form.querySelectorAll<HTMLSelectElement>('select').forEach(select => {
    select.addEventListener('change', () => {
      if (select.name in checkoutFormDraft) {
        checkoutFormDraft[select.name as keyof CheckoutFormDraft] = select.value;
        persistCheckoutDraft();
      }
      if (select.name === 'country') render();
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-checkout-inc], [data-checkout-dec]').forEach(button => {
    button.addEventListener('click', () => {
      const productId = Number(button.dataset.checkoutInc ?? button.dataset.checkoutDec);
      const item = cartStore.getItems().find(cartItem => cartItem.product.id === productId);
      if (!item) return;
      if (button.dataset.checkoutDec && item.quantity === 1) {
        if (!window.confirm(checkoutContent.validation.removeItem)) return;
        cartStore.removeItem(productId);
      } else {
        cartStore.updateQuantity(productId, item.quantity + (button.dataset.checkoutInc ? 1 : -1));
      }
      checkoutPriceLock = checkoutService.lockPrice(cartStore.getSubtotal());
      checkoutLockConfirmed = true;
      checkoutLockPreviousRemaining = PRICE_LOCK_DURATION_MS;
      render();
    });
  });

  document.querySelector('[data-confirm-new-price]')?.addEventListener('click', () => {
    checkoutPriceLock = checkoutService.lockPrice(cartStore.getSubtotal());
    checkoutLockConfirmed = true;
    checkoutLockPreviousRemaining = PRICE_LOCK_DURATION_MS;
    render();
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (isSubmittingOrder) return;
    const email = checkoutFormDraft.email.trim();
    const phoneIsValid = validateInternationalPhone(checkoutFormDraft.phoneCode, checkoutFormDraft.phone);
    const validation: Array<[string, string, boolean]> = [
      ['checkout-full-name', 'checkout-full-name-error', checkoutFormDraft.fullName.trim().length >= 2],
      ['checkout-email', 'checkout-email-error', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)],
      ['checkout-phone', 'checkout-phone-error', phoneIsValid],
    ];
    if (checkoutDeliveryMethod !== 'collection') {
      validation.push(
        ['checkout-country', 'checkout-country-error', Boolean(checkoutFormDraft.country)],
        ['checkout-city', 'checkout-city-error', Boolean(checkoutFormDraft.city.trim())],
        ['checkout-street', 'checkout-street-error', checkoutFormDraft.street.trim().length >= 5],
        ['checkout-delivery-phone', 'checkout-delivery-phone-error', validateInternationalPhone(checkoutFormDraft.deliveryPhoneCode, checkoutFormDraft.deliveryPhone)],
      );
    }
    const date = form.querySelector<HTMLInputElement>('[name="appointmentDate"]');
    const time = form.querySelector<HTMLSelectElement>('[name="appointmentTime"]');
    if (checkoutDeliveryMethod === 'collection') {
      validation.push(
        ['checkout-appointment-date', '', Boolean(date?.value && date.value >= date.min)],
        ['checkout-appointment-time', '', Boolean(time?.value)],
      );
    }
    for (const [fieldId, errorId, valid] of validation) {
      const field = document.getElementById(fieldId);
      const error = errorId ? document.getElementById(errorId) : null;
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) {
        field.setAttribute('aria-invalid', String(!valid));
      }
      if (error) error.textContent = valid ? '' : fieldId === 'checkout-full-name'
        ? checkoutContent.validation.name
        : fieldId === 'checkout-email' ? checkoutContent.validation.email
          : fieldId.includes('phone') ? checkoutContent.validation.phone
            : checkoutContent.validation.required;
    }
    const terms = form.querySelector<HTMLInputElement>('[name="terms"]');
    const submitError = document.getElementById('checkout-submit-error');
    const invalidField = validation.find(([, , valid]) => !valid);
    if (invalidField) {
      document.getElementById(invalidField[0])?.focus();
      document.getElementById(invalidField[0])?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    if (!terms?.checked) {
      terms?.setAttribute('aria-invalid', 'true');
      if (submitError) {
        submitError.hidden = false;
        submitError.textContent = checkoutContent.validation.terms;
      }
      terms?.focus();
      return;
    }
    if (checkoutDeliveryMethod === 'international' && RESTRICTED_COUNTRY_CODES.includes(checkoutFormDraft.country)) {
      if (submitError) {
        submitError.hidden = false;
        submitError.textContent = checkoutContent.validation.restrictedCountry;
      }
      return;
    }
    if (isPriceFeedStale(checkoutFeedUpdatedAt)
      || !checkoutPriceLock
      || isPriceLockExpired(checkoutPriceLock)
      || !checkoutLockConfirmed
      || !cartStore.getItems().every(({ product }) => product.priceSource === 'verified' && product.stockStatus === 'in_stock')) {
      if (submitError) {
        submitError.hidden = false;
        submitError.textContent = checkoutContent.validation.orderBlocked;
      }
      return;
    }

    isSubmittingOrder = true;
    const submitButton = form.querySelector<HTMLButtonElement>('.checkout-submit-button');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Placing order…';
    }
    try {
      const order = await orderService.createOrder({
        idempotencyKey: checkoutIdempotencyKey,
        lines: cartStore.getItems().map(({ product, quantity }) => ({
          productId: product.id,
          title: product.title,
          quantity,
          unitPriceAed: product.price,
          image: product.image,
          weight: product.packSize ?? 'Weight awaiting confirmation',
        })),
        totalAed: cartStore.getSubtotal(),
        contact: {
          fullName: checkoutFormDraft.fullName.trim(),
          email: checkoutFormDraft.email.trim(),
          phone: `${checkoutFormDraft.phoneCode} ${checkoutFormDraft.phone.trim()}`,
        },
        delivery: {
          method: checkoutDeliveryMethod,
          appointmentDate: checkoutDeliveryMethod === 'collection' ? checkoutFormDraft.appointmentDate : '',
          appointmentTime: checkoutDeliveryMethod === 'collection' ? checkoutFormDraft.appointmentTime : '',
          country: checkoutDeliveryMethod === 'collection' ? '' : checkoutFormDraft.country,
          city: checkoutDeliveryMethod === 'collection' ? '' : checkoutFormDraft.city.trim(),
          street: checkoutDeliveryMethod === 'collection' ? '' : checkoutFormDraft.street.trim(),
          postalCode: checkoutDeliveryMethod === 'collection' ? '' : checkoutFormDraft.postalCode.trim(),
          phone: checkoutDeliveryMethod === 'collection'
            ? ''
            : `${checkoutFormDraft.deliveryPhoneCode} ${checkoutFormDraft.deliveryPhone.trim()}`,
        },
        notes: checkoutFormDraft.notes.trim(),
        paymentMethod: 'bank-transfer',
      });
      try {
        sessionStorage.setItem(CHECKOUT_ORDER_KEY, JSON.stringify(order));
        checkoutOrderPersistenceWarning = false;
      } catch (error) {
        checkoutOrderPersistenceWarning = true;
        console.error('Failed to persist mock checkout confirmation data', error);
      }
      checkoutOrder = order;
      sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
      checkoutFormDraft = { ...EMPTY_CHECKOUT_DRAFT };
      checkoutPriceLock = null;
      checkoutIdempotencyKey = '';
      cartStore.clear();
      currentPage = 'confirmation';
      window.history.pushState({}, '', `/checkout/confirmation/${order.reference}`);
      render();
    } catch (error) {
      console.error('Failed to create mock checkout order', error);
      if (submitError) {
        submitError.hidden = false;
        submitError.textContent = checkoutContent.validation.orderFailed;
      }
    } finally {
      isSubmittingOrder = false;
    }
  });
}

function attachProductDetailsListeners(product: Product | undefined) {
  if (!product) return;

  document.querySelectorAll('[data-detail-quantity]').forEach(button => {
    button.addEventListener('click', () => {
      detailQuantity = Math.max(1, detailQuantity + ((button as HTMLElement).dataset.detailQuantity === 'increase' ? 1 : -1));
      const output = document.getElementById('product-detail-quantity');
      if (output) output.textContent = String(detailQuantity);
    });
  });

  document.getElementById('btn-detail-add-to-cart')?.addEventListener('click', () => {
    if (addProductToCart(product, detailQuantity)) navigateTo('cart');
  });

  document.getElementById('btn-product-back')?.addEventListener('click', () => {
    if (window.history.state) window.history.back();
    else navigateTo('shop');
  });

  document.querySelectorAll('[data-product-tab]').forEach(button => {
    button.addEventListener('click', () => {
      detailTab = (button as HTMLElement).dataset.productTab === 'reviews' ? 'reviews' : 'description';
      render();
    });
  });
  document.querySelectorAll('[data-product-tab-link]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      detailTab = 'reviews';
      render();
      document.getElementById('product-tabs')?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  document.getElementById('btn-product-wishlist')?.addEventListener('click', () => {
    let savedIds: number[] = [];
    try {
      savedIds = normalizeCatalogueWishlistIds(JSON.parse(localStorage.getItem('falaqfood_wishlist_v1') || '[]'));
      savedIds = savedIds.includes(product.id)
        ? savedIds.filter(id => id !== product.id)
        : [...savedIds, product.id];
      localStorage.setItem('falaqfood_wishlist_v1', JSON.stringify(savedIds));
    } catch (error) {
      console.error('Failed to update wishlist', error);
      showToast('Unable to save wishlist. Please check browser storage settings.');
      return;
    }
    render();
  });

  document.querySelectorAll('[data-share]').forEach(button => {
    button.addEventListener('click', async () => {
      const shareType = (button as HTMLElement).dataset.share;
      const url = window.location.href;
      if (shareType === 'copy') {
        try {
          await navigator.clipboard.writeText(url);
          showToast('Product link copied.');
        } catch (error) {
          console.error('Failed to copy product link', error);
          showToast('Unable to copy the product link.');
        }
      } else {
        const shareUrl = shareType === 'whatsapp'
          ? `https://wa.me/?text=${encodeURIComponent(`${product.title} ${url}`)}`
          : `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
      }
    });
  });
}

function attachLoginListeners() {
  // Password visibility toggle
  const pwdInput = document.getElementById('login-password') as HTMLInputElement;
  const toggleBtn = document.getElementById('btn-toggle-login-password');
  let isPasswordVisible = false;

  toggleBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    isPasswordVisible = !isPasswordVisible;
    if (pwdInput) {
      pwdInput.type = isPasswordVisible ? 'text' : 'password';
    }
    if (toggleBtn) {
      toggleBtn.innerHTML = isPasswordVisible ? `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      ` : `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      `;
    }
  });

  // Login form submit
  document.getElementById('customer-login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const phoneInput = document.getElementById('login-phone') as HTMLInputElement;
    const phone = phoneInput?.value || '';
    showToast(`Login successful! Welcome back (${phone})`);
    setTimeout(() => {
      navigateTo('home');
    }, 700);
  });

  // Lost password
  document.getElementById('btn-lost-password')?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Password reset link sent to your registered phone/email.');
  });

  // Create new account
  document.getElementById('btn-create-account-view')?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Registration is open! Please enter your phone number to sign up.');
  });
}

function renderShop(cartCount: number) {
  const filteredProducts = getFilteredProducts();
  const currency = getSelectedCurrency();
  const facets = computeFacets(PRODUCTS, filters, currency);
  const hasChanges = invalidPriceRange || !filtersEqual(filters, pendingFilters);
  app.innerHTML = `
    ${renderCartDrawerAndModals()}
    ${renderHeader({ activeNav: 'Shop', cartCount, searchQuery: topSearchQuery, selectedNavCategory })}
    <main class="shop-main-bg">
      ${renderPageBanner()}
      <div class="shop-container shop-content-area wide-screen-container">
        <div class="shop-layout-grid">
          <div class="mobile-filter-bar">
            <button class="mobile-filter-toggle-btn" id="btn-mobile-filter-open" aria-expanded="${mobileFilterOpen}" aria-controls="filter-sidebar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/>
              </svg>
              Filters (${filterActiveCount(filters)})
            </button>
            <span class="mobile-results-count">${filteredProducts.length} products found</span>
          </div>
          <div class="sidebar-column ${mobileFilterOpen ? 'mobile-open' : ''}" id="sidebar-column">
            ${renderFilterSidebar({
              filters: pendingFilters,
              facets,
              currency,
              expandedSections,
              hasChanges,
              hasActiveFilters: filtersActive(filters) || filtersActive(pendingFilters),
              mobileOpen: mobileFilterOpen,
              invalidPriceRange,
              totalProducts: PRODUCTS.length,
            })}
          </div>
          <div class="sidebar-overlay ${mobileFilterOpen ? 'visible' : ''}" id="sidebar-overlay"></div>
          <section class="products-column">
            <div class="shop-results-summary">
              <p class="results-count" aria-live="polite">Showing ${filteredProducts.length} of ${PRODUCTS.length} products</p>
              ${renderFilterChips(filters)}
            </div>
            <div class="shop-products-grid" id="products-grid">
              ${renderProductGrid(filteredProducts)}
            </div>
          </section>
        </div>
      </div>
      ${renderFalaqFooter()}
    </main>
  `;
  const currencySelect = app.querySelector<HTMLSelectElement>('.footer-currency-dropdown');
  if (currencySelect) currencySelect.value = currency;
  attachHeaderListeners();
  attachShopListeners();
  attachCartAndModalListeners();
}

// ═══════════════════════════════════════════════════════════════
// HEADER LISTENERS
// ═══════════════════════════════════════════════════════════════
function attachHeaderListeners() {
  // Brand logo
  document.getElementById('header-brand-logo')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('home');
  });

  // Nav links (Home, Shop, Offers, New Arrivals, Login)
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const nav = (el as HTMLElement).dataset.nav || '';
      closeMobileNav();
      if (nav === 'Home') {
        navigateTo('home');
      } else if (nav === 'Shop') {
        navigateTo('shop');
      } else if (nav === 'Offers') {
        navigateTo('offers');
      } else if (nav === 'New Arrivals') {
        navigateTo('new-arrivals');
      } else if (nav === 'Login') {
        navigateTo('login');
      }
    });
  });

  // Secondary Category Nav
  document.querySelectorAll('[data-cat-nav]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const catId = (el as HTMLElement).dataset.catNav || '';
      closeMobileNav();
      navigateTo('shop', catId);
    });
  });

  // ── Top Search: Full Autocomplete Implementation ──────────────
  const topInput = document.getElementById('top-search-input') as HTMLInputElement;
  const dropdown = document.getElementById('search-suggestions-dropdown') as HTMLDivElement;
  const clearBtn = document.getElementById('btn-search-clear') as HTMLButtonElement;
  let activeSuggestionIndex = -1;
  let suggestionItems: HTMLElement[] = [];

  function highlightMatch(text: string, query: string): string {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  function getSuggestions(query: string): Product[] {
    const filters = createEmptyCatalogueFilters();
    filters.query = query.trim();
    if (!filters.query) return [];
    return filterCatalogueProducts(catalogueItems, filters).slice(0, 7).map(toStorefrontProduct);
  }

  function renderDropdown(query: string) {
    if (!dropdown) return;
    const suggestions = getSuggestions(query);
    activeSuggestionIndex = -1;

    if (!query.trim() || suggestions.length === 0) {
      closeDropdown();
      return;
    }

    dropdown.innerHTML = suggestions.map((p, i) => `
      <div
        class="search-suggestion-item"
        data-suggest-index="${i}"
        data-suggest-slug="${p.slug}"
        role="option"
        aria-selected="false"
      >
        <img src="${p.image}" alt="${p.title}" class="suggest-thumb" />
        <div class="suggest-info">
          <div class="suggest-title">${highlightMatch(p.title, query)}</div>
          <div class="suggest-category">${p.category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
        </div>
        <div class="suggest-price">${p.priceDisplay}</div>
      </div>
    `).join('') + `
      <div class="search-suggestion-footer" data-suggest-all="1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        See all results for "<strong>${query}</strong>"
      </div>
    `;

    dropdown.classList.add('open');
    topInput?.setAttribute('aria-expanded', 'true');

    // Cache suggestion items for keyboard nav
    suggestionItems = Array.from(dropdown.querySelectorAll('.search-suggestion-item')) as HTMLElement[];

    // Click on item
    suggestionItems.forEach(item => {
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const slug = item.dataset.suggestSlug;
        closeDropdown();
        if (slug) navigateModern(`/catalogue/${slug}`);
      });
    });

    // Click "See all" footer
    const footerBtn = dropdown.querySelector('[data-suggest-all]') as HTMLElement;
    footerBtn?.addEventListener('mousedown', (e) => {
      e.preventDefault();
      closeDropdown();
      submitTopSearch(topInput.value);
    });
  }

  function closeDropdown() {
    if (!dropdown) return;
    dropdown.classList.remove('open');
    dropdown.innerHTML = '';
    topInput?.setAttribute('aria-expanded', 'false');
    activeSuggestionIndex = -1;
    suggestionItems = [];
  }

  function updateClearBtn() {
    if (!clearBtn) return;
    if (topInput?.value) {
      clearBtn.classList.add('visible');
    } else {
      clearBtn.classList.remove('visible');
    }
  }

  function setActiveItem(index: number) {
    suggestionItems.forEach((item, i) => {
      if (i === index) {
        item.classList.add('active');
        item.setAttribute('aria-selected', 'true');
        topInput.value = item.querySelector('.suggest-title')?.textContent || topInput.value;
        updateClearBtn();
      } else {
        item.classList.remove('active');
        item.setAttribute('aria-selected', 'false');
      }
    });
  }

  // Input — real-time suggestions
  topInput?.addEventListener('input', () => {
    updateClearBtn();
    renderDropdown(topInput.value);
  });

  // Focus — re-show dropdown if there's already text
  topInput?.addEventListener('focus', () => {
    if (topInput.value.trim()) {
      renderDropdown(topInput.value);
    }
  });

  // Keyboard navigation
  topInput?.addEventListener('keydown', (e) => {
    if (!dropdown.classList.contains('open')) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeSuggestionIndex = Math.min(activeSuggestionIndex + 1, suggestionItems.length - 1);
      setActiveItem(activeSuggestionIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeSuggestionIndex = Math.max(activeSuggestionIndex - 1, 0);
      setActiveItem(activeSuggestionIndex);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      closeDropdown();
      submitTopSearch(topInput.value);
    } else if (e.key === 'Escape') {
      closeDropdown();
    }
  });

  // Click outside → close dropdown
  document.addEventListener('click', (e) => {
    const wrapper = document.getElementById('header-search-wrapper');
    if (wrapper && !wrapper.contains(e.target as Node)) {
      closeDropdown();
    }
  }, { capture: true });

  // Clear button
  clearBtn?.addEventListener('click', () => {
    topInput.value = '';
    submitTopSearch('');
    updateClearBtn();
    closeDropdown();
    topInput.focus();
  });

  // Form submit
  document.getElementById('top-search-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    closeDropdown();
    submitTopSearch(topInput?.value ?? '');
  });

  // Search icon button
  document.getElementById('btn-top-search')?.addEventListener('click', () => {
    closeDropdown();
    submitTopSearch(topInput?.value ?? '');
  });

  // Cart button in header
  document.getElementById('btn-header-cart')?.addEventListener('click', () => {
    navigateTo('cart');
  });

  document.querySelector('[data-bottom-menu]')?.addEventListener('click', openMobileNav);

  // User profile button in header
  document.getElementById('btn-user-profile')?.addEventListener('click', () => {
    navigateTo('login');
  });

  // Mobile nav drawer toggles
  document.getElementById('btn-mobile-nav-toggle')?.addEventListener('click', openMobileNav);
  document.getElementById('btn-close-mobile-nav')?.addEventListener('click', closeMobileNav);
  document.getElementById('mobile-nav-backdrop')?.addEventListener('click', closeMobileNav);
}

function openMobileNav() {
  document.getElementById('mobile-nav-drawer')?.classList.add('open');
  document.getElementById('mobile-nav-backdrop')?.classList.add('open');
}

function closeMobileNav() {
  document.getElementById('mobile-nav-drawer')?.classList.remove('open');
  document.getElementById('mobile-nav-backdrop')?.classList.remove('open');
}

// ═══════════════════════════════════════════════════════════════
// HOME PAGE LISTENERS
// ═══════════════════════════════════════════════════════════════
function attachHomeListeners() {
  document.querySelectorAll<HTMLButtonElement>('[data-action="add-to-cart"]').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      const product = catalogueItems.find(item => item.id === Number(button.dataset.id));
      if (product) addCatalogueProductToCart(product.slug);
    });
  });

  try {
    const savedIds = normalizeCatalogueWishlistIds(JSON.parse(localStorage.getItem('falaqfood_wishlist_v1') || '[]'));
    localStorage.setItem('falaqfood_wishlist_v1', JSON.stringify(savedIds));
    document.querySelectorAll<HTMLButtonElement>('[data-home-wishlist]').forEach(button => {
      const wishlisted = savedIds.includes(Number(button.dataset.homeWishlist));
      button.setAttribute('aria-pressed', String(wishlisted));
      button.setAttribute('aria-label', `${wishlisted ? 'Remove' : 'Add'} product from wishlist`);
      button.classList.toggle('wishlisted', wishlisted);
      button.textContent = wishlisted ? '♥' : '♡';
    });
  } catch (error) {
    console.error('Failed to read wishlist', error);
    showToast('Unable to load wishlist. Please check browser storage settings.');
  }

  document.querySelectorAll<HTMLButtonElement>('[data-home-wishlist]').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      const productId = Number(button.dataset.homeWishlist);
      try {
        const saved = normalizeCatalogueWishlistIds(JSON.parse(localStorage.getItem('falaqfood_wishlist_v1') || '[]'));
        const wishlisted = saved.includes(productId);
        const next = wishlisted ? saved.filter(id => id !== productId) : [...saved, productId];
        localStorage.setItem('falaqfood_wishlist_v1', JSON.stringify(next));
        button.setAttribute('aria-pressed', String(!wishlisted));
        button.setAttribute('aria-label', `${wishlisted ? 'Add' : 'Remove'} product from wishlist`);
        button.classList.toggle('wishlisted', !wishlisted);
        button.textContent = wishlisted ? '♡' : '♥';
      } catch (error) {
        console.error('Failed to update wishlist', error);
        showToast('Unable to update wishlist. Please check browser storage settings.');
      }
    });
  });

  // Slider dot navigation
  document.querySelectorAll('[data-dot]').forEach(dot => {
    dot.addEventListener('click', () => {
      currentSlide = parseInt((dot as HTMLElement).dataset.dot || '0', 10);
      updateHeroTrack();
    });
  });

  const hero = document.querySelector<HTMLElement>('.hero-carousel-wrap');
  let swipeStartX: number | null = null;
  hero?.addEventListener('pointerdown', event => {
    swipeStartX = event.clientX;
  });
  hero?.addEventListener('pointerup', event => {
    if (swipeStartX === null) return;
    const delta = event.clientX - swipeStartX;
    swipeStartX = null;
    const slideCount = document.querySelectorAll('.hero-dot').length;
    if (Math.abs(delta) < 45 || slideCount === 0) return;
    currentSlide = (currentSlide + (delta < 0 ? 1 : slideCount - 1)) % slideCount;
    updateHeroTrack();
  });
  hero?.addEventListener('pointercancel', () => { swipeStartX = null; });

  // Side promo banners
  document.querySelectorAll('[data-promo-cat]').forEach(box => {
    box.addEventListener('click', () => {
      const cat = (box as HTMLElement).dataset.promoCat;
      navigateTo('shop', cat);
    });
  });

  // ── Category Carousel: Infinite Loop ──────────────────────
  const catTrack = document.getElementById('category-track');
  const catPrev = document.getElementById('cat-carousel-prev');
  const catNext = document.getElementById('cat-carousel-next');

  if (catTrack && catPrev && catNext) {
    // Clone all original cards and append/prepend them for infinite loop
    const originalCards = Array.from(catTrack.querySelectorAll('.category-card'));
    const CARD_W = 120;
    const GAP = parseFloat(getComputedStyle(catTrack).columnGap || getComputedStyle(catTrack).gap) || 12;
    const STEP = (originalCards[0]?.getBoundingClientRect().width || CARD_W) + GAP;
    const CLONE_COUNT = originalCards.length;

    // Prepend clones (right-to-left order to fill left buffer)
    const prependFragment = document.createDocumentFragment();
    [...originalCards].reverse().forEach(card => {
      const clone = card.cloneNode(true) as HTMLElement;
      clone.classList.add('cat-clone');
      prependFragment.appendChild(clone);
    });
    catTrack.prepend(prependFragment);

    // Append clones (left-to-right order for right buffer)
    const appendFragment = document.createDocumentFragment();
    originalCards.forEach(card => {
      const clone = card.cloneNode(true) as HTMLElement;
      clone.classList.add('cat-clone');
      appendFragment.appendChild(clone);
    });
    catTrack.appendChild(appendFragment);

    // Jump silently to the real (center) cards on init
    const bufferWidth = CLONE_COUNT * STEP;
    const track = catTrack as HTMLElement; // non-null ref for nested functions
    track.style.scrollBehavior = 'auto';
    track.scrollLeft = bufferWidth;
    requestAnimationFrame(() => {
      track.style.scrollBehavior = '';
    });

    // Scroll by one page width (number of visible cards × step)
    function getPageStep(): number {
      const visibleCount = Math.floor(track.clientWidth / STEP) || 1;
      return visibleCount * STEP;
    }

    const indicators = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-category-page]'));
    const updateCategoryIndicator = () => {
      if (indicators.length === 0) return;
      const card = track.querySelector<HTMLElement>('.category-card');
      const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || GAP;
      const step = (card?.getBoundingClientRect().width || CARD_W) + gap;
      const firstRealIndex = Math.round((track.scrollLeft - bufferWidth) / step);
      const normalizedIndex = ((firstRealIndex % CLONE_COUNT) + CLONE_COUNT) % CLONE_COUNT;
      const activeIndex = Math.floor(normalizedIndex / 3) % indicators.length;
      indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === activeIndex);
        indicator.setAttribute('aria-pressed', String(index === activeIndex));
      });
    };
    track.addEventListener('scroll', updateCategoryIndicator, { passive: true });
    indicators.forEach(indicator => {
      indicator.addEventListener('click', () => {
        const card = track.querySelector<HTMLElement>('.category-card');
        const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || GAP;
        const step = (card?.getBoundingClientRect().width || CARD_W) + gap;
        const page = Number(indicator.dataset.categoryPage || 0);
        track.scrollTo({ left: bufferWidth + page * 3 * step, behavior: 'smooth' });
      });
    });
    updateCategoryIndicator();


    function scrollCarousel(direction: 'prev' | 'next') {
      const pageStep = getPageStep();
      const totalReal = CLONE_COUNT * STEP;
      const totalBuf  = CLONE_COUNT * STEP; // same — symmetrical

      // Enable smooth scroll for the animated step
      track.style.scrollBehavior = 'smooth';
      track.scrollLeft += direction === 'next' ? pageStep : -pageStep;

      // After animation (~350ms) check if we need to silently reset
      setTimeout(() => {
        track.style.scrollBehavior = 'auto';
        const leftEdge  = totalBuf;              // start of real cards
        const rightEdge = totalBuf + totalReal;  // end of real cards

        if (track.scrollLeft < leftEdge - STEP * 0.5) {
          // Jumped into left clone zone — teleport to right real equivalent
          track.scrollLeft += totalReal;
        } else if (track.scrollLeft > rightEdge - STEP * 0.5) {
          // Jumped into right clone zone — teleport to left real equivalent
          track.scrollLeft -= totalReal;
        }

        // Re-enable smooth for next interaction
        requestAnimationFrame(() => {
          track.style.scrollBehavior = '';
        });
      }, 380);
    }

    catPrev.addEventListener('click', (e) => {
      e.preventDefault();
      scrollCarousel('prev');
    });
    catNext.addEventListener('click', (e) => {
      e.preventDefault();
      scrollCarousel('next');
    });

  }

  // Add to cart buttons on Recent Products
  document.querySelectorAll('[data-add]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const pid = parseInt((el as HTMLElement).dataset.add || '0', 10);
      const prod = getProductById(pid);
      if (prod) {
        if (!addProductToCart(prod, 1)) return;
        isCartOpen = true;
        render();
      }
    });
  });

  // "SHOP ALL PRODUCTS" button click -> navigate to shop!
  document.getElementById('btn-shop-all-products')?.addEventListener('click', () => {
    navigateTo('shop');
  });

  // Blog card "READ MORE »" click -> open blog modal
  document.querySelectorAll('[data-blog-id]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const bid = parseInt((link as HTMLElement).dataset.blogId || '0', 10);
      selectedBlog = BLOG_POSTS.find(b => b.id === bid) || null;
      render();
    });
  });

  // Reviews carousel buttons
  if (reviewsInterval) clearInterval(reviewsInterval);
  const revTrack = document.getElementById('reviews-track');
  if (revTrack && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const reviewCards = Array.from(revTrack.querySelectorAll<HTMLElement>('.review-card'));
    const wrapper = revTrack.parentElement;
    let paused = document.hidden;
    const advanceReviews = () => {
      if (paused || document.hidden || reviewCards.length < 2) return;
      const maxScroll = revTrack.scrollWidth - revTrack.clientWidth;
      const step = reviewCards[0].getBoundingClientRect().width +
        (parseFloat(getComputedStyle(revTrack).columnGap) || 20);
      if (revTrack.scrollLeft >= maxScroll - 2) {
        revTrack.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        revTrack.scrollBy({ left: step, behavior: 'smooth' });
      }
    };
    wrapper?.addEventListener('mouseenter', () => { paused = true; });
    wrapper?.addEventListener('mouseleave', () => { paused = false; });
    wrapper?.addEventListener('focusin', () => { paused = true; });
    wrapper?.addEventListener('focusout', event => {
      const relatedTarget = event.relatedTarget;
      if (!(relatedTarget instanceof Node) || !wrapper.contains(relatedTarget)) paused = false;
    });
    reviewsInterval = setInterval(advanceReviews, 4500);
  } else {
    reviewsInterval = null;
  }
}

// ═══════════════════════════════════════════════════════════════
// SHOP PAGE LISTENERS
// ═══════════════════════════════════════════════════════════════
function attachProductCardListeners() {
  document.querySelectorAll('[data-action="add-to-cart"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt((btn as HTMLElement).dataset.id || '0', 10);
      const product = PRODUCTS.find(p => p.id === id);
      if (product) {
        if (!addProductToCart(product, 1)) return;
        isCartOpen = true;
        render();
      }
    });
  });
}

function attachShopListeners() {
  attachProductCardListeners();
  const sidebarInput = document.getElementById('sidebar-search-input');
  sidebarInput?.addEventListener('input', () => {
    if (!(sidebarInput instanceof HTMLInputElement)) return;
    pendingFilters.query = sidebarInput.value.trim();
    const clearButton = document.querySelector<HTMLButtonElement>('[data-clear-search]');
    if (clearButton) clearButton.hidden = pendingFilters.query.length === 0;
    invalidPriceRange = false;
    if (searchDebounce) clearTimeout(searchDebounce);
    searchDebounce = setTimeout(applyPendingFilters, 300);
    refreshFilterActions();
  });
  sidebarInput?.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (searchDebounce) clearTimeout(searchDebounce);
      applyPendingFilters();
    }
  });
  document.getElementById('btn-sidebar-search')?.addEventListener('click', () => {
    if (sidebarInput instanceof HTMLInputElement) pendingFilters.query = sidebarInput.value.trim();
    if (searchDebounce) clearTimeout(searchDebounce);
    applyPendingFilters();
  });
  document.querySelector('[data-clear-search]')?.addEventListener('click', () => {
    pendingFilters.query = '';
    const input = document.getElementById('sidebar-search-input');
    if (input instanceof HTMLInputElement) input.value = '';
    if (searchDebounce) clearTimeout(searchDebounce);
    applyPendingFilters();
  });

  document.querySelectorAll<HTMLInputElement>('[data-filter-cat]').forEach(el => {
    el.addEventListener('change', () => {
      const category = SHOP_CATEGORIES.find(item => item.id === el.value)?.id;
      if (!category) return;
      pendingFilters.categories = el.checked
        ? [...new Set([...pendingFilters.categories, category])]
        : pendingFilters.categories.filter(item => item !== category);
      refreshFilterActions();
    });
  });
  document.querySelector('[data-clear-categories]')?.addEventListener('click', () => {
    pendingFilters.categories = [];
    document.querySelectorAll<HTMLInputElement>('[data-filter-cat]').forEach(input => { input.checked = false; });
    refreshFilterActions();
  });

  document.querySelectorAll<HTMLInputElement>('[data-filter-size]').forEach(el => {
    el.addEventListener('change', () => {
      pendingFilters.weights = el.checked
        ? [...new Set([...pendingFilters.weights, el.value])]
        : pendingFilters.weights.filter(weight => weight !== el.value);
      refreshFilterActions();
    });
  });
  document.querySelector('[data-show-more-weights]')?.addEventListener('click', () => {
    mobileWeightsExpanded = !mobileWeightsExpanded;
    if (mobileWeightsExpanded && !expandedSections.includes('all-weights')) expandedSections.push('all-weights');
    if (!mobileWeightsExpanded) expandedSections = expandedSections.filter(section => section !== 'all-weights');
    render();
  });

  const minInput = document.getElementById('price-min-input');
  const maxInput = document.getElementById('price-max-input');
  const minSlider = document.getElementById('price-min-slider');
  const maxSlider = document.getElementById('price-max-slider');
  const updatePriceRange = () => {
    const minField = document.getElementById('price-min-input');
    const maxField = document.getElementById('price-max-input');
    const minParsed = minField instanceof HTMLInputElement ? parsePriceInput(minField.value) : pendingFilters.minPrice;
    const maxParsed = maxField instanceof HTMLInputElement ? parsePriceInput(maxField.value) : pendingFilters.maxPrice;
    const malformedMin = minField instanceof HTMLInputElement && minField.value.trim() !== '' && minParsed === null;
    const malformedMax = maxField instanceof HTMLInputElement && maxField.value.trim() !== '' && maxParsed === null;
    invalidPriceRange = malformedMin || malformedMax || (minParsed !== null && maxParsed !== null && minParsed > maxParsed);
    const error = document.getElementById('filter-price-error');
    if (error) error.hidden = !invalidPriceRange;
    refreshFilterActions();
  };
  for (const input of [minInput, maxInput]) {
    input?.addEventListener('input', () => {
      if (!(input instanceof HTMLInputElement)) return;
      const value = parsePriceInput(input.value);
      if (input.id === 'price-min-input') pendingFilters.minPrice = value;
      else pendingFilters.maxPrice = value;
      invalidPriceRange = input.value.trim() !== '' && value === null;
      updatePriceRange();
    });
  }
  for (const slider of [minSlider, maxSlider]) {
    slider?.addEventListener('input', () => {
      if (!(slider instanceof HTMLInputElement)) return;
      const rangeMin = Number(slider.min);
      const rangeMax = Number(slider.max);
      const value = Number(slider.value);
      if (slider.id === 'price-min-slider') {
        const maxValue = document.getElementById('price-max-slider');
        if (maxValue instanceof HTMLInputElement && value > Number(maxValue.value)) maxValue.value = String(value);
      } else {
        const minValue = document.getElementById('price-min-slider');
        if (minValue instanceof HTMLInputElement && value < Number(minValue.value)) minValue.value = String(value);
      }
      const minRange = document.getElementById('price-min-slider');
      const maxRange = document.getElementById('price-max-slider');
      const selectedMin = minRange instanceof HTMLInputElement ? Number(minRange.value) : rangeMin;
      const selectedMax = maxRange instanceof HTMLInputElement ? Number(maxRange.value) : rangeMax;
      pendingFilters.minPrice = selectedMin > rangeMin ? selectedMin : null;
      pendingFilters.maxPrice = selectedMax < rangeMax ? selectedMax : null;
      const minNumber = document.getElementById('price-min-input');
      const maxNumber = document.getElementById('price-max-input');
      if (minNumber instanceof HTMLInputElement) minNumber.value = pendingFilters.minPrice === null ? '' : String(pendingFilters.minPrice);
      if (maxNumber instanceof HTMLInputElement) maxNumber.value = pendingFilters.maxPrice === null ? '' : String(pendingFilters.maxPrice);
      updatePriceRange();
    });
  }

  document.querySelectorAll<HTMLInputElement>('[data-filter-stock]').forEach(el => {
    el.addEventListener('change', () => {
      const status = STOCK_STATUSES.find(item => item.id === el.value)?.id;
      if (!status) return;
      pendingFilters.stock = el.checked
        ? [...new Set([...pendingFilters.stock, status])]
        : pendingFilters.stock.filter(item => item !== status);
      refreshFilterActions();
    });
  });

  document.getElementById('btn-apply-filter')?.addEventListener('click', applyPendingFilters);
  document.getElementById('btn-reset-filter')?.addEventListener('click', resetShopFilters);
  document.querySelectorAll<HTMLElement>('[data-clear-filter]').forEach(button => {
    button.addEventListener('click', () => clearAppliedFilter(button.dataset.clearFilter ?? ''));
  });
  document.querySelectorAll<HTMLElement>('[data-clear-all-filters]').forEach(button => {
    button.addEventListener('click', resetShopFilters);
  });

  document.querySelectorAll<HTMLButtonElement>('.filter-sidebar [data-toggle]').forEach(button => {
    button.addEventListener('click', () => {
      const section = button.dataset.toggle ?? '';
      const panelId = button.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      if (panel) panel.hidden = expanded;
      button.querySelector('.filter-toggle-btn')?.classList.toggle('minus', !expanded);
      button.querySelector('.filter-toggle-btn')?.classList.toggle('plus', expanded);
      const icon = button.querySelector<HTMLElement>('.filter-toggle-btn');
      if (icon) icon.textContent = expanded ? '+' : '−';
      expandedSections = expanded
        ? expandedSections.filter(item => item !== section)
        : [...new Set([...expandedSections, section])];
    });
  });

  document.getElementById('btn-mobile-filter-open')?.addEventListener('click', () => {
    openMobileFilters();
  });
  document.getElementById('btn-mobile-filter-close')?.addEventListener('click', () => closeMobileFilters());
  document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
    closeMobileFilters();
  });
}

function parsePriceInput(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function refreshFilterActions(): void {
  const applyButton = document.getElementById('btn-apply-filter');
  const resetButton = document.getElementById('btn-reset-filter');
  if (applyButton instanceof HTMLButtonElement) {
    applyButton.disabled = invalidPriceRange || filtersEqual(filters, pendingFilters);
  }
  if (resetButton instanceof HTMLButtonElement) {
    resetButton.disabled = !filtersActive(filters) && !filtersActive(pendingFilters);
  }
}

function applyPendingFilters(): void {
  if (invalidPriceRange) return;
  const changed = !filtersEqual(filters, pendingFilters);
  filters = cloneFilters(pendingFilters);
  topSearchQuery = filters.query;
  selectedNavCategory = '';
  if (changed) updateFilterUrl();
  closeMobileFilters(false);
  render();
}

function resetShopFilters(): void {
  filters = createEmptyFilters();
  pendingFilters = cloneFilters(filters);
  invalidPriceRange = false;
  topSearchQuery = '';
  selectedNavCategory = '';
  if (searchDebounce) clearTimeout(searchDebounce);
  updateFilterUrl();
  closeMobileFilters(false);
  render();
}

function clearAppliedFilter(key: string): void {
  const updated = cloneFilters(filters);
  if (key === 'query') updated.query = '';
  else if (key === 'price') {
    updated.minPrice = null;
    updated.maxPrice = null;
  } else if (key.startsWith('category:')) {
    updated.categories = updated.categories.filter(category => category !== key.slice('category:'.length));
  } else if (key.startsWith('weight:')) {
    updated.weights = updated.weights.filter(weight => weight !== key.slice('weight:'.length));
  } else if (key.startsWith('stock:')) {
    updated.stock = updated.stock.filter(status => status !== key.slice('stock:'.length));
  } else return;
  filters = updated;
  pendingFilters = cloneFilters(updated);
  topSearchQuery = updated.query;
  invalidPriceRange = false;
  updateFilterUrl();
  render();
}

function updateFilterUrl(): void {
  const search = serializeFilterUrl(window.location.search, filters, true);
  const destination = `${window.location.pathname}${search}${window.location.hash}`;
  if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== destination) {
    window.history.pushState({}, '', destination);
  }
}

function submitTopSearch(query: string): void {
  const search = query.trim();
  navigateModern(search ? `/catalogue?q=${encodeURIComponent(search)}` : '/catalogue');
}

function openMobileFilters(): void {
  mobileFilterOpen = true;
  document.body.classList.add('filters-open');
  document.getElementById('sidebar-column')?.classList.add('mobile-open');
  document.getElementById('sidebar-overlay')?.classList.add('visible');
  document.getElementById('btn-mobile-filter-open')?.setAttribute('aria-expanded', 'true');
  document.getElementById('btn-mobile-filter-close')?.focus();
}

function closeMobileFilters(restoreFocus = true): void {
  mobileFilterOpen = false;
  document.body.classList.remove('filters-open');
  document.getElementById('sidebar-column')?.classList.remove('mobile-open');
  document.getElementById('sidebar-overlay')?.classList.remove('visible');
  document.getElementById('btn-mobile-filter-open')?.setAttribute('aria-expanded', 'false');
  if (restoreFocus) document.getElementById('btn-mobile-filter-open')?.focus();
}

function convertFilterCurrency(filtersToConvert: ProductFilters, from: Currency, to: Currency): ProductFilters {
  const converted = cloneFilters(filtersToConvert);
  if (converted.minPrice !== null) converted.minPrice = convertPriceCurrency(converted.minPrice, from, to);
  if (converted.maxPrice !== null) converted.maxPrice = convertPriceCurrency(converted.maxPrice, from, to);
  return converted;
}

function getCurrencyFromValue(value: string): Currency | null {
  const currencies: readonly Currency[] = ['AED', 'USD', 'EUR', 'GBP', 'INR', 'SAR'];
  return currencies.find(currency => currency === value) ?? null;
}

// ═══════════════════════════════════════════════════════════════
// CART & MODALS LISTENERS
// ═══════════════════════════════════════════════════════════════
function attachCartAndModalListeners() {
  // Cart close button
  document.getElementById('btn-cart-close')?.addEventListener('click', () => {
    isCartOpen = false;
    render();
  });

  // Cart backdrop click
  document.getElementById('cart-backdrop')?.addEventListener('click', () => {
    isCartOpen = false;
    render();
  });

  // Return to shop from empty cart
  document.getElementById('btn-return-shop')?.addEventListener('click', () => {
    isCartOpen = false;
    navigateTo('shop');
  });

  // Cart increment / decrement / delete
  document.querySelectorAll('[data-inc]').forEach(btn => {
    btn.addEventListener('click', () => {
      const pid = parseInt((btn as HTMLElement).dataset.inc || '0', 10);
      const item = cartStore.getItems().find(i => i.product.id === pid);
      if (item) {
        cartStore.updateQuantity(pid, item.quantity + 1);
        render();
      }
    });
  });

  document.querySelectorAll('[data-dec]').forEach(btn => {
    btn.addEventListener('click', () => {
      const pid = parseInt((btn as HTMLElement).dataset.dec || '0', 10);
      const item = cartStore.getItems().find(i => i.product.id === pid);
      if (item) {
        if (item.quantity > 1) {
          cartStore.updateQuantity(pid, item.quantity - 1);
        } else {
          cartStore.removeItem(pid);
        }
        render();
      }
    });
  });

  document.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', () => {
      const pid = parseInt((btn as HTMLElement).dataset.del || '0', 10);
      cartStore.removeItem(pid);
      render();
    });
  });

  document.getElementById('btn-open-cart-page')?.addEventListener('click', () => {
    isCartOpen = false;
    navigateTo('cart');
  });

  // Close checkout modal
  document.getElementById('btn-close-checkout-modal')?.addEventListener('click', () => {
    isCheckoutOpen = false;
    render();
  });

  document.getElementById('checkout-modal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('checkout-modal')) {
      isCheckoutOpen = false;
      render();
    }
  });

  document.querySelectorAll<HTMLInputElement>('input[name="cart-area"], input[name="checkout-area"]').forEach(radio => {
    radio.addEventListener('change', () => {
      cartStore.setDeliveryZone(radio.value as 'inside_dhaka' | 'outside_dhaka');
      render();
    });
  });

  document.querySelectorAll<HTMLInputElement>('input[name="area"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const fee = radio.value === 'inside' ? 70 : 130;
      const feeElement = document.getElementById('display-delivery-fee');
      const totalElement = document.getElementById('display-grand-total');
      const total = Math.max(0, cartStore.getSubtotal() + fee - cartStore.getCouponDiscountTotal());
      if (feeElement) feeElement.textContent = `${fee} ৳`;
      if (totalElement) totalElement.textContent = `${total} ৳`;
    });
  });

  document.getElementById('btn-cart-proceed-checkout')?.addEventListener('click', () => {
    const items = cartStore.getItems();
    if (items.length === 0) return;
    navigateTo('checkout');
  });

  document.getElementById('btn-cart-change-address')?.addEventListener('click', () => {
    document.getElementById('cart-delivery-options')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  document.querySelectorAll<HTMLFormElement>('#cart-coupon-form, #checkout-coupon-form').forEach(form => {
    const input = form.querySelector<HTMLInputElement>('input[name="coupon"]');
    input?.addEventListener('input', () => {
      couponInputDraft = input.value;
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      couponInputDraft = input?.value.trim() ?? '';
      const applied = cartStore.applyCoupon(couponInputDraft);
      couponFeedbackType = applied ? 'success' : 'error';
      couponFeedback = applied
        ? 'Coupon AR10 applied — 10% off your products.'
        : 'That coupon code is not valid. Try AR10.';
      if (applied) couponInputDraft = '';
      render();
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-remove-coupon]').forEach(button => {
    button.addEventListener('click', () => {
      cartStore.removeCoupon();
      couponInputDraft = '';
      couponFeedback = 'Coupon removed.';
      couponFeedbackType = 'success';
      render();
    });
  });

  // Checkout order submission
  document.getElementById('order-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const items = cartStore.getItems();
    if (!items.length || !items.every(({ product }) =>
      product.priceSource === 'verified' && product.stockStatus === 'in_stock')) {
      showToast('Purchasing is paused until prices and availability are confirmed.');
      return;
    }
    const name = (document.getElementById('order-name') as HTMLInputElement).value;
    const phone = (document.getElementById('order-phone') as HTMLInputElement).value;
    const address = (document.getElementById('order-address') as HTMLInputElement).value;
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    const modalBox = document.querySelector('.checkout-modal-box');
    if (modalBox) {
      modalBox.innerHTML = `
        <div style="padding: 36px 24px; text-align: center;">
          <div style="width: 60px; height: 60px; background: #ECFDF5; color: #0D874C; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 26px; font-weight: 700;">
            ✓
          </div>
          <h3 style="font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 8px;">Allocation Confirmed</h3>
          <p style="font-size: 14px; color: #4B5563; margin-bottom: 16px;">Reference: <b>#${orderId}</b></p>
          <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 14px; text-align: left; font-size: 13.5px; line-height: 1.7; margin-bottom: 22px;">
            <div><b>Client:</b> ${name}</div>
            <div><b>Phone:</b> ${phone}</div>
            <div><b>Destination:</b> ${address}</div>
            <div><b>Settlement:</b> Verified Wire / Depository Handover</div>
          </div>
          <button class="side-cart-checkout-btn" id="btn-finish-order">Return to Catalogue</button>
        </div>
      `;
      cartStore.clear();
      document.getElementById('btn-finish-order')?.addEventListener('click', () => {
        isCheckoutOpen = false;
        navigateTo('home');
      });
    }
  });

  // Blog modal close
  document.getElementById('btn-close-blog-modal')?.addEventListener('click', () => {
    selectedBlog = null;
    render();
  });
  document.getElementById('blog-modal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('blog-modal')) {
      selectedBlog = null;
      render();
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// CART SUBSCRIPTION
// ═══════════════════════════════════════════════════════════════
cartStore.subscribe(() => {
  const badge = document.getElementById('header-cart-badge');
  if (badge) {
    badge.textContent = String(cartStore.getItemCount());
  }
});

// ═══════════════════════════════════════════════════════════════
// BOOTSTRAP
// ═══════════════════════════════════════════════════════════════
restoreCheckoutDraft();
restoreCheckoutOrder();
window.addEventListener('popstate', renderFromLocation);
renderFromLocation();
