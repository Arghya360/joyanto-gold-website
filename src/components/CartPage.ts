import type { CartItem } from '../store/cart';
import type { Product } from '../data/products';

export interface CartPageProps {
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  deliveryFee: number;
  total: number;
  deliveryZone: 'inside_dhaka' | 'outside_dhaka';
  couponCode: string;
  couponInputValue: string;
  couponMessage: string;
  couponMessageType: 'success' | 'error';
}

export function renderCartPage(props: CartPageProps): string {
  const { items, subtotal, discountTotal, couponCode, couponInputValue, couponMessage, couponMessageType } = props;
  const pricesVerified = items.length > 0 && items.every(({ product }) =>
    product.priceSource === 'verified' && product.stockStatus === 'in_stock');
  const hasKnownPrice = (product: Product) =>
    (product.priceSource === 'indicative' || product.priceSource === 'verified')
    && Number.isFinite(product.price) && product.price > 0;
  const formatAed = (amount: number) =>
    `AED ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const allItemsPriced = items.every(({ product }) => hasKnownPrice(product));
  const pricedSubtotal = items.reduce(
    (sum, { product, quantity }) => sum + (hasKnownPrice(product) ? product.price * quantity : 0),
    0,
  );
  const safeCouponInputValue = couponInputValue.replace(/[&<>"']/g, character => {
    switch (character) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      default: return '&#39;';
    }
  });
  return `
    <main class="commerce-page shop-container wide-screen-container cart-page">
      <nav class="commerce-breadcrumbs" aria-label="Breadcrumb"><a href="/" data-route="home">Home</a><span>/</span><span>Shopping Cart</span></nav>
      <h1 class="commerce-page-title">CART</h1>
      ${items.length === 0 ? `
        <div class="commerce-empty-state">
          <span class="empty-cart-icon" aria-hidden="true">🛒</span><h2>Your cart is empty</h2>
          <p>Explore the shop and add something you love.</p>
          <button type="button" class="product-detail-add-button" data-route="shop">CONTINUE SHOPPING</button>
        </div>
      ` : `
        <div class="cart-page-layout">
          <div class="cart-page-left-column">
            <section class="cart-table-card" aria-label="Cart items">
              <div class="cart-table-header">
                <span>Product</span><span>Price</span><span>Quantity</span><span>Subtotal</span>
              </div>
              ${items.map(({ product, quantity }) => `
                <article class="cart-page-item" data-cart-item="${product.id}">
                  <button type="button" class="cart-page-remove" data-del="${product.id}" aria-label="Remove ${product.title}">&times;</button>
                  <a class="cart-page-item-image" href="/catalogue/${product.slug}" data-modern-path="/catalogue/${product.slug}" aria-label="View ${product.title}">
                    <img src="${product.image}" alt="${product.title}" />
                  </a>
                  <div class="cart-page-item-info">
                    <h2><a href="/catalogue/${product.slug}" data-modern-path="/catalogue/${product.slug}">${product.title}</a></h2>
                    <p>${product.packSize ?? 'Product'}</p>
                  </div>
                  <strong class="cart-page-unit-price">${hasKnownPrice(product) ? product.priceDisplay || formatAed(product.price) : 'Price unavailable'}</strong>
                  <div class="commerce-quantity-control" aria-label="Quantity for ${product.title}">
                    <button type="button" data-dec="${product.id}" aria-label="Decrease quantity">−</button>
                    <output>${quantity}</output>
                    <button type="button" data-inc="${product.id}" aria-label="Increase quantity">+</button>
                  </div>
                  <strong class="cart-page-item-subtotal">${hasKnownPrice(product) ? formatAed(product.price * quantity) : 'Unavailable'}</strong>
                </article>
              `).join('')}
            </section>

            <form class="coupon-card" id="cart-coupon-form">
              <label class="visually-hidden" for="cart-coupon-code">Coupon code</label>
              <input id="cart-coupon-code" name="coupon" type="text" placeholder="Coupon code" value="${safeCouponInputValue}" autocomplete="off" ${pricesVerified ? '' : 'disabled'} />
              <button type="submit" class="coupon-apply-button" ${pricesVerified ? '' : 'disabled'}>${couponCode ? 'APPLIED' : 'APPLY COUPON'}</button>
              ${couponCode ? '<button type="button" class="coupon-remove-button" data-remove-coupon>Remove</button>' : ''}
              ${couponMessage ? `<p class="coupon-feedback ${couponMessageType}" role="status">${couponMessage}</p>` : ''}
            </form>
            <button type="button" class="cart-continue-link" data-route="shop">← Continue shopping</button>
          </div>

          <aside class="cart-summary">
            <h2>Order Valuation</h2>
            <div class="cart-summary-row"><span>${pricesVerified ? 'Product subtotal' : 'Indicative product subtotal'}</span><strong>${allItemsPriced ? formatAed(subtotal) : `${formatAed(pricedSubtotal)} · some prices unavailable`}</strong></div>
            <div class="cart-shipping-section">
              <h3>Delivery &amp; Insurance</h3>
              <strong class="cart-shipping-current">To be confirmed</strong>
              <p>Delivery, insurance and applicable taxes are not included in the indicative product subtotal.</p>
            </div>
            ${pricesVerified && couponCode ? `<div class="cart-summary-row cart-discount-row"><span>Concession (${couponCode})</span><strong>−AED ${discountTotal}</strong></div>` : ''}
            <div class="cart-summary-row cart-total-row"><span>Order total</span><strong>${pricesVerified ? formatAed(props.total) : 'To be confirmed'}</strong></div>
            ${pricesVerified ? '' : '<p role="status">Displayed product prices are indicative. Purchasing remains paused until price, availability and delivery terms are confirmed.</p>'}
            <button type="button" class="product-detail-add-button cart-checkout-button" id="btn-cart-proceed-checkout">${pricesVerified ? 'PROCEED TO CHECKOUT' : 'PURCHASING PAUSED · VIEW DETAILS'}</button>
          </aside>
        </div>
      `}
    </main>
  `;
}
