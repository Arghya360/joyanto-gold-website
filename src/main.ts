import './style.css';
import { PRODUCTS, getProductById, getProductBySlug, makeSlug } from './data/products';
import type { Product } from './data/products';
import { BLOG_POSTS } from './data/blogs';
import type { BlogPost } from './data/blogs';
import { REVIEWS } from './data/reviews';
import { cartStore } from './store/cart';
import { renderHeader } from './components/Header';
import { renderPageBanner } from './components/PageBanner';
import { renderProductCard } from './components/ProductCard';
import { renderFilterSidebar } from './components/FilterSidebar';
import type { FilterState } from './components/FilterSidebar';
import { renderHomePage } from './components/HomePage';
import { renderFalaqFooter } from './components/Footer';
import { renderOffersPage } from './components/OffersPage';
import { renderNewArrivalsPage } from './components/NewArrivalsPage';
import { renderLoginPage } from './components/LoginPage';
import { renderProductDetailsPage } from './components/ProductDetailsPage';
import { renderCartPage } from './components/CartPage';
import { renderCheckoutPage } from './components/CheckoutPage';
import { renderWishlistPage } from './components/WishlistPage';

// ═══════════════════════════════════════════════════════════════
// ROUTER STATE
// ═══════════════════════════════════════════════════════════════
type Page = 'home' | 'shop' | 'offers' | 'new-arrivals' | 'login' | 'product' | 'cart' | 'checkout' | 'wishlist';
type CheckoutFormDraft = {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
};

let currentPage: Page = 'home';
let selectedProductSlug = '';
let detailQuantity = 1;
let detailTab: 'description' | 'reviews' = 'description';

// ── Modals & Drawer state ────────────────────────────────────
let isCartOpen = false;
let isCheckoutOpen = false;
let selectedBlog: BlogPost | null = null;
let couponFeedback = '';
let couponInputDraft = '';
let couponFeedbackType: 'success' | 'error' = 'success';
let isSubmittingOrder = false;
let checkoutFormDraft: CheckoutFormDraft = { name: '', email: '', phone: '', address: '', notes: '' };

// ── Home slider state ────────────────────────────────────────
let currentSlide = 0;
let slideInterval: ReturnType<typeof setInterval> | null = null;

// ── Shop filter state ────────────────────────────────────────
let selectedNavCategory: string = '';
let topSearchQuery: string = '';

let filters: FilterState = {
  searchQuery: '',
  selectedCategories: [],
  priceMin: 0,
  priceMax: 5000,
  selectedPackSizes: [],
  minRating: 0,
  inStockOnly: false,
};

let expandedSections: string[] = ['categories'];
let mobileFilterOpen = false;

const app = document.getElementById('app')!;

app.addEventListener('click', event => {
  const target = event.target as HTMLElement;
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

app.addEventListener('keydown', event => {
  const keyEvent = event as KeyboardEvent;
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
  currentPage = page;
  const paths: Record<Page, string> = {
    home: '/',
    shop: '/shop',
    offers: '/offers',
    'new-arrivals': '/new-arrivals',
    login: '/login',
    product: `/product/${selectedProductSlug}`,
    cart: '/cart',
    checkout: '/checkout',
    wishlist: '/wishlist',
  };
  const nextPath = paths[page];
  if (window.location.pathname !== nextPath) {
    window.history.pushState({}, '', nextPath);
  }
  if (page === 'shop') {
    if (cat) {
      selectedNavCategory = cat;
      filters.selectedCategories = [];
    }
    stopSlideshow();
  } else if (page === 'offers') {
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

function navigateToProduct(product: Product) {
  selectedProductSlug = product.slug || makeSlug(product.title, product.id);
  detailQuantity = 1;
  detailTab = 'description';
  currentPage = 'product';
  const productPath = `/product/${selectedProductSlug}`;
  if (window.location.pathname !== productPath) {
    window.history.pushState({}, '', productPath);
  }
  stopSlideshow();
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderFromLocation() {
  const pathname = decodeURIComponent(window.location.pathname).replace(/\/+$/, '') || '/';
  const productMatch = pathname.match(/^\/product\/(.+)$/);
  if (productMatch) {
    selectedProductSlug = productMatch[1];
    currentPage = 'product';
    stopSlideshow();
  } else if (pathname === '/cart') {
    currentPage = 'cart';
    stopSlideshow();
  } else if (pathname === '/checkout') {
    currentPage = 'checkout';
    stopSlideshow();
  } else if (pathname === '/wishlist') {
    currentPage = 'wishlist';
    stopSlideshow();
  } else if (pathname === '/shop') {
    currentPage = 'shop';
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
  } else {
    currentPage = 'home';
    startSlideshow();
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
function matchesProductSearch(product: Product, query: string): boolean {
  const searchableText = [
    product.title,
    product.category.replace(/-/g, ' '),
    product.description || '',
    ...(product.features || []),
  ].join(' ').toLowerCase();
  return searchableText.includes(query);
}

function getFilteredProducts(): Product[] {
  let list = [...PRODUCTS];

  if (filters.selectedCategories.length > 0) {
    list = list.filter(p => filters.selectedCategories.includes(p.category));
  } else if (selectedNavCategory && selectedNavCategory !== 'catalog') {
    list = list.filter(p => p.category === selectedNavCategory);
  }

  const q = (filters.searchQuery || topSearchQuery || '').toLowerCase().trim();
  if (q) {
    list = list.filter(p => matchesProductSearch(p, q));
  }

  if (filters.priceMax > 0) {
    list = list.filter(p => p.price >= filters.priceMin && p.price <= filters.priceMax);
  }
  if (filters.selectedPackSizes.length > 0) {
    list = list.filter(p => p.packSize && filters.selectedPackSizes.includes(p.packSize));
  }
  if (filters.minRating > 0) {
    list = list.filter(p => (p.rating ?? 5) >= filters.minRating);
  }
  if (filters.inStockOnly) {
    list = list.filter(p => p.inStock !== false);
  }

  return list;
}

function renderProductGrid(products: Product[]): string {
  if (products.length === 0) {
    return `
      <div class="no-products-found">
        <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#ccc" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <p>No products found</p>
        <span>Try adjusting your filters or search term</span>
      </div>`;
  }
  return products.map(p => renderProductCard(p)).join('');
}

// ═══════════════════════════════════════════════════════════════
// RENDER MODALS & CART DRAWER
// ═══════════════════════════════════════════════════════════════
function renderCartDrawerAndModals(): string {
  const cartItems = cartStore.getItems();
  const cartSubtotal = cartStore.getSubtotal();

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
              <div class="side-cart-item-price">AED ${item.product.price} × ${item.quantity} = AED ${item.product.price * item.quantity}</div>
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
            <span>Metal Value Subtotal:</span>
            <span style="color: #0d874c;">AED ${cartSubtotal}</span>
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
                <span>AED ${cartSubtotal}</span>
              </div>
              <div style="display:flex; justify-content:space-between; margin-bottom: 6px; color: #4b5563;">
                <span>Insured Freight:</span>
                <span id="display-delivery-fee">AED 70</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-weight:700; color:#0d874c; font-size:16px; border-top:1px dashed #D1D5DB; padding-top:8px;">
                <span>Total Invoice:</span>
                <span id="display-grand-total">AED ${cartSubtotal + 70}</span>
              </div>
            </div>

            <button type="submit" class="side-cart-checkout-btn" style="padding: 13px;">
              Confirm Allocation Order
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
  const cartCount = cartStore.getItemCount();

  if (currentPage === 'home') {
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
  } else if (currentPage === 'wishlist') {
    renderWishlist(cartCount);
  } else {
    renderShop(cartCount);
  }
}

function renderHome(cartCount: number) {
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
    if (Array.isArray(saved)) productIds = saved.filter((id): id is number => Number.isInteger(id));
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
      cartStore.addItem(product);
      showToast(`"${product.title}" added to cart!`);
      navigateTo('cart');
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
        cartStore.addItem(product, 1);
        showToast(`"${product.title}" added to cart!`);
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
        cartStore.addItem(product, 1);
        showToast(`"${product.title}" added to cart!`);
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
  const product = getProductBySlug(selectedProductSlug)
    || PRODUCTS.find(p => makeSlug(p.title, p.id) === selectedProductSlug);
  let wishlisted = false;
  try {
    const savedIds: number[] = JSON.parse(localStorage.getItem('falaqfood_wishlist_v1') || '[]');
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
  app.innerHTML = `
    ${renderCartDrawerAndModals()}
    ${renderHeader({ activeNav: 'Cart', cartCount, searchQuery: topSearchQuery, selectedNavCategory })}
    ${renderCheckoutPage({
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
      formValues: checkoutFormDraft,
    })}
    ${renderFalaqFooter()}
  `;
  attachHeaderListeners();
  attachCartAndModalListeners();
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
    cartStore.addItem(product, detailQuantity);
    showToast(`"${product.title}" added to cart!`);
    navigateTo('cart');
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
      savedIds = JSON.parse(localStorage.getItem('falaqfood_wishlist_v1') || '[]');
      if (!Array.isArray(savedIds)) savedIds = [];
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
  app.innerHTML = `
    ${renderCartDrawerAndModals()}
    ${renderHeader({ activeNav: 'Shop', cartCount, searchQuery: topSearchQuery, selectedNavCategory })}
    <main class="shop-main-bg">
      ${renderPageBanner()}
      <div class="shop-container shop-content-area">
        <div class="shop-layout-grid">
          <div class="mobile-filter-bar">
            <button class="mobile-filter-toggle-btn" id="btn-mobile-filter-open">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/>
              </svg>
              Filters
            </button>
            <span class="results-count">${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} found</span>
          </div>
          <div class="sidebar-column ${mobileFilterOpen ? 'mobile-open' : ''}" id="sidebar-column">
            ${renderFilterSidebar({ filters, expandedSections })}
          </div>
          <div class="sidebar-overlay ${mobileFilterOpen ? 'visible' : ''}" id="sidebar-overlay"></div>
          <section class="products-column">
            <div class="shop-products-grid" id="products-grid">
              ${renderProductGrid(filteredProducts)}
            </div>
          </section>
        </div>
      </div>
      ${renderFalaqFooter()}
    </main>
  `;
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
    const q = query.toLowerCase().trim();
    if (!q || q.length < 1) return [];
    return PRODUCTS.filter(product => matchesProductSearch(product, q)).slice(0, 7);
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
        data-suggest-id="${p.id}"
        role="option"
        aria-selected="false"
      >
        <img src="${p.image}" alt="${p.title}" class="suggest-thumb" />
        <div class="suggest-info">
          <div class="suggest-title">${highlightMatch(p.title, query)}</div>
          <div class="suggest-category">${p.category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
        </div>
        <div class="suggest-price">${p.price}৳</div>
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
        const product = getProductById(Number(item.dataset.suggestId));
        closeDropdown();
        if (product) navigateToProduct(product);
      });
    });

    // Click "See all" footer
    const footerBtn = dropdown.querySelector('[data-suggest-all]') as HTMLElement;
    footerBtn?.addEventListener('mousedown', (e) => {
      e.preventDefault();
      topSearchQuery = topInput.value.trim();
      filters.searchQuery = '';
      closeDropdown();
      navigateTo('shop');
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
      topSearchQuery = topInput.value.trim();
      filters.searchQuery = '';
      closeDropdown();
      navigateTo('shop');
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
    topSearchQuery = '';
    filters.searchQuery = '';
    updateClearBtn();
    closeDropdown();
    topInput.focus();
    if (currentPage === 'shop') updateProductGrid();
  });

  // Form submit
  document.getElementById('top-search-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    topSearchQuery = topInput?.value ?? '';
    filters.searchQuery = '';
    closeDropdown();
    navigateTo('shop');
  });

  // Search icon button
  document.getElementById('btn-top-search')?.addEventListener('click', () => {
    topSearchQuery = topInput?.value ?? '';
    filters.searchQuery = '';
    closeDropdown();
    navigateTo('shop');
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
  try {
    const savedIds: number[] = JSON.parse(localStorage.getItem('falaqfood_wishlist_v1') || '[]');
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
        const saved: number[] = JSON.parse(localStorage.getItem('falaqfood_wishlist_v1') || '[]');
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
      clone.setAttribute('data-cat-card', card.getAttribute('data-cat-card') || '');
      clone.classList.add('cat-clone');
      prependFragment.appendChild(clone);
    });
    catTrack.prepend(prependFragment);

    // Append clones (left-to-right order for right buffer)
    const appendFragment = document.createDocumentFragment();
    originalCards.forEach(card => {
      const clone = card.cloneNode(true) as HTMLElement;
      clone.setAttribute('data-cat-card', card.getAttribute('data-cat-card') || '');
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

    // Also re-attach click listeners on cloned cards
    track.querySelectorAll('.cat-clone[data-cat-card]').forEach(clone => {
      clone.addEventListener('click', () => {
        const catId = (clone as HTMLElement).dataset.catCard;
        if (catId) navigateTo('shop', catId);
      });
    });
  }


  // Category card click -> navigate to Shop filtered by that category
  document.querySelectorAll('[data-cat-card]').forEach(card => {
    card.addEventListener('click', () => {
      const catId = (card as HTMLElement).dataset.catCard;
      navigateTo('shop', catId);
    });
  });

  // Add to cart buttons on Recent Products
  document.querySelectorAll('[data-add]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const pid = parseInt((el as HTMLElement).dataset.add || '0', 10);
      const prod = getProductById(pid);
      if (prod) {
        cartStore.addItem(prod, 1);
        showToast(`"${prod.title}" added to cart!`);
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
  const revTrack = document.getElementById('reviews-track');
  document.getElementById('review-prev')?.addEventListener('click', () => {
    if (revTrack) revTrack.scrollBy({ left: -320, behavior: 'smooth' });
  });
  document.getElementById('review-next')?.addEventListener('click', () => {
    if (revTrack) revTrack.scrollBy({ left: 320, behavior: 'smooth' });
  });
}

// ═══════════════════════════════════════════════════════════════
// SHOP PAGE LISTENERS
// ═══════════════════════════════════════════════════════════════
function attachShopListeners() {
  // Add to cart buttons in shop grid
  document.querySelectorAll('[data-action="add-to-cart"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt((btn as HTMLElement).dataset.id || '0', 10);
      const product = PRODUCTS.find(p => p.id === id);
      if (product) {
        cartStore.addItem(product, 1);
        showToast(`"${product.title}" added to cart!`);
        isCartOpen = true;
        render();
      }
    });
  });

  // Sidebar search
  const sidebarInput = document.getElementById('sidebar-search-input') as HTMLInputElement;
  sidebarInput?.addEventListener('input', () => {
    filters.searchQuery = sidebarInput.value;
    updateProductGrid();
  });
  document.getElementById('btn-sidebar-search')?.addEventListener('click', () => {
    filters.searchQuery = sidebarInput?.value ?? '';
    updateProductGrid();
  });

  // Category checkboxes
  document.querySelectorAll('[data-filter-cat]').forEach(el => {
    el.addEventListener('change', () => {
      const catId = (el as HTMLInputElement).value;
      const checked = (el as HTMLInputElement).checked;
      if (checked) {
        if (!filters.selectedCategories.includes(catId)) filters.selectedCategories.push(catId);
      } else {
        filters.selectedCategories = filters.selectedCategories.filter(c => c !== catId);
      }
      selectedNavCategory = '';
      updateProductGrid();
    });
  });

  // Pack size checkboxes
  document.querySelectorAll('[data-filter-size]').forEach(el => {
    el.addEventListener('change', () => {
      const size = (el as HTMLInputElement).value;
      const checked = (el as HTMLInputElement).checked;
      if (checked) {
        if (!filters.selectedPackSizes.includes(size)) filters.selectedPackSizes.push(size);
      } else {
        filters.selectedPackSizes = filters.selectedPackSizes.filter(s => s !== size);
      }
      updateProductGrid();
    });
  });

  // Price range slider
  const slider = document.getElementById('price-range-slider') as HTMLInputElement;
  const pMax = document.getElementById('price-max-input') as HTMLInputElement;
  const pMin = document.getElementById('price-min-input') as HTMLInputElement;
  slider?.addEventListener('input', () => {
    filters.priceMax = parseInt(slider.value, 10);
    if (pMax) pMax.value = slider.value;
    updateProductGrid();
  });
  pMin?.addEventListener('input', () => {
    filters.priceMin = parseInt(pMin.value, 10) || 0;
    updateProductGrid();
  });
  pMax?.addEventListener('input', () => {
    filters.priceMax = parseInt(pMax.value, 10) || 5000;
    if (slider) slider.value = String(filters.priceMax);
    updateProductGrid();
  });

  // Rating filter
  document.querySelectorAll('[data-filter-rating]').forEach(el => {
    el.addEventListener('change', () => {
      filters.minRating = parseInt((el as HTMLInputElement).value, 10);
      updateProductGrid();
    });
  });

  // Stock filter
  document.querySelectorAll('[data-filter-stock]').forEach(el => {
    el.addEventListener('change', () => {
      filters.inStockOnly = (el as HTMLInputElement).value === 'in-stock';
      updateProductGrid();
    });
  });

  // Apply / Reset
  document.getElementById('btn-apply-filter')?.addEventListener('click', () => {
    mobileFilterOpen = false;
    updateProductGrid();
  });
  document.getElementById('btn-reset-filter')?.addEventListener('click', () => {
    filters = {
      searchQuery: '',
      selectedCategories: [],
      priceMin: 0,
      priceMax: 5000,
      selectedPackSizes: [],
      minRating: 0,
      inStockOnly: false
    };
    selectedNavCategory = '';
    topSearchQuery = '';
    mobileFilterOpen = false;
    render();
  });

  // Collapsible accordion
  document.querySelectorAll('[data-toggle]').forEach(el => {
    el.addEventListener('click', () => {
      const section = (el as HTMLElement).dataset.toggle || '';
      if (expandedSections.includes(section)) {
        expandedSections = expandedSections.filter(s => s !== section);
      } else {
        expandedSections.push(section);
      }
      const col = document.getElementById('sidebar-column');
      if (col) {
        col.innerHTML = renderFilterSidebar({ filters, expandedSections });
        attachShopListeners();
      }
    });
  });

  // Mobile filter drawer
  document.getElementById('btn-mobile-filter-open')?.addEventListener('click', () => {
    mobileFilterOpen = true;
    document.getElementById('sidebar-column')?.classList.add('mobile-open');
    document.getElementById('sidebar-overlay')?.classList.add('visible');
  });
  document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
    mobileFilterOpen = false;
    document.getElementById('sidebar-column')?.classList.remove('mobile-open');
    document.getElementById('sidebar-overlay')?.classList.remove('visible');
  });
}

function updateProductGrid() {
  const grid = document.getElementById('products-grid');
  const countEl = document.querySelector('.results-count');
  const filtered = getFilteredProducts();
  if (grid) {
    grid.innerHTML = renderProductGrid(filtered);
    attachShopListeners();
  }
  if (countEl) {
    countEl.textContent = `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`;
  }
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
    if (cartStore.getItems().length > 0) navigateTo('checkout');
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

  document.querySelectorAll<HTMLButtonElement>('[data-checkout-inc], [data-checkout-dec]').forEach(button => {
    button.addEventListener('click', () => {
      const increment = button.dataset.checkoutInc;
      const decrement = button.dataset.checkoutDec;
      const productId = Number(increment ?? decrement);
      const item = cartStore.getItems().find(cartItem => cartItem.product.id === productId);
      if (!item) return;
      if (decrement && item.quantity === 1) {
        cartStore.removeItem(productId);
        render();
        return;
      }
      cartStore.updateQuantity(productId, item.quantity + (increment ? 1 : -1));
      const row = document.querySelector<HTMLElement>(`[data-checkout-item="${productId}"]`);
      if (!row) return;
      const quantityOutput = row.querySelector('output');
      const imageQuantity = row.querySelector('.checkout-order-image span');
      const lineTotal = row.querySelector<HTMLElement>('[data-checkout-line-total]');
      if (quantityOutput) quantityOutput.textContent = String(item.quantity);
      if (imageQuantity) imageQuantity.textContent = String(item.quantity);
      if (lineTotal) lineTotal.textContent = `${item.product.price * item.quantity}৳`;
      const subtotal = cartStore.getSubtotal();
      const discount = cartStore.getCouponDiscountTotal();
      const fee = cartStore.getDeliveryFee();
      const total = cartStore.getTotal();
      const subtotalElement = document.getElementById('checkout-order-subtotal');
      const discountElement = document.getElementById('checkout-coupon-discount');
      const feeElement = document.getElementById('checkout-shipping-total');
      const totalElement = document.getElementById('checkout-grand-total');
      const submitButton = document.querySelector<HTMLButtonElement>('.checkout-submit-button');
      if (subtotalElement) subtotalElement.textContent = `${subtotal}৳`;
      if (discountElement) discountElement.textContent = `−${discount}৳`;
      if (feeElement) feeElement.textContent = `${fee}৳`;
      if (totalElement) totalElement.textContent = `${total}৳`;
      if (submitButton) submitButton.textContent = `PLACE ORDER · ${total}৳`;
    });
  });

  const checkoutPageForm = document.getElementById('checkout-page-form');
  checkoutPageForm?.addEventListener('input', event => {
    const field = event.target;
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;
    if (field.name in checkoutFormDraft) {
      checkoutFormDraft[field.name as keyof CheckoutFormDraft] = field.value;
    }
  });

  checkoutPageForm?.addEventListener('submit', event => {
    event.preventDefault();
    if (isSubmittingOrder) return;
    const form = event.currentTarget as HTMLFormElement;
    if (!form.reportValidity() || cartStore.getItems().length === 0) return;

    isSubmittingOrder = true;
    const submitButton = form.querySelector<HTMLButtonElement>('.checkout-submit-button');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'PLACING ORDER…';
    }
    const formData = new FormData(form);
    const details = [
      ['Name', String(formData.get('name') || '')],
      ['Email', String(formData.get('email') || '')],
      ['Phone', String(formData.get('phone') || '')],
      ['Address', String(formData.get('address') || '')],
      ['Payment', 'Verified Wire / Depository Handover'],
    ];
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const layout = form.closest('.checkout-page-layout');
    if (!layout) {
      isSubmittingOrder = false;
      return;
    }

    const success = document.createElement('section');
    success.className = 'checkout-success-panel';
    const heading = document.createElement('h2');
    heading.textContent = 'Allocation Order Confirmed!';
    const confirmation = document.createElement('p');
    confirmation.textContent = `Reference ID: #${orderId}`;
    const disclosure = document.createElement('p');
    disclosure.className = 'checkout-client-order-note';
    disclosure.textContent = 'Your bullion allocation request has been registered for this session. A Montague Cole depository officer will confirm settlement coordinates.';
    const detailList = document.createElement('div');
    detailList.className = 'checkout-success-details';
    for (const [label, value] of details) {
      const row = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = `${label}: `;
      row.append(strong, document.createTextNode(value));
      detailList.append(row);
    }
    const continueButton = document.createElement('button');
    continueButton.className = 'product-detail-add-button';
    continueButton.textContent = 'Return to Catalogue';
    continueButton.addEventListener('click', () => {
      navigateTo('home');
    });
    success.append(heading, confirmation, disclosure, detailList, continueButton);
    layout.replaceChildren(success);
    couponFeedback = '';
    couponInputDraft = '';
    couponFeedbackType = 'success';
    checkoutFormDraft = { name: '', email: '', phone: '', address: '', notes: '' };
    cartStore.clear();
    isSubmittingOrder = false;
  });

  // Checkout order submission
  document.getElementById('order-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
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
window.addEventListener('popstate', renderFromLocation);
renderFromLocation();
