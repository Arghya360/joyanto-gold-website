import type { Candle, MarketDataProvider, Snapshot, Tick, Timeframe } from './provider.ts';

export class HttpMarketDataProvider implements MarketDataProvider {
  private readonly apiUrl: string | undefined = import.meta.env.VITE_MARKET_API_URL;
  private readonly websocketUrl: string | undefined = import.meta.env.VITE_MARKET_WS_URL;

  // TODO: Map the licensed provider's authenticated snapshot response to Snapshot.
  async getSnapshot(_symbol: string): Promise<Snapshot> {
    this.requireApiUrl();
    throw new Error('HTTP market snapshot parsing is pending the licensed provider contract.');
  }

  // TODO: Map the licensed provider's candle response to the normalized Candle format.
  async getCandles(_symbol: string, _timeframe: Timeframe, _from: number, _to: number): Promise<Candle[]> {
    this.requireApiUrl();
    throw new Error('HTTP candle parsing is pending the licensed provider contract.');
  }

  // TODO: Implement the licensed provider's WebSocket message and reconnect contract.
  subscribe(_symbol: string, _onTick: (tick: Tick) => void): () => void {
    if (!this.websocketUrl) {
      throw new Error('VITE_MARKET_WS_URL is required for the HTTP provider tick connection.');
    }
    throw new Error('WebSocket message parsing is pending the licensed provider contract.');
  }

  private requireApiUrl(): string {
    if (!this.apiUrl) throw new Error('VITE_MARKET_API_URL is required for the HTTP market data provider.');
    return this.apiUrl;
  }
}
