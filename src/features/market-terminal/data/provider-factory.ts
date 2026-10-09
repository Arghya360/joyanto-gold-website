import type { MarketDataProvider } from './provider.ts';
import { HttpMarketDataProvider } from './http-provider.ts';
import { MockMarketDataProvider } from './mock-provider.ts';

export function createMarketDataProvider(providerName = import.meta.env.VITE_MARKET_PROVIDER): MarketDataProvider {
  if (!providerName || providerName === 'mock') return new MockMarketDataProvider();
  if (providerName === 'http') return new HttpMarketDataProvider();
  throw new Error(`Unsupported VITE_MARKET_PROVIDER value: ${providerName}`);
}
