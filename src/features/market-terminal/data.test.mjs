import assert from 'node:assert/strict';
import test from 'node:test';
import { FX_RATES_FROM_USD } from './config.ts';
import { MockMarketDataProvider, aggregateCandles } from './data/mock-provider.ts';
import { calculateChange, calculateDayRange, calculateSpreadAsk, convertCurrency, isTerminalPriceStale } from './market-math.ts';
import { symbolFor } from './symbols.ts';
import { METAL_UNITS, TROY_OUNCE_GRAMS, convertPerTroyOunce } from './units.ts';
import { DEFAULT_TERMINAL_VIEW, parsePersistedView, parseUrlView, serializeViewToSearch } from './view-state.ts';
import { createMarketTerminalStore } from './store.ts';

test('converts a troy-ounce price into all configured metal units', () => {
  const ouncePrice = 4201.2;
  const byUnit = Object.fromEntries(METAL_UNITS.map(unit => [unit.key, convertPerTroyOunce(ouncePrice, unit.grams)]));
  assert.equal(byUnit.ounce, 4201.2);
  assert.ok(Math.abs(byUnit.gram - 135.0717) < 0.001);
  assert.ok(Math.abs(byUnit.kilo - 135071.7) < 0.1);
  assert.ok(Math.abs(byUnit.pennyweight - 210.06) < 0.02);
  assert.ok(Math.abs(byUnit.tola - 1575.45) < 0.02);
  assert.ok(Math.abs(byUnit.tael - 5105.6) < 0.2);
  assert.equal(TROY_OUNCE_GRAMS, 31.1034768);
});

test('calculates spread, change and day-range marker without losing direction', () => {
  assert.equal(calculateSpreadAsk(100, 'gold'), 102);
  assert.equal(calculateSpreadAsk(100, 'silver'), 100.05);
  const change = calculateChange(1068.8, 1000);
  assert.ok(Math.abs(change.amount - 68.8) < 1e-10);
  assert.ok(Math.abs(change.percent - 6.88) < 1e-10);
  assert.deepEqual(calculateDayRange(90, 110, 105), { low: 90, high: 110, markerPercent: 75 });
  assert.equal(calculateDayRange(10, 10, 10).markerPercent, 50);
});

test('uses the configured AED peg and converts USD values to a selected currency', () => {
  assert.equal(FX_RATES_FROM_USD.AED, 3.6725);
  assert.equal(convertCurrency(100, 'AED'), 367.25);
});

test('creates and parses supported material symbols', () => {
  assert.equal(symbolFor('gold'), 'XAUUSD');
  assert.equal(symbolFor('gold', 'AED'), 'XAUAED');
  assert.equal(symbolFor('diamond'), 'DIAMOND-IDX');
});

test('staleness changes strictly after the configured 60-second threshold', () => {
  assert.equal(isTerminalPriceStale(40_000, 100_000), false);
  assert.equal(isTerminalPriceStale(39_999, 100_000), true);
});

test('hourly candles aggregate the same minute history and create a new bucket at boundaries', async () => {
  const provider = new MockMarketDataProvider();
  const start = 1_800_000_000;
  const from = Math.floor(start / 3600) * 3600;
  const minutes = await provider.getCandles('XAUUSD', '1m', from, from + 7200);
  const hourly = await provider.getCandles('XAUUSD', '1h', from, from + 7200);
  assert.deepEqual(hourly, aggregateCandles(minutes, 3600));
  assert.equal(hourly.length, 2);
  assert.equal(hourly[0].time + 3600, hourly[1].time);
  assert.equal(hourly[0].open, minutes[0].open);
  assert.equal(hourly[0].close, minutes[59].close);
});

test('mock history is repeatable for the same instrument and range', async () => {
  const provider = new MockMarketDataProvider();
  const from = 1_800_000_000;
  const first = await provider.getCandles('XAGUSD', '15m', from, from + 1800);
  const second = await provider.getCandles('XAGUSD', '15m', from, from + 1800);
  assert.deepEqual(second, first);
});

test('diamond mock data is daily-reference-only and does not subscribe to ticks', () => {
  const provider = new MockMarketDataProvider();
  assert.doesNotThrow(() => provider.subscribe('DIAMOND-IDX', () => undefined)());
});

test('diamond index history stays low-volatility and daily', async () => {
  const provider = new MockMarketDataProvider();
  const to = 1_800_000_000;
  const candles = await provider.getCandles('DIAMOND-IDX', '1D', to - 365 * 24 * 60 * 60, to);
  assert.ok(candles.length >= 360 && candles.length <= 366);
  const prices = candles.flatMap(candle => [candle.high, candle.low]);
  const relativeSpread = (Math.max(...prices) - Math.min(...prices)) / Math.min(...prices);
  assert.ok(relativeSpread < 0.03);
});

test('URL state validates supported values and defaults invalid query parameters', () => {
  const invalid = parseUrlView('?metal=plutonium&cur=CAD&tf=90m&range=2D&type=pie');
  assert.deepEqual(invalid, DEFAULT_TERMINAL_VIEW);

  const parsed = parseUrlView('?metal=silver&cur=AED&tf=30m&range=5D&type=line');
  assert.equal(parsed.material, 'silver');
  assert.equal(parsed.currency, 'AED');
  assert.equal(parsed.timeframe, '30m');
  assert.equal(parsed.range, '5D');
  assert.equal(parsed.chartType, 'line');
});

test('view state serialization preserves unrelated URL parameters', () => {
  const search = serializeViewToSearch('?feed=slow&campaign=spring', {
    ...DEFAULT_TERMINAL_VIEW,
    material: 'platinum',
    currency: 'EUR',
    timeframe: '4h',
    range: '1Y',
    chartType: 'area',
  });
  const params = new URLSearchParams(search);
  assert.equal(params.get('feed'), 'slow');
  assert.equal(params.get('campaign'), 'spring');
  assert.equal(params.get('metal'), 'platinum');
  assert.equal(params.get('type'), 'area');
});

test('persisted view state rejects invalid values and never trusts malformed fields', () => {
  const parsed = parsePersistedView({ material: 'unknown', timeframe: '90m', logScale: 'yes', compareSymbol: 'BAD' });
  assert.equal(parsed.material, 'gold');
  assert.equal(parsed.timeframe, '1m');
  assert.equal(parsed.logScale, false);
  assert.equal(parsed.compareSymbol, null);
});

test('market terminal store persists updates and syncs shareable URL state', () => {
  const values = new Map();
  let search = '?feed=slow';
  const storage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  const store = createMarketTerminalStore({
    getSearch: () => search,
    replaceSearch: nextSearch => { search = `?${nextSearch}`; },
    storage,
  });

  store.update({ material: 'silver', currency: 'AED', timeframe: '30m' });
  assert.equal(store.getState().material, 'silver');
  assert.equal(new URLSearchParams(search).get('feed'), 'slow');
  assert.equal(new URLSearchParams(search).get('metal'), 'silver');
  assert.equal(new URLSearchParams(search).get('cur'), 'AED');
  assert.equal(JSON.parse(values.get('mc-market-terminal-view')).timeframe, '30m');
  assert.equal(createMarketTerminalStore({ getSearch: () => '', replaceSearch: () => undefined, storage }).getState().material, 'silver');
});
