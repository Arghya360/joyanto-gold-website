import assert from 'node:assert/strict';
import test from 'node:test';
import { isPriceStale } from '../lib/pricing.ts';
import {
  calculateFineWeightGrams,
  calculateIndicativeValueRange,
  convertSellWeightToGrams,
  parseSellQuoteParams,
  sanitizeSellQuoteDraft,
  sellQuoteService,
  validateSellConsents,
  validateSellDetails,
  validateSellItems,
  validateSellPhotos,
  validateSellPresentation,
} from './sellToUs.ts';

test('converts supported weights to grams', () => {
  assert.equal(convertSellWeightToGrams(1, 'g'), 1);
  assert.equal(convertSellWeightToGrams(1, 'kg'), 1000);
  assert.equal(convertSellWeightToGrams(1, 'oz'), 31.1035);
  assert.equal(convertSellWeightToGrams(1, 'tola'), 11.6638);
});

test('fine weight applies the selected metal purity and quantity', () => {
  assert.equal(calculateFineWeightGrams({
    metal: 'Gold', purity: '999.9', weight: 10, unit: 'g', quantity: 2,
  }), 19.998);
  assert.equal(calculateFineWeightGrams({
    metal: 'Gold', purity: '916', weight: 1, unit: 'kg', quantity: 1,
  }), 916);
  assert.ok(Math.abs(calculateFineWeightGrams({
    metal: 'Silver', purity: '925', weight: 1, unit: 'oz', quantity: 1,
  }) - 28.7707375) < 1e-10);
  assert.equal(calculateFineWeightGrams({
    metal: 'Silver', purity: 'not-sure', weight: 20, unit: 'g', quantity: 1,
  }), null);
});

test('indicative values are a range only when a configured band exists', () => {
  assert.deepEqual(calculateIndicativeValueRange(100, { low: 0.8, high: 0.9 }), { low: 80, high: 90 });
  assert.equal(calculateIndicativeValueRange(100, null), null);
});

test('the shared price staleness threshold hides a feed older than 60 seconds', () => {
  assert.equal(isPriceStale(1_000, 60_999), false);
  assert.equal(isPriceStale(1_000, 61_001), true);
  assert.equal(isPriceStale(Number.NaN, 2_000), true);
});

test('step validation rejects incomplete item, contact, presentation, and consent data', () => {
  assert.notEqual(validateSellItems([]), null);
  assert.equal(validateSellItems([{
    id: 'item-1', metal: 'Gold', type: 'Bar', purity: '999.9',
    weight: 10, unit: 'g', quantity: 1, description: '',
  }]), null);
  assert.ok(validateSellDetails({
    fullName: 'A Buyer', email: 'bad-email', phoneCode: '+971', phone: '123',
    country: '', contactMethod: 'Email', bestTime: '',
  }).email);
  assert.equal(validateSellPresentation('appointment', '', ''), 'Choose an appointment date and time request.');
  assert.equal(validateSellPresentation('speak-first', '', ''), null);
  assert.equal(validateSellConsents({ accurate: true, verification: false, contact: true }), false);
});

test('photo validation enforces accepted formats, 5 MB size, and item count', () => {
  assert.deepEqual(validateSellPhotos([{ name: 'bar.webp', type: 'image/webp', size: 100 }]), []);
  assert.equal(validateSellPhotos([{ name: 'bad.gif', type: 'image/gif', size: 100 }])[0]?.message, 'Only JPG, PNG and WebP images are accepted.');
  assert.equal(validateSellPhotos([{ name: 'large.png', type: 'image/png', size: 5 * 1024 * 1024 + 1 }])[0]?.message, 'Each image must be 5 MB or smaller.');
  assert.equal(validateSellPhotos([{ name: 'sixth.jpg', type: 'image/jpeg', size: 100 }], 5)[0]?.message, 'Add no more than 5 images to this item.');
});

test('quote draft sanitization excludes photos and does not carry consent fields', () => {
  const draft = sanitizeSellQuoteDraft({
    step: 5,
    items: [{
      id: 'item-1', metal: 'Gold', type: 'Bar', purity: '999.9',
      weight: 10, unit: 'g', quantity: 1, description: '',
    }],
    details: { fullName: 'A Buyer', email: 'buyer@example.com' },
    route: 'speak-first',
    appointmentDate: '',
    appointmentTime: '',
  });
  assert.equal(draft.step, 4);
  assert.equal('photoNames' in draft.items[0], false);
  assert.equal('consent' in draft, false);
});

test('URL parsing accepts supported prefill values and ignores invalid parameters', () => {
  assert.deepEqual(parseSellQuoteParams('?metal=gold&type=bar'), { metal: 'Gold', type: 'Bar' });
  assert.deepEqual(parseSellQuoteParams('?metal=platinum&type=unlisted'), { metal: null, type: null });
});

test('quote references use the required shape and repeated idempotency keys return one receipt', async () => {
  const submission = {
    idempotencyKey: 'sell-test-idempotency',
    items: [{
      id: 'item-1', metal: 'Gold', type: 'Bar', purity: '999.9',
      weight: 10, unit: 'g', quantity: 1, description: '', photoNames: ['bar.png'],
    }],
    details: {
      fullName: 'A Buyer', email: 'buyer@example.com', phoneCode: '+971', phone: '501234567',
      country: 'United Arab Emirates', contactMethod: 'Email', bestTime: '',
    },
    route: 'speak-first',
    appointmentDate: '',
    appointmentTime: '',
    consents: { accurate: true, verification: true, contact: true },
    honeypot: '',
  };
  const [first, second] = await Promise.all([
    sellQuoteService.submit(submission, 0),
    sellQuoteService.submit(submission, 0),
  ]);
  assert.equal(first, second);
  assert.match(first.reference, /^SQ-\d{8}-\d{4}$/);
  assert.deepEqual(first.items[0]?.photoNames, ['bar.png']);
});
