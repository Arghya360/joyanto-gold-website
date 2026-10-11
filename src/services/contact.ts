import {
  CONTACT_ENQUIRY_TYPES,
  CONTACT_METHODS,
  contactContent,
  type AppointmentFormat,
  type AppointmentPurpose,
  type ContactEnquiryType,
  type ContactMethod,
} from '../content/contact.ts';
import { CONTACT_CONFIG } from '../config/contact.ts';

export interface ContactEnquiry {
  name: string;
  email: string;
  phone: string;
  country: string;
  type: ContactEnquiryType;
  preferredContact: ContactMethod;
  bestTime: string;
  message: string;
  consent: boolean;
}

export type ContactFieldErrors = Partial<Record<keyof ContactEnquiry | 'honeypot', string>>;

export function validateContactEnquiry(
  enquiry: ContactEnquiry,
  honeypot = '',
): ContactFieldErrors {
  const errors: ContactFieldErrors = {};
  if (!enquiry.name.trim()) errors.name = 'required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email.trim())) errors.email = 'email';
  if (!/^\+[1-9]\d{7,14}$/.test(enquiry.phone.replace(/[()\s.-]/g, ''))) errors.phone = 'phone';
  if (!CONTACT_ENQUIRY_TYPES.includes(enquiry.type)) errors.type = 'type';
  if (!CONTACT_METHODS.includes(enquiry.preferredContact)) errors.preferredContact = 'contact';
  if (enquiry.message.trim().length < 20 || enquiry.message.length > 1000) errors.message = 'message';
  if (!enquiry.consent) errors.consent = 'consent';
  if (honeypot.trim()) errors.honeypot = 'honeypot';
  return errors;
}

export interface ContactReceipt {
  reference: string;
  receivedAt: number;
}

export interface AppointmentRequest {
  date: string;
  time: string;
  format: AppointmentFormat;
  purpose: AppointmentPurpose;
  name: string;
  email: string;
  phone: string;
}

export function parseContactType(raw: string | null): ContactEnquiryType | null {
  if (!raw) return null;
  const normalized = raw.toLowerCase().trim().replace(/[_\s]+/g, '-');
  const aliases: Record<string, ContactEnquiryType> = {
    'private-consultation': 'Private Assets',
    'private-assets': 'Private Assets',
    'mc-reserve': 'MC Reserve',
    'corporate-gifting': 'Corporate gifting',
    'dubai-collection': 'Dubai Collection',
  };
  return aliases[normalized]
    ?? CONTACT_ENQUIRY_TYPES.find(type => type.toLowerCase().replace(/\s+/g, '-') === normalized)
    ?? null;
}

export function getDubaiDate(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CONTACT_CONFIG.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  return `${parts.find(part => part.type === 'year')?.value}-${parts.find(part => part.type === 'month')?.value}-${parts.find(part => part.type === 'day')?.value}`;
}

export function isAppointmentDateDisabled(date: string, today = getDubaiDate()): boolean {
  const value = new Date(`${date}T12:00:00Z`);
  const todayValue = new Date(`${today}T12:00:00Z`);
  if (Number.isNaN(value.getTime()) || value < todayValue) return true;
  const lastDate = new Date(todayValue);
  lastDate.setUTCDate(lastDate.getUTCDate() + CONTACT_CONFIG.bookingWindowDays);
  return value > lastDate
    || CONTACT_CONFIG.closedWeekdays.includes(value.getUTCDay())
    || CONTACT_CONFIG.holidays.includes(date);
}

function createReference(prefix: 'CT' | 'AP', now: Date): string {
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now).replaceAll('-', '');
  const suffix = Math.floor(Math.random() * 10_000).toString().padStart(4, '0');
  return `${prefix}-${date}-${suffix}`;
}

function wait(delayMs: number): Promise<void> {
  if (!Number.isFinite(delayMs) || delayMs < 0) throw new RangeError('Contact demo delay must be non-negative.');
  return new Promise(resolve => setTimeout(resolve, delayMs));
}

export const contactService = {
  async submitEnquiry(_enquiry: ContactEnquiry, delayMs = 600 + Math.floor(Math.random() * 401)): Promise<ContactReceipt> {
    await wait(delayMs);
    const now = new Date();
    return { reference: createReference('CT', now), receivedAt: now.getTime() };
  },
};

export const appointmentService = {
  async submitAppointment(_request: AppointmentRequest, delayMs = 600 + Math.floor(Math.random() * 401)): Promise<ContactReceipt> {
    await wait(delayMs);
    const now = new Date();
    return { reference: createReference('AP', now), receivedAt: now.getTime() };
  },

  getSlots(date: string, reserved: readonly string[] = [], now = new Date()): Array<{ time: string; available: boolean }> {
    const day = new Date(`${date}T12:00:00Z`);
    if (Number.isNaN(day.getTime())) return [];
    if (isAppointmentDateDisabled(date, getDubaiDate(now))) return [];
    const today = getDubaiDate(now);
    const isToday = date === today;
    const currentParts = new Intl.DateTimeFormat('en-GB', {
      timeZone: CONTACT_CONFIG.timezone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(now);
    const currentMinutes = Number(currentParts.find(part => part.type === 'hour')?.value) * 60
      + Number(currentParts.find(part => part.type === 'minute')?.value);

    const { open, close } = CONTACT_CONFIG.mockAppointmentHours;
    const [openHour, openMinute] = open.split(':').map(Number);
    const [closeHour, closeMinute] = close.split(':').map(Number);
    const start = openHour * 60 + openMinute;
    const end = closeHour * 60 + closeMinute;
    const slots: Array<{ time: string; available: boolean }> = [];
    for (let minutes = start; minutes + CONTACT_CONFIG.slotDurationMinutes <= end; minutes += CONTACT_CONFIG.slotDurationMinutes) {
      const time = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
      const seed = date.split('-').join('').split('').reduce((sum, digit) => sum + Number(digit), 0);
      const isMockUnavailable = (seed + slots.length) % 5 === 2;
      slots.push({ time, available: !isMockUnavailable && !reserved.includes(`${date}T${time}`) && (!isToday || minutes > currentMinutes) });
    }
    return slots;
  },

  getReservedSlots(): string[] {
    const serialized = sessionStorage.getItem('mc-demo-booked-slots');
    if (!serialized) return [];
    const parsed: unknown = JSON.parse(serialized);
    if (!Array.isArray(parsed) || !parsed.every(value => typeof value === 'string')) {
      throw new Error('Saved demo appointment data is invalid.');
    }
    return parsed;
  },

  reserveSlot(date: string, time: string): boolean {
    const key = localStorageKeyForAppointment(date, time);
    const reserved = this.getReservedSlots();
    if (reserved.includes(key) || !this.getSlots(date).some(slot => slot.time === time && slot.available)) return false;
    sessionStorage.setItem('mc-demo-booked-slots', JSON.stringify([...reserved, key]));
    return true;
  },

  releaseSlot(date: string, time: string): void {
    const key = localStorageKeyForAppointment(date, time);
    sessionStorage.setItem('mc-demo-booked-slots', JSON.stringify(this.getReservedSlots().filter(slot => slot !== key)));
  },
};

export function localStorageKeyForAppointment(date: string, time: string): string {
  return `${date}T${time}`;
}

export function createAppointmentIcs(reference: string, date: string, time: string, purpose: string): string {
  const [year, month, day] = date.split('-');
  const [hour, minute] = time.split(':');
  const startMinutes = Number(hour) * 60 + Number(minute);
  const endMinutes = startMinutes + CONTACT_CONFIG.slotDurationMinutes;
  const endHour = String(Math.floor(endMinutes / 60)).padStart(2, '0');
  const endMinute = String(endMinutes % 60).padStart(2, '0');
  const datePart = `${year}${month}${day}`;
  const escapeIcs = (value: string) => value.replace(/[\\;,]/g, character => `\\${character}`).replace(/\n/g, '\\n');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Montague Cole Bullion//Private Meeting//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${reference}@montaguecole.example`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART;TZID=Asia/Dubai:${datePart}T${hour}${minute}00`,
    `DTEND;TZID=Asia/Dubai:${datePart}T${endHour}${endMinute}00`,
    `SUMMARY:${escapeIcs(contactContent.validation.calendarSummary(purpose))}`,
    `DESCRIPTION:${escapeIcs(contactContent.validation.calendarDescription)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
