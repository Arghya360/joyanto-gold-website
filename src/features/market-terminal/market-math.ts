import { FX_RATES_FROM_USD, SPREADS_USD_PER_OUNCE } from './config.ts';
import { isPriceStale, PRICE_STALE_AFTER_MS } from '../../lib/pricing.ts';
import type { Currency, Material } from './types.ts';

export const STALE_AFTER_MS = PRICE_STALE_AFTER_MS;

export interface PriceChange {
  amount: number;
  percent: number;
}

export interface DayRange {
  low: number;
  high: number;
  markerPercent: number;
}

export function calculateSpreadAsk(bid: number, material: Material): number {
  if (!Number.isFinite(bid) || bid < 0) throw new RangeError('Bid must be finite and non-negative.');
  return bid + SPREADS_USD_PER_OUNCE[material];
}

export function calculateChange(current: number, previousClose: number): PriceChange {
  if (!Number.isFinite(current) || !Number.isFinite(previousClose) || previousClose <= 0) {
    throw new RangeError('Prices must be finite and the previous close must be positive.');
  }
  const amount = current - previousClose;
  return { amount, percent: (amount / previousClose) * 100 };
}

export function calculateDayRange(low: number, high: number, current: number): DayRange {
  if (![low, high, current].every(Number.isFinite) || low > high) {
    throw new RangeError('Day range values must be finite and low cannot exceed high.');
  }
  const markerPercent = high === low ? 50 : Math.min(100, Math.max(0, ((current - low) / (high - low)) * 100));
  return { low, high, markerPercent };
}

export function convertCurrency(value: number, currency: Currency): number {
  if (!Number.isFinite(value)) throw new RangeError('Currency conversion value must be finite.');
  return value * FX_RATES_FROM_USD[currency];
}

export function isTerminalPriceStale(lastTickAt: number, now = Date.now()): boolean {
  return isPriceStale(lastTickAt, now);
}
