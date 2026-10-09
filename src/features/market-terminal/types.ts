export type Material = 'gold' | 'silver' | 'platinum' | 'diamond';
export type Currency = 'USD' | 'AED' | 'EUR' | 'GBP' | 'INR' | 'SAR';
export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1D' | '1W';
export type PriceRange = '1D' | '5D' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '5Y' | 'All';
export type ChartType = 'candles' | 'bars' | 'line' | 'area' | 'baseline';
export type Timezone = 'Dubai' | 'UTC' | 'New York' | 'London';

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Tick {
  symbol: string;
  bid: number;
  ask: number;
  time: number;
  ticks: number;
}

export interface Snapshot {
  symbol: string;
  bid: number;
  ask: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  sessionOpen: number;
  time: number;
}

export type IndicatorSetting =
  | { kind: 'sma'; period: number }
  | { kind: 'ema'; period: number }
  | { kind: 'bollinger'; period: number; deviations: number }
  | { kind: 'rsi'; period: number }
  | { kind: 'macd'; fastPeriod: number; slowPeriod: number; signalPeriod: number };

export interface TerminalViewState {
  material: Material;
  currency: Currency;
  timeframe: Timeframe;
  range: PriceRange;
  chartType: ChartType;
  indicators: IndicatorSetting[];
  compareSymbol: string | null;
  logScale: boolean;
  percentageScale: boolean;
  autoScale: boolean;
  showGrid: boolean;
  showVolume: boolean;
  showLastPriceLine: boolean;
  timezone: Timezone;
}

export type TerminalStatus =
  | { status: 'loading' }
  | { status: 'live'; lastTickAt: number }
  | { status: 'stale'; lastTickAt: number }
  | { status: 'error'; message: string };

export interface MarketDataProvider {
  getSnapshot(symbol: string): Promise<Snapshot>;
  getCandles(symbol: string, timeframe: Timeframe, from: number, to: number): Promise<Candle[]>;
  subscribe(symbol: string, onTick: (tick: Tick) => void): () => void;
}
