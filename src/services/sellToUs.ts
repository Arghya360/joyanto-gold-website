import {
  SELL_TO_US_CONFIG,
  type SellItemType,
  type SellMetal,
  type SellWeightUnit,
} from '../config/sellToUs.ts';

export interface SellQuoteItem {
  id: string;
  metal: SellMetal;
  type: SellItemType;
  purity: string;
  weight: number;
  unit: SellWeightUnit;
  quantity: number;
  description: string;
  photoNames: string[];
}

export interface SellQuoteDetails {
  fullName: string;
  email: string;
  phoneCode: string;
  phone: string;
  country: string;
  contactMethod: 'Email' | 'Phone' | 'WhatsApp';
  bestTime: string;
}

export interface SellQuoteSubmission {
  idempotencyKey: string;
  items: SellQuoteItem[];
  details: SellQuoteDetails;
  route: 'appointment' | 'shipping' | 'speak-first';
  appointmentDate: string;
  appointmentTime: string;
  consents: {
    accurate: boolean;
    verification: boolean;
    contact: boolean;
  };
  honeypot: string;
}

export interface SellQuoteReceipt {
  reference: string;
  receivedAt: number;
  items: SellQuoteItem[];
  route: SellQuoteSubmission['route'];
  appointmentDate: string;
  appointmentTime: string;
}

export type SellItemErrorKey = 'metal' | 'type' | 'purity' | 'weight' | 'quantity';
export type SellItemErrors = Partial<Record<SellItemErrorKey, string>>;

const weightToGrams: Record<SellWeightUnit, number> = {
  g: 1,
  kg: 1000,
  oz: 31.1035,
  tola: 11.6638,
};

export function convertSellWeightToGrams(weight: number, unit: SellWeightUnit): number {
  if (!Number.isFinite(weight) || weight < 0) throw new RangeError('Weight must be finite and non-negative.');
  return weight * weightToGrams[unit];
}

export function getSellPurityFraction(metal: SellMetal, purity: string): number | null {
  if (purity === 'not-sure') return null;
  return SELL_TO_US_CONFIG.purities[metal].find(option => option.value === purity)?.fraction ?? null;
}

export function calculateFineWeightGrams(item: Pick<SellQuoteItem, 'metal' | 'purity' | 'weight' | 'unit' | 'quantity'>): number | null {
  const purity = getSellPurityFraction(item.metal, item.purity);
  if (purity === null) return null;
  return convertSellWeightToGrams(item.weight, item.unit) * item.quantity * purity;
}

export function validateSellQuoteItem(item: Omit<SellQuoteItem, 'photoNames'>): SellItemErrors {
  const errors: SellItemErrors = {};
  if (!['Gold', 'Silver'].includes(item.metal)) errors.metal = 'Choose gold or silver.';
  if (!['Bar', 'Coin', 'Jewellery', 'Scrap', 'Mixed'].includes(item.type)) errors.type = 'Choose an item type.';
  if (getSellPurityFraction(item.metal, item.purity) === null && item.purity !== 'not-sure') {
    errors.purity = 'Choose a purity or “Not sure”.';
  }
  if (!Number.isFinite(item.weight) || item.weight <= 0 || item.weight > SELL_TO_US_CONFIG.maxWeight) {
    errors.weight = `Enter a weight greater than 0 and no more than ${SELL_TO_US_CONFIG.maxWeight.toLocaleString()}.`;
  }
  if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 999) {
    errors.quantity = 'Enter a quantity from 1 to 999.';
  }
  return errors;
}

export function validateSellItems(items: ReadonlyArray<Omit<SellQuoteItem, 'photoNames'>>): string | null {
  if (items.length < 1) return 'Add at least one item.';
  if (items.length > SELL_TO_US_CONFIG.maxItems) return `Add no more than ${SELL_TO_US_CONFIG.maxItems} items.`;
  return items.some(item => Object.keys(validateSellQuoteItem(item)).length > 0)
    ? 'Complete the highlighted item details.'
    : null;
}

export type SellDetailsErrorKey = keyof SellQuoteDetails;
export type SellDetailsErrors = Partial<Record<SellDetailsErrorKey, string>>;

export function validateSellDetails(details: SellQuoteDetails): SellDetailsErrors {
  const errors: SellDetailsErrors = {};
  if (!details.fullName.trim()) errors.fullName = 'Enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim())) errors.email = 'Enter a valid email address.';
  if (!/^\+[1-9]\d{7,14}$/.test(`${details.phoneCode}${details.phone}`.replace(/[()\s.-]/g, ''))) {
    errors.phone = 'Enter a valid international phone number.';
  }
  if (!details.country.trim()) errors.country = 'Choose your country.';
  if (!['Email', 'Phone', 'WhatsApp'].includes(details.contactMethod)) errors.contactMethod = 'Choose a contact method.';
  return errors;
}

export function validateSellPresentation(
  route: SellQuoteSubmission['route'],
  date: string,
  time: string,
): string | null {
  if (!['appointment', 'shipping', 'speak-first'].includes(route)) return 'Choose how you would like to present your items.';
  if (route === 'appointment' && (!date || !time)) return 'Choose an appointment date and time request.';
  return null;
}

export function validateSellConsents(consents: SellQuoteSubmission['consents']): boolean {
  return consents.accurate && consents.verification && consents.contact;
}

export interface PhotoValidationError {
  name: string;
  message: string;
}

export function validateSellPhotos(
  files: ReadonlyArray<Pick<File, 'name' | 'type' | 'size'>>,
  existingCount = 0,
): PhotoValidationError[] {
  const errors: PhotoValidationError[] = [];
  for (const file of files) {
    if (!SELL_TO_US_CONFIG.acceptedPhotoTypes.includes(file.type as (typeof SELL_TO_US_CONFIG.acceptedPhotoTypes)[number])) {
      errors.push({ name: file.name, message: 'Only JPG, PNG and WebP images are accepted.' });
    } else if (file.size > SELL_TO_US_CONFIG.maxPhotoBytes) {
      errors.push({ name: file.name, message: 'Each image must be 5 MB or smaller.' });
    }
  }
  if (files.length + existingCount > SELL_TO_US_CONFIG.maxPhotoCount) {
    errors.push({ name: '', message: 'Add no more than 5 images to this item.' });
  }
  return errors;
}

export interface IndicativeValueRange {
  low: number;
  high: number;
}

export function calculateIndicativeValueRange(
  metalValue: number,
  band: { low: number; high: number } | null = SELL_TO_US_CONFIG.indicativeBand,
): IndicativeValueRange | null {
  if (!Number.isFinite(metalValue) || metalValue < 0) throw new RangeError('Metal value must be finite and non-negative.');
  if (!band) return null;
  if (!Number.isFinite(band.low) || !Number.isFinite(band.high) || band.low < 0 || band.high < band.low) {
    throw new RangeError('Indicative value band must be finite, non-negative, and ordered.');
  }
  return { low: metalValue * band.low, high: metalValue * band.high };
}

export interface SellQuoteParams {
  metal: SellMetal | null;
  type: SellItemType | null;
}

export function parseSellQuoteParams(search: string | URLSearchParams): SellQuoteParams {
  const params = typeof search === 'string' ? new URLSearchParams(search) : search;
  const metalValue = params.get('metal')?.trim().toLowerCase();
  const typeValue = params.get('type')?.trim().toLowerCase();
  const metal = metalValue === 'gold' ? 'Gold' : metalValue === 'silver' ? 'Silver' : null;
  const types: Record<string, SellItemType> = {
    bar: 'Bar',
    coin: 'Coin',
    jewellery: 'Jewellery',
    scrap: 'Scrap',
    mixed: 'Mixed',
  };
  return { metal, type: typeValue ? types[typeValue] ?? null : null };
}

export interface SellQuoteDraft {
  step: number;
  items: Array<Omit<SellQuoteItem, 'photoNames'>>;
  details: Partial<SellQuoteDetails>;
  route: SellQuoteSubmission['route'];
  appointmentDate: string;
  appointmentTime: string;
}

export function sanitizeSellQuoteDraft(draft: SellQuoteDraft): SellQuoteDraft {
  return {
    step: Math.max(1, Math.min(4, Math.trunc(draft.step))),
    items: draft.items.map(({ id, metal, type, purity, weight, unit, quantity, description }) => ({
      id, metal, type, purity, weight, unit, quantity, description,
    })),
    details: { ...draft.details },
    route: draft.route,
    appointmentDate: draft.appointmentDate,
    appointmentTime: draft.appointmentTime,
  };
}

function createSellReference(now: Date, random: () => number): string {
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now).replaceAll('-', '');
  const suffix = Math.floor(Math.min(0.999999999, Math.max(0, random())) * 10_000)
    .toString()
    .padStart(4, '0');
  return `SQ-${date}-${suffix}`;
}

const submissions = new Map<string, Promise<SellQuoteReceipt>>();

export const sellQuoteService = {
  async submit(
    submission: SellQuoteSubmission,
    delayMs = SELL_TO_US_CONFIG.mockSubmissionDelayMinMs
      + Math.floor(Math.random() * (SELL_TO_US_CONFIG.mockSubmissionDelayMaxMs - SELL_TO_US_CONFIG.mockSubmissionDelayMinMs + 1)),
  ): Promise<SellQuoteReceipt> {
    const prior = submissions.get(submission.idempotencyKey);
    if (prior) return prior;
    if (!submission.idempotencyKey.trim()) throw new Error('A quote idempotency key is required.');
    if (submission.honeypot.trim()) throw new Error('Quote request rejected.');
    if (!Number.isFinite(delayMs) || delayMs < 0) throw new RangeError('Quote request delay must be non-negative.');

    const pending = new Promise<SellQuoteReceipt>(resolve => {
      setTimeout(() => {
        const now = new Date();
        resolve({
          reference: createSellReference(now, Math.random),
          receivedAt: now.getTime(),
          items: submission.items.map(item => ({ ...item, photoNames: [...item.photoNames] })),
          route: submission.route,
          appointmentDate: submission.appointmentDate,
          appointmentTime: submission.appointmentTime,
        });
      }, delayMs);
    });
    submissions.set(submission.idempotencyKey, pending);
    return pending;
  },
};
