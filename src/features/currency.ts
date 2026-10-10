export type Currency = 'AED' | 'USD' | 'EUR' | 'GBP' | 'INR' | 'SAR';

export const CURRENCY_RATES_FROM_USD: Readonly<Record<Currency, number>> = {
  AED: 3.6725,
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.1,
  SAR: 3.75,
};

const CURRENCIES: readonly Currency[] = ['AED', 'USD', 'EUR', 'GBP', 'INR', 'SAR'];

export function getSelectedCurrency(): Currency {
  const saved = localStorage.getItem('mc-currency');
  return CURRENCIES.find(currency => currency === saved) ?? 'AED';
}

export function convertCurrencyAmount(value: number, from: Currency, to: Currency): number {
  return value / CURRENCY_RATES_FROM_USD[from] * CURRENCY_RATES_FROM_USD[to];
}

export function formatCurrencyAmount(value: number, currency: Currency = getSelectedCurrency()): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}
