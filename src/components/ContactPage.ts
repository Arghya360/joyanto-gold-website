import '../features/contact-page.css';
import contactBannerImage from '../assets/contact page.png';
import { CONTACT_CONFIG, isOpenNow } from '../config/contact.ts';
import {
  APPOINTMENT_FORMATS,
  APPOINTMENT_PURPOSES,
  BEST_TIMES,
  CONTACT_ENQUIRY_TYPES,
  CONTACT_METHODS,
  contactContent,
  type AppointmentFormat,
  type AppointmentPurpose,
  type ContactEnquiryType,
  type ContactMethod,
} from '../content/contact.ts';
import {
  appointmentService,
  contactService,
  createAppointmentIcs,
  getDubaiDate,
  isAppointmentDateDisabled,
  parseContactType,
  validateContactEnquiry,
  type ContactEnquiry,
  type ContactReceipt,
} from '../services/contact.ts';
import { catalogueItems } from '../features/modern-data.ts';

const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[character] ?? character));

const icon = (name: string): string => {
  const paths: Record<string, string> = {
    Buying: '<path d="M4 8h16v12H4z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/><path d="M8 13h8"/>',
    Selling: '<path d="M4 5h16v14H4z"/><path d="m8 12 3 3 5-6"/><path d="M8 8h.01"/>',
    Storage: '<path d="M3 10 12 4l9 6"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/>',
    'MC Reserve': '<path d="M12 3 4 7v5c0 5 3.5 8 8 10 4.5-2 8-5 8-10V7z"/><path d="m9 12 2 2 4-4"/>',
    'Private Assets': '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M15 9.5c0-1-1.2-1.5-3-1.5s-3 .5-3 1.7c0 3 6 1.2 6 4.4 0 1.2-1.2 1.9-3 1.9s-3-.7-3-1.8"/>',
    'Corporate gifting': '<path d="M4 10h16v10H4z"/><path d="M3 7h18v3H3z"/><path d="M12 7v13"/><path d="M12 7H8a2 2 0 1 1 2-2c0 1 .8 2 2 2Zm0 0h4a2 2 0 1 0-2-2c0 1-.8 2-2 2Z"/>',
    phone: '<path d="M7 3h10v18H7z"/><path d="M10 6h4M11 18h2"/>',
    email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
    whatsapp: '<path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z"/><path d="M9 9c1 3 2 4 5 5"/>',
    address: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? '<circle cx="12" cy="12" r="8"/>'}</svg>`;
};

function dateAtNoon(date: string): Date {
  return new Date(`${date}T12:00:00Z`);
}

function formatDate(date: string, options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }): string {
  return new Intl.DateTimeFormat(undefined, { ...options, timeZone: CONTACT_CONFIG.timezone }).format(dateAtNoon(date));
}

function renderPending(label: string, fallback: string): string {
  return import.meta.env.DEV
    ? `<span class="mc-contact-pending">${escapeHtml(`[PENDING CLIENT: ${label}]`)}</span>`
    : `<span>${escapeHtml(fallback)}</span>`;
}

function renderContactOptions<T extends string>(options: readonly T[], selected = ''): string {
  return options.map(option => `<option value="${escapeHtml(option)}"${option === selected ? ' selected' : ''}>${escapeHtml(option)}</option>`).join('');
}

interface ContactDraft {
  name: string;
  email: string;
  phoneCode: string;
  phone: string;
  country: string;
  type: string;
  preferredContact: string;
  bestTime: string;
  message: string;
}

const draftKey = 'mc-contact-draft';
let draftNotice = '';

const emptyDraft = (): ContactDraft => ({
  name: '',
  email: '',
  phoneCode: '',
  phone: '',
  country: '',
  type: '',
  preferredContact: 'Email',
  bestTime: '',
  message: '',
});

function readContactDraft(): ContactDraft | null {
  draftNotice = '';
  try {
    const serialized = sessionStorage.getItem(draftKey);
    if (!serialized) return null;
    const parsed: unknown = JSON.parse(serialized);
    if (!parsed || typeof parsed !== 'object') throw new Error('Saved contact draft is invalid.');
    const draft = parsed as Record<string, unknown>;
    const keys: (keyof ContactDraft)[] = ['name', 'email', 'phoneCode', 'phone', 'country', 'type', 'preferredContact', 'bestTime', 'message'];
    if (!keys.every(key => typeof draft[key] === 'string')) throw new Error('Saved contact draft is invalid.');
    return {
      name: draft.name as string,
      email: draft.email as string,
      phoneCode: draft.phoneCode as string,
      phone: draft.phone as string,
      country: draft.country as string,
      type: draft.type as string,
      preferredContact: draft.preferredContact as string,
      bestTime: draft.bestTime as string,
      message: draft.message as string,
    };
  } catch {
    draftNotice = contactContent.validation.storageError;
    return null;
  }
}

function renderContactForm(draft: ContactDraft, selectedType: ContactEnquiryType): string {
  const defaultType = selectedType;
  const phoneCodes = CONTACT_CONFIG.phoneDialCodes.map(item => `<option value="${escapeHtml(item.code)}"${draft.phoneCode === item.code ? ' selected' : ''}>${escapeHtml(item.country)} (${escapeHtml(item.code)})</option>`).join('');
  const countryOptions = CONTACT_CONFIG.countries.map(country => `<option value="${escapeHtml(country)}"></option>`).join('');
  const typeOptions = CONTACT_ENQUIRY_TYPES.map(type => `<option value="${escapeHtml(type)}"${type === defaultType ? ' selected' : ''}>${escapeHtml(type)}</option>`).join('');
  const contactChoices = CONTACT_METHODS.map(method => `<label class="mc-contact-segment"><input type="radio" name="preferredContact" value="${escapeHtml(method)}"${(draft.preferredContact || 'Email') === method ? ' checked' : ''}><span>${escapeHtml(method)}</span></label>`).join('');
  const privacy = CONTACT_CONFIG.privacyUrl
    ? `<a href="${escapeHtml(CONTACT_CONFIG.privacyUrl)}">${escapeHtml(contactContent.field.privacy)}</a>`
    : `<span>${escapeHtml(contactContent.field.privacy)}</span>`;
  return `<form class="mc-contact-form" id="contact-enquiry-form" novalidate>
    <div class="mc-contact-form-grid">
      <div class="mc-contact-field-wrap"><label class="mc-contact-field" for="contact-name">${escapeHtml(contactContent.field.fullName)}<input id="contact-name" name="name" autocomplete="name" required value="${escapeHtml(draft.name)}" aria-describedby="contact-name-error"></label><p class="mc-contact-error" id="contact-name-error" data-error-for="name"></p></div>
      <div class="mc-contact-field-wrap"><label class="mc-contact-field" for="contact-email">${escapeHtml(contactContent.field.email)}<input id="contact-email" name="email" type="email" autocomplete="email" required value="${escapeHtml(draft.email)}" aria-describedby="contact-email-error"></label><p class="mc-contact-error" id="contact-email-error" data-error-for="email"></p></div>
      <div class="mc-contact-field-wrap"><label class="mc-contact-field mc-contact-phone-field" for="contact-phone">${escapeHtml(contactContent.field.phone)}
        <span class="mc-contact-phone-row"><select name="phoneCode" aria-label="${escapeHtml(contactContent.field.phoneCode)}" autocomplete="tel-country-code" required><option value="">+</option>${phoneCodes}</select><input id="contact-phone" name="phone" type="tel" autocomplete="tel-national" required placeholder="${escapeHtml(contactContent.field.phoneNumberPlaceholder)}" value="${escapeHtml(draft.phone)}" aria-describedby="contact-phone-error"></span>
      </label><p class="mc-contact-error" id="contact-phone-error" data-error-for="phone"></p></div>
      <label class="mc-contact-field" for="contact-country">${escapeHtml(contactContent.field.country)}<input id="contact-country" name="country" list="contact-countries" autocomplete="country-name" value="${escapeHtml(draft.country)}"><datalist id="contact-countries">${countryOptions}</datalist></label>
      <div class="mc-contact-field-wrap"><label class="mc-contact-field" for="contact-type">${escapeHtml(contactContent.field.enquiryType)}<select id="contact-type" name="type" required><option value="">${escapeHtml(contactContent.field.chooseType)}</option>${typeOptions}</select></label><p class="mc-contact-error" id="contact-type-error" data-error-for="type"></p></div>
      <fieldset class="mc-contact-fieldset"><legend>${escapeHtml(contactContent.field.contactMethod)}</legend><div class="mc-contact-segments">${contactChoices}</div></fieldset>
      <label class="mc-contact-field" for="contact-best-time">${escapeHtml(contactContent.field.bestTime)}<select id="contact-best-time" name="bestTime"><option value="">${escapeHtml(contactContent.field.chooseTime)}</option>${renderContactOptions(BEST_TIMES, draft?.bestTime ?? '')}</select></label>
      <div class="mc-contact-field-wrap mc-contact-field--full"><label class="mc-contact-field" for="contact-message">${escapeHtml(contactContent.field.message)}<span class="mc-contact-textarea-wrap"><textarea id="contact-message" name="message" rows="5" minlength="20" maxlength="1000" required placeholder="${escapeHtml(contactContent.field.messagePlaceholder)}" aria-describedby="contact-message-error contact-message-count">${escapeHtml(draft.message)}</textarea><output id="contact-message-count" aria-live="polite"></output></span></label><p class="mc-contact-error" id="contact-message-error" data-error-for="message"></p></div>
      <label class="mc-contact-consent mc-contact-field--full"><input type="checkbox" name="consent" required aria-describedby="contact-consent-error"><span>${escapeHtml(contactContent.field.consent)} ${privacy}</span></label>
      <p class="mc-contact-error mc-contact-field--full" id="contact-consent-error" data-error-for="consent"></p>
      <label class="mc-contact-honeypot" aria-hidden="true" tabindex="-1">${escapeHtml(contactContent.field.honeypot)}<input name="website" tabindex="-1" autocomplete="off"></label>
      <p class="mc-contact-complaint mc-contact-field--full" hidden>${escapeHtml(contactContent.complaintNote)}</p>
      <button class="mc-button mc-contact-submit mc-contact-field--full" type="submit">${escapeHtml(contactContent.field.submit)}</button>
      <p class="mc-contact-secure mc-contact-field--full">${icon('lock')}<span>${escapeHtml(contactContent.field.security)}</span></p>
      <p class="mc-contact-form-status mc-contact-field--full" role="status" aria-live="polite">${escapeHtml(draftNotice)}</p>
    </div>
  </form>`;
}

function renderQuickActions(): string {
  const actions: Array<{ label: string; href: string; symbol: string }> = [];
  if (CONTACT_CONFIG.phone) actions.push({ label: contactContent.quickAction.call, href: `tel:${CONTACT_CONFIG.phone}`, symbol: 'phone' });
  if (CONTACT_CONFIG.whatsapp) actions.push({ label: contactContent.quickAction.whatsapp, href: CONTACT_CONFIG.whatsapp, symbol: 'whatsapp' });
  if (CONTACT_CONFIG.email) actions.push({ label: contactContent.quickAction.email, href: `mailto:${CONTACT_CONFIG.email}`, symbol: 'email' });
  if (!actions.length) return `<a class="mc-button mc-contact-quick-action" href="#contact-form">${escapeHtml(contactContent.sendEnquiry)}</a>`;
  return actions.map(action => `<a class="mc-button mc-contact-quick-action" href="${escapeHtml(action.href)}">${icon(action.symbol)}${escapeHtml(action.label)}</a>`).join('');
}

function renderIntentCards(selected: ContactEnquiryType): string {
  const intents = Object.keys(contactContent.intent) as (keyof typeof contactContent.intent)[];
  return `<section class="mc-contact-intents" aria-labelledby="contact-intents-heading"><div class="mc-contact-section-title"><span class="mc-eyebrow">${escapeHtml(contactContent.intentEyebrow)}</span><h2 id="contact-intents-heading">${escapeHtml(contactContent.intentHeading)}</h2></div><div class="mc-contact-intent-grid">${intents.map(type => `<button type="button" class="mc-contact-intent${type === selected ? ' is-selected' : ''}" data-contact-intent="${escapeHtml(type)}" aria-pressed="${type === selected}">
    <span class="mc-contact-intent-icon">${icon(type)}</span><span class="mc-contact-intent-copy"><strong>${escapeHtml(type === 'Selling' ? contactContent.sellLabel : type)}</strong><small>${escapeHtml(contactContent.intent[type])}</small></span><span class="mc-contact-intent-check" aria-hidden="true">✓</span>
  </button>`).join('')}</div></section>`;
}

function getConfiguredHours(): Array<{ day: number; open: string; close: string }> {
  return Object.entries(CONTACT_CONFIG.openingHours ?? {}).flatMap(([day, hours]) => (
    hours ? [{ day: Number(day), open: hours.open, close: hours.close }] : []
  ));
}

function getTodayIndex(now = new Date()): number {
  const weekday = new Intl.DateTimeFormat('en-GB', { timeZone: CONTACT_CONFIG.timezone, weekday: 'short' }).format(now);
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(weekday);
}

function renderHoursCard(): string {
  const rows = getConfiguredHours();
  if (!rows.length) return '';
  const now = new Date();
  const today = getTodayIndex(now);
  const openNow = isOpenNow(now, CONTACT_CONFIG.openingHours) ?? false;
  return `<article class="mc-contact-card mc-contact-hours"><h2>${escapeHtml(contactContent.hours.heading)}</h2><span class="mc-contact-badge ${openNow ? 'is-open' : 'is-closed'}">${escapeHtml(openNow ? contactContent.hours.open : contactContent.hours.closed)}</span><p>${escapeHtml(contactContent.hours.timezone)}</p><ul>${rows.map(row => {
    const weekday = new Intl.DateTimeFormat('en', { weekday: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2024, 0, 7 + row.day)));
    return `<li class="${row.day === today ? 'is-today' : ''}"><span>${escapeHtml(weekday)}${row.day === today ? ` · ${escapeHtml(contactContent.booking.calendarToday)}` : ''}</span><time>${escapeHtml(row.open)}–${escapeHtml(row.close)}</time></li>`;
  }).join('')}</ul></article>`;
}

function getNextOpening(now = new Date()): string | null {
  const rows = getConfiguredHours();
  if (!rows.length) return null;
  const todayIndex = getTodayIndex(now);
  const nowParts = new Intl.DateTimeFormat('en-GB', {
    timeZone: CONTACT_CONFIG.timezone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const nowMinutes = Number(nowParts.find(part => part.type === 'hour')?.value) * 60
    + Number(nowParts.find(part => part.type === 'minute')?.value);
  for (let offset = 0; offset < 7; offset += 1) {
    const day = (todayIndex + offset) % 7;
    const hours = rows.find(row => row.day === day);
    if (!hours) continue;
    const opening = hours.open.split(':').map(Number);
    const closing = hours.close.split(':').map(Number);
    const openingMinutes = opening[0] * 60 + opening[1];
    const closingMinutes = closing[0] * 60 + closing[1];
    if (offset === 0 && (nowMinutes >= closingMinutes || nowMinutes >= openingMinutes)) continue;
    return hours.open;
  }
  return null;
}

function renderHeroHoursStatus(): string {
  if (!getConfiguredHours().length) return '';
  const openNow = isOpenNow(new Date(), CONTACT_CONFIG.openingHours);
  if (openNow === null) return '';
  if (openNow) return `<span class="mc-contact-badge is-open">${escapeHtml(contactContent.hours.open)}</span>`;
  const nextOpening = getNextOpening();
  return `<span class="mc-contact-badge is-closed">${escapeHtml(nextOpening ? contactContent.hours.nextOpening(nextOpening) : contactContent.hours.closed)}</span>`;
}

function renderContactDetails(): string {
  const configured: Array<{ name: string; iconName: string; value: string; href: string | null }> = [];
  if (CONTACT_CONFIG.phone) configured.push({ name: contactContent.field.phone, iconName: 'phone', value: CONTACT_CONFIG.phone, href: `tel:${CONTACT_CONFIG.phone}` });
  if (CONTACT_CONFIG.email) configured.push({ name: contactContent.field.email, iconName: 'email', value: CONTACT_CONFIG.email, href: `mailto:${CONTACT_CONFIG.email}` });
  if (CONTACT_CONFIG.whatsapp) configured.push({ name: contactContent.quickAction.whatsapp, iconName: 'whatsapp', value: CONTACT_CONFIG.whatsapp, href: CONTACT_CONFIG.whatsapp });
  if (CONTACT_CONFIG.address) configured.push({ name: contactContent.location.heading, iconName: 'address', value: CONTACT_CONFIG.address, href: CONTACT_CONFIG.mapUrl });
  if (!configured.length) return `<article class="mc-contact-card mc-contact-details"><h2>${escapeHtml(contactContent.contactDetails.heading)}</h2><p>${escapeHtml(contactContent.contactDetails.unknown)}</p></article>`;
  return `<article class="mc-contact-card mc-contact-details"><h2>${escapeHtml(contactContent.contactDetails.heading)}</h2><ul>${configured.map(detail => `<li>${icon(detail.iconName)}<span><small>${escapeHtml(detail.name)}</small>${detail.href ? `<a href="${escapeHtml(detail.href)}" ${detail.href.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(detail.value)}</a>` : `<span>${escapeHtml(detail.value)}</span>`}</span><button type="button" data-contact-copy="${escapeHtml(detail.value)}" aria-label="${escapeHtml(contactContent.contactDetails.copy)} ${escapeHtml(detail.name)}">${escapeHtml(contactContent.contactDetails.copy)}</button></li>`).join('')}</ul><p class="mc-contact-copy-status" role="status" aria-live="polite"></p></article>`;
}

function renderContactLocation(): string {
  const address = CONTACT_CONFIG.address;
  const mapUrl = CONTACT_CONFIG.mapUrl;
  const canMap = Boolean(address && mapUrl && mapUrl.startsWith('https://'));
  return `<section class="mc-contact-location" aria-labelledby="contact-location-heading"><div><span class="mc-eyebrow">${escapeHtml(contactContent.locationEyebrow)}</span><h2 id="contact-location-heading">${escapeHtml(contactContent.location.heading)}</h2>${address ? `<p>${escapeHtml(address)}</p>` : `<p>${renderPending(contactContent.location.pendingLabel, contactContent.location.pending)}</p>`}${canMap ? `<a class="mc-button mc-button-outline" href="${escapeHtml(mapUrl ?? '')}" target="_blank" rel="noopener noreferrer">${escapeHtml(contactContent.location.directions)}</a>` : ''}</div><div class="mc-contact-map" id="contact-map-slot">${canMap ? `<button type="button" class="mc-button mc-button-outline" data-contact-load-map>${escapeHtml(contactContent.location.loadMap)}</button>` : `<div class="mc-contact-skyline" aria-hidden="true"><svg viewBox="0 0 500 160" preserveAspectRatio="xMidYMax meet"><path d="M0 145h500M35 145V95h20v50m10 0V75h30v70m14 0V115h36V88h23v57m22 0V65h12V24h7v41h12v80m18 0V96h34v49m16 0V76h18v69m14 0V108h50V82h22v63m18 0V98h35v47m18 0V70h30v75m12 0V112h32v33"/></svg></div><p>${escapeHtml(contactContent.location.pending)}</p>`}</div></section>`;
}

function renderCalendar(month: Date, selectedDate: string): string {
  const year = month.getUTCFullYear();
  const monthIndex = month.getUTCMonth();
  const firstWeekday = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const dayCount = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const today = getDubaiDate();
  const monthTitle = new Intl.DateTimeFormat(undefined, { month: 'long', timeZone: 'UTC' }).format(month);
  const blanks = Array.from({ length: firstWeekday }, () => '<span class="mc-contact-calendar-empty" aria-hidden="true"></span>').join('');
  const days = Array.from({ length: dayCount }, (_, index) => {
    const day = index + 1;
    const date = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const disabled = isAppointmentDateDisabled(date);
    return `<button type="button" class="mc-contact-calendar-day${date === selectedDate ? ' is-selected' : ''}${date === today ? ' is-today' : ''}" data-calendar-date="${date}" aria-label="${escapeHtml(contactContent.booking.dayLabel(formatDate(date)))}"${date === selectedDate ? ' aria-pressed="true"' : ' aria-pressed="false"'}${disabled ? ' disabled' : ''}>${day}</button>`;
  }).join('');
  return `<div class="mc-contact-calendar-head"><button type="button" data-calendar-month="-1" aria-label="${escapeHtml(contactContent.booking.calendarPrevious)}"${year === dateAtNoon(today).getUTCFullYear() && monthIndex <= dateAtNoon(today).getUTCMonth() ? ' disabled' : ''}>‹</button><h3 aria-live="polite">${escapeHtml(contactContent.booking.monthLabel(monthTitle, year))}</h3><button type="button" data-calendar-month="1" aria-label="${escapeHtml(contactContent.booking.calendarNext)}">›</button></div><div class="mc-contact-calendar-grid" role="grid" aria-label="${escapeHtml(contactContent.booking.monthLabel(monthTitle, year))}">${contactContent.booking.calendarWeekdays.map(day => `<span role="columnheader">${escapeHtml(day)}</span>`).join('')}${blanks}${days}</div>`;
}

function renderTimeSlots(date: string, selectedTime: string): string {
  if (!date) return `<p class="mc-contact-slot-note">${escapeHtml(contactContent.booking.dateRequired)}</p>`;
  let slots: ReturnType<typeof appointmentService.getSlots>;
  try {
    slots = appointmentService.getSlots(date, appointmentService.getReservedSlots());
  } catch {
    return `<p class="mc-contact-slot-note" role="alert">${escapeHtml(contactContent.validation.storageError)}</p>`;
  }
  if (!slots.length) return `<p class="mc-contact-slot-note">${escapeHtml(contactContent.booking.noSlots)}</p>`;
  const visitorZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return `<div class="mc-contact-slot-list" role="group" aria-label="${escapeHtml(contactContent.booking.time)}">${slots.map(slot => {
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = slot.time.split(':').map(Number);
    const instant = new Date(Date.UTC(year, month - 1, day, hour - 4, minute));
    const localTime = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', timeZone: visitorZone }).format(instant);
    const secondary = visitorZone === CONTACT_CONFIG.timezone ? '' : `<small>${escapeHtml(localTime)} ${escapeHtml(contactContent.booking.visitorTime)}</small>`;
    return `<button type="button" class="mc-contact-slot${slot.time === selectedTime ? ' is-selected' : ''}" data-contact-slot="${slot.time}" aria-label="${escapeHtml(contactContent.booking.slotLabel(slot.time))}" aria-pressed="${slot.time === selectedTime}"${slot.available ? '' : ' disabled'}><span>${escapeHtml(slot.time)} ${escapeHtml(contactContent.booking.dubaiTime)}</span>${secondary}</button>`;
  }).join('')}</div><p class="mc-contact-slot-note">${escapeHtml(contactContent.booking.slotsPending)}</p>`;
}

function renderBookingCard(selectedDate = '', selectedTime = '', month = dateAtNoon(getDubaiDate())): string {
  const firstContactForm = document.querySelector<HTMLFormElement>('#contact-enquiry-form');
  const savedName = firstContactForm?.elements.namedItem('name');
  const savedEmail = firstContactForm?.elements.namedItem('email');
  const savedCode = firstContactForm?.elements.namedItem('phoneCode');
  const savedPhone = firstContactForm?.elements.namedItem('phone');
  const getValue = (element: Element | RadioNodeList | null | undefined): string => element instanceof HTMLInputElement || element instanceof HTMLSelectElement ? element.value : '';
  const phoneCode = getValue(savedCode);
  const phone = `${phoneCode}${getValue(savedPhone)}`.replace(/[()\s.-]/g, '');
  const localParts = phone;
  return `<article class="mc-contact-card mc-contact-booking" id="contact-booking"><div class="mc-contact-booking-heading"><span class="mc-eyebrow">${escapeHtml(contactContent.booking.eyebrow)}</span><h2>${escapeHtml(contactContent.booking.heading)}</h2><p>${escapeHtml(contactContent.booking.lead)}</p></div>
    <form id="contact-appointment-form" novalidate>
      <div class="mc-contact-booking-field"><span class="mc-contact-field-label">${escapeHtml(contactContent.booking.date)}</span><div class="mc-contact-calendar" data-calendar tabindex="-1">${renderCalendar(month, selectedDate)}</div><input type="hidden" name="date" value="${escapeHtml(selectedDate)}" data-contact-date></div>
      <div class="mc-contact-booking-field"><span class="mc-contact-field-label">${escapeHtml(contactContent.booking.time)}</span><div data-contact-slots>${renderTimeSlots(selectedDate, selectedTime)}</div><input type="hidden" name="time" value="${escapeHtml(selectedTime)}" data-contact-time></div>
      <fieldset class="mc-contact-fieldset"><legend>${escapeHtml(contactContent.booking.format)}</legend><div class="mc-contact-segments">${APPOINTMENT_FORMATS.map((format, index) => `<label class="mc-contact-segment"><input type="radio" name="format" value="${escapeHtml(format)}"${index === 0 ? ' checked' : ''}><span>${escapeHtml(format)}</span></label>`).join('')}</div></fieldset>
      <label class="mc-contact-field" for="contact-appointment-purpose">${escapeHtml(contactContent.booking.purpose)}<select id="contact-appointment-purpose" name="purpose">${renderContactOptions(APPOINTMENT_PURPOSES)}</select></label>
      <div class="mc-contact-booking-details"><label class="mc-contact-field" for="booking-name">${escapeHtml(contactContent.booking.name)}<input id="booking-name" name="name" autocomplete="name" required value="${escapeHtml(getValue(savedName))}"></label><label class="mc-contact-field" for="booking-email">${escapeHtml(contactContent.booking.email)}<input id="booking-email" name="email" type="email" autocomplete="email" required value="${escapeHtml(getValue(savedEmail))}"></label><label class="mc-contact-field" for="booking-phone">${escapeHtml(contactContent.booking.phone)}<input id="booking-phone" name="phone" type="tel" autocomplete="tel" pattern="\\+[1-9][0-9]{7,14}" required value="${escapeHtml(localParts)}"></label></div>
      <p class="mc-contact-demo-notice">${escapeHtml(contactContent.demoNotice)}</p><button type="submit" class="mc-button mc-contact-book-button">${escapeHtml(contactContent.booking.request)}</button><p class="mc-contact-book-status" role="status" aria-live="polite"></p>
    </form>
  </article>`;
}

function renderAppointmentSuccess(receipt: ContactReceipt, date: string, time: string, format: AppointmentFormat, purpose: AppointmentPurpose): string {
  return `<article class="mc-contact-card mc-contact-booking mc-contact-booking-success" id="contact-booking" aria-live="polite"><span class="mc-eyebrow">${escapeHtml(contactContent.booking.eyebrow)}</span><h2>${escapeHtml(contactContent.booking.heading)}</h2><div class="mc-contact-receipt"><strong>${escapeHtml(receipt.reference)}</strong><p>${escapeHtml(formatDate(date))} · ${escapeHtml(time)} ${escapeHtml(contactContent.booking.dubaiTime)}</p><p>${escapeHtml(format)} · ${escapeHtml(purpose)}</p><p>${escapeHtml(contactContent.booking.confirmation)}</p><button type="button" class="mc-button mc-button-outline" data-contact-ics="${escapeHtml(JSON.stringify({ reference: receipt.reference, date, time, purpose }))}">${escapeHtml(contactContent.booking.addCalendar)}</button></div><button type="button" class="mc-text-button" data-contact-change-booking="${escapeHtml(JSON.stringify({ date, time }))}">${escapeHtml(contactContent.booking.change)}</button><p class="mc-contact-copy-status" role="status" aria-live="polite"></p></article>`;
}

function renderSuccess(receipt: ContactReceipt, enquiry: ContactEnquiry, storageWarning = ''): string {
  const firstName = enquiry.name.trim().split(/\s+/)[0] ?? enquiry.name;
  return `<section class="mc-contact-card mc-contact-success" aria-live="polite"><span class="mc-eyebrow">${escapeHtml(contactContent.validation.successAnnouncement)}</span><h2>${escapeHtml(contactContent.validation.thankYou(firstName))}</h2><p>${escapeHtml(contactContent.validation.reference)}: <strong>${escapeHtml(receipt.reference)}</strong> <button type="button" class="mc-text-button" data-contact-copy="${escapeHtml(receipt.reference)}">${escapeHtml(contactContent.validation.copyReference)}</button></p><h3>${escapeHtml(contactContent.validation.summary)}</h3><dl><div><dt>${escapeHtml(contactContent.field.enquiryType)}</dt><dd>${escapeHtml(enquiry.type)}</dd></div><div><dt>${escapeHtml(contactContent.field.contactMethod)}</dt><dd>${escapeHtml(enquiry.preferredContact)}</dd></div><div><dt>${escapeHtml(contactContent.field.message)}</dt><dd>${escapeHtml(enquiry.message)}</dd></div></dl><p>${CONTACT_CONFIG.responseTime ? escapeHtml(`${contactContent.responsePrefix}${CONTACT_CONFIG.responseTime}.`) : ''}</p>${storageWarning ? `<p role="status">${escapeHtml(storageWarning)}</p>` : ''}<div class="mc-contact-success-actions"><button type="button" class="mc-button mc-button-outline" data-contact-send-another>${escapeHtml(contactContent.validation.sendAnother)}</button><a class="mc-button" href="/catalogue" data-modern-path="/catalogue">${escapeHtml(contactContent.validation.browseCatalogue)}</a></div><p class="mc-contact-copy-status" role="status" aria-live="polite"></p></section>`;
}

function renderLocationPage(): string {
  return `<div class="mc-contact-location-shell">${renderContactLocation()}</div>`;
}

function renderNextSteps(): string {
  return `<section class="mc-contact-next" aria-labelledby="contact-next-heading"><div class="mc-contact-section-title"><span class="mc-eyebrow">${escapeHtml(contactContent.nextStepsEyebrow)}</span><h2 id="contact-next-heading">${escapeHtml(contactContent.nextSteps.heading)}</h2></div><ol>${contactContent.nextSteps.steps.map((step, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span><p>${escapeHtml(step)}</p></li>`).join('')}</ol></section>`;
}

function renderFaq(): string {
  return `<section class="mc-contact-faq" aria-labelledby="contact-faq-heading"><div class="mc-contact-section-title"><span class="mc-eyebrow">${escapeHtml(contactContent.faqEyebrow)}</span><h2 id="contact-faq-heading">${escapeHtml(contactContent.faq.heading)}</h2></div><div class="mc-contact-faq-grid">  ${contactContent.faq.items.map(item => `<details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}${'link' in item && item.link ? ` <a href="${escapeHtml(item.link)}" data-modern-path="${escapeHtml(item.link)}">${escapeHtml(item.linkLabel ?? item.link)}</a>` : ''}</p></details>`).join('')}</div></section>`;
}

export function renderContactPage(): string {
  const query = new URLSearchParams(location.search);
  const requestedProduct = catalogueItems.find(product => product.slug === query.get('product'));
  const urlType = parseContactType(query.get('type'));
  const draft = readContactDraft() ?? emptyDraft();
  const productType = requestedProduct?.category === 'Dubai Collection' ? 'Dubai Collection' : requestedProduct ? 'Buying' : null;
  const selectedType = urlType ?? productType ?? parseContactType(draft.type) ?? 'General';
  draft.type = selectedType;
  if (requestedProduct && !draft.message) draft.message = `I am enquiring about ${requestedProduct.name}.`;
  const hoursCard = renderHoursCard();
  const heroStatus = renderHeroHoursStatus();
  return `<section class="mc-contact-page">
    <header class="mc-contact-hero"><img class="mc-contact-hero-image" src="${escapeHtml(contactBannerImage)}" alt="" aria-hidden="true" fetchpriority="high"><div class="mc-contact-hero-copy"><span class="mc-eyebrow">${escapeHtml(contactContent.eyebrow)}</span><h1>${escapeHtml(contactContent.title)}</h1><p>${escapeHtml(contactContent.heroSubtitle)}</p></div>${heroStatus ? `<div class="mc-contact-hero-status">${heroStatus}</div>` : ''}<nav class="mc-contact-quick-actions" aria-label="${escapeHtml(contactContent.quickActionsLabel)}">${renderQuickActions()}</nav><div class="mc-contact-gold-line"></div></header>
    ${renderIntentCards(selectedType)}
    <div class="mc-contact-main">
      <section class="mc-contact-form-card" id="contact-form"><div class="mc-contact-form-intro"><span class="mc-eyebrow">${escapeHtml(contactContent.formEyebrow)}</span><h2>${escapeHtml(contactContent.formHeading)}</h2><p>${escapeHtml(contactContent.formLead)}${CONTACT_CONFIG.responseTime ? ` ${escapeHtml(`${contactContent.responsePrefix}${CONTACT_CONFIG.responseTime}.`)}` : ''}</p><p class="mc-contact-demo-notice">${escapeHtml(contactContent.demoNotice)}</p></div>${renderContactForm(draft, selectedType)}</section>
      <aside class="mc-contact-aside">${renderBookingCard()}${renderContactDetails()}${hoursCard}</aside>
    </div>
    ${renderNextSteps()}
    ${renderLocationPage()}
    ${renderFaq()}
    <p class="mc-contact-footnote" id="contact-privacy">${escapeHtml(contactContent.footnote)}</p>
  </section>`;
}

function saveDraft(form: HTMLFormElement): void {
  const data = new FormData(form);
  const draft: ContactDraft = {
    name: String(data.get('name') ?? ''),
    email: String(data.get('email') ?? ''),
    phoneCode: String(data.get('phoneCode') ?? ''),
    phone: String(data.get('phone') ?? ''),
    country: String(data.get('country') ?? ''),
    type: String(data.get('type') ?? ''),
    preferredContact: String(data.get('preferredContact') ?? 'Email'),
    bestTime: String(data.get('bestTime') ?? ''),
    message: String(data.get('message') ?? ''),
  };
  const status = form.querySelector<HTMLElement>('.mc-contact-form-status');
  try {
    sessionStorage.setItem(draftKey, JSON.stringify(draft));
    if (status?.textContent === contactContent.validation.draftError || status?.textContent === contactContent.validation.storageError) status.textContent = '';
  } catch {
    if (status) status.textContent = contactContent.validation.draftError;
  }
}

function applyErrorMessages(form: HTMLFormElement, enquiry: ContactEnquiry, honeypot: string): boolean {
  const errors = validateContactEnquiry(enquiry, honeypot);
  const messages: Record<string, string> = {
    name: contactContent.validation.invalidName,
    email: contactContent.validation.invalidEmail,
    phone: contactContent.validation.invalidPhone,
    type: contactContent.validation.invalidEnquiryType,
    preferredContact: contactContent.validation.invalidContactMethod,
    message: contactContent.validation.invalidMessage,
    consent: contactContent.validation.invalidConsent,
  };
  for (const field of ['name', 'email', 'phone', 'type', 'preferredContact', 'message', 'consent']) {
    const input = form.elements.namedItem(field);
    const error = form.querySelector<HTMLElement>(`[data-error-for="${field}"]`);
    const invalid = field in errors;
    if (input instanceof HTMLInputElement || input instanceof HTMLSelectElement || input instanceof HTMLTextAreaElement) {
      input.setAttribute('aria-invalid', String(invalid));
      if (invalid) input.setAttribute('aria-describedby', error?.id ?? '');
      else input.removeAttribute('aria-invalid');
    } else if (input instanceof RadioNodeList) {
      [...input].forEach(radio => {
        if (radio instanceof HTMLInputElement) {
          if (invalid) radio.setAttribute('aria-invalid', 'true');
          else radio.removeAttribute('aria-invalid');
        }
      });
    }
    if (error) error.textContent = invalid ? messages[field] ?? contactContent.validation.required : '';
  }
  if (errors.honeypot) {
    const status = form.querySelector<HTMLElement>('.mc-contact-form-status');
    if (status) status.textContent = contactContent.validation.honeypot;
    return false;
  }
  const firstInvalid = form.querySelector<HTMLElement>('[aria-invalid="true"]');
  if (firstInvalid) {
    firstInvalid.focus();
    firstInvalid.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    return false;
  }
  return true;
}

function readEnquiry(form: HTMLFormElement): ContactEnquiry {
  const data = new FormData(form);
  const rawType = String(data.get('type') ?? '');
  const rawMethod = String(data.get('preferredContact') ?? '');
  const type = parseContactType(rawType) ?? 'General';
  const method = CONTACT_METHODS.find(option => option === rawMethod) ?? 'Email';
  const phoneCode = String(data.get('phoneCode') ?? '');
  const phone = `${phoneCode}${String(data.get('phone') ?? '')}`.replace(/[()\s.-]/g, '');
  return {
    name: String(data.get('name') ?? ''),
    email: String(data.get('email') ?? ''),
    phone,
    country: String(data.get('country') ?? ''),
    type,
    preferredContact: method as ContactMethod,
    bestTime: String(data.get('bestTime') ?? ''),
    message: String(data.get('message') ?? ''),
    consent: data.get('consent') === 'on',
  };
}

function updateMessageCounter(root: HTMLElement): void {
  const message = root.querySelector<HTMLTextAreaElement>('#contact-message');
  const counter = root.querySelector<HTMLOutputElement>('#contact-message-count');
  if (!message || !counter) return;
  counter.value = contactContent.messageCount(message.value.length);
  counter.textContent = counter.value;
  counter.classList.toggle('is-near-limit', message.value.length >= 900);
}

function updateCalendar(root: HTMLElement, month: Date, selectedDate: string): void {
  const calendar = root.querySelector<HTMLElement>('[data-calendar]');
  if (calendar) calendar.innerHTML = renderCalendar(month, selectedDate);
}

function updateSlots(root: HTMLElement, date: string, time = ''): void {
  const slots = root.querySelector<HTMLElement>('[data-contact-slots]');
  const dateInput = root.querySelector<HTMLInputElement>('[data-contact-date]');
  const timeInput = root.querySelector<HTMLInputElement>('[data-contact-time]');
  if (dateInput) dateInput.value = date;
  if (timeInput) timeInput.value = time;
  if (slots) slots.innerHTML = renderTimeSlots(date, time);
}

function parseJsonData<T>(value: string | undefined): T | null {
  if (!value) return null;
  const parsed: unknown = JSON.parse(value);
  return parsed as T;
}

function localizeCalendarDay(root: HTMLElement, date: string): void {
  const button = root.querySelector<HTMLButtonElement>(`[data-calendar-date="${CSS.escape(date)}"]`);
  button?.focus();
}

function copyToClipboard(value: string): Promise<void> {
  if (!navigator.clipboard?.writeText) return Promise.reject(new Error('Clipboard access is unavailable.'));
  return navigator.clipboard.writeText(value);
}

function buildIcsDownload(root: HTMLElement, payload: { reference: string; date: string; time: string; purpose: string }): void {
  const ics = createAppointmentIcs(payload.reference, payload.date, payload.time, payload.purpose);
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${payload.reference}.ics`;
  link.click();
  URL.revokeObjectURL(url);
  root.querySelector<HTMLElement>('#contact-booking .mc-contact-copy-status')?.replaceChildren(document.createTextNode(contactContent.booking.addCalendar));
}

type ContactAnalyticsEvent = 'contact_view' | 'contact_intent_select' | 'contact_submit' | 'appointment_request';

function trackContactEvent(event: ContactAnalyticsEvent, type?: ContactEnquiryType): void {
  window.dispatchEvent(new CustomEvent('mc:analytics', {
    detail: type ? { event, type } : { event },
  }));
}

export function attachContactPageInteractions(root: HTMLElement): void {
  const intents = [...root.querySelectorAll<HTMLButtonElement>('[data-contact-intent]')];
  let typeSelect = root.querySelector<HTMLSelectElement>('#contact-type');
  let form = root.querySelector<HTMLFormElement>('#contact-enquiry-form');
  const formCard = root.querySelector<HTMLElement>('#contact-form');
  const today = dateAtNoon(getDubaiDate());
  let calendarMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  let selectedDate = '';
  let selectedTime = '';
  let enquiryBusy = false;
  let appointmentBusy = false;
  let lastEnquiryAt = 0;
  let successPayload: { receipt: ContactReceipt; enquiry: ContactEnquiry } | null = null;
  trackContactEvent('contact_view');

  const selectIntent = (type: string, scroll = false) => {
    if (!typeSelect) return;
    typeSelect.value = type;
    intents.forEach(button => {
      const selected = button.dataset.contactIntent === type;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    const complaint = root.querySelector<HTMLElement>('.mc-contact-complaint');
    if (complaint) complaint.hidden = type !== 'Complaint';
    if (scroll) {
      formCard?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      form?.querySelector<HTMLInputElement>('#contact-name')?.focus({ preventScroll: true });
    }
  };
  if (typeSelect?.value) selectIntent(typeSelect.value);
  else {
    selectIntent('General');
    if (typeSelect) typeSelect.value = '';
  }
  updateMessageCounter(root);

  root.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target.closest<HTMLElement>('button, a') : null;
    if (!target) return;
    const intent = target.closest<HTMLButtonElement>('[data-contact-intent]');
    if (intent?.dataset.contactIntent) {
      const type = parseContactType(intent.dataset.contactIntent);
      if (!type) return;
      selectIntent(type, true);
      trackContactEvent('contact_intent_select', type);
      return;
    }
    if (target.matches('[data-calendar-month]')) {
      calendarMonth.setUTCMonth(calendarMonth.getUTCMonth() + Number(target.dataset.calendarMonth));
      updateCalendar(root, calendarMonth, selectedDate);
      return;
    }
    if (target.matches('[data-calendar-date]')) {
      const date = target.dataset.calendarDate;
      if (!date || isAppointmentDateDisabled(date)) return;
      selectedDate = date;
      selectedTime = '';
      calendarMonth = new Date(Date.UTC(dateAtNoon(date).getUTCFullYear(), dateAtNoon(date).getUTCMonth(), 1));
      updateCalendar(root, calendarMonth, selectedDate);
      updateSlots(root, selectedDate);
      return;
    }
    if (target.matches('[data-contact-slot]')) {
      if ((target as HTMLButtonElement).disabled) return;
      selectedTime = target.dataset.contactSlot ?? '';
      root.querySelectorAll<HTMLButtonElement>('[data-contact-slot]').forEach(button => {
        const selected = button.dataset.contactSlot === selectedTime;
        button.classList.toggle('is-selected', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
      const input = root.querySelector<HTMLInputElement>('[data-contact-time]');
      if (input) input.value = selectedTime;
      return;
    }
    if (target.matches('[data-contact-copy]')) {
      const text = target.dataset.contactCopy;
      if (!text) return;
      void copyToClipboard(text).then(() => {
        const status = target.closest('.mc-contact-card, .mc-contact-success')?.querySelector<HTMLElement>('.mc-contact-copy-status');
        if (status) status.textContent = contactContent.contactDetails.copied;
      }).catch(() => {
        const status = target.closest('.mc-contact-card, .mc-contact-success')?.querySelector<HTMLElement>('.mc-contact-copy-status');
        if (status) status.textContent = contactContent.validation.copyFailed;
      });
      return;
    }
    if (target.matches('[data-contact-send-another]') && formCard && successPayload) {
      successPayload = null;
      formCard.innerHTML = `<div class="mc-contact-form-intro"><span class="mc-eyebrow">${escapeHtml(contactContent.formEyebrow)}</span><h2>${escapeHtml(contactContent.formHeading)}</h2><p>${escapeHtml(contactContent.formLead)}</p></div>${renderContactForm(emptyDraft(), 'General')}`;
      form = root.querySelector<HTMLFormElement>('#contact-enquiry-form');
      typeSelect = root.querySelector<HTMLSelectElement>('#contact-type');
      selectIntent('General');
      form?.querySelector<HTMLInputElement>('#contact-name')?.focus();
      updateMessageCounter(root);
      return;
    }
    if (target.matches('[data-contact-ics]')) {
      const payload = parseJsonData<{ reference: string; date: string; time: string; purpose: string }>(target.dataset.contactIcs);
      if (payload) buildIcsDownload(root, payload);
      return;
    }
    if (target.matches('[data-contact-change-booking]')) {
      const payload = parseJsonData<{ date: string; time: string }>(target.dataset.contactChangeBooking);
      if (!payload) return;
      appointmentService.releaseSlot(payload.date, payload.time);
      const booking = root.querySelector<HTMLElement>('#contact-booking');
      if (booking) booking.outerHTML = renderBookingCard(payload.date, payload.time, new Date(Date.UTC(dateAtNoon(payload.date).getUTCFullYear(), dateAtNoon(payload.date).getUTCMonth(), 1)));
      selectedDate = payload.date;
      selectedTime = payload.time;
      return;
    }
    if (target.matches('[data-contact-load-map]')) {
      const slot = root.querySelector<HTMLElement>('#contact-map-slot');
      if (!slot || !CONTACT_CONFIG.mapUrl || !CONTACT_CONFIG.mapUrl.startsWith('https://')) return;
      const iframe = document.createElement('iframe');
      iframe.src = CONTACT_CONFIG.mapUrl;
      iframe.title = contactContent.location.mapTitle;
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer';
      iframe.setAttribute('allowfullscreen', '');
      iframe.className = 'mc-contact-map-frame';
      iframe.addEventListener('error', () => {
        const fallback = document.createElement('p');
        fallback.textContent = contactContent.location.mapFallback;
        slot.replaceChildren(fallback);
      }, { once: true });
      slot.replaceChildren(iframe);
    }
  });

  root.addEventListener('input', event => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) return;
    if (form && target.form === form) {
      saveDraft(form);
      if (target.name === 'message') updateMessageCounter(root);
      if (target.name === 'type') {
        selectIntent(target.value);
        const selectedType = parseContactType(target.value);
        if (selectedType) trackContactEvent('contact_intent_select', selectedType);
      }
      if (target.name === 'name' || target.name === 'email' || target.name === 'phone' || target.name === 'phoneCode') {
        const booking = root.querySelector<HTMLFormElement>('#contact-appointment-form');
        if (booking) {
          const formPhone = form.elements.namedItem('phone');
          const formPhoneCode = form.elements.namedItem('phoneCode');
          const phoneCode = formPhoneCode instanceof HTMLSelectElement ? formPhoneCode.value : '';
          const source = target.name === 'phoneCode' && formPhone instanceof HTMLInputElement
            ? `${target.value}${formPhone.value}`
            : target.name === 'phone'
              ? `${phoneCode}${target.value}`
              : target.value;
          const destinationName = target.name === 'phoneCode' || target.name === 'phone' ? 'phone' : target.name;
          const destination = booking.elements.namedItem(destinationName);
          if (destination instanceof HTMLInputElement) destination.value = source;
        }
      }
    }
    if (target.matches('[data-contact-date]')) {
      selectedDate = target.value;
      updateSlots(root, selectedDate);
    }
  });

  root.addEventListener('blur', event => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) return;
    if (!form || target.form !== form || !target.name) return;
    const phoneCode = form.elements.namedItem('phoneCode');
    const phone = form.elements.namedItem('phone');
    const completePhone = `${phoneCode instanceof HTMLSelectElement ? phoneCode.value : ''}${target.name === 'phone' ? target.value : phone instanceof HTMLInputElement ? phone.value : ''}`.replace(/[()\s.-]/g, '');
    const message = target.name === 'message'
      ? target.value.trim().length < 20 || target.value.length > 1000 ? contactContent.validation.invalidMessage : ''
      : target.name === 'phone' || target.name === 'phoneCode'
        ? /^\+[1-9]\d{7,14}$/.test(completePhone) ? '' : contactContent.validation.invalidPhone
        : target.validity.valid ? '' : target.name === 'email' ? contactContent.validation.invalidEmail : contactContent.validation.required;
    const errorName = target.name === 'phoneCode' ? 'phone' : target.name;
    const error = root.querySelector<HTMLElement>(`[data-error-for="${errorName}"]`);
    if (error) error.textContent = message;
    target.setAttribute('aria-invalid', String(Boolean(message)));
  }, true);

  root.addEventListener('keydown', event => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement) || !target.dataset.calendarDate) return;
    const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (event.key === 'Home' || event.key === 'End') {
      const weekday = dateAtNoon(target.dataset.calendarDate).getUTCDay();
      const offset = event.key === 'Home' ? -weekday : 6 - weekday;
      const targetDate = dateAtNoon(target.dataset.calendarDate);
      targetDate.setUTCDate(targetDate.getUTCDate() + offset);
      event.preventDefault();
      localizeCalendarDay(root, getDubaiDate(targetDate));
      return;
    }
    const offset = offsets[event.key];
    if (!offset) return;
    const targetDate = dateAtNoon(target.dataset.calendarDate);
    targetDate.setUTCDate(targetDate.getUTCDate() + offset);
    const nextDate = getDubaiDate(targetDate);
    if (isAppointmentDateDisabled(nextDate)) return;
    event.preventDefault();
    const nextMonth = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), 1));
    if (nextMonth.getTime() !== calendarMonth.getTime()) {
      calendarMonth = nextMonth;
      updateCalendar(root, calendarMonth, selectedDate);
      window.requestAnimationFrame(() => localizeCalendarDay(root, nextDate));
    } else {
      localizeCalendarDay(root, nextDate);
    }
  });

  root.addEventListener('submit', async event => {
    const target = event.target;
    if (!(target instanceof HTMLFormElement)) return;
    if (target.id === 'contact-enquiry-form') {
      event.preventDefault();
      if (enquiryBusy) return;
      const status = target.querySelector<HTMLElement>('.mc-contact-form-status');
      const submit = target.querySelector<HTMLButtonElement>('[type="submit"]');
      if (!status || !submit) return;
      status.textContent = '';
      const enquiry = readEnquiry(target);
      const honeypot = String(new FormData(target).get('website') ?? '');
      if (!applyErrorMessages(target, enquiry, honeypot)) return;
      trackContactEvent('contact_submit', enquiry.type);
      if (Date.now() - lastEnquiryAt < 30_000) {
        status.textContent = contactContent.validation.rateLimit;
        return;
      }
      enquiryBusy = true;
      submit.disabled = true;
      submit.textContent = contactContent.field.submitting;
      target.dataset.state = 'submitting';
      try {
        const receipt = await contactService.submitEnquiry(enquiry);
        lastEnquiryAt = Date.now();
        let storageWarning = '';
        try {
          sessionStorage.removeItem(draftKey);
        } catch {
          storageWarning = contactContent.validation.storageError;
        }
        successPayload = { receipt, enquiry };
        if (formCard) formCard.innerHTML = renderSuccess(receipt, enquiry, storageWarning);
      } catch {
        target.dataset.state = 'error';
        status.textContent = contactContent.validation.sendError;
        submit.disabled = false;
        submit.textContent = contactContent.field.submit;
      } finally {
        enquiryBusy = false;
      }
      return;
    }
    if (target.id === 'contact-appointment-form') {
      event.preventDefault();
      if (appointmentBusy) return;
      const status = target.querySelector<HTMLElement>('.mc-contact-book-status');
      const submit = target.querySelector<HTMLButtonElement>('[type="submit"]');
      if (!status || !submit) return;
      const date = String(new FormData(target).get('date') ?? '');
      const time = String(new FormData(target).get('time') ?? '');
      let slots: ReturnType<typeof appointmentService.getSlots>;
      try {
        slots = appointmentService.getSlots(date, appointmentService.getReservedSlots());
      } catch {
        status.textContent = contactContent.validation.storageError;
        return;
      }
      const selectedSlot = slots.find(slot => slot.time === time && slot.available);
      if (!date || isAppointmentDateDisabled(date) || !selectedSlot || !target.reportValidity()) {
        status.textContent = contactContent.validation.slotRequired;
        if (!date) root.querySelector<HTMLElement>('[data-calendar]')?.focus();
        return;
      }
      const data = new FormData(target);
      const format = APPOINTMENT_FORMATS.find(value => value === data.get('format')) ?? APPOINTMENT_FORMATS[0];
      const purpose = APPOINTMENT_PURPOSES.find(value => value === data.get('purpose')) ?? APPOINTMENT_PURPOSES[0];
      let reserved = false;
      try {
        reserved = appointmentService.reserveSlot(date, time);
      } catch {
        status.textContent = contactContent.validation.storageError;
        return;
      }
      if (!reserved) {
        status.textContent = contactContent.validation.invalidSlot;
        updateSlots(root, date);
        return;
      }
      trackContactEvent('appointment_request');
      appointmentBusy = true;
      submit.disabled = true;
      submit.textContent = contactContent.field.submitting;
      try {
        const receipt = await appointmentService.submitAppointment({
          date,
          time,
          format,
          purpose,
          name: String(data.get('name') ?? ''),
          email: String(data.get('email') ?? ''),
          phone: String(data.get('phone') ?? ''),
        });
        const booking = root.querySelector<HTMLElement>('#contact-booking');
        if (booking) booking.outerHTML = renderAppointmentSuccess(receipt, date, time, format, purpose);
      } catch {
        let failureMessage: string = contactContent.validation.appointmentError;
        try {
          appointmentService.releaseSlot(date, time);
        } catch {
          failureMessage = contactContent.validation.storageError;
        }
        status.textContent = failureMessage;
        submit.disabled = false;
        submit.textContent = contactContent.booking.request;
      } finally {
        appointmentBusy = false;
      }
    }
  });
}
