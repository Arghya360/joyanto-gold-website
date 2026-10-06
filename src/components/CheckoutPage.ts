import type { CartItem } from '../store/cart';

export interface CheckoutPageProps {
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
  formValues: {
    name: string;
    email: string;
    phone: string;
    address: string;
    notes: string;
  };
}

export function renderCheckoutPage(props: CheckoutPageProps): string {
  const { items, subtotal, discountTotal, deliveryFee, total, deliveryZone, couponCode, couponInputValue, couponMessage, couponMessageType, formValues } = props;
  const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => {
    switch (character) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      default: return '&#39;';
    }
  });
  const safeCouponInputValue = couponInputValue.replace(/[&<>"']/g, character => {
    switch (character) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      default: return '&#39;';
    }
  });
  if (items.length === 0) {
    return `
      <main class="commerce-page shop-container checkout-page">
        <nav class="commerce-breadcrumbs" aria-label="Breadcrumb"><a href="/" data-route="home">Home</a><span>/</span><a href="/cart" data-route="cart">Shopping Cart</a><span>/</span><span>Checkout</span></nav>
        <div class="commerce-empty-state"><h1>Your cart is empty</h1><p>Add products before proceeding to checkout.</p><button type="button" class="product-detail-add-button" data-route="shop">Continue Shopping</button></div>
      </main>
    `;
  }
  return `
    <main class="commerce-page shop-container checkout-page">
      <nav class="commerce-breadcrumbs" aria-label="Breadcrumb"><a href="/" data-route="home">Home</a><span>/</span><a href="/cart" data-route="cart">Shopping Cart</a><span>/</span><span>Checkout</span></nav>
      <header class="checkout-page-heading">
        <span>COMPLETE YOUR ORDER</span>
        <h1>Checkout</h1>
        <p>Almost there! Enter your details to get your order delivered.</p>
      </header>
      <div class="checkout-page-layout">
        <form class="checkout-page-form" id="checkout-page-form">
          <section class="checkout-form-section">
            <div class="checkout-section-heading"><span>01</span><div><h2>Contact information</h2><p>Where can we reach you about your order?</p></div></div>
            <label class="checkout-field">Full name<input name="name" autocomplete="name" placeholder="Enter your full name" value="${escapeHtml(formValues.name)}" required minlength="2" /></label>
            <label class="checkout-field">Email address<input name="email" type="email" autocomplete="email" placeholder="you@example.com" value="${escapeHtml(formValues.email)}" required /></label>
            <label class="checkout-field">Phone number<input name="phone" type="tel" autocomplete="tel" placeholder="01XXXXXXXXX" value="${escapeHtml(formValues.phone)}" pattern="(?:\\+8801|01)[3-9][0-9]{8}" required aria-describedby="checkout-phone-hint" /><small id="checkout-phone-hint">Use a Bangladesh mobile number, e.g. 01XXXXXXXXX.</small></label>
          </section>
          <section class="checkout-form-section">
            <div class="checkout-section-heading"><span>02</span><div><h2>Delivery address</h2><p>Choose your delivery area and enter the address.</p></div></div>
            <fieldset class="checkout-delivery-options">
              <legend>Delivery area</legend>
              <label><input type="radio" name="checkout-area" value="inside_dhaka" ${deliveryZone === 'inside_dhaka' ? 'checked' : ''} /><span><strong>Inside Dhaka</strong><small>Delivery fee 70৳</small></span><b>70৳</b></label>
              <label><input type="radio" name="checkout-area" value="outside_dhaka" ${deliveryZone === 'outside_dhaka' ? 'checked' : ''} /><span><strong>Outside Dhaka</strong><small>Delivery fee 130৳</small></span><b>130৳</b></label>
            </fieldset>
            <label class="checkout-field">Street address<input name="address" autocomplete="street-address" placeholder="House, road and area" value="${escapeHtml(formValues.address)}" required minlength="5" /></label>
            <label class="checkout-field">Order notes <span class="optional-label">(optional)</span><textarea name="notes" rows="3" placeholder="Anything we should know about delivery?">${escapeHtml(formValues.notes)}</textarea></label>
          </section>
          <section class="checkout-form-section">
            <div class="checkout-section-heading"><span>03</span><div><h2>Payment method</h2><p>Pay safely when your order arrives.</p></div></div>
            <label class="checkout-payment-method"><input type="radio" name="payment" value="cod" checked required /><span><strong>Cash on delivery</strong><small>Pay the delivery person when your order arrives.</small></span><b>৳</b></label>
          </section>
          <p class="checkout-submit-error" id="checkout-submit-error" role="alert" hidden></p>
          <button class="product-detail-add-button checkout-submit-button" type="submit">PLACE ORDER · ${total}৳</button>
          <p class="checkout-privacy-note">Your information is used only to process and deliver your order.</p>
        </form>
        <aside class="cart-summary checkout-order-summary">
          <h2>Order summary <span>${items.length} ${items.length === 1 ? 'item' : 'items'}</span></h2>
          ${items.map(({ product, quantity }) => `
            <div class="checkout-order-item" data-checkout-item="${product.id}">
              <div class="checkout-order-image"><img src="${product.image}" alt="${product.title}" /><span>${quantity}</span></div>
              <div class="checkout-order-product"><strong>${product.title}</strong><span>${product.packSize ?? 'Product'}</span><div class="commerce-quantity-control" aria-label="Quantity for ${product.title}"><button type="button" data-checkout-dec="${product.id}" aria-label="Decrease quantity">−</button><output>${quantity}</output><button type="button" data-checkout-inc="${product.id}" aria-label="Increase quantity">+</button></div></div>
              <b data-checkout-line-total="${product.id}">${product.price * quantity}৳</b>
            </div>
          `).join('')}
          <form class="coupon-card checkout-coupon-card" id="checkout-coupon-form">
            <label class="visually-hidden" for="checkout-coupon-code">Coupon code</label>
            <input id="checkout-coupon-code" name="coupon" type="text" placeholder="Coupon code" value="${safeCouponInputValue}" autocomplete="off" />
            <button type="submit" class="coupon-apply-button">${couponCode ? 'APPLIED' : 'APPLY'}</button>
            ${couponCode ? '<button type="button" class="coupon-remove-button" data-remove-coupon>Remove</button>' : ''}
            ${couponMessage ? `<p class="coupon-feedback ${couponMessageType}" role="status">${couponMessage}</p>` : ''}
          </form>
          <div class="cart-summary-row"><span>Subtotal</span><strong id="checkout-order-subtotal">${subtotal}৳</strong></div>
          ${couponCode ? `<div class="cart-summary-row cart-discount-row" id="checkout-coupon-row"><span>Discount (${couponCode})</span><strong id="checkout-coupon-discount">−${discountTotal}৳</strong></div>` : ''}
          <div class="cart-summary-row"><span>Shipping</span><strong id="checkout-shipping-total">${deliveryFee}৳</strong></div>
          <div class="cart-summary-row cart-total-row"><span>Total</span><strong id="checkout-grand-total">${total}৳</strong></div>
          <p class="cart-shipping-note">No online payment is collected. Pay the delivery person when your order arrives.</p>
        </aside>
      </div>
    </main>
  `;
}
