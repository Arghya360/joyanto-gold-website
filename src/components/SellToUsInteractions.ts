import { CONTACT_CONFIG } from '../config/contact.ts';
import { SELL_TO_US_CONFIG, type SellItemType, type SellWeightUnit } from '../config/sellToUs.ts';
import { sellToUsContent as copy } from '../content/sellToUs.ts';
import { isAppointmentDateDisabled, getDubaiDate, appointmentService } from '../services/contact.ts';
import {
  parseSellQuoteParams,
  sanitizeSellQuoteDraft,
  sellQuoteService,
  validateSellConsents,
  validateSellDetails,
  validateSellItems,
  validateSellPhotos,
  validateSellPresentation,
  type SellQuoteDetails,
  type SellQuoteDraft,
  type SellQuoteItem,
  type SellQuoteSubmission,
} from '../services/sellToUs.ts';
import { renderSellItemCard } from './SellToUsPage.ts';

const DRAFT_KEY = 'mc-sell-to-us-draft';
const CHECKLIST_KEY = 'mc-sell-to-us-checklist';
const LAST_SUBMIT_KEY = 'mc-sell-to-us-last-submit';

interface StoredPhoto {
  file: File;
  url: string;
}

const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character] ?? character));

function fieldValue(root: ParentNode, selector: string): string {
  return root.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(selector)?.value ?? '';
}

function readItems(root: HTMLElement): SellQuoteItem[] {
  const types: readonly SellItemType[] = ['Bar', 'Coin', 'Jewellery', 'Scrap', 'Mixed'];
  const units: readonly SellWeightUnit[] = ['g', 'kg', 'oz', 'tola'];
  return [...root.querySelectorAll<HTMLElement>('[data-sell-item]')].map((card, index) => {
    const rawMetal = fieldValue(card, '[data-sell-field="metal"]');
    const rawType = fieldValue(card, '[data-sell-field="type"]');
    const rawUnit = fieldValue(card, '[data-sell-field="unit"]');
    return {
      id: card.dataset.sellItem ?? `sell-item-${index + 1}`,
      metal: rawMetal === 'Silver' ? 'Silver' : 'Gold',
      type: types.find(type => type === rawType) ?? 'Bar',
      purity: fieldValue(card, '[data-sell-field="purity"]') || 'not-sure',
      weight: Number(fieldValue(card, '[data-sell-field="weight"]')),
      unit: units.find(unit => unit === rawUnit) ?? 'g',
      quantity: Number(fieldValue(card, '[data-sell-field="quantity"]')),
      description: fieldValue(card, '[data-sell-field="description"]').trim(),
      photoNames: [],
    };
  });
}

function readDetails(root: HTMLElement): SellQuoteDetails {
  const method = root.querySelector<HTMLInputElement>('input[name="contactMethod"]:checked')?.value;
  return {
    fullName: fieldValue(root, '[name="fullName"]').trim(),
    email: fieldValue(root, '[name="email"]').trim(),
    phoneCode: fieldValue(root, '[name="phoneCode"]'),
    phone: fieldValue(root, '[name="phone"]').trim(),
    country: fieldValue(root, '[name="country"]').trim(),
    contactMethod: method === 'Phone' || method === 'WhatsApp' ? method : 'Email',
    bestTime: fieldValue(root, '[name="bestTime"]'),
  };
}

function readRoute(root: HTMLElement): SellQuoteSubmission['route'] {
  const route = root.querySelector<HTMLInputElement>('input[name="route"]:checked')?.value;
  return route === 'shipping' ? 'shipping' : route === 'speak-first' ? 'speak-first' : 'appointment';
}

function setError(control: HTMLElement | null, message: string): void {
  if (!control) return;
  control.setAttribute('aria-invalid', 'true');
  if (!control.id) control.id = `sell-control-${Math.random().toString(36).slice(2, 9)}`;
  const errorId = `${control.id}-validation`;
  control.setAttribute('aria-describedby', errorId);
  let error = control.parentElement?.querySelector<HTMLElement>(`#${CSS.escape(errorId)}`);
  if (!error) {
    error = document.createElement('span');
    error.id = errorId;
    error.className = 'mc-sell-field-error';
    control.insertAdjacentElement('afterend', error);
  }
  error.textContent = message;
}

function clearError(control: HTMLElement): void {
  control.removeAttribute('aria-invalid');
  const errorId = control.getAttribute('aria-describedby');
  if (errorId?.endsWith('-validation')) {
    control.removeAttribute('aria-describedby');
    document.getElementById(errorId)?.remove();
  }
}

function focusInvalid(control: HTMLElement | null): void {
  if (!control) return;
  control.focus();
  control.scrollIntoView({
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'center',
  });
}

function updateStep(root: HTMLElement, next: number, completed: Set<number>): void {
  root.querySelectorAll<HTMLElement>('[data-sell-step]').forEach(panel => {
    panel.hidden = Number(panel.dataset.sellStep) !== next;
  });
  const back = root.querySelector<HTMLButtonElement>('[data-sell-back]');
  const forward = root.querySelector<HTMLButtonElement>('[data-sell-next]');
  const submit = root.querySelector<HTMLButtonElement>('[data-sell-submit]');
  if (back) back.hidden = next === 1;
  if (forward) forward.hidden = next === 4;
  if (submit) submit.hidden = next !== 4;
  const announcement = root.querySelector<HTMLElement>('[data-sell-step-announcement]');
  if (announcement) announcement.textContent = copy.workspace.stepLabel(next);
  root.querySelectorAll<HTMLButtonElement>('[data-sell-step-button]').forEach(button => {
    const step = Number(button.dataset.sellStepButton);
    button.disabled = step > next && !Array.from({ length: step - 1 }, (_, index) => completed.has(index + 1)).every(Boolean);
    button.toggleAttribute('aria-current', step === next);
    button.innerHTML = `<span class="mc-sell-step-number">${completed.has(step) ? '✓' : step}</span><span class="mc-sell-step-name">${escapeHtml(copy.workspace.steps[step - 1] ?? '')}</span>`;
  });
  const legend = root.querySelector<HTMLElement>(`[data-sell-step="${next}"] legend`);
  if (legend) {
    legend.tabIndex = -1;
    legend.focus();
  }
  if (next === 4) renderReview(root);
  saveDraft(root, next);
}

function renderReview(root: HTMLElement): void {
  const review = root.querySelector<HTMLElement>('[data-sell-review]');
  if (!review) return;
  const items = readItems(root);
  const details = readDetails(root);
  const route = readRoute(root);
  const date = fieldValue(root, '[data-sell-appointment-date]');
  const time = fieldValue(root, '[data-sell-appointment-time]');
  review.innerHTML = `<section class="mc-sell-review-card"><div><h3>${escapeHtml(copy.workspace.itemHeading)}</h3><button type="button" data-sell-edit="1">Edit</button></div><ul>${items.map(item => `<li>${item.quantity} × ${item.weight} ${escapeHtml(item.unit)} ${escapeHtml(item.metal.toLowerCase())} ${escapeHtml(item.type.toLowerCase())} · ${escapeHtml(item.purity === 'not-sure' ? copy.workspace.field.notSure : item.purity)}</li>`).join('')}</ul></section>
    <section class="mc-sell-review-card"><div><h3>${escapeHtml(copy.workspace.detailsHeading)}</h3><button type="button" data-sell-edit="2">Edit</button></div><p>${escapeHtml(details.fullName)} · ${escapeHtml(details.email)} · ${escapeHtml(details.phoneCode + ' ' + details.phone)} · ${escapeHtml(details.country)}</p><p>${escapeHtml(details.contactMethod)}${details.bestTime ? ` · ${escapeHtml(details.bestTime)}` : ''}</p></section>
    <section class="mc-sell-review-card"><div><h3>${escapeHtml(copy.workspace.presentationHeading)}</h3><button type="button" data-sell-edit="3">Edit</button></div><p>${route === 'appointment' ? `${escapeHtml(copy.workspace.field.visit)}${date ? ` · ${escapeHtml(date)}${time ? ` · ${escapeHtml(time)} Dubai` : ''}` : ''}` : route === 'shipping' ? escapeHtml(copy.workspace.field.shipping) : escapeHtml(copy.workspace.field.speakFirst)}</p>${route === 'appointment' ? `<p>${escapeHtml(copy.workspace.appointmentFallback)}</p>` : ''}</section>`;
}

function hasProgress(root: HTMLElement): boolean {
  return readItems(root).length > 1
    || readItems(root).some(item => item.weight > 0 || item.description.length > 0)
    || Object.values(readDetails(root)).some(value => value.length > 0)
    || readRoute(root) !== 'appointment'
    || Boolean(fieldValue(root, '[data-sell-appointment-date]'));
}

function saveDraft(root: HTMLElement, step = Number(root.dataset.sellStep ?? 1)): void {
  if (!hasProgress(root)) {
    localStorage.removeItem(DRAFT_KEY);
    return;
  }
  const items = readItems(root).map(({ photoNames: _photoNames, ...item }) => item);
  const draft = sanitizeSellQuoteDraft({
    step,
    items,
    details: readDetails(root),
    route: readRoute(root),
    appointmentDate: fieldValue(root, '[data-sell-appointment-date]'),
    appointmentTime: fieldValue(root, '[data-sell-appointment-time]'),
  });
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    const status = root.querySelector<HTMLElement>('[data-sell-draft-status]');
    if (status) status.textContent = copy.workspace.photosNotSaved;
  } catch (error) {
    console.error('Unable to save Sell to Us draft.', error);
    const status = root.querySelector<HTMLElement>('[data-sell-draft-status]');
    if (status) status.textContent = 'Your draft could not be saved in this browser.';
  }
}

function isDraft(value: unknown): value is SellQuoteDraft {
  if (!value || typeof value !== 'object') return false;
  const draft = value as Partial<SellQuoteDraft>;
  return Number.isInteger(draft.step) && Array.isArray(draft.items)
    && typeof draft.details === 'object'
    && (draft.route === 'appointment' || draft.route === 'shipping' || draft.route === 'speak-first')
    && typeof draft.appointmentDate === 'string' && typeof draft.appointmentTime === 'string';
}

function restoreDraft(root: HTMLElement, completed: Set<number>): number {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return 1;
  let draftValue: unknown;
  try {
    draftValue = JSON.parse(raw);
  } catch (error) {
    console.error('Unable to parse saved Sell to Us draft.', error);
    localStorage.removeItem(DRAFT_KEY);
    return 1;
  }
  if (!isDraft(draftValue) || draftValue.items.length < 1 || draftValue.items.length > SELL_TO_US_CONFIG.maxItems) {
    localStorage.removeItem(DRAFT_KEY);
    return 1;
  }
  const container = root.querySelector<HTMLElement>('[data-sell-items]');
  if (!container) return 1;
  container.innerHTML = draftValue.items.map((item, index) => renderSellItemCard(item.id, index, item)).join('');
  for (const [name, value] of Object.entries(draftValue.details)) {
    const field = root.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${CSS.escape(name)}"]`);
    if (field && typeof value === 'string') field.value = value;
  }
  if (draftValue.details.contactMethod) {
    const radio = root.querySelector<HTMLInputElement>(`input[name="contactMethod"][value="${CSS.escape(draftValue.details.contactMethod)}"]`);
    if (radio) radio.checked = true;
  }
  const route = root.querySelector<HTMLInputElement>(`input[name="route"][value="${draftValue.route}"]`);
  if (route && !route.disabled) route.checked = true;
  const date = root.querySelector<HTMLInputElement>('[data-sell-appointment-date]');
  const time = root.querySelector<HTMLInputElement>('[data-sell-appointment-time]');
  if (date) date.value = draftValue.appointmentDate;
  if (time) time.value = draftValue.appointmentTime;
  const restored = root.querySelector<HTMLElement>('[data-sell-restored]');
  if (restored) restored.hidden = false;
  completed.clear();
  updateRoute(root);
  if (draftValue.appointmentDate) {
    const [year, month] = draftValue.appointmentDate.split('-').map(Number);
    renderCalendar(root, year, month - 1);
    renderSlots(root, draftValue.appointmentDate);
  }
  return draftValue.step;
}

function syncItemCards(root: HTMLElement): void {
  const cards = [...root.querySelectorAll<HTMLElement>('[data-sell-item]')];
  cards.forEach((card, index) => {
    const title = card.querySelector('h3');
    if (title) title.textContent = `Item ${index + 1}`;
    const remove = card.querySelector<HTMLButtonElement>('[data-sell-remove]');
    if (remove) remove.disabled = cards.length === 1;
  });
  const add = root.querySelector<HTMLButtonElement>('[data-sell-add-item]');
  if (add) add.disabled = cards.length >= SELL_TO_US_CONFIG.maxItems;
}

function clearPhotos(photos: Map<string, StoredPhoto[]>): void {
  for (const entries of photos.values()) entries.forEach(photo => URL.revokeObjectURL(photo.url));
  photos.clear();
}

function renderPhotos(root: HTMLElement, id: string, photos: Map<string, StoredPhoto[]>): void {
  const list = root.querySelector<HTMLElement>(`[data-sell-photo-list="${CSS.escape(id)}"]`);
  if (!list) return;
  list.innerHTML = (photos.get(id) ?? []).map((photo, index) => `<div class="mc-sell-photo"><img src="${escapeHtml(photo.url)}" alt=""><span>${escapeHtml(photo.file.name)}</span><button type="button" data-sell-remove-photo="${escapeHtml(id)}" data-sell-photo-index="${index}" aria-label="Remove ${escapeHtml(photo.file.name)}">×</button></div>`).join('');
}

function addPhotos(root: HTMLElement, id: string, files: FileList | File[], stored: Map<string, StoredPhoto[]>): void {
  const current = stored.get(id) ?? [];
  const accepted: File[] = [];
  const errors: string[] = [];
  for (const file of Array.from(files)) {
    const error = validateSellPhotos([file], current.length + accepted.length)[0];
    if (error) errors.push(`${file.name}: ${error.message}`);
    else accepted.push(file);
  }
  stored.set(id, [...current, ...accepted.map(file => ({ file, url: URL.createObjectURL(file) }))]);
  const errorNode = root.querySelector<HTMLElement>(`[data-sell-photo-errors="${CSS.escape(id)}"]`);
  if (errorNode) errorNode.textContent = errors.join(' ');
  renderPhotos(root, id, stored);
  saveDraft(root);
}

function showItemErrors(card: HTMLElement, errors: Record<string, string>): HTMLElement | null {
  let first: HTMLElement | null = null;
  for (const [name, message] of Object.entries(errors)) {
    const field = card.querySelector<HTMLElement>(`[data-sell-field="${name}"]`);
    if (!field) continue;
    field.setAttribute('aria-invalid', 'true');
    let error = card.querySelector<HTMLElement>(`[data-sell-error="${name}"]`);
    if (!error) {
      error = document.createElement('span');
      error.className = 'mc-sell-field-error';
      error.dataset.sellError = name;
      error.setAttribute('role', 'alert');
      field.insertAdjacentElement('afterend', error);
    }
    error.textContent = message;
    first ??= field;
  }
  return first;
}

function clearItemErrors(card: HTMLElement): void {
  card.querySelectorAll<HTMLElement>('[data-sell-error]').forEach(error => error.remove());
  card.querySelectorAll<HTMLElement>('[aria-invalid="true"]').forEach(field => field.removeAttribute('aria-invalid'));
}

function validateStep(root: HTMLElement, step: number): boolean {
  if (step === 1) {
    const items = readItems(root);
    const valid = validateSellItems(items);
    let first: HTMLElement | null = null;
    root.querySelectorAll<HTMLElement>('[data-sell-item]').forEach((card, index) => {
      const item = items[index];
      if (!item) return;
      const errors: Record<string, string> = {};
      if (!item.purity) errors.purity = 'Choose a purity or “Not sure”.';
      if (!Number.isFinite(item.weight) || item.weight <= 0 || item.weight > SELL_TO_US_CONFIG.maxWeight) {
        errors.weight = `Enter a weight greater than 0 and no more than ${SELL_TO_US_CONFIG.maxWeight.toLocaleString()}.`;
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 999) errors.quantity = 'Enter a quantity from 1 to 999.';
      first ??= showItemErrors(card, errors);
    });
    if (!valid) return true;
    const status = root.querySelector<HTMLElement>('[data-sell-submit-status]');
    if (status) status.textContent = valid ?? '';
    focusInvalid(first ?? root.querySelector('[data-sell-add-item]'));
    return false;
  }
  if (step === 2) {
    const errors = validateSellDetails(readDetails(root));
    const labels: Record<string, string> = {
      fullName: 'Enter your full name.',
      email: 'Enter a valid email address.',
      phone: 'Enter a valid international phone number.',
      country: 'Choose your country.',
      contactMethod: 'Choose a contact method.',
    };
    let first: HTMLElement | null = null;
    for (const [key, value] of Object.entries(errors)) {
      const field = key === 'contactMethod' ? root.querySelector<HTMLInputElement>('input[name="contactMethod"]')
        : root.querySelector<HTMLElement>(`[name="${key}"]`);
      setError(field, labels[key] ?? value);
      first ??= field;
    }
    if (first) focusInvalid(first);
    return !first;
  }
  if (step === 3) {
    const error = validateSellPresentation(readRoute(root), fieldValue(root, '[data-sell-appointment-date]'), fieldValue(root, '[data-sell-appointment-time]'));
    if (error) {
      const status = root.querySelector<HTMLElement>('[data-sell-submit-status]');
      if (status) status.textContent = error;
      focusInvalid(root.querySelector<HTMLElement>('[data-sell-calendar]'));
      return false;
    }
    return true;
  }
  const consents = {
    accurate: Boolean(root.querySelector<HTMLInputElement>('[name="accuracy"]')?.checked),
    verification: Boolean(root.querySelector<HTMLInputElement>('[name="verification"]')?.checked),
    contact: Boolean(root.querySelector<HTMLInputElement>('[name="contactConsent"]')?.checked),
  };
  const error = root.querySelector<HTMLElement>('[data-sell-consent-error]');
  if (!validateSellConsents(consents)) {
    if (error) error.textContent = 'Please confirm all required statements before sending your request.';
    focusInvalid(root.querySelector<HTMLInputElement>('[name="accuracy"]'));
    return false;
  }
  if (error) error.textContent = '';
  return true;
}

function updateRoute(root: HTMLElement): void {
  const panel = root.querySelector<HTMLElement>('[data-sell-appointment]');
  if (panel) panel.hidden = readRoute(root) !== 'appointment';
}

function visitorTime(date: string, time: string): string {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(`${date}T${time}:00+04:00`));
}

function renderSlots(root: HTMLElement, date: string): void {
  const holder = root.querySelector<HTMLElement>('[data-sell-slots]');
  if (!holder) return;
  const slots = appointmentService.getSlots(date, appointmentService.getReservedSlots());
  if (!slots.some(slot => slot.available)) {
    holder.innerHTML = `<p>${escapeHtml(copy.workspace.noSlots)}</p>`;
    return;
  }
  const selected = fieldValue(root, '[data-sell-appointment-time]');
  holder.innerHTML = `<h3>${escapeHtml(copy.workspace.chooseTime)}</h3><div class="mc-sell-slot-list">${slots.map(slot => `<button type="button" class="mc-sell-slot" data-sell-slot="${escapeHtml(slot.time)}"${slot.available ? '' : ' disabled'}${slot.time === selected ? ' aria-pressed="true"' : ''}><span>${escapeHtml(slot.time)} Dubai</span><small>${escapeHtml(visitorTime(date, slot.time))} ${escapeHtml(copy.workspace.visitorTime)}</small></button>`).join('')}</div>`;
}

function renderCalendar(root: HTMLElement, year: number, month: number): void {
  const heading = root.querySelector<HTMLElement>('[data-sell-calendar-month]');
  const days = root.querySelector<HTMLElement>('[data-sell-calendar-days]');
  if (!heading || !days) return;
  const first = new Date(Date.UTC(year, month, 1));
  heading.textContent = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(first);
  const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const offset = first.getUTCDay();
  const today = getDubaiDate();
  const reserved = appointmentService.getReservedSlots();
  const cells = Array.from({ length: offset }, () => '<span class="mc-sell-calendar-empty" aria-hidden="true"></span>');
  for (let day = 1; day <= count; day += 1) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const available = !isAppointmentDateDisabled(date, today) && appointmentService.getSlots(date, reserved).some(slot => slot.available);
    const selected = fieldValue(root, '[data-sell-appointment-date]') === date;
    const label = new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
    cells.push(`<button type="button" role="gridcell" data-sell-date="${date}" aria-label="${escapeHtml(label)}"${selected ? ' aria-selected="true" tabindex="0"' : ' tabindex="-1"'}${available ? '' : ' disabled'}>${day}</button>`);
  }
  days.innerHTML = cells.join('');
  const current = new Date(`${today}T12:00:00Z`);
  const max = new Date(current);
  max.setUTCDate(max.getUTCDate() + SELL_TO_US_CONFIG.appointmentWindowDays);
  const previous = root.querySelector<HTMLButtonElement>('[data-sell-calendar-nav="-1"]');
  const next = root.querySelector<HTMLButtonElement>('[data-sell-calendar-nav="1"]');
  if (previous) previous.disabled = year < current.getUTCFullYear() || (year === current.getUTCFullYear() && month <= current.getUTCMonth());
  if (next) next.disabled = year > max.getUTCFullYear() || (year === max.getUTCFullYear() && month >= max.getUTCMonth());
}

function clearDraft(root: HTMLElement, photos: Map<string, StoredPhoto[]>, completed: Set<number>): void {
  localStorage.removeItem(DRAFT_KEY);
  clearPhotos(photos);
  const container = root.querySelector<HTMLElement>('[data-sell-items]');
  if (container) container.innerHTML = renderSellItemCard('sell-item-1', 0);
  root.querySelector<HTMLFormElement>('[data-sell-form]')?.reset();
  const restored = root.querySelector<HTMLElement>('[data-sell-restored]');
  const status = root.querySelector<HTMLElement>('[data-sell-draft-status]');
  if (restored) restored.hidden = true;
  if (status) status.textContent = 'Draft cleared.';
  completed.clear();
  updateStep(root, 1, completed);
  syncItemCards(root);
  updateRoute(root);
}

function getDateIcs(reference: string, date: string, time: string): string {
  const [year, month, day] = date.split('-');
  const [hour, minute] = time.split(':');
  const end = Number(hour) * 60 + Number(minute) + CONTACT_CONFIG.slotDurationMinutes;
  const endHour = String(Math.floor(end / 60)).padStart(2, '0');
  const endMinute = String(end % 60).padStart(2, '0');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Montague Cole Bullion//Quote Request//EN',
    'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `UID:${reference}@montaguecole.example`,
    `DTSTAMP:${stamp}Z`, `DTSTART;TZID=Asia/Dubai:${year}${month}${day}T${hour}${minute}00`,
    `DTEND;TZID=Asia/Dubai:${year}${month}${day}T${endHour}${endMinute}00`,
    'SUMMARY:Sell to Us appointment request (subject to confirmation)',
    `DESCRIPTION:${copy.workspace.appointmentFallback}`, 'STATUS:TENTATIVE', 'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}

function downloadIcs(root: HTMLElement): void {
  const reference = root.querySelector<HTMLElement>('[data-sell-reference]')?.textContent ?? '';
  const date = fieldValue(root, '[data-sell-appointment-date]');
  const time = fieldValue(root, '[data-sell-appointment-time]');
  const url = URL.createObjectURL(new Blob([getDateIcs(reference, date, time)], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${reference || 'sell-to-us-request'}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

function idempotencyKey(): string {
  if (crypto.randomUUID) return crypto.randomUUID();
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), value => value.toString(16).padStart(2, '0')).join('');
}

function renderSuccess(root: HTMLElement, receipt: Awaited<ReturnType<typeof sellQuoteService.submit>>, details: SellQuoteDetails): void {
  const success = root.querySelector<HTMLElement>('[data-sell-success]');
  const form = root.querySelector<HTMLElement>('[data-sell-form]');
  if (!success || !form) return;
  const firstName = details.fullName.trim().split(/\s+/)[0] ?? '';
  const appointment = receipt.route === 'appointment' && receipt.appointmentDate && receipt.appointmentTime;
  const routeText = receipt.route === 'appointment'
    ? `${copy.workspace.field.visit} · ${receipt.appointmentDate} · ${receipt.appointmentTime} Dubai`
    : receipt.route === 'shipping' ? copy.workspace.field.shipping : copy.workspace.field.speakFirst;
  success.innerHTML = `<span class="mc-sell-eyebrow">Request received</span><h2 id="sell-success-heading">${escapeHtml(copy.success.heading(firstName))}</h2>
    <div class="mc-sell-reference"><span>Reference</span><code data-sell-reference>${escapeHtml(receipt.reference)}</code><button type="button" data-sell-copy-reference>${escapeHtml(copy.success.copyReference)}</button><span role="status" data-sell-copy-status></span></div>
    <section class="mc-sell-review-card"><h3>Items included</h3><ul>${receipt.items.map(item => `<li>${item.quantity} × ${item.weight} ${escapeHtml(item.unit)} ${escapeHtml(item.metal.toLowerCase())} ${escapeHtml(item.type.toLowerCase())}</li>`).join('')}</ul></section>
    <section class="mc-sell-review-card"><h3>How to present your items</h3><p>${escapeHtml(routeText)}</p><p>${escapeHtml(copy.workspace.appointmentFallback)}</p>${appointment ? `<button type="button" data-sell-add-calendar>${escapeHtml(copy.success.addCalendar)}</button>` : ''}</section>
    <section class="mc-sell-next-steps"><h3>${escapeHtml(copy.success.next)}</h3><ol>${copy.success.steps.map(step => `<li>${escapeHtml(step)}</li>`).join('')}</ol></section>
    <div class="mc-sell-success-actions"><button type="button" data-sell-print-summary>${escapeHtml(copy.success.print)}</button><a href="/catalogue" data-modern-path="/catalogue" class="mc-sell-button">${escapeHtml(copy.success.catalogue)}</a><a href="/mc-reserve" data-modern-path="/mc-reserve" class="mc-sell-button mc-sell-button-outline">${escapeHtml(copy.success.reserve)}</a></div>`;
  form.hidden = true;
  success.hidden = false;
  success.focus();
  localStorage.removeItem(DRAFT_KEY);
  root.dataset.sellSubmitted = 'true';
}

async function submitQuote(root: HTMLElement, photos: Map<string, StoredPhoto[]>): Promise<void> {
  const status = root.querySelector<HTMLElement>('[data-sell-submit-status]');
  const button = root.querySelector<HTMLButtonElement>('[data-sell-submit]');
  for (let step = 1; step <= 4; step += 1) {
    if (!validateStep(root, step)) {
      root.dataset.sellStep = String(step);
      updateStep(root, step, new Set([1, 2, 3]));
      return;
    }
  }
  const route = readRoute(root);
  const date = fieldValue(root, '[data-sell-appointment-date]');
  const time = fieldValue(root, '[data-sell-appointment-time]');
  const details = readDetails(root);
  const honeypot = fieldValue(root, '[name="website"]');
  if (honeypot) {
    if (status) status.textContent = copy.workspace.submitError;
    return;
  }
  const last = Number(sessionStorage.getItem(LAST_SUBMIT_KEY) ?? 0);
  const wait = SELL_TO_US_CONFIG.submissionIntervalMs - (Date.now() - last);
  if (last > 0 && wait > 0) {
    if (status) status.textContent = `Please wait ${Math.ceil(wait / 1000)} seconds before sending another request.`;
    return;
  }
  const reserved = route === 'appointment' && appointmentService.reserveSlot(date, time);
  if (route === 'appointment' && !reserved) {
    if (status) status.textContent = 'That request time is no longer available. Please choose another time.';
    renderSlots(root, date);
    return;
  }
  if (button) {
    button.disabled = true;
    button.textContent = copy.workspace.sending;
  }
  if (status) status.textContent = '';
  const items = readItems(root).map(item => ({
    ...item,
    photoNames: (photos.get(item.id) ?? []).map(photo => photo.file.name),
  }));
  const submission: SellQuoteSubmission = {
    idempotencyKey: idempotencyKey(),
    items,
    details,
    route,
    appointmentDate: route === 'appointment' ? date : '',
    appointmentTime: route === 'appointment' ? time : '',
    consents: {
      accurate: Boolean(root.querySelector<HTMLInputElement>('[name="accuracy"]')?.checked),
      verification: Boolean(root.querySelector<HTMLInputElement>('[name="verification"]')?.checked),
      contact: Boolean(root.querySelector<HTMLInputElement>('[name="contactConsent"]')?.checked),
    },
    honeypot,
  };
  window.dispatchEvent(new CustomEvent('sell_submit', { detail: { route, itemCount: items.length } }));
  try {
    sessionStorage.setItem(LAST_SUBMIT_KEY, String(Date.now()));
    const receipt = await sellQuoteService.submit(submission);
    renderSuccess(root, receipt, details);
    clearPhotos(photos);
  } catch (error) {
    if (reserved) appointmentService.releaseSlot(date, time);
    console.error('Sell to Us quote submission failed.', error);
    if (status) status.textContent = copy.workspace.submitError;
    if (button) {
      button.disabled = false;
      button.textContent = copy.workspace.submit;
    }
  }
}

function loadChecklist(root: HTMLElement): void {
  const boxes = [...root.querySelectorAll<HTMLInputElement>('[data-sell-checklist]')];
  const saved = sessionStorage.getItem(CHECKLIST_KEY);
  if (!saved) return;
  try {
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed) || !parsed.every(value => typeof value === 'boolean')) throw new TypeError('Saved checklist data is invalid.');
    boxes.forEach((box, index) => box.checked = parsed[index] ?? false);
  } catch (error) {
    console.error('Unable to restore Sell to Us checklist.', error);
    sessionStorage.removeItem(CHECKLIST_KEY);
  }
}

function printPage(root: HTMLElement, mode: 'checklist' | 'summary'): void {
  root.dataset.sellPrintMode = mode;
  const clear = () => {
    delete root.dataset.sellPrintMode;
    window.removeEventListener('afterprint', clear);
  };
  window.addEventListener('afterprint', clear, { once: true });
  window.print();
}

function startStep(root: HTMLElement, step: number, completed: Set<number>): boolean {
  if (!validateStep(root, step)) return false;
  completed.add(step);
  window.dispatchEvent(new CustomEvent('sell_step_complete', { detail: { step } }));
  return true;
}

function syncCalendar(root: HTMLElement, year: number, month: number): void {
  const heading = root.querySelector<HTMLElement>('[data-sell-calendar-month]');
  const days = root.querySelector<HTMLElement>('[data-sell-calendar-days]');
  if (!heading || !days) return;
  const first = new Date(Date.UTC(year, month, 1));
  heading.textContent = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(first);
  const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const offset = first.getUTCDay();
  const today = getDubaiDate();
  const reserved = appointmentService.getReservedSlots();
  const cells = Array.from({ length: offset }, () => '<span class="mc-sell-calendar-empty" aria-hidden="true"></span>');
  for (let day = 1; day <= count; day += 1) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const available = !isAppointmentDateDisabled(date, today) && appointmentService.getSlots(date, reserved).some(slot => slot.available);
    const selected = fieldValue(root, '[data-sell-appointment-date]') === date;
    const label = new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
    cells.push(`<button type="button" role="gridcell" data-sell-date="${date}" aria-label="${escapeHtml(label)}"${selected ? ' aria-selected="true" tabindex="0"' : ' tabindex="-1"'}${available ? '' : ' disabled'}>${day}</button>`);
  }
  days.innerHTML = cells.join('');
  const now = new Date(`${today}T12:00:00Z`);
  const limit = new Date(now);
  limit.setUTCDate(limit.getUTCDate() + SELL_TO_US_CONFIG.appointmentWindowDays);
  const prev = root.querySelector<HTMLButtonElement>('[data-sell-calendar-nav="-1"]');
  const next = root.querySelector<HTMLButtonElement>('[data-sell-calendar-nav="1"]');
  if (prev) prev.disabled = year < now.getUTCFullYear() || (year === now.getUTCFullYear() && month <= now.getUTCMonth());
  if (next) next.disabled = year > limit.getUTCFullYear() || (year === limit.getUTCFullYear() && month >= limit.getUTCMonth());
}

function renderAppointmentSlots(root: HTMLElement, date: string): void {
  const holder = root.querySelector<HTMLElement>('[data-sell-slots]');
  if (!holder) return;
  const slots = appointmentService.getSlots(date, appointmentService.getReservedSlots());
  if (!slots.some(slot => slot.available)) {
    holder.innerHTML = `<p>${escapeHtml(copy.workspace.noSlots)}</p>`;
    return;
  }
  const selected = fieldValue(root, '[data-sell-appointment-time]');
  const localTime = (time: string) => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(`${date}T${time}:00+04:00`));
  holder.innerHTML = `<h3>${escapeHtml(copy.workspace.chooseTime)}</h3><div class="mc-sell-slot-list">${slots.map(slot => `<button type="button" class="mc-sell-slot" data-sell-slot="${escapeHtml(slot.time)}"${slot.available ? '' : ' disabled'}${slot.time === selected ? ' aria-pressed="true"' : ''}><span>${escapeHtml(slot.time)} Dubai</span><small>${escapeHtml(localTime(slot.time))} ${escapeHtml(copy.workspace.visitorTime)}</small></button>`).join('')}</div>`;
}

function clearStepFieldError(target: HTMLElement): void {
  clearError(target);
  const group = target.closest('.mc-sell-phone-field');
  group?.querySelector<HTMLElement>('[data-sell-detail-error]')?.replaceChildren();
}

function printChecklist(root: HTMLElement): void {
  const checklist = root.querySelector<HTMLElement>('.mc-sell-checklist-card');
  if (!checklist) return;
  const printable = checklist.cloneNode(true) as HTMLElement;
  const checks = [...printable.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];
  const originalChecks = [...checklist.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];
  checks.forEach((check, index) => {
    const mark = document.createElement('span');
    mark.textContent = originalChecks[index]?.checked ? '☑ ' : '☐ ';
    check.replaceWith(mark);
  });
  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=700,height=700');
  if (!printWindow) {
    root.dataset.sellPrintMode = 'checklist';
    window.print();
    delete root.dataset.sellPrintMode;
    return;
  }
  printWindow.document.write(`<title>${escapeHtml(copy.checklist.heading)}</title><style>body{font:16px sans-serif;padding:32px;color:#001838}li{margin:14px 0}button{display:none}</style><h1>${escapeHtml(copy.checklist.heading)}</h1>${printable.outerHTML}`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}

export function attachSellToUsInteractions(root: HTMLElement): void {
  const page = root.querySelector<HTMLElement>('[data-sell-page]');
  if (!page) return;
  const photos = new Map<string, StoredPhoto[]>();
  const completed = new Set<number>();
  let currentStep = 1;
  let nextItemId = 2;
  let year = Number(getDubaiDate().slice(0, 4));
  let month = Number(getDubaiDate().slice(5, 7)) - 1;
  let submitted = false;

  window.dispatchEvent(new CustomEvent('sell_view', { detail: { path: location.pathname } }));
  currentStep = restoreDraft(page, completed);
  page.dataset.sellStep = String(currentStep);
  for (let step = 1; step < currentStep; step += 1) completed.add(step);
  const maxItemId = [...page.querySelectorAll<HTMLElement>('[data-sell-item]')]
    .map(card => Number(card.dataset.sellItem?.replace('sell-item-', '')) || 0);
  nextItemId = Math.max(1, ...maxItemId) + 1;
  syncCalendar(page, year, month);
  updateStep(page, currentStep, completed);
  syncItemCards(page);
  updateRoute(page);
  loadChecklist(page);

  const beforeUnload = (event: BeforeUnloadEvent) => {
    if (!submitted && hasProgress(page)) {
      event.preventDefault();
      event.returnValue = '';
    }
  };
  window.addEventListener('beforeunload', beforeUnload);
  root.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const target = event.target;
    const anchor = target.closest<HTMLAnchorElement>('a[href^="#"]');
    if (anchor) {
      const hash = anchor.getAttribute('href');
      if (hash && hash.length > 1) {
        const dest = root.querySelector<HTMLElement>(hash) || document.querySelector<HTMLElement>(hash);
        if (dest) {
          event.preventDefault();
          dest.scrollIntoView({ behavior: 'smooth', block: 'start' });
          try {
            history.pushState(null, '', hash);
          } catch {
            // ignore
          }
        }
      }
    }

    const cta = target.closest<HTMLElement>('[data-sell-cta]');
    if (cta) window.dispatchEvent(new CustomEvent('sell_start', { detail: { action: cta.dataset.sellCta } }));

    const prefill = target.closest<HTMLAnchorElement>('[data-sell-prefill-metal]');
    if (prefill) {
      const query = `?metal=${encodeURIComponent(prefill.dataset.sellPrefillMetal ?? '')}&type=${encodeURIComponent(prefill.dataset.sellPrefillType ?? '')}`;
      const values = parseSellQuoteParams(query);
      const card = page.querySelector<HTMLElement>('[data-sell-item]');
      if (card && values.metal) card.querySelector<HTMLButtonElement>(`[data-sell-metal="${values.metal}"]`)?.click();
      const type = card?.querySelector<HTMLSelectElement>('[data-sell-field="type"]');
      if (type && values.type) type.value = values.type;
      window.dispatchEvent(new CustomEvent('sell_start', { detail: values }));
    }

    const metal = target.closest<HTMLButtonElement>('[data-sell-metal]');
    if (metal) {
      const card = metal.closest<HTMLElement>('[data-sell-item]');
      const value = metal.dataset.sellMetal === 'Silver' ? 'Silver' : 'Gold';
      const field = card?.querySelector<HTMLInputElement>('[data-sell-field="metal"]');
      if (field) field.value = value;
      card?.querySelectorAll<HTMLButtonElement>('[data-sell-metal]').forEach(button => button.setAttribute('aria-pressed', String(button === metal)));
      const purity = card?.querySelector<HTMLSelectElement>('[data-sell-field="purity"]');
      if (purity) purity.innerHTML = `<option value="">Choose purity</option>${SELL_TO_US_CONFIG.purities[value].map(option => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`).join('')}<option value="not-sure" selected>${escapeHtml(copy.workspace.field.notSure)}</option>`;
      if (card) clearItemErrors(card);
      saveDraft(page);
    }

    const add = target.closest<HTMLButtonElement>('[data-sell-add-item]');
    if (add) {
      const cards = [...page.querySelectorAll<HTMLElement>('[data-sell-item]')];
      if (cards.length < SELL_TO_US_CONFIG.maxItems) {
        page.querySelector<HTMLElement>('[data-sell-items]')?.insertAdjacentHTML('beforeend', renderSellItemCard(`sell-item-${nextItemId++}`, cards.length));
        syncItemCards(page);
        saveDraft(page);
      }
    }

    const duplicate = target.closest<HTMLButtonElement>('[data-sell-duplicate]');
    if (duplicate) {
      const cards = [...page.querySelectorAll<HTMLElement>('[data-sell-item]')];
      const sourceId = duplicate.dataset.sellDuplicate ?? '';
      const source = page.querySelector<HTMLElement>(`[data-sell-item="${CSS.escape(sourceId)}"]`);
      const item = readItems(page)[cards.indexOf(source as HTMLElement)];
      if (source && item && cards.length < SELL_TO_US_CONFIG.maxItems) {
        page.querySelector<HTMLElement>('[data-sell-items]')?.insertAdjacentHTML('beforeend', renderSellItemCard(`sell-item-${nextItemId++}`, cards.length, item));
        syncItemCards(page);
        saveDraft(page);
      }
    }

    const remove = target.closest<HTMLButtonElement>('[data-sell-remove]');
    if (remove && page.querySelectorAll('[data-sell-item]').length > 1) {
      const id = remove.dataset.sellRemove ?? '';
      photos.get(id)?.forEach(photo => URL.revokeObjectURL(photo.url));
      photos.delete(id);
      page.querySelector<HTMLElement>(`[data-sell-item="${CSS.escape(id)}"]`)?.remove();
      syncItemCards(page);
      saveDraft(page);
    }

    const browse = target.closest<HTMLButtonElement>('[data-sell-browse]');
    if (browse) page.querySelector<HTMLInputElement>(`[data-sell-file="${CSS.escape(browse.dataset.sellBrowse ?? '')}"]`)?.click();

    const removePhoto = target.closest<HTMLButtonElement>('[data-sell-remove-photo]');
    if (removePhoto) {
      const id = removePhoto.dataset.sellRemovePhoto ?? '';
      const index = Number(removePhoto.dataset.sellPhotoIndex);
      const entries = photos.get(id) ?? [];
      if (entries[index]) URL.revokeObjectURL(entries[index]!.url);
      photos.set(id, entries.filter((_, position) => position !== index));
      renderPhotos(page, id, photos);
      saveDraft(page);
    }

    const next = target.closest<HTMLButtonElement>('[data-sell-next]');
    if (next && startStep(page, currentStep, completed)) {
      currentStep += 1;
      page.dataset.sellStep = String(currentStep);
      updateStep(page, currentStep, completed);
    }
    const back = target.closest<HTMLButtonElement>('[data-sell-back]');
    if (back && currentStep > 1) {
      currentStep -= 1;
      page.dataset.sellStep = String(currentStep);
      updateStep(page, currentStep, completed);
    }
    const stepButton = target.closest<HTMLButtonElement>('[data-sell-step-button]');
    if (stepButton && !stepButton.disabled) {
      const destination = Number(stepButton.dataset.sellStepButton);
      if (destination < currentStep) {
        currentStep = destination;
        page.dataset.sellStep = String(currentStep);
        updateStep(page, currentStep, completed);
      } else if (destination === currentStep + 1 && startStep(page, currentStep, completed)) {
        currentStep = destination;
        page.dataset.sellStep = String(currentStep);
        updateStep(page, currentStep, completed);
      }
    }
    const edit = target.closest<HTMLButtonElement>('[data-sell-edit]');
    if (edit) {
      currentStep = Number(edit.dataset.sellEdit);
      page.dataset.sellStep = String(currentStep);
      updateStep(page, currentStep, completed);
    }
    if (target.closest('[data-sell-clear]')) {
      clearDraft(page, photos, completed);
      currentStep = 1;
      page.dataset.sellStep = '1';
    }

    const dateButton = target.closest<HTMLButtonElement>('[data-sell-date]');
    if (dateButton && !dateButton.disabled) {
      const date = dateButton.dataset.sellDate ?? '';
      const dateInput = page.querySelector<HTMLInputElement>('[data-sell-appointment-date]');
      const timeInput = page.querySelector<HTMLInputElement>('[data-sell-appointment-time]');
      if (dateInput) dateInput.value = date;
      if (timeInput) timeInput.value = '';
      const [y, m] = date.split('-').map(Number);
      year = y;
      month = m - 1;
      syncCalendar(page, year, month);
      renderAppointmentSlots(page, date);
      saveDraft(page);
      window.dispatchEvent(new CustomEvent('sell_appointment_select', { detail: { date } }));
    }
    const nav = target.closest<HTMLButtonElement>('[data-sell-calendar-nav]');
    if (nav) {
      const nextDate = new Date(Date.UTC(year, month + Number(nav.dataset.sellCalendarNav), 1));
      year = nextDate.getUTCFullYear();
      month = nextDate.getUTCMonth();
      syncCalendar(page, year, month);
      page.querySelector<HTMLButtonElement>('[data-sell-calendar-days] button:not([disabled])')?.focus();
    }
    const slot = target.closest<HTMLButtonElement>('[data-sell-slot]');
    if (slot) {
      const time = page.querySelector<HTMLInputElement>('[data-sell-appointment-time]');
      if (time) time.value = slot.dataset.sellSlot ?? '';
      page.querySelectorAll<HTMLButtonElement>('[data-sell-slot]').forEach(button => button.setAttribute('aria-pressed', String(button === slot)));
      saveDraft(page);
      window.dispatchEvent(new CustomEvent('sell_appointment_select', { detail: { time: slot.dataset.sellSlot } }));
    }
    if (target.closest('input[name="route"]')) {
      updateRoute(page);
      saveDraft(page);
    }
    if (target.closest('[data-sell-print-checklist]')) printChecklist(page);
    if (target.closest('[data-sell-print-summary]')) printPage(page, 'summary');
    if (target.closest('[data-sell-add-calendar]')) downloadIcs(page);
    const copyButton = target.closest<HTMLButtonElement>('[data-sell-copy-reference]');
    if (copyButton) {
      const reference = page.querySelector<HTMLElement>('[data-sell-reference]')?.textContent ?? '';
      const status = page.querySelector<HTMLElement>('[data-sell-copy-status]');
      navigator.clipboard.writeText(reference).then(() => {
        if (status) status.textContent = copy.success.copied;
      }).catch(error => {
        console.error('Unable to copy Sell to Us reference.', error);
        if (status) status.textContent = 'Copy is unavailable. Select the reference to copy it.';
      });
    }
  });

  root.addEventListener('input', event => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) return;
    if (target.matches('[data-sell-field]')) {
      const card = target.closest<HTMLElement>('[data-sell-item]');
      if (card) clearItemErrors(card);
      saveDraft(page);
    } else if (['fullName', 'email', 'phone', 'country'].includes(target.name)) {
      clearStepFieldError(target);
      saveDraft(page);
    }
  });

  root.addEventListener('change', event => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) return;
    if (target.matches('[data-sell-field]')) {
      const card = target.closest<HTMLElement>('[data-sell-item]');
      if (card) clearItemErrors(card);
      saveDraft(page);
    }
    if (target instanceof HTMLInputElement && target.matches('[data-sell-file]')) {
      if (target.files) addPhotos(page, target.dataset.sellFile ?? '', target.files, photos);
      target.value = '';
    }
    if (target.matches('input[name="route"]')) {
      updateRoute(page);
      saveDraft(page);
    }
    if (target.matches('[data-sell-checklist]')) {
      try {
        sessionStorage.setItem(CHECKLIST_KEY, JSON.stringify([...page.querySelectorAll<HTMLInputElement>('[data-sell-checklist]')].map(box => box.checked)));
      } catch (error) {
        console.error('Unable to save Sell to Us checklist.', error);
      }
    }
  });

  root.addEventListener('blur', event => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement) || !target.dataset.sellField) return;
    const card = target.closest<HTMLElement>('[data-sell-item]');
    const item = readItems(page).find(value => value.id === card?.dataset.sellItem);
    if (!card || !item) return;
    const errors: Record<string, string> = {};
    if (target.dataset.sellField === 'weight' && (!(item.weight > 0) || item.weight > SELL_TO_US_CONFIG.maxWeight)) errors.weight = `Enter a weight greater than 0 and no more than ${SELL_TO_US_CONFIG.maxWeight.toLocaleString()}.`;
    if (target.dataset.sellField === 'quantity' && (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 999)) errors.quantity = 'Enter a quantity from 1 to 999.';
    showItemErrors(card, errors);
  }, true);

  root.addEventListener('dragover', event => {
    if (!(event.target instanceof Element)) return;
    const zone = event.target.closest<HTMLElement>('[data-sell-dropzone]');
    if (zone) {
      event.preventDefault();
      zone.classList.add('is-dragging');
    }
  });
  root.addEventListener('dragleave', event => {
    if (event.target instanceof Element) event.target.closest<HTMLElement>('[data-sell-dropzone]')?.classList.remove('is-dragging');
  });
  root.addEventListener('drop', event => {
    if (!(event.target instanceof Element)) return;
    const zone = event.target.closest<HTMLElement>('[data-sell-dropzone]');
    if (!zone) return;
    event.preventDefault();
    zone.classList.remove('is-dragging');
    if (event.dataTransfer?.files) addPhotos(page, zone.dataset.sellDropzone ?? '', event.dataTransfer.files, photos);
  });

  root.addEventListener('keydown', event => {
    if (!(event.target instanceof HTMLElement)) return;
    const target = event.target;
    const zone = target.closest<HTMLElement>('[data-sell-dropzone]');
    if (zone && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      page.querySelector<HTMLInputElement>(`[data-sell-file="${CSS.escape(zone.dataset.sellDropzone ?? '')}"]`)?.click();
    }
    const day = target.closest<HTMLButtonElement>('[data-sell-date]');
    if (day) {
      const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1
        : event.key === 'ArrowDown' ? 7 : event.key === 'ArrowUp' ? -7
          : event.key === 'Home' ? -new Date(`${day.dataset.sellDate}T12:00:00Z`).getUTCDay()
            : event.key === 'End' ? 6 - new Date(`${day.dataset.sellDate}T12:00:00Z`).getUTCDay() : 0;
      if (delta) {
        event.preventDefault();
        const nextDate = new Date(`${day.dataset.sellDate}T12:00:00Z`);
        nextDate.setUTCDate(nextDate.getUTCDate() + delta);
        const date = nextDate.toISOString().slice(0, 10);
        let nextDay = page.querySelector<HTMLButtonElement>(`[data-sell-date="${date}"]:not([disabled])`);
        if (!nextDay) {
          year = nextDate.getUTCFullYear();
          month = nextDate.getUTCMonth();
          syncCalendar(page, year, month);
          nextDay = page.querySelector<HTMLButtonElement>(`[data-sell-date="${date}"]:not([disabled])`);
        }
        nextDay?.focus();
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        day.click();
      }
    }
    if (event.key === 'PageUp' || event.key === 'PageDown') {
      if (!target.closest('[data-sell-calendar]')) return;
      event.preventDefault();
      const nextMonth = new Date(Date.UTC(year, month + (event.key === 'PageDown' ? 1 : -1), 1));
      year = nextMonth.getUTCFullYear();
      month = nextMonth.getUTCMonth();
      syncCalendar(page, year, month);
      page.querySelector<HTMLButtonElement>('[data-sell-calendar-days] button:not([disabled])')?.focus();
    }
  });

  root.addEventListener('submit', event => {
    if (!(event.target instanceof HTMLFormElement) || !event.target.matches('[data-sell-form]')) return;
    event.preventDefault();
    if (currentStep < 4) {
      if (startStep(page, currentStep, completed)) {
        currentStep += 1;
        page.dataset.sellStep = String(currentStep);
        updateStep(page, currentStep, completed);
      }
      return;
    }
    void submitQuote(page, photos).then(() => {
      const success = page.querySelector<HTMLElement>('[data-sell-success]');
      if (success && !success.hidden) {
        submitted = true;
        window.removeEventListener('beforeunload', beforeUnload);
      } else {
        const button = page.querySelector<HTMLButtonElement>('[data-sell-submit]');
        if (button?.disabled) {
          button.disabled = false;
          button.textContent = copy.workspace.submit;
        }
      }
    });
  });

  loadChecklist(page);
  const processSteps = [...page.querySelectorAll<HTMLElement>('[data-process-step]')];
  if ('IntersectionObserver' in window && processSteps.length) {
    const observer = new IntersectionObserver(entries => {
      const active = entries.filter(entry => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0]?.target;
      processSteps.forEach(step => step.classList.toggle('is-active', step === active));
    }, { rootMargin: '-25% 0px -55% 0px', threshold: [0, 0.25, 0.6] });
    processSteps.forEach(step => observer.observe(step));
    window.addEventListener('pagehide', () => observer.disconnect(), { once: true });
  }
  window.addEventListener('pagehide', () => {
    clearPhotos(photos);
  }, { once: true });
}