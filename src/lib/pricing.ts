export const PRICE_STALE_AFTER_MS = 60_000;

export interface SellPriceInput {
  spotPerGram: number;
  fineWeightGrams: number;
  premium: number;
  delivery: number;
  insurance: number;
  taxes: number;
}

export interface SellPriceBreakdown {
  metalValue: number;
  premium: number;
  delivery: number;
  insurance: number;
  taxes: number;
  total: number;
}

export function computeSellPrice(input: SellPriceInput): SellPriceBreakdown {
  const values = Object.values(input);
  if (values.some(value => !Number.isFinite(value) || value < 0)) {
    throw new RangeError('Price inputs must be finite, non-negative numbers.');
  }
  const metalValue = input.spotPerGram * input.fineWeightGrams;
  return {
    metalValue,
    premium: input.premium,
    delivery: input.delivery,
    insurance: input.insurance,
    taxes: input.taxes,
    total: metalValue + input.premium + input.delivery + input.insurance + input.taxes,
  };
}

export function isPriceStale(lastUpdatedAt: number, now = Date.now()): boolean {
  return !Number.isFinite(lastUpdatedAt) || now - lastUpdatedAt > PRICE_STALE_AFTER_MS;
}
