import type { Currency, Material } from './types.ts';

export const DEFAULT_BASE_PRICES_USD: Readonly<Record<Material, number>> = {
  gold: 4201.2,
  silver: 52.4,
  platinum: 1620,
  diamond: 10_000,
};

export const SPREADS_USD_PER_OUNCE: Readonly<Record<Material, number>> = {
  gold: 2,
  silver: 0.05,
  platinum: 3,
  diamond: 0,
};

export const FX_RATES_FROM_USD: Readonly<Record<Currency, number>> = {
  USD: 1,
  AED: 3.6725,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.1,
  SAR: 3.75,
};

export const PLACEHOLDER_DATA_NOTICES = [
  '[PENDING CLIENT: licensed live market data provider]',
  '[PENDING CLIENT: licensed live FX source]',
  '[PENDING CLIENT: spreads]',
  '[PENDING CLIENT: confirm base prices]',
  '[PENDING CLIENT: licensed diamond price source]',
] as const;
