import type { Currency, Material } from './types.ts';

const METAL_CODES: Readonly<Record<Exclude<Material, 'diamond'>, string>> = {
  gold: 'XAU',
  silver: 'XAG',
  platinum: 'XPT',
};

export function symbolFor(material: Material, currency: Currency = 'USD'): string {
  return material === 'diamond' ? 'DIAMOND-IDX' : `${METAL_CODES[material]}${currency}`;
}

export function materialFromSymbol(symbol: string): Material {
  const normalized = symbol.toUpperCase();
  if (normalized === 'DIAMOND-IDX') return 'diamond';
  if (normalized.startsWith('XAU')) return 'gold';
  if (normalized.startsWith('XAG')) return 'silver';
  if (normalized.startsWith('XPT')) return 'platinum';
  throw new RangeError(`Unsupported market symbol: ${symbol}`);
}
