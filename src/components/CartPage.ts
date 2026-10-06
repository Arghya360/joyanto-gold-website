import type { CartItem } from '../store/cart';

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
  const { items, subtotal, discountTotal, deliveryFee, total, deliveryZone, couponCode, couponInputValue, couponMessage, couponMessageType } = props;
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
    <main class="commerce-page shop-container cart-page">
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
                  <a class="cart-page-item-image" href="/product/${product.slug}" data-product-id="${product.id}" aria-label="View ${product.title}">
                    <img src="${product.image}" alt="${product.title}" />
                  </a>
                  <div class="cart-page-item-info">
                    <h2><a href="/product/${product.slug}" data-product-id="${product.id}">${product.title}</a></h2>
                    <p>${product.packSize ?? 'Product'}</p>
                  </div>
                  <strong class="cart-page-unit-price">${product.price}৳</strong>
                  <div class="commerce-quantity-control" aria-label="Quantity for ${product.title}">
                    <button type="button" data-dec="${product.id}" aria-label="Decrease quantity">−</button>
                    <output>${quantity}</output>
                    <button type="button" data-inc="${product.id}" aria-label="Increase quantity">+</button>
                  </div>
                  <strong class="cart-page-item-subtotal">${product.price * quantity}৳</strong>
                </article>
              `).join('')}
            </section>

            <form class="coupon-card" id="cart-coupon-form">
              <label class="visually-hidden" for="cart-coupon-code">Coupon code</label>
              <input id="cart-coupon-code" name="coupon" type="text" placeholder="Coupon code" value="${safeCouponInputValue}" autocomplete="off" />
              <button type="submit" class="coupon-apply-button">${couponCode ? 'APPLIED' : 'APPLY COUPON'}</button>
              ${couponCode ? '<button type="button" class="coupon-remove-button" data-remove-coupon>Remove</button>' : ''}
              ${couponMessage ? `<p class="coupon-feedback ${couponMessageType}" role="status">${couponMessage}</p>` : ''}
            </form>
            <button type="button" class="cart-continue-link" data-route="shop">← Continue shopping</button>
          </div>

          <aside class="cart-summary">
            <h2>Cart Totals</h2>
            <div class="cart-summary-row"><span>Subtotal</span><strong>${subtotal}৳</strong></div>
            <div class="cart-shipping-section">
              <h3>Shipment</h3>
              <strong class="cart-shipping-current">Shipping · ${deliveryFee}৳</strong>
              <p>Shipping to ${deliveryZone === 'inside_dhaka' ? 'Dhaka' : 'outside Dhaka'}.</p>
              <button type="button" class="cart-change-address" id="btn-cart-change-address">Change address</button>
              <fieldset class="cart-delivery-options" id="cart-delivery-options">
                <legend>Delivery area</legend>
                <label><input type="radio" name="cart-area" value="inside_dhaka" ${deliveryZone === 'inside_dhaka' ? 'checked' : ''} /> Inside Dhaka · 70৳</label>
                <label><input type="radio" name="cart-area" value="outside_dhaka" ${deliveryZone === 'outside_dhaka' ? 'checked' : ''} /> Outside Dhaka · 130৳</label>
              </fieldset>
            </div>
            ${couponCode ? `<div class="cart-summary-row cart-discount-row"><span>Discount (${couponCode})</span><strong>−${discountTotal}৳</strong></div>` : ''}
            <div class="cart-summary-row cart-total-row"><span>Total</span><strong>${total}৳</strong></div>
            <button type="button" class="product-detail-add-button cart-checkout-button" id="btn-cart-proceed-checkout">PROCEED TO CHECKOUT</button>
          </aside>
        </div>
      `}
    </main>
  `;
}
