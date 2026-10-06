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
        <div class="commerce-empty-state"><h1>Your allocation cart is empty</h1><p>Select bullion items before proceeding to settlement.</p><button type="button" class="product-detail-add-button" data-route="shop">Browse Bullion</button></div>
      </main>
    `;
  }
  return `
    <main class="commerce-page shop-container checkout-page">
      <nav class="commerce-breadcrumbs" aria-label="Breadcrumb"><a href="/" data-route="home">Home</a><span>/</span><a href="/cart" data-route="cart">Shopping Cart</a><span>/</span><span>Checkout</span></nav>
      <header class="checkout-page-heading">
        <span>CONFIRM YOUR ALLOCATION</span>
        <h1>Order Settlement</h1>
        <p>Complete your verified client credentials and insured delivery coordinates.</p>
      </header>
      <div class="checkout-page-layout">
        <form class="checkout-page-form" id="checkout-page-form">
          <section class="checkout-form-section">
            <div class="checkout-section-heading"><span>01</span><div><h2>Client credentials</h2><p>Where may our bullion desk contact you regarding confirmation?</p></div></div>
            <label class="checkout-field">Full legal name<input name="name" autocomplete="name" placeholder="Enter your full legal name" value="${escapeHtml(formValues.name)}" required minlength="2" /></label>
            <label class="checkout-field">Email address<input name="email" type="email" autocomplete="email" placeholder="client@domain.com" value="${escapeHtml(formValues.email)}" required /></label>
            <label class="checkout-field">Mobile / Phone number<input name="phone" type="tel" autocomplete="tel" placeholder="+971 XX XXX XXXX" value="${escapeHtml(formValues.phone)}" required aria-describedby="checkout-phone-hint" /><small id="checkout-phone-hint">Provide full number with country code for secure courier dispatch.</small></label>
          </section>
          <section class="checkout-form-section">
            <div class="checkout-section-heading"><span>02</span><div><h2>Custody &amp; Delivery Destination</h2><p>Select your dispatch tier and enter verified destination coordinates.</p></div></div>
            <fieldset class="checkout-delivery-options">
              <legend>Delivery area</legend>
              <label><input type="radio" name="checkout-area" value="inside_dhaka" ${deliveryZone === 'inside_dhaka' ? 'checked' : ''} /><span><strong>UAE Domestic / Vault Custody</strong><small>Insured transit fee AED 70</small></span><b>AED 70</b></label>
              <label><input type="radio" name="checkout-area" value="outside_dhaka" ${deliveryZone === 'outside_dhaka' ? 'checked' : ''} /><span><strong>International Insured Courier</strong><small>Insured transit fee AED 130</small></span><b>AED 130</b></label>
            </fieldset>
            <label class="checkout-field">Street address / Depository box<input name="address" autocomplete="street-address" placeholder="Building, street, suite or vault box" value="${escapeHtml(formValues.address)}" required minlength="5" /></label>
            <label class="checkout-field">Order &amp; dispatch notes <span class="optional-label">(optional)</span><textarea name="notes" rows="3" placeholder="Special handling or vault custodian instructions">${escapeHtml(formValues.notes)}</textarea></label>
          </section>
          <section class="checkout-form-section">
            <div class="checkout-section-heading"><span>03</span><div><h2>Settlement method</h2><p>Direct custodial handover &amp; verified bank wire settlement.</p></div></div>
            <label class="checkout-payment-method"><input type="radio" name="payment" value="cod" checked required /><span><strong>Bank Wire / Secure Custodial Handover</strong><small>Final settlement executed against official assay invoice.</small></span><b>AED</b></label>
          </section>
          <p class="checkout-submit-error" id="checkout-submit-error" role="alert" hidden></p>
          <button class="product-detail-add-button checkout-submit-button" type="submit">CONFIRM ALLOCATION · AED ${total}</button>
          <p class="checkout-privacy-note">Client data protected under strict confidentiality standards [PENDING LEGAL REVIEW].</p>
        </form>
        <aside class="cart-summary checkout-order-summary">
          <h2>Order summary <span>${items.length} ${items.length === 1 ? 'item' : 'items'}</span></h2>
          ${items.map(({ product, quantity }) => `
            <div class="checkout-order-item" data-checkout-item="${product.id}">
              <div class="checkout-order-image"><img src="${product.image}" alt="${product.title}" /><span>${quantity}</span></div>
              <div class="checkout-order-product"><strong>${product.title}</strong><span>${product.packSize ?? 'Bullion'}</span><div class="commerce-quantity-control" aria-label="Quantity for ${product.title}"><button type="button" data-checkout-dec="${product.id}" aria-label="Decrease quantity">−</button><output>${quantity}</output><button type="button" data-checkout-inc="${product.id}" aria-label="Increase quantity">+</button></div></div>
              <b data-checkout-line-total="${product.id}">AED ${product.price * quantity}</b>
            </div>
          `).join('')}
          <form class="coupon-card checkout-coupon-card" id="checkout-coupon-form">
            <label class="visually-hidden" for="checkout-coupon-code">Concession code</label>
            <input id="checkout-coupon-code" name="coupon" type="text" placeholder="Concession code" value="${safeCouponInputValue}" autocomplete="off" />
            <button type="submit" class="coupon-apply-button">${couponCode ? 'APPLIED' : 'APPLY'}</button>
            ${couponCode ? '<button type="button" class="coupon-remove-button" data-remove-coupon>Remove</button>' : ''}
            ${couponMessage ? `<p class="coupon-feedback ${couponMessageType}" role="status">${couponMessage}</p>` : ''}
          </form>
          <div class="cart-summary-row"><span>Metal Value Subtotal</span><strong id="checkout-order-subtotal">AED ${subtotal}</strong></div>
          ${couponCode ? `<div class="cart-summary-row cart-discount-row" id="checkout-coupon-row"><span>Concession (${couponCode})</span><strong id="checkout-coupon-discount">−AED ${discountTotal}</strong></div>` : ''}
          <div class="cart-summary-row"><span>Insured Freight</span><strong id="checkout-shipping-total">AED ${deliveryFee}</strong></div>
          <div class="cart-summary-row cart-total-row"><span>Settlement Total</span><strong id="checkout-grand-total">AED ${total}</strong></div>
          <p class="cart-shipping-note">Pricing rule: Sell Price = Live Metal Value + Product Premium + Delivery + Insurance + Applicable Taxes. Never promise returns or future value.</p>
        </aside>
      </div>
    </main>
  `;
}
