export type SellMetal = 'Gold' | 'Silver';
export type SellItemType = 'Bar' | 'Coin' | 'Jewellery' | 'Scrap' | 'Mixed';
export type SellWeightUnit = 'g' | 'kg' | 'oz' | 'tola';

export const SELL_TO_US_CONFIG = {
  maxItems: 10,
  maxWeight: 1_000_000,
  maxPhotoCount: 5,
  maxPhotoBytes: 5 * 1024 * 1024,
  acceptedPhotoTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  units: {
    g: { label: 'g', grams: 1 },
    kg: { label: 'kg', grams: 1000 },
    oz: { label: 'oz', grams: 31.1035 },
    tola: { label: 'tola', grams: 11.6638 },
  } satisfies Record<SellWeightUnit, { label: string; grams: number }>,
  purities: {
    Gold: [
      { value: '999.9', label: '24K · 999.9', fraction: 0.9999 },
      { value: '916', label: '22K · 916', fraction: 0.916 },
      { value: '875', label: '21K · 875', fraction: 0.875 },
      { value: '750', label: '18K · 750', fraction: 0.75 },
      { value: '585', label: '14K · 585', fraction: 0.585 },
      { value: '375', label: '9K · 375', fraction: 0.375 },
    ],
    Silver: [
      { value: '999', label: '999 fine', fraction: 0.999 },
      { value: '925', label: '925 sterling', fraction: 0.925 },
      { value: '800', label: '800', fraction: 0.8 },
    ],
  } satisfies Record<SellMetal, ReadonlyArray<{ value: string; label: string; fraction: number }>>,
  indicativeBand: null as { low: number; high: number } | null,
  shippingEnabled: false,
  appointmentWindowDays: 60,
  submissionIntervalMs: 30_000,
  mockSubmissionDelayMinMs: 800,
  mockSubmissionDelayMaxMs: 1200,
} as const;
