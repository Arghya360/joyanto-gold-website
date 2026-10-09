export const TROY_OUNCE_GRAMS = 31.1034768;
export const KILOGRAM_GRAMS = 1000;
export const PENNYWEIGHT_GRAMS = 1.55517384;
export const TOLA_GRAMS = 11.6638038;
// Tael definitions differ by region; confirm the applicable definition with the client.
export const TAEL_GRAMS = 37.7994;

export const METAL_UNITS = [
  { key: 'ounce', label: 'Ounce', grams: TROY_OUNCE_GRAMS },
  { key: 'gram', label: 'Gram', grams: 1 },
  { key: 'kilo', label: 'Kilo', grams: KILOGRAM_GRAMS },
  { key: 'pennyweight', label: 'Pennyweight', grams: PENNYWEIGHT_GRAMS },
  { key: 'tola', label: 'Tola', grams: TOLA_GRAMS },
  { key: 'tael', label: 'Tael', grams: TAEL_GRAMS },
] as const;

export type MetalUnit = (typeof METAL_UNITS)[number];

export function convertPerTroyOunce(value: number, unitGrams: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(unitGrams) || unitGrams <= 0) {
    throw new RangeError('Price and unit weight must be finite; unit weight must be positive.');
  }
  return value * (unitGrams / TROY_OUNCE_GRAMS);
}
