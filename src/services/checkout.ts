import { ORDER_REVIEW_THRESHOLD_AED, PRICE_LOCK_DURATION_MS } from '../config/checkout.ts';
import { isPriceStale } from '../lib/pricing.ts';

export interface PriceLock {
  id: string;
  createdAt: number;
  expiresAt: number;
  totalAed: number;
}

export interface OrderLineSnapshot {
  productId: number;
  title: string;
  quantity: number;
  unitPriceAed: number;
  image: string;
  weight: string;
}

export interface OrderPriceSnapshot {
  metalValueAed: number | null;
  productPremiumAed: number | null;
  catalogueSubtotalAed: number;
  deliveryAed: number | null;
  insuranceAed: number | null;
  taxesAndDutiesAed: number | null;
  totalAed: number;
}

export interface OrderContactSnapshot {
  fullName: string;
  email: string;
  phone: string;
}

export interface OrderDeliverySnapshot {
  method: string;
  appointmentDate: string;
  appointmentTime: string;
  country: string;
  city: string;
  street: string;
  postalCode: string;
  phone: string;
}

export interface MockOrder {
  reference: string;
  status: 'awaiting_payment' | 'on_hold_compliance';
  createdAt: number;
  items: OrderLineSnapshot[];
  price: OrderPriceSnapshot;
  contact: OrderContactSnapshot;
  delivery: OrderDeliverySnapshot;
  notes: string;
  paymentMethod: 'bank-transfer';
}

export interface MockOrderInput {
  idempotencyKey: string;
  lines: OrderLineSnapshot[];
  totalAed: number;
  contact: OrderContactSnapshot;
  delivery: OrderDeliverySnapshot;
  notes: string;
  paymentMethod: 'bank-transfer';
  now?: number;
  delayMs?: number;
}

const orderPromises = new Map<string, Promise<MockOrder>>();
let orderSequence = 0;

export function createMockPriceLock(totalAed: number, now = Date.now()): PriceLock {
  if (!Number.isFinite(totalAed) || totalAed < 0 || !Number.isFinite(now)) {
    throw new RangeError('Price lock values must be finite and non-negative.');
  }
  return {
    id: `mock-lock-${now}`,
    createdAt: now,
    expiresAt: now + PRICE_LOCK_DURATION_MS,
    totalAed,
  };
}

export function isPriceLockExpired(lock: PriceLock, now = Date.now()): boolean {
  return !Number.isFinite(now) || now >= lock.expiresAt;
}

export function isPriceFeedStale(lastUpdatedAt: number | null, now = Date.now()): boolean {
  return lastUpdatedAt === null || isPriceStale(lastUpdatedAt, now);
}

export function validateInternationalPhone(phoneCode: string, localNumber: string): boolean {
  const normalized = `${phoneCode}${localNumber}`.replace(/[()\s.-]/g, '');
  return /^\+[1-9]\d{7,14}$/.test(normalized);
}

export function isOrderAboveComplianceThreshold(totalAed: number): boolean {
  return Number.isFinite(totalAed) && totalAed >= ORDER_REVIEW_THRESHOLD_AED;
}

export function isMockOrder(value: unknown): value is MockOrder {
  if (!value || typeof value !== 'object') return false;
  const order = value as Partial<MockOrder>;
  return typeof order.reference === 'string'
    && /^MC-\d{8}-\d{4}$/.test(order.reference)
    && (order.status === 'awaiting_payment' || order.status === 'on_hold_compliance')
    && Number.isFinite(order.createdAt)
    && Array.isArray(order.items)
    && order.items.every(item => item
      && Number.isInteger(item.productId)
      && typeof item.title === 'string'
      && Number.isInteger(item.quantity)
      && item.quantity > 0
      && Number.isFinite(item.unitPriceAed)
      && typeof item.image === 'string'
      && typeof item.weight === 'string')
    && Boolean(order.price)
    && Number.isFinite(order.price?.catalogueSubtotalAed)
    && Number.isFinite(order.price?.totalAed)
    && order.price?.metalValueAed === null
    && order.price?.productPremiumAed === null
    && order.price?.deliveryAed === null
    && order.price?.insuranceAed === null
    && order.price?.taxesAndDutiesAed === null
    && Boolean(order.contact)
    && typeof order.contact?.fullName === 'string'
    && typeof order.contact?.email === 'string'
    && typeof order.contact?.phone === 'string'
    && Boolean(order.delivery)
    && typeof order.delivery?.method === 'string'
    && typeof order.delivery?.appointmentDate === 'string'
    && typeof order.delivery?.appointmentTime === 'string'
    && typeof order.delivery?.country === 'string'
    && typeof order.delivery?.city === 'string'
    && typeof order.delivery?.street === 'string'
    && typeof order.delivery?.postalCode === 'string'
    && typeof order.delivery?.phone === 'string'
    && typeof order.notes === 'string'
    && order.paymentMethod === 'bank-transfer';
}

function makeOrder(input: MockOrderInput): MockOrder {
  const now = input.now ?? Date.now();
  orderSequence += 1;
  const datePart = new Date(now).toISOString().slice(0, 10).replaceAll('-', '');
  const sequencePart = String(orderSequence).padStart(4, '0');
  const catalogueSubtotalAed = input.lines.reduce(
    (sum, line) => sum + line.unitPriceAed * line.quantity,
    0,
  );

  return {
    reference: `MC-${datePart}-${sequencePart}`,
    status: isOrderAboveComplianceThreshold(input.totalAed) ? 'on_hold_compliance' : 'awaiting_payment',
    createdAt: now,
    items: input.lines.map(line => ({ ...line })),
    price: {
      metalValueAed: null,
      productPremiumAed: null,
      catalogueSubtotalAed,
      deliveryAed: null,
      insuranceAed: null,
      taxesAndDutiesAed: null,
      totalAed: input.totalAed,
    },
    contact: { ...input.contact },
    delivery: { ...input.delivery },
    notes: input.notes,
    paymentMethod: input.paymentMethod,
  };
}

export function createMockOrder(input: MockOrderInput): Promise<MockOrder> {
  if (!input.idempotencyKey.trim()) {
    return Promise.reject(new Error('An idempotency key is required to create an order.'));
  }

  const existing = orderPromises.get(input.idempotencyKey);
  if (existing) return existing;

  const pendingOrder = new Promise<MockOrder>((resolve, reject) => {
    const delayMs = input.delayMs ?? 700;
    if (!Number.isFinite(delayMs) || delayMs < 0) {
      reject(new RangeError('Order delay must be a finite, non-negative number.'));
      return;
    }
    setTimeout(() => resolve(makeOrder(input)), delayMs);
  });
  orderPromises.set(input.idempotencyKey, pendingOrder);
  pendingOrder.catch(() => orderPromises.delete(input.idempotencyKey));
  return pendingOrder;
}

export const checkoutService = {
  lockPrice: createMockPriceLock,
};

export const orderService = {
  createOrder: createMockOrder,
};
