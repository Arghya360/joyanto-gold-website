import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createMockOrder,
  createMockPriceLock,
  isOrderAboveComplianceThreshold,
  isMockOrder,
  isPriceFeedStale,
  isPriceLockExpired,
  validateInternationalPhone,
} from './checkout.ts';
import { PRICE_LOCK_DURATION_MS, ORDER_REVIEW_THRESHOLD_AED } from '../config/checkout.ts';

test('price locks expire at the configured boundary', () => {
  const lock = createMockPriceLock(1200, 1000);
  assert.equal(lock.expiresAt, 1000 + PRICE_LOCK_DURATION_MS);
  assert.equal(isPriceLockExpired(lock, lock.expiresAt - 1), false);
  assert.equal(isPriceLockExpired(lock, lock.expiresAt), true);
});

test('missing and older-than-one-minute feed timestamps are stale', () => {
  assert.equal(isPriceFeedStale(null, 100_000), true);
  assert.equal(isPriceFeedStale(Number.NaN, 100_000), true);
  assert.equal(isPriceFeedStale(39_999, 100_000), true);
  assert.equal(isPriceFeedStale(40_001, 100_000), false);
});

test('international phone validation accepts E.164-like numbers only', () => {
  assert.equal(validateInternationalPhone('+971', '50 123 4567'), true);
  assert.equal(validateInternationalPhone('+1', '(202) 555-0148'), true);
  assert.equal(validateInternationalPhone('+971', '123'), false);
  assert.equal(validateInternationalPhone('', '501234567'), false);
});

test('orders at the configured threshold require compliance review', () => {
  assert.equal(isOrderAboveComplianceThreshold(ORDER_REVIEW_THRESHOLD_AED - 1), false);
  assert.equal(isOrderAboveComplianceThreshold(ORDER_REVIEW_THRESHOLD_AED), true);
});

test('mock order creation is idempotent for a repeated key', async () => {
  const input = {
    idempotencyKey: `test-${Date.now()}-${Math.random()}`,
    lines: [{
      productId: 101,
      title: 'Demo bar',
      quantity: 2,
      unitPriceAed: 500,
      image: '',
      weight: '5 g',
    }],
    totalAed: 1000,
    contact: { fullName: 'Demo Customer', email: 'demo@example.com', phone: '+971 50 123 4567' },
    delivery: {
      method: 'collection',
      appointmentDate: '2026-01-02',
      appointmentTime: '10:00–11:00',
      country: '',
      city: '',
      street: '',
      postalCode: '',
      phone: '',
    },
    notes: 'Please call on arrival.',
    paymentMethod: 'bank-transfer',
    now: Date.UTC(2026, 0, 1),
    delayMs: 0,
  };
  const first = createMockOrder(input);
  const second = createMockOrder(input);
  assert.equal(first, second);
  const order = await first;
  assert.match(order.reference, /^MC-20260101-\d{4}$/);
  assert.equal(order.status, 'awaiting_payment');
  assert.equal(order.price.catalogueSubtotalAed, 1000);
  assert.equal(order.price.metalValueAed, null);
  assert.equal(order.price.deliveryAed, null);
  assert.equal(order.contact.email, 'demo@example.com');
  assert.equal(order.delivery.appointmentDate, '2026-01-02');
  assert.equal(order.notes, 'Please call on arrival.');
  assert.equal(isMockOrder(order), true);
  assert.equal(isMockOrder({ ...order, reference: 'invalid' }), false);
});

test('mock order service refuses an empty idempotency key', async () => {
  await assert.rejects(createMockOrder({
    idempotencyKey: ' ',
    lines: [],
    totalAed: 0,
    deliveryMethod: 'collection',
    paymentMethod: 'bank-transfer',
    delayMs: 0,
  }), /idempotency key is required/i);
});
