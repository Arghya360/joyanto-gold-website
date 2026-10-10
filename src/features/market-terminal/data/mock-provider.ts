import { DEFAULT_BASE_PRICES_USD, SPREADS_USD_PER_OUNCE } from '../config.ts';
import { materialFromSymbol } from '../symbols.ts';
import type { Candle, MarketDataProvider, Snapshot, Tick, Timeframe } from '../types.ts';

const TIMEFRAME_SECONDS: Readonly<Record<Timeframe, number>> = {
  '1m': 60,
  '5m': 5 * 60,
  '15m': 15 * 60,
  '30m': 30 * 60,
  '1h': 60 * 60,
  '4h': 4 * 60 * 60,
  '1D': 24 * 60 * 60,
  '1W': 7 * 24 * 60 * 60,
};
const MAX_CANDLES = 5000;
const MAX_BASE_CANDLES = 300_000;
const MINUTE_SECONDS = 60;
const DAY_SECONDS = 24 * 60 * 60;
const dailyWalkLevels = new Map<ReturnType<typeof materialFromSymbol>, number[]>();

function seededValue(seedText: string): number {
  let seed = 2166136261;
  for (let index = 0; index < seedText.length; index += 1) {
    seed = Math.imul(seed ^ seedText.charCodeAt(index), 16777619);
  }
  seed += seed << 13;
  seed ^= seed >>> 7;
  seed += seed << 3;
  seed ^= seed >>> 17;
  seed += seed << 5;
  return (seed >>> 0) / 0xffffffff;
}

function priceAt(material: ReturnType<typeof materialFromSymbol>, time: number): number {
  const base = DEFAULT_BASE_PRICES_USD[material];
  const diamond = material === 'diamond';
  const day = Math.floor(time / DAY_SECONDS);
  const minute = Math.floor(time / MINUTE_SECONDS);
  let levels = dailyWalkLevels.get(material);
  if (!levels) {
    levels = [base];
    dailyWalkLevels.set(material, levels);
  }
  while (levels.length <= day) {
    const previous = levels[levels.length - 1];
    if (previous === undefined) throw new Error('Mock price history could not be initialized.');
    const dailyVolatility = diamond ? 0.0003 : 0.003;
    const dailyReturn = (seededValue(`${material}:${levels.length}`) - 0.5) * dailyVolatility;
    levels.push(previous * Math.exp(dailyReturn));
  }
  const walkLevel = levels[day] ?? base;
  const slowCycle = Math.sin(day / 91) * (diamond ? 0.004 : 0.035)
    + Math.sin(day / 23) * (diamond ? 0.002 : 0.009);
  const intraday = Math.sin(minute / 97) * (diamond ? 0.00012 : 0.001)
    + Math.sin(minute / 19) * (diamond ? 0.00004 : 0.00035);
  return walkLevel * Math.exp(slowCycle + intraday);
}

function makeBaseCandle(material: ReturnType<typeof materialFromSymbol>, time: number, seconds: number): Candle {
  const open = priceAt(material, time);
  const close = priceAt(material, time + seconds);
  const middle = priceAt(material, time + seconds / 2);
  const wick = Math.max(open, close) * (0.00008 + seededValue(`${material}:${time}:wick`) * 0.00035);
  const high = Math.max(open, close, middle) + wick;
  const low = Math.max(0, Math.min(open, close, middle) - wick);
  const movement = Math.abs(close - open) / Math.max(open, 1);
  const volume = Math.round(30 + seededValue(`${material}:${time}:volume`) * 120 + movement * 150_000);
  return { time, open, high, low, close, volume };
}

export function aggregateCandles(candles: readonly Candle[], timeframeSeconds: number): Candle[] {
  if (!Number.isInteger(timeframeSeconds) || timeframeSeconds <= 0) {
    throw new RangeError('Timeframe duration must be a positive integer.');
  }
  const aggregated = new Map<number, Candle>();
  for (const candle of candles) {
    const bucket = Math.floor(candle.time / timeframeSeconds) * timeframeSeconds;
    const previous = aggregated.get(bucket);
    if (previous) {
      aggregated.set(bucket, {
        time: bucket,
        open: previous.open,
        high: Math.max(previous.high, candle.high),
        low: Math.min(previous.low, candle.low),
        close: candle.close,
        volume: previous.volume + candle.volume,
      });
    } else {
      aggregated.set(bucket, { ...candle, time: bucket });
    }
  }
  return [...aggregated.values()].sort((left, right) => left.time - right.time);
}

function nextRandom(seed: { value: number }): number {
  seed.value = (Math.imul(seed.value, 1664525) + 1013904223) >>> 0;
  return seed.value / 0x1_0000_0000;
}

export class MockMarketDataProvider implements MarketDataProvider {
  async getCandles(symbol: string, timeframe: Timeframe, from: number, to: number): Promise<Candle[]> {
    if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) {
      throw new RangeError('Candle range must be finite and end after start.');
    }
    const material = materialFromSymbol(symbol);
    const candleSeconds = TIMEFRAME_SECONDS[timeframe];
    const baseSeconds = candleSeconds >= DAY_SECONDS ? DAY_SECONDS : MINUTE_SECONDS;
    const alignedEnd = Math.ceil(to / baseSeconds) * baseSeconds;
    const requestedStart = Math.floor(from / baseSeconds) * baseSeconds;
    const baseCount = Math.ceil((alignedEnd - requestedStart) / baseSeconds);
    const start = baseCount > MAX_BASE_CANDLES ? alignedEnd - MAX_BASE_CANDLES * baseSeconds : requestedStart;
    const baseCandles: Candle[] = [];
    for (let time = start; time < alignedEnd; time += baseSeconds) {
      baseCandles.push(makeBaseCandle(material, time, baseSeconds));
    }
    return aggregateCandles(baseCandles, candleSeconds).slice(-MAX_CANDLES);
  }

  async getSnapshot(symbol: string): Promise<Snapshot> {
    const material = materialFromSymbol(symbol);
    const now = Math.floor(Date.now() / 1000);
    const sessionStart = Math.floor(now / DAY_SECONDS) * DAY_SECONDS;
    const previousClose = priceAt(material, sessionStart - MINUTE_SECONDS);
    const bid = priceAt(material, now);
    const sessionCandles = await this.getCandles(symbol, '1m', sessionStart, now + 1);
    const dayHigh = Math.max(bid, ...sessionCandles.map(candle => candle.high));
    const dayLow = Math.min(bid, ...sessionCandles.map(candle => candle.low));
    return {
      symbol,
      bid,
      ask: bid + SPREADS_USD_PER_OUNCE[material],
      previousClose,
      dayHigh,
      dayLow,
      sessionOpen: priceAt(material, sessionStart),
      time: now,
    };
  }

  subscribe(symbol: string, onTick: (tick: Tick) => void): () => void {
    const material = materialFromSymbol(symbol);
    if (material === 'diamond') return () => undefined;
    const params = new URLSearchParams(window.location.search);
    const failDemo = import.meta.env.DEV && params.get('feed') === 'fail';
    if (failDemo) return () => undefined;
    const slowDemo = import.meta.env.DEV && params.get('feed') === 'slow';

    const seed = { value: Math.floor(seededValue(`${symbol}:${Date.now()}`) * 0xffff_ffff) >>> 0 };
    let bid = priceAt(material, Math.floor(Date.now() / 1000));
    let ticks = 0;
    let timeout = 0;
    let active = true;

    const schedule = () => {
      timeout = window.setTimeout(() => {
        if (!active) return;
        const direction = nextRandom(seed) - 0.5;
        bid = Math.max(0, bid * (1 + direction * 0.00012));
        ticks += 1;
        onTick({
          symbol,
          bid,
          ask: bid + SPREADS_USD_PER_OUNCE[material],
          time: Date.now() / 1000,
          ticks,
        });
        schedule();
      }, slowDemo ? 5000 + Math.floor(nextRandom(seed) * 5001) : 500 + Math.floor(nextRandom(seed) * 1001));
    };
    schedule();

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }
}
