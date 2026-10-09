import type {
  ChartType,
  Currency,
  IndicatorSetting,
  Material,
  PriceRange,
  TerminalViewState,
  Timeframe,
  Timezone,
} from './types.ts';

export const MARKET_TERMINAL_STORAGE_KEY = 'mc-market-terminal-view';

const materials = ['gold', 'silver', 'platinum', 'diamond'] as const satisfies readonly Material[];
const currencies = ['USD', 'AED', 'EUR', 'GBP', 'INR', 'SAR'] as const satisfies readonly Currency[];
const timeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1D', '1W'] as const satisfies readonly Timeframe[];
const ranges = ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'All'] as const satisfies readonly PriceRange[];
const chartTypes = ['candles', 'bars', 'line', 'area', 'baseline'] as const satisfies readonly ChartType[];
const timezones = ['Dubai', 'UTC', 'New York', 'London'] as const satisfies readonly Timezone[];

export const DEFAULT_TERMINAL_VIEW: Readonly<TerminalViewState> = {
  material: 'gold',
  currency: 'USD',
  timeframe: '1m',
  range: '1D',
  chartType: 'candles',
  indicators: [{ kind: 'sma', period: 20 }],
  compareSymbol: null,
  logScale: false,
  percentageScale: false,
  autoScale: true,
  showGrid: true,
  showVolume: true,
  showLastPriceLine: true,
  timezone: 'Dubai',
};

function isOneOf<T extends string>(values: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && values.some(candidate => candidate === value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseIndicators(value: unknown): IndicatorSetting[] {
  if (!Array.isArray(value)) return [...DEFAULT_TERMINAL_VIEW.indicators];
  const result: IndicatorSetting[] = [];
  for (const item of value) {
    if (!isRecord(item) || typeof item.kind !== 'string') continue;
    if ((item.kind === 'sma' || item.kind === 'ema' || item.kind === 'rsi')
      && Number.isInteger(item.period) && Number(item.period) >= 2 && Number(item.period) <= 500) {
      result.push({ kind: item.kind, period: Number(item.period) });
    } else if (item.kind === 'bollinger'
      && Number.isInteger(item.period) && Number(item.period) >= 2 && Number(item.period) <= 500
      && typeof item.deviations === 'number' && Number.isFinite(item.deviations)
      && item.deviations > 0 && item.deviations <= 5) {
      result.push({ kind: 'bollinger', period: Number(item.period), deviations: item.deviations });
    } else if (item.kind === 'macd'
      && [item.fastPeriod, item.slowPeriod, item.signalPeriod].every(period =>
        Number.isInteger(period) && Number(period) >= 2 && Number(period) <= 500)
      && Number(item.fastPeriod) < Number(item.slowPeriod)) {
      result.push({
        kind: 'macd',
        fastPeriod: Number(item.fastPeriod),
        slowPeriod: Number(item.slowPeriod),
        signalPeriod: Number(item.signalPeriod),
      });
    }
  }
  return result;
}

function isCompareSymbol(value: unknown): value is string {
  return typeof value === 'string'
    && (/^X(AU|AG|PT)(USD|AED|EUR|GBP|INR|SAR)$/.test(value) || value === 'DIAMOND-IDX');
}

export function parsePersistedView(value: unknown): TerminalViewState {
  if (!isRecord(value)) return { ...DEFAULT_TERMINAL_VIEW, indicators: [...DEFAULT_TERMINAL_VIEW.indicators] };
  return {
    material: isOneOf(materials, value.material) ? value.material : DEFAULT_TERMINAL_VIEW.material,
    currency: isOneOf(currencies, value.currency) ? value.currency : DEFAULT_TERMINAL_VIEW.currency,
    timeframe: isOneOf(timeframes, value.timeframe) ? value.timeframe : DEFAULT_TERMINAL_VIEW.timeframe,
    range: isOneOf(ranges, value.range) ? value.range : DEFAULT_TERMINAL_VIEW.range,
    chartType: isOneOf(chartTypes, value.chartType) ? value.chartType : DEFAULT_TERMINAL_VIEW.chartType,
    indicators: parseIndicators(value.indicators),
    compareSymbol: value.compareSymbol === null || isCompareSymbol(value.compareSymbol)
      ? value.compareSymbol
      : null,
    logScale: typeof value.logScale === 'boolean' ? value.logScale : DEFAULT_TERMINAL_VIEW.logScale,
    percentageScale: typeof value.percentageScale === 'boolean' ? value.percentageScale : DEFAULT_TERMINAL_VIEW.percentageScale,
    autoScale: typeof value.autoScale === 'boolean' ? value.autoScale : DEFAULT_TERMINAL_VIEW.autoScale,
    showGrid: typeof value.showGrid === 'boolean' ? value.showGrid : DEFAULT_TERMINAL_VIEW.showGrid,
    showVolume: typeof value.showVolume === 'boolean' ? value.showVolume : DEFAULT_TERMINAL_VIEW.showVolume,
    showLastPriceLine: typeof value.showLastPriceLine === 'boolean'
      ? value.showLastPriceLine
      : DEFAULT_TERMINAL_VIEW.showLastPriceLine,
    timezone: isOneOf(timezones, value.timezone) ? value.timezone : DEFAULT_TERMINAL_VIEW.timezone,
  };
}

export function parseUrlView(search: string, persisted?: unknown): TerminalViewState {
  const base = parsePersistedView(persisted);
  const params = new URLSearchParams(search);
  const material = params.get('metal');
  const currency = params.get('cur');
  const timeframe = params.get('tf');
  const range = params.get('range');
  const chartType = params.get('type');
  return {
    ...base,
    material: params.has('metal')
      ? (isOneOf(materials, material) ? material : DEFAULT_TERMINAL_VIEW.material)
      : base.material,
    currency: params.has('cur')
      ? (isOneOf(currencies, currency) ? currency : DEFAULT_TERMINAL_VIEW.currency)
      : base.currency,
    timeframe: params.has('tf')
      ? (isOneOf(timeframes, timeframe) ? timeframe : DEFAULT_TERMINAL_VIEW.timeframe)
      : base.timeframe,
    range: params.has('range')
      ? (isOneOf(ranges, range) ? range : DEFAULT_TERMINAL_VIEW.range)
      : base.range,
    chartType: params.has('type')
      ? (isOneOf(chartTypes, chartType) ? chartType : DEFAULT_TERMINAL_VIEW.chartType)
      : base.chartType,
  };
}

export function serializeViewToSearch(search: string, state: TerminalViewState): string {
  const params = new URLSearchParams(search);
  params.set('metal', state.material);
  params.set('cur', state.currency);
  params.set('tf', state.timeframe);
  params.set('range', state.range);
  params.set('type', state.chartType);
  return params.toString();
}
