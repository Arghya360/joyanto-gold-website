export const SHOW_COUPON = false;
export const PAYMENT_METHODS = ['bank-transfer'] as const;
export const PRICE_LOCK_DURATION_MS = 10 * 60 * 1000;
export const PRICE_FEED_MAX_AGE_MS = 60 * 1000;
export const ORDER_REVIEW_THRESHOLD_AED = 100_000;
export const RESTRICTED_COUNTRY_CODES: readonly string[] = [];

export const CHECKOUT_COUNTRIES = [
  { code: 'AE', name: 'United Arab Emirates', phoneCode: '+971' },
  { code: 'GB', name: 'United Kingdom', phoneCode: '+44' },
  { code: 'US', name: 'United States', phoneCode: '+1' },
  { code: 'IN', name: 'India', phoneCode: '+91' },
  { code: 'SA', name: 'Saudi Arabia', phoneCode: '+966' },
] as const;

export const APPOINTMENT_TIME_SLOTS = [
  '10:00–11:00',
  '11:00–12:00',
  '14:00–15:00',
  '15:00–16:00',
] as const;
