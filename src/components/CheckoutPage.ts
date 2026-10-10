import type { CartItem } from '../store/cart';
import { CHECKOUT_COUNTRIES, APPOINTMENT_TIME_SLOTS, PAYMENT_METHODS, PRICE_LOCK_DURATION_MS, RESTRICTED_COUNTRY_CODES, SHOW_COUPON } from '../config/checkout';
import type { MockOrder, PriceLock } from '../services/checkout';
import { convertCurrencyAmount, formatCurrencyAmount, getSelectedCurrency } from '../features/currency';
import { checkoutContent as copy } from '../content/checkout';

export interface CheckoutFormDraft {
  fullName: string;
  email: string;
  phoneCode: string;
  phone: string;
  deliveryPhoneCode: string;
  deliveryPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  country: string;
  city: string;
  street: string;
  postalCode: string;
  notes: string;
}

export interface CheckoutPageProps {
  items: CartItem[];
  subtotalAed: number;
  deliveryMethod: 'collection' | 'uae' | 'international';
  formValues: CheckoutFormDraft;
  priceLock: PriceLock | null;
  lockConfirmed: boolean;
  feedIsStale: boolean;
  invalidCartNotice: boolean;
  order: MockOrder | null;
  orderPersistenceWarning: boolean;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character);
}

function pending(kind: 'client' | 'legal' = 'client'): string {
  const marker = kind === 'legal' ? '[PENDING LEGAL REVIEW]' : '[PENDING CLIENT]';
  const text = import.meta.env.DEV ? marker : 'Confirmed on order';
  return `<span class="checkout-pending">${text}</span>`;
}

function formatAedAmount(amount: number): string {
  return formatCurrencyAmount(convertCurrencyAmount(amount, 'AED', getSelectedCurrency()), getSelectedCurrency());
}

function sectionHeading(number: string, title: string, description: string, section: string): string {
  return `<div class="checkout-section-heading"><span data-checkout-section="${section}" aria-label="Section ${number}">${number}</span><div><h2>${title}</h2><p>${description}</p></div></div>`;
}

function renderCountryOptions(selected: string): string {
  return `<option value="">${copy.delivery.country}</option>${CHECKOUT_COUNTRIES.map(country =>
    `<option value="${country.code}" ${country.code === selected ? 'selected' : ''}>${country.name}</option>`,
  ).join('')}`;
}

function renderConfirmation(order: MockOrder | null, persistenceWarning: boolean): string {
  if (!order) {
    return `<main class="commerce-page wide-screen-container checkout-confirmation"><section class="commerce-empty-state"><h1>${copy.confirmation.unavailable}</h1><a class="product-detail-add-button" href="/catalogue" data-modern-path="/catalogue">${copy.browse}</a></section></main>`;
  }
  const deliveryDescription = order.delivery.method === 'collection'
    ? `${order.delivery.appointmentDate} · ${order.delivery.appointmentTime}`
    : [order.delivery.street, order.delivery.city, order.delivery.postalCode, order.delivery.country].filter(Boolean).join(', ');
  return `<main class="commerce-page wide-screen-container checkout-confirmation">
    <header class="checkout-page-heading"><span>${copy.eyebrow}</span><h1>${copy.confirmation.title}</h1><p>${copy.confirmation.next}</p></header>
    <section class="checkout-confirmation-card">
      <p><strong>${copy.confirmation.reference}:</strong> ${escapeHtml(order.reference)}</p>
      ${persistenceWarning ? `<p class="checkout-notice checkout-notice-warning" role="status">${copy.confirmation.persistenceWarning}</p>` : ''}
      <p><strong>${copy.confirmation.bankDetails}:</strong> ${pending()}</p>
      <p><strong>${copy.confirmation.deadline}:</strong> ${pending()}</p>
      <h2>${copy.contact.title}</h2>
      <p>${escapeHtml(order.contact.fullName)} · ${escapeHtml(order.contact.email)} · ${escapeHtml(order.contact.phone)}</p>
      <h2>${copy.delivery.title}</h2>
      <p>${escapeHtml(deliveryDescription || order.delivery.method)}</p>
      ${order.delivery.phone ? `<p>${escapeHtml(order.delivery.phone)}</p>` : ''}
      ${order.notes ? `<p><strong>${copy.delivery.notes}:</strong> ${escapeHtml(order.notes)}</p>` : ''}
      <h2>${copy.summary.title}</h2>
      ${order.items.map(item => `<div class="checkout-order-item"><img src="${escapeHtml(item.image)}" alt=""><div class="checkout-order-product"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.weight)} · ${copy.summary.quantity}: ${item.quantity}</span></div><b>${formatAedAmount(item.unitPriceAed * item.quantity)}</b></div>`).join('')}
      <p class="checkout-confirmation-status">${escapeHtml(order.status === 'on_hold_compliance' ? copy.largerOrder : copy.confirmation.next)}</p>
      <div class="checkout-confirmation-actions"><button type="button" class="product-detail-add-button" data-print-order>${copy.confirmation.download}</button><a href="/mc-reserve" data-modern-path="/mc-reserve">${copy.confirmation.viewReserve}</a><a href="/catalogue" data-modern-path="/catalogue">${copy.confirmation.continueShopping}</a></div>
    </section>
  </main>`;
}

export function renderCheckoutPage(props: CheckoutPageProps): string {
  if (window.location.pathname.startsWith('/checkout/confirmation')) {
    const requestedReference = window.location.pathname.match(/^\/checkout\/confirmation\/([^/]+)$/)?.[1];
    return renderConfirmation(requestedReference === props.order?.reference ? props.order : null, props.orderPersistenceWarning);
  }
  if (props.items.length === 0) {
    return `<main class="commerce-page wide-screen-container checkout-page"><div class="commerce-empty-state"><h1>${copy.empty}</h1><a class="product-detail-add-button" href="/catalogue" data-modern-path="/catalogue">${copy.browse}</a></div></main>`;
  }

  const draft = props.formValues;
  const selectedCountryIsRestricted = RESTRICTED_COUNTRY_CODES.includes(draft.country);
  const orderAllowed = !props.feedIsStale
    && props.lockConfirmed
    && Boolean(props.priceLock)
    && Date.now() < (props.priceLock?.expiresAt ?? 0)
    && props.items.length > 0
    && props.items.every(({ product }) => product.priceSource === 'verified' && product.stockStatus === 'in_stock');
  const lockRemaining = props.priceLock
    ? Math.max(0, props.priceLock.expiresAt - Date.now())
    : 0;
  const lockSeconds = Math.ceil(lockRemaining / 1000);
  const lockMinutes = Math.floor(lockSeconds / 60).toString().padStart(2, '0');
  const lockRemainder = (lockSeconds % 60).toString().padStart(2, '0');
  const lockProgress = props.priceLock
    ? Math.max(0, Math.min(100, lockRemaining / PRICE_LOCK_DURATION_MS * 100))
    : 0;
  const phoneOptions = CHECKOUT_COUNTRIES.map(country =>
    `<option value="${country.phoneCode}" ${country.phoneCode === draft.phoneCode ? 'selected' : ''}>${country.phoneCode}</option>`,
  ).join('');
  const deliveryPhoneOptions = CHECKOUT_COUNTRIES.map(country =>
    `<option value="${country.phoneCode}" ${country.phoneCode === draft.deliveryPhoneCode ? 'selected' : ''}>${country.phoneCode}</option>`,
  ).join('');

  return `<main class="commerce-page wide-screen-container checkout-page">
    <nav class="commerce-breadcrumbs" aria-label="Breadcrumb"><a href="/" data-route="home">Home</a><span>/</span><span aria-current="page">${copy.title}</span></nav>
    <header class="checkout-page-heading"><span>${copy.eyebrow}</span><h1>${copy.title}</h1><p>${copy.subtitle}</p></header>
    ${props.invalidCartNotice ? `<p class="checkout-notice" role="status">${copy.invalidCart}</p>` : ''}
    ${props.feedIsStale ? `<p class="checkout-notice checkout-notice-warning" role="status">${copy.staleFeed}</p>` : ''}
    <div class="checkout-page-layout">
      <form class="checkout-page-form" id="checkout-page-form" novalidate>
        ${sectionHeading('01', copy.contact.title, copy.contact.description, 'contact')}
        <label class="checkout-field" for="checkout-full-name">${copy.contact.fullName}<input id="checkout-full-name" name="fullName" autocomplete="name" value="${escapeHtml(draft.fullName)}" required minlength="2" aria-describedby="checkout-full-name-error"><small class="checkout-field-error" id="checkout-full-name-error"></small></label>
        <label class="checkout-field" for="checkout-email">${copy.contact.email}<input id="checkout-email" name="email" type="email" autocomplete="email" value="${escapeHtml(draft.email)}" required aria-describedby="checkout-email-error"><small class="checkout-field-error" id="checkout-email-error"></small></label>
        <div class="checkout-field"><label for="checkout-phone">${copy.contact.phone}</label><div class="checkout-phone-field"><select name="phoneCode" aria-label="Phone country calling code">${phoneOptions}</select><input id="checkout-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel-national" value="${escapeHtml(draft.phone)}" required aria-describedby="checkout-phone-help checkout-phone-error"></div><small id="checkout-phone-help">${copy.contact.phoneHelp}</small><small class="checkout-field-error" id="checkout-phone-error"></small></div>

        ${sectionHeading('02', copy.delivery.title, copy.delivery.description, 'delivery')}
        <fieldset class="checkout-delivery-options"><legend class="visually-hidden">${copy.delivery.title}</legend>
          <label class="checkout-choice-card"><input type="radio" name="deliveryMethod" value="collection" ${props.deliveryMethod === 'collection' ? 'checked' : ''}><span><strong>${copy.delivery.collection}</strong><small>${copy.delivery.collectionDescription}</small></span><b>${pending()}</b></label>
          <label class="checkout-choice-card"><input type="radio" name="deliveryMethod" value="uae" ${props.deliveryMethod === 'uae' ? 'checked' : ''}><span><strong>${copy.delivery.uae}</strong><small>${copy.delivery.availabilityPending}</small></span><b>${pending()}</b></label>
          <label class="checkout-choice-card"><input type="radio" name="deliveryMethod" value="international" ${props.deliveryMethod === 'international' ? 'checked' : ''}><span><strong>${copy.delivery.international}</strong><small>${copy.delivery.availabilityPending}</small></span><b>${pending()}</b></label>
        </fieldset>
        <div class="checkout-appointment-fields" ${props.deliveryMethod === 'collection' ? '' : 'hidden'}>
          <p>${copy.delivery.appointmentPending}</p>
          <label class="checkout-field" for="checkout-appointment-date">${copy.delivery.date}<input id="checkout-appointment-date" name="appointmentDate" type="date" min="${new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)}" value="${escapeHtml(draft.appointmentDate)}" ${props.deliveryMethod === 'collection' ? 'required' : ''} aria-describedby="checkout-appointment-date-error"><small class="checkout-field-error" id="checkout-appointment-date-error"></small></label>
          <label class="checkout-field" for="checkout-appointment-time">${copy.delivery.time}<select id="checkout-appointment-time" name="appointmentTime" ${props.deliveryMethod === 'collection' ? 'required' : ''} aria-describedby="checkout-appointment-time-error"><option value="">${copy.delivery.time}</option>${APPOINTMENT_TIME_SLOTS.map(slot => `<option value="${slot}" ${slot === draft.appointmentTime ? 'selected' : ''}>${slot} · ${copy.appointmentOption}</option>`).join('')}</select><small class="checkout-field-error" id="checkout-appointment-time-error"></small></label>
        </div>
        <div class="checkout-address-fields" ${props.deliveryMethod === 'collection' ? 'hidden' : ''}>
          <label class="checkout-field" for="checkout-country">${copy.delivery.country}<select id="checkout-country" name="country" autocomplete="country" required>${renderCountryOptions(draft.country)}</select><small class="checkout-field-error" id="checkout-country-error"></small></label>
          ${selectedCountryIsRestricted ? `<p class="checkout-notice checkout-notice-warning" role="alert">${copy.delivery.unsupportedCountry}</p>` : ''}
          <p class="checkout-pending-note">${copy.delivery.availabilityPending}</p>
          <label class="checkout-field" for="checkout-city">${copy.delivery.city}<input id="checkout-city" name="city" autocomplete="address-level2" value="${escapeHtml(draft.city)}" required aria-describedby="checkout-city-error"><small class="checkout-field-error" id="checkout-city-error"></small></label>
          <label class="checkout-field" for="checkout-street">${copy.delivery.street}<input id="checkout-street" name="street" autocomplete="address-line1" value="${escapeHtml(draft.street)}" required aria-describedby="checkout-street-error"><small class="checkout-field-error" id="checkout-street-error"></small></label>
          <label class="checkout-field" for="checkout-postal">${copy.delivery.postalCode}<input id="checkout-postal" name="postalCode" autocomplete="postal-code" value="${escapeHtml(draft.postalCode)}"></label>
          <div class="checkout-field"><label for="checkout-delivery-phone">${copy.delivery.deliveryPhone}</label><div class="checkout-phone-field"><select name="deliveryPhoneCode" aria-label="Delivery phone country calling code">${deliveryPhoneOptions}</select><input id="checkout-delivery-phone" name="deliveryPhone" type="tel" autocomplete="tel" value="${escapeHtml(draft.deliveryPhone)}" required aria-describedby="checkout-delivery-phone-error"></div><small class="checkout-field-error" id="checkout-delivery-phone-error"></small></div>
          <label class="checkout-signature"><input type="checkbox" name="signature" checked disabled><span>${copy.delivery.signature}</span></label>
        </div>
        ${props.deliveryMethod === 'international' ? `<p class="checkout-legal-note">${copy.delivery.internationalNote} ${pending('legal')}</p>` : ''}
        <label class="checkout-field" for="checkout-notes">${copy.delivery.notes}<textarea id="checkout-notes" name="notes" rows="3" maxlength="500" aria-describedby="checkout-notes-count">${escapeHtml(draft.notes)}</textarea><small id="checkout-notes-count" class="checkout-notes-count">${draft.notes.length}/500</small></label>

        ${sectionHeading('03', copy.payment.title, copy.payment.description, 'payment')}
        <fieldset class="checkout-payment-options"><legend class="visually-hidden">${copy.payment.title}</legend>
          ${PAYMENT_METHODS.includes('bank-transfer') ? `<label class="checkout-choice-card"><input type="radio" name="paymentMethod" value="bank-transfer" checked><span><strong>${copy.payment.bankTransfer}</strong><small>${copy.payment.bankTransferDescription}</small></span></label>` : ''}
        </fieldset>
        <p class="checkout-legal-note">${copy.payment.termsPending}</p>
        <label class="checkout-terms"><input type="checkbox" name="terms" required><span>${copy.payment.terms} ${pending('legal')}</span></label>
        <p class="checkout-price-lock" data-price-lock-status>${props.priceLock ? `${copy.summary.locked} <time>${lockMinutes}:${lockRemainder}</time>` : pending()}</p>
        <small class="checkout-pending-note">${copy.summary.mockLockNote}</small>
        <div class="checkout-price-lock-progress" role="progressbar" aria-label="Price lock time remaining" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(lockProgress)}"><span style="width:${lockProgress}%"></span></div>
        <p id="checkout-lock-warning" class="checkout-notice checkout-notice-warning" role="status" ${lockRemaining > 60_000 || lockRemaining === 0 ? 'hidden' : ''}>${copy.summary.warning}</p>
        <span id="checkout-lock-live" class="visually-hidden" aria-live="polite"></span>
        <p class="checkout-lock-expired" ${props.priceLock && lockRemaining === 0 ? '' : 'hidden'} role="status">${copy.summary.expired}<button type="button" data-confirm-new-price>${copy.summary.confirmPrice}</button></p>
        <p class="checkout-submit-error" id="checkout-submit-error" role="alert" hidden></p>
        <button class="product-detail-add-button checkout-submit-button" type="submit" ${orderAllowed ? '' : 'disabled'}>${copy.placeOrder} · ${formatAedAmount(props.subtotalAed)}</button>
        <p class="checkout-privacy-note">${copy.privacy}</p>
      </form>
      <aside class="cart-summary checkout-order-summary">
        <details class="checkout-summary-details" open><summary>${copy.summary.title} · ${formatAedAmount(props.subtotalAed)} <span>${props.items.length} ${props.items.length === 1 ? 'item' : 'items'}</span></summary>
          ${props.items.map(({ product, quantity }) => `<div class="checkout-order-item" data-checkout-item="${product.id}">
            <img src="${escapeHtml(product.image)}" alt="">
            <div class="checkout-order-product"><strong>${escapeHtml(product.title)}</strong><span>${escapeHtml(product.packSize ?? 'Weight awaiting confirmation')}</span><div class="commerce-quantity-control" aria-label="${copy.summary.quantity}: ${escapeHtml(product.title)}"><button type="button" data-checkout-dec="${product.id}" aria-label="Decrease quantity">−</button><output>${quantity}</output><button type="button" data-checkout-inc="${product.id}" aria-label="Increase quantity">+</button></div></div>
            <b>${formatAedAmount(product.price * quantity)}</b>
          </div>`).join('')}
        </details>
        ${SHOW_COUPON ? '<div id="checkout-coupon-slot"></div>' : ''}
        <div class="checkout-price-breakdown">
          <div><span>${copy.summary.metalValue}</span><strong>${pending()}</strong></div>
          <div><span>${copy.summary.premium}</span><strong>${pending()}</strong></div>
          <div><span>${copy.summary.delivery}</span><strong>${pending()}</strong></div>
          <div><span>${copy.summary.insurance}</span><strong>${pending('legal')}</strong></div>
          <div><span>${copy.summary.taxes}</span><strong>${pending('legal')}</strong></div>
          <div class="checkout-breakdown-catalogue"><span>${copy.summary.catalogueBasis}</span><strong>${formatAedAmount(props.subtotalAed)}</strong></div>
          <div class="checkout-breakdown-total"><span>${copy.summary.total}</span><strong>${pending()}</strong></div>
        </div>
        <p class="cart-shipping-note">${copy.summary.totalPendingNote}</p>
        <p class="cart-shipping-note">${copy.summary.notes}</p>
        <p class="cart-shipping-note">${copy.summary.insuranceTerms} ${pending('legal')}</p>
      </aside>
    </div>
  </main>`;
}
