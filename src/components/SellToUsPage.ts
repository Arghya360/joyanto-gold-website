import sellToUsBanner from '../assets/Sell to Us.png';
import { CONTACT_CONFIG } from '../config/contact.ts';
import {
  SELL_TO_US_CONFIG,
  type SellItemType,
  type SellMetal,
  type SellWeightUnit,
} from '../config/sellToUs.ts';
import { sellToUsContent as copy } from '../content/sellToUs.ts';
import { parseSellQuoteParams, type SellQuoteItem } from '../services/sellToUs.ts';
import '../features/sell-to-us.css';

const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[character] ?? character));

function renderPending(label: string, fallback: string): string {
  if (import.meta.env.DEV) {
    return `<span class="mc-sell-pending" title="${escapeHtml(fallback)}">[PENDING ${escapeHtml(label)}]</span>`;
  }
  return escapeHtml(fallback);
}

function renderHero(): string {
  return `<header class="mc-sell-hero" style="--sell-banner-image: url('${escapeHtml(sellToUsBanner)}')">
    <div class="mc-sell-hero-copy">
      <span class="mc-sell-eyebrow">${escapeHtml(copy.eyebrow)}</span>
      <h1>${escapeHtml(copy.heading)}</h1>
      <p>${escapeHtml(copy.subline)}</p>
      <div class="mc-sell-hero-actions">
        <a href="#sell-workspace" class="mc-sell-button" data-sell-cta="start">${escapeHtml(copy.heroActions.quote)}</a>
        <a href="#sell-process" class="mc-sell-button mc-sell-button-outline">${escapeHtml(copy.heroActions.process)}</a>
      </div>
      <ul class="mc-sell-trust-points">${copy.trustPoints.map((point, index) => `<li><span aria-hidden="true">${['✓', '◇', '◎'][index]}</span>${escapeHtml(point)}</li>`).join('')}</ul>
    </div>
  </header>`;
}

function renderProcess(): string {
  return `<section class="mc-sell-section" id="sell-process" aria-labelledby="sell-process-heading">
    <div class="mc-sell-section-heading"><span class="mc-sell-eyebrow">${escapeHtml(copy.process.eyebrow)}</span><h2 id="sell-process-heading">${escapeHtml(copy.process.heading)}</h2></div>
    <ol class="mc-sell-process">${copy.process.steps.map((step, index) => `<li class="mc-sell-process-step" data-process-step="${index + 1}">
      <span class="mc-sell-process-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
      <div><h3>${escapeHtml(step.title)}</h3><p>${index === 3 ? renderPending('LEGAL REVIEW: settlement terms', step.copy) : escapeHtml(step.copy)}</p></div>
    </li>`).join('')}</ol>
  </section>`;
}

function renderConsider(): string {
  return `<section class="mc-sell-section" aria-labelledby="sell-consider-heading">
    <div class="mc-sell-section-heading"><span class="mc-sell-eyebrow">${escapeHtml(copy.consider.eyebrow)}</span><h2 id="sell-consider-heading">${escapeHtml(copy.consider.heading)}</h2><p>${escapeHtml(copy.consider.lead)}</p></div>
    <div class="mc-sell-consider-grid">${copy.consider.items.map(item => `<article class="mc-sell-consider-card">
      <span class="mc-sell-item-icon" aria-hidden="true">${escapeHtml(item.icon)}</span><h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(copy.consider.documentation)}</p>
      <a href="#sell-workspace" data-sell-prefill-metal="${escapeHtml(item.metal.toLowerCase())}" data-sell-prefill-type="${escapeHtml(item.type.toLowerCase())}">${escapeHtml(copy.consider.startQuote)} <span aria-hidden="true">↗</span></a>
    </article>`).join('')}</div>
  </section>`;
}

function renderPurityOptions(metal: SellMetal, selected = 'not-sure'): string {
  const options = SELL_TO_US_CONFIG.purities[metal];
  return `<option value="">${escapeHtml(copy.workspace.choosePurity)}</option>${options.map(option => `<option value="${escapeHtml(option.value)}"${option.value === selected ? ' selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}<option value="not-sure"${selected === 'not-sure' ? ' selected' : ''}>${escapeHtml(copy.workspace.field.notSure)}</option>`;
}

export function renderSellItemCard(
  itemId: string,
  index: number,
  values: Partial<Pick<SellQuoteItem, 'metal' | 'type' | 'purity' | 'unit' | 'weight' | 'quantity' | 'description'>> = {},
): string {
  const metal: SellMetal = values.metal ?? 'Gold';
  const selectedType: SellItemType = values.type ?? 'Bar';
  const unit: SellWeightUnit = values.unit ?? 'g';
  const weight = values.weight === undefined ? '' : String(values.weight);
  const quantity = values.quantity === undefined ? '1' : String(values.quantity);
  return `<article class="mc-sell-item-card" data-sell-item="${escapeHtml(itemId)}">
    <div class="mc-sell-item-header"><h3>${escapeHtml(copy.workspace.itemLabel)} ${index + 1}</h3><div class="mc-sell-item-controls"><button type="button" class="mc-sell-text-button" data-sell-duplicate="${escapeHtml(itemId)}">${escapeHtml(copy.workspace.duplicate)}</button><button type="button" class="mc-sell-text-button" data-sell-remove="${escapeHtml(itemId)}">${escapeHtml(copy.workspace.remove)}</button></div></div>
    <fieldset class="mc-sell-fieldset"><legend>${escapeHtml(copy.workspace.field.metal)}</legend>
      <div class="mc-sell-segmented" role="group" aria-label="${escapeHtml(copy.workspace.field.metal)}">
        <button type="button" data-sell-metal="Gold" aria-pressed="${metal === 'Gold'}">Gold</button><button type="button" data-sell-metal="Silver" aria-pressed="${metal === 'Silver'}">Silver</button>
      </div><input type="hidden" data-sell-field="metal" value="${metal}">
    </fieldset>
    <label>${escapeHtml(copy.workspace.field.itemType)}<select data-sell-field="type">${(['Bar', 'Coin', 'Jewellery', 'Scrap', 'Mixed'] as const).map(type => `<option value="${type}"${type === selectedType ? ' selected' : ''}>${type === 'Mixed' ? escapeHtml(copy.workspace.mixedItemType) : type}</option>`).join('')}</select></label>
    <label>${escapeHtml(copy.workspace.field.purity)}<select data-sell-field="purity">${renderPurityOptions(metal, values.purity ?? 'not-sure')}</select></label>
    <div class="mc-sell-weight-row"><label>${escapeHtml(copy.workspace.field.weight)}<input type="number" data-sell-field="weight" min="0.001" max="${SELL_TO_US_CONFIG.maxWeight}" step="any" inputmode="decimal" value="${escapeHtml(weight)}" required aria-describedby="${escapeHtml(itemId)}-weight-error"></label>
      <label>${escapeHtml(copy.workspace.unit)}<select data-sell-field="unit">${(Object.keys(SELL_TO_US_CONFIG.units) as SellWeightUnit[]).map(value => `<option value="${value}"${unit === value ? ' selected' : ''}>${value}</option>`).join('')}</select></label>
    </div>
    <label>${escapeHtml(copy.workspace.field.quantity)}<input type="number" data-sell-field="quantity" min="1" max="999" step="1" value="${escapeHtml(quantity)}" required aria-describedby="${escapeHtml(itemId)}-quantity-error"></label>
    <p class="mc-sell-field-error" id="${escapeHtml(itemId)}-weight-error" data-sell-error="weight" aria-live="polite"></p>
    <p class="mc-sell-field-error" id="${escapeHtml(itemId)}-quantity-error" data-sell-error="quantity" aria-live="polite"></p>
    <label>${escapeHtml(copy.workspace.description)}<textarea data-sell-field="description" rows="2" maxlength="300">${escapeHtml(values.description ?? '')}</textarea></label>
    <div class="mc-sell-dropzone" data-sell-dropzone="${escapeHtml(itemId)}" role="button" tabindex="0" aria-label="${escapeHtml(copy.workspace.photoLabel)}" aria-describedby="${escapeHtml(itemId)}-photo-help">
      <span class="mc-sell-dropzone-icon" aria-hidden="true">＋</span><strong>${escapeHtml(copy.workspace.photoLabel)}</strong>
      <span id="${escapeHtml(itemId)}-photo-help">${escapeHtml(copy.workspace.photoInstructions)}</span>
      <button type="button" class="mc-sell-button mc-sell-browse" data-sell-browse="${escapeHtml(itemId)}">${escapeHtml(copy.workspace.photoBrowse)}</button>
      <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" multiple hidden data-sell-file="${escapeHtml(itemId)}" aria-label="${escapeHtml(copy.workspace.photoLabel)}">
    </div>
    <div class="mc-sell-photo-list" data-sell-photo-list="${escapeHtml(itemId)}" aria-live="polite"></div>
    <div class="mc-sell-field-error" data-sell-photo-errors="${escapeHtml(itemId)}" role="alert"></div>
  </article>`;
}

function renderStepper(): string {
  return `<div class="mc-sell-stepper" aria-label="Quote request steps">${copy.workspace.steps.map((step, index) => `<button type="button" data-sell-step-button="${index + 1}"${index === 0 ? ' aria-current="step"' : ''} disabled>
    <span class="mc-sell-step-number">${index + 1}</span><span class="mc-sell-step-name">${escapeHtml(step)}</span>
  </button>`).join('')}</div><p class="mc-sell-sr-only" data-sell-step-announcement aria-live="polite">${escapeHtml(copy.workspace.stepLabel(1))}</p>`;
}

function renderCountryOptions(): string {
  return CONTACT_CONFIG.countries.map(country => `<option value="${escapeHtml(country)}"></option>`).join('');
}

function renderContactStep(): string {
  return `<fieldset class="mc-sell-step-panel" data-sell-step="2" hidden><legend><span class="mc-sell-eyebrow">02</span><span class="mc-sell-panel-title">${escapeHtml(copy.workspace.detailsHeading)}</span></legend>
    <div class="mc-sell-fields">
      <label>${escapeHtml(copy.workspace.field.fullName)}<input name="fullName" autocomplete="name" required maxlength="120"></label>
      <label>Email<input name="email" type="email" autocomplete="email" required maxlength="254"></label>
      <fieldset class="mc-sell-phone-field"><legend>${escapeHtml(copy.workspace.field.phone)}</legend><div class="mc-sell-phone-row"><label class="mc-sell-sr-only" for="sell-phone-code">${escapeHtml(copy.workspace.field.phoneCode)}</label><select name="phoneCode" id="sell-phone-code" autocomplete="tel-country-code">${CONTACT_CONFIG.phoneDialCodes.map(entry => `<option value="${escapeHtml(entry.code)}">${escapeHtml(entry.country)} (${escapeHtml(entry.code)})</option>`).join('')}</select><label class="mc-sell-sr-only" for="sell-phone">${escapeHtml(copy.workspace.field.phone)}</label><input id="sell-phone" name="phone" type="tel" autocomplete="tel-national" inputmode="tel" required></div><span class="mc-sell-field-error" data-sell-detail-error="phone" aria-live="polite"></span></fieldset>
      <label>${escapeHtml(copy.workspace.field.country)}<input name="country" list="sell-country-options" autocomplete="country-name" required maxlength="80"><datalist id="sell-country-options">${renderCountryOptions()}</datalist></label>
      <fieldset class="mc-sell-fieldset"><legend>${escapeHtml(copy.workspace.field.contactMethod)}</legend><div class="mc-sell-segmented" role="radiogroup" aria-label="${escapeHtml(copy.workspace.field.contactMethod)}">${['Email', 'Phone', 'WhatsApp'].map((method, index) => `<label><input type="radio" name="contactMethod" value="${method}"${index === 0 ? ' checked' : ''}><span>${method}</span></label>`).join('')}</div></fieldset>
      <label>${escapeHtml(copy.workspace.field.bestTime)}<select name="bestTime"><option value="">No preference</option>${copy.workspace.preferredTimeOptions.map(value => `<option>${escapeHtml(value)}</option>`).join('')}</select></label>
    </div>
  </fieldset>`;
}

function renderAppointment(): string {
  return `<div class="mc-sell-appointment-panel" data-sell-appointment hidden>
    <div class="mc-sell-pending-line">${renderPending('CLIENT: appointment location', copy.workspace.locationFallback)}</div>
    <div class="mc-sell-calendar" data-sell-calendar>
      <div class="mc-sell-calendar-heading"><button type="button" data-sell-calendar-nav="-1" aria-label="${escapeHtml(copy.workspace.calendarPrevious)}">‹</button><h3 data-sell-calendar-month></h3><button type="button" data-sell-calendar-nav="1" aria-label="${escapeHtml(copy.workspace.calendarNext)}">›</button></div>
      <div class="mc-sell-calendar-grid" role="grid" aria-label="Appointment request calendar">
        ${['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => `<span role="columnheader">${day}</span>`).join('')}
        <div data-sell-calendar-days></div>
      </div>
    </div>
    <input type="hidden" name="appointmentDate" data-sell-appointment-date>
    <div class="mc-sell-slots" data-sell-slots aria-live="polite"><p>${escapeHtml(copy.workspace.chooseDate)}</p></div>
    <p class="mc-sell-slot-note">${escapeHtml(copy.workspace.slotNote)}</p>
    <input type="hidden" name="appointmentTime" data-sell-appointment-time>
  </div>`;
}

function renderPresentationStep(): string {
  return `<fieldset class="mc-sell-step-panel" data-sell-step="3" hidden><legend><span class="mc-sell-eyebrow">03</span><span class="mc-sell-panel-title">${escapeHtml(copy.workspace.presentationHeading)}</span></legend>
    <div class="mc-sell-route-options">
      <label class="mc-sell-route-card"><input type="radio" name="route" value="appointment" checked><span><strong>${escapeHtml(copy.workspace.field.visit)}</strong><small>${escapeHtml(copy.workspace.appointmentChoiceNote)}</small></span></label>
      <label class="mc-sell-route-card mc-sell-route-disabled" aria-disabled="${!SELL_TO_US_CONFIG.shippingEnabled}"><input type="radio" name="route" value="shipping"${SELL_TO_US_CONFIG.shippingEnabled ? '' : ' disabled'}><span><strong>${escapeHtml(copy.workspace.field.shipping)}</strong><small>${SELL_TO_US_CONFIG.shippingEnabled ? escapeHtml(copy.workspace.appointmentRouteNote) : escapeHtml(copy.workspace.routeNote)}</small></span>${SELL_TO_US_CONFIG.shippingEnabled ? '' : renderPending('CLIENT: shipping options', copy.workspace.routeNote)}</label>
      <label class="mc-sell-route-card"><input type="radio" name="route" value="speak-first"><span><strong>${escapeHtml(copy.workspace.field.speakFirst)}</strong><small>${escapeHtml(copy.workspace.speakFirstNote)}</small></span></label>
    </div>
    ${renderAppointment()}
  </fieldset>`;
}

function renderReviewStep(): string {
  return `<fieldset class="mc-sell-step-panel" data-sell-step="4" hidden><legend><span class="mc-sell-eyebrow">04</span><span class="mc-sell-panel-title">${escapeHtml(copy.workspace.reviewHeading)}</span></legend>
    <div class="mc-sell-review" data-sell-review></div>
    <div class="mc-sell-consents">
      <label><input type="checkbox" name="accuracy"><span>${escapeHtml(copy.workspace.field.accuracyConsent)}</span></label>
      <label><input type="checkbox" name="verification"><span>${escapeHtml(copy.workspace.field.verificationConsent)} ${renderPending('LEGAL REVIEW: identity and source-of-funds wording', 'identity verification and source-of-funds checks may apply, and no payment is made before inspection and testing.')}</span></label>
      <label><input type="checkbox" name="contactConsent"><span>${escapeHtml(copy.workspace.field.contactConsent)} <a href="/contact#contact-privacy" data-modern-path="/contact">${escapeHtml(copy.workspace.field.privacy)}</a></span></label>
      <p class="mc-sell-field-error" data-sell-consent-error role="alert"></p>
    </div>
    <label class="mc-sell-honeypot" aria-hidden="true">${escapeHtml(copy.workspace.field.honeypot)}<input name="website" tabindex="-1" autocomplete="off"></label>
  </fieldset>`;
}

function renderWizard(firstItem = renderSellItemCard('sell-item-1', 0)): string {
  return `<form class="mc-sell-wizard" data-sell-form novalidate>
    ${renderStepper()}
    <div class="mc-sell-step-panels">
      <fieldset class="mc-sell-step-panel" data-sell-step="1"><legend><span class="mc-sell-eyebrow">01</span><span class="mc-sell-panel-title">${escapeHtml(copy.workspace.itemHeading)}</span></legend>
        <div data-sell-items>${firstItem}</div>
        <button type="button" class="mc-sell-button mc-sell-add-item" data-sell-add-item>＋ ${escapeHtml(copy.workspace.addItem)}</button>
        <p class="mc-sell-tip"><span aria-hidden="true">i</span>${escapeHtml(copy.workspace.purityTip)}</p>
      </fieldset>
      ${renderContactStep()}
      ${renderPresentationStep()}
      ${renderReviewStep()}
    </div>
    <div class="mc-sell-wizard-footer">
      <div class="mc-sell-draft-actions">
        <button type="button" class="mc-sell-text-button" data-sell-save>${escapeHtml(copy.workspace.saveLater)}</button>
        <button type="button" class="mc-sell-text-button" data-sell-clear>${escapeHtml(copy.workspace.clearDraft)}</button>
      </div>
      <div class="mc-sell-step-actions">
        <button type="button" class="mc-sell-button mc-sell-button-outline" data-sell-back hidden>${escapeHtml(copy.workspace.back)}</button>
        <button type="button" class="mc-sell-button" data-sell-next>${escapeHtml(copy.workspace.next)}</button>
        <button type="submit" class="mc-sell-button" data-sell-submit hidden>${escapeHtml(copy.workspace.submit)}</button>
      </div>
    </div>
    <p class="mc-sell-draft-status" data-sell-draft-status role="status" aria-live="polite"></p>
    <p class="mc-sell-submit-status" data-sell-submit-status role="status" aria-live="polite"></p>
  </form>`;
}

function renderChecklist(): string {
  return `<section class="mc-sell-section" aria-labelledby="sell-checklist-heading">
    <div class="mc-sell-section-heading"><span class="mc-sell-eyebrow">${escapeHtml(copy.checklist.eyebrow)}</span><h2 id="sell-checklist-heading">${escapeHtml(copy.checklist.heading)}</h2></div>
    <div class="mc-sell-checklist-card"><ul>${copy.checklist.items.map((item, index) => `<li><label><input type="checkbox" data-sell-checklist="${index}"><span>${index === 3 ? `${escapeHtml(item)} ${renderPending('LEGAL REVIEW: identification requirements', 'if requested by our team.')}` : escapeHtml(item)}</span></label></li>`).join('')}</ul><button type="button" class="mc-sell-button mc-sell-button-outline" data-sell-print-checklist>${escapeHtml(copy.checklist.print)}</button></div>
  </section>`;
}

function renderFaq(): string {
  return `<section class="mc-sell-section" aria-labelledby="sell-faq-heading"><div class="mc-sell-section-heading"><span class="mc-sell-eyebrow">${escapeHtml(copy.faq.eyebrow)}</span><h2 id="sell-faq-heading">${escapeHtml(copy.faq.heading)}</h2></div>
    <div class="mc-sell-faq">${copy.faq.items.map(item => `<details><summary>${escapeHtml(item.question)}</summary><p>${item.answer ? escapeHtml(item.answer) : renderPending('CLIENT: confirmed process answer', 'Confirmed with you before inspection.')}</p></details>`).join('')}</div>
  </section>`;
}

function renderClosing(): string {
  return `<section class="mc-sell-closing"><div><h2>${escapeHtml(copy.closing.heading)}</h2><p>${renderPending('LEGAL REVIEW: settlement and verification wording', copy.closing.legal)}</p></div><div class="mc-sell-closing-actions">
    <a class="mc-sell-button" href="/contact?type=selling" data-modern-path="/contact?type=selling">${escapeHtml(copy.closing.consult)}</a>
    <a class="mc-sell-button mc-sell-button-outline" href="/catalogue" data-modern-path="/catalogue">${escapeHtml(copy.closing.catalogue)}</a>
  </div></section>`;
}

export function renderSellToUsPage(): string {
  const params = parseSellQuoteParams(location.search);
  const firstItem = renderSellItemCard('sell-item-1', 0, {
    metal: params.metal ?? 'Gold',
    type: params.type ?? 'Bar',
    purity: 'not-sure',
    unit: 'g',
    quantity: 1,
  });
  return `<main class="mc-sell-page" data-sell-page data-sell-prefill-metal="${params.metal ?? ''}" data-sell-prefill-type="${params.type ?? ''}">
    ${renderHero()}
    ${renderProcess()}
    ${renderConsider()}
    <section class="mc-sell-section mc-sell-workspace-section" id="sell-workspace" aria-labelledby="sell-workspace-heading">
      <div class="mc-sell-section-heading"><span class="mc-sell-eyebrow">${escapeHtml(copy.workspace.eyebrow)}</span><h2 id="sell-workspace-heading">${escapeHtml(copy.workspace.heading)}</h2><p>${escapeHtml(copy.workspace.lead)}</p></div>
      <p class="mc-sell-draft-restored" data-sell-restored hidden role="status">${escapeHtml(copy.workspace.draftRestored)} <button type="button" data-sell-clear>${escapeHtml(copy.workspace.clearDraft)}</button></p>
      <div class="mc-sell-workspace">
        <div class="mc-sell-wizard-column">${renderWizard(firstItem)}</div>
      </div>
    </section>
    ${renderChecklist()}
    ${renderFaq()}
    ${renderClosing()}
    <section class="mc-sell-success" data-sell-success hidden tabindex="-1" aria-labelledby="sell-success-heading"></section>
  </main>`;
}
