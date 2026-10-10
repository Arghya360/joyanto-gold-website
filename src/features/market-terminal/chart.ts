import { MockMarketDataProvider } from './data/mock-provider.ts';
import { symbolFor } from './symbols.ts';
import type { Candle, Material, PriceRange, Timeframe } from './types.ts';

const RANGE_SECONDS: Readonly<Record<PriceRange, number>> = {
  '1D': 24 * 60 * 60,
  '5D': 5 * 24 * 60 * 60,
  '1M': 30 * 24 * 60 * 60,
  '3M': 90 * 24 * 60 * 60,
  '6M': 182 * 24 * 60 * 60,
  YTD: 365 * 24 * 60 * 60,
  '1Y': 365 * 24 * 60 * 60,
  '5Y': 5 * 365 * 24 * 60 * 60,
  All: 5 * 365 * 24 * 60 * 60,
};

const TIMEFRAMES: Readonly<Record<PriceRange, Timeframe>> = {
  '1D': '30m',
  '5D': '4h',
  '1M': '1D',
  '3M': '1D',
  '6M': '1D',
  YTD: '1D',
  '1Y': '1D',
  '5Y': '1W',
  All: '1W',
};

const MATERIALS: Readonly<Record<string, Material>> = {
  Gold: 'gold',
  Silver: 'silver',
  Platinum: 'platinum',
  Diamond: 'diamond',
};
const MAX_VISIBLE_CANDLES = 160;
const SVG_HEIGHT = 360;
const provider = new MockMarketDataProvider();
let renderSequence = 0;

function isPriceRange(value: string): value is PriceRange {
  return Object.hasOwn(RANGE_SECONDS, value);
}

function compactCandles(candles: readonly Candle[]): Candle[] {
  if (candles.length <= MAX_VISIBLE_CANDLES) return [...candles];
  const groupSize = Math.ceil(candles.length / MAX_VISIBLE_CANDLES);
  const compacted: Candle[] = [];
  for (let start = 0; start < candles.length; start += groupSize) {
    const group = candles.slice(start, start + groupSize);
    const first = group[0];
    const last = group[group.length - 1];
    if (!first || !last) continue;
    compacted.push({
      time: first.time,
      open: first.open,
      high: Math.max(...group.map(candle => candle.high)),
      low: Math.min(...group.map(candle => candle.low)),
      close: last.close,
      volume: group.reduce((sum, candle) => sum + candle.volume, 0),
    });
  }
  return compacted;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function formatTime(time: number, range: PriceRange): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: range === '1D' ? undefined : '2-digit',
    hour: range === '1D' ? '2-digit' : undefined,
    minute: range === '1D' ? '2-digit' : undefined,
    timeZone: 'Asia/Dubai',
  }).format(new Date(time * 1000));
}

function escapeAttribute(value: string): string {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character] ?? character);
}

function renderCandleChart(candles: readonly Candle[], range: PriceRange, currency: string, width: number): string {
  const visible = compactCandles(candles);
  if (visible.length === 0) return '';
  const svgWidth = Math.max(280, Math.floor(width));
  const plot = { left: Math.min(74, svgWidth * 0.2), right: 8, top: 18, bottom: 42 };
  const plotWidth = svgWidth - plot.left - plot.right;
  const plotHeight = SVG_HEIGHT - plot.top - plot.bottom;
  const low = Math.min(...visible.map(candle => candle.low));
  const high = Math.max(...visible.map(candle => candle.high));
  const padding = (high - low || high * 0.01) * 0.08;
  const scaleLow = low - padding;
  const scaleHigh = high + padding;
  const priceY = (price: number) => plot.top + ((scaleHigh - price) / (scaleHigh - scaleLow)) * plotHeight;
  const step = plotWidth / visible.length;
  const candleWidth = Math.max(2, Math.min(12, step * 0.62));
  const labels = Array.from({ length: 5 }, (_, index) => {
    const y = plot.top + (plotHeight * index) / 4;
    const value = scaleHigh - ((scaleHigh - scaleLow) * index) / 4;
    return `<line class="mc-market-gridline" x1="${plot.left}" y1="${y}" x2="${svgWidth - plot.right}" y2="${y}"></line>
      <text class="mc-market-axis-label" x="${plot.left - 7}" y="${y + 4}" text-anchor="end">${formatPrice(value)}</text>`;
  }).join('');
  const candleMarks = visible.map((candle, index) => {
    const x = plot.left + step * (index + 0.5);
    const openY = priceY(candle.open);
    const closeY = priceY(candle.close);
    const rising = candle.close >= candle.open;
    const bodyY = Math.min(openY, closeY);
    const bodyHeight = Math.max(1.5, Math.abs(closeY - openY));
    const title = `${formatTime(candle.time, range)} · O ${formatPrice(candle.open)} · H ${formatPrice(candle.high)} · L ${formatPrice(candle.low)} · C ${formatPrice(candle.close)} ${currency}`;
    return `<g class="mc-market-candle ${rising ? 'mc-market-candle--up' : 'mc-market-candle--down'}">
      <title>${escapeAttribute(title)}</title>
      <line x1="${x}" y1="${priceY(candle.high)}" x2="${x}" y2="${priceY(candle.low)}"></line>
      <rect x="${x - candleWidth / 2}" y="${bodyY}" width="${candleWidth}" height="${bodyHeight}" rx="0.8"></rect>
    </g>`;
  }).join('');
  const first = visible[0];
  const last = visible[visible.length - 1];
  if (!first || !last) return '';
  const lastY = priceY(last.close);
  const lastX = plot.left + plotWidth - 1;
  const axisLabels = [first, visible[Math.floor(visible.length / 2)], last]
    .filter((candle): candle is Candle => candle !== undefined)
    .map((candle, index, list) => {
      const x = plot.left + (plotWidth * index) / Math.max(1, list.length - 1);
      return `<text class="mc-market-axis-label" x="${x}" y="${SVG_HEIGHT - 12}" text-anchor="${index === 0 ? 'start' : index === list.length - 1 ? 'end' : 'middle'}">${formatTime(candle.time, range)}</text>`;
    }).join('');

  return `<svg class="mc-market-svg" viewBox="0 0 ${svgWidth} ${SVG_HEIGHT}" role="img" aria-label="${range} candlestick chart, ${visible.length} bars, prices in ${currency}">
    ${labels}${candleMarks}
    <line class="mc-market-last-line" x1="${plot.left}" y1="${lastY}" x2="${lastX}" y2="${lastY}"></line>
    <rect class="mc-market-last-tag" x="${svgWidth - plot.right - 68}" y="${lastY - 11}" width="68" height="22" rx="2"></rect>
    <text class="mc-market-last-label" x="${svgWidth - plot.right - 34}" y="${lastY + 4}" text-anchor="middle">${formatPrice(last.close)}</text>
    ${axisLabels}
  </svg>`;
}

function showChartError(host: HTMLElement): void {
  host.innerHTML = '<div class="mc-market-chart-state" role="alert">Chart data could not be loaded. <button class="mc-button mc-button-outline" type="button" data-market-retry>Retry</button></div>';
}

export function initializeMarketChart(root: HTMLElement): void {
  const host = root.querySelector<HTMLElement>('#market-chart');
  const materialSelect = root.querySelector<HTMLSelectElement>('#chart-metal');
  const caption = root.querySelector<HTMLElement>('#chart-value');
  if (!host || !materialSelect || !caption) return;
  let latestCandles: Candle[] = [];
  let selectedRange: PriceRange = '1D';
  const resizeObserver = new ResizeObserver(() => {
    if (!host.isConnected) {
      resizeObserver.disconnect();
      return;
    }
    if (latestCandles.length > 0) host.innerHTML = renderCandleChart(latestCandles, selectedRange, 'USD', host.clientWidth);
  });
  resizeObserver.observe(host);
  const update = async () => {
    const thisRender = ++renderSequence;
    const name = materialSelect.value;
    const material = MATERIALS[name];
    const range = host.dataset.range;
    if (!material || !range || !isPriceRange(range)) return;
    selectedRange = range;
    host.setAttribute('aria-busy', 'true');
    host.innerHTML = '<div class="mc-market-chart-state" role="status">Loading chart…</div>';
    try {
      const now = Math.floor(Date.now() / 1000);
      const timeframe = material === 'diamond' ? '1D' : TIMEFRAMES[selectedRange];
      const candles = await provider.getCandles(
        symbolFor(material),
        timeframe,
        now - RANGE_SECONDS[selectedRange],
        now + 1,
      );
      if (thisRender !== renderSequence || !host.isConnected) return;
      if (candles.length === 0) {
        latestCandles = [];
        host.innerHTML = '<div class="mc-market-chart-state" role="status">No chart data is available for this range.</div>';
        return;
      }
      latestCandles = candles;
      host.innerHTML = renderCandleChart(candles, selectedRange, 'USD', host.clientWidth);
      const latest = candles[candles.length - 1];
      if (latest) caption.textContent = `${name} · ${selectedRange} · ${formatPrice(latest.close)} USD per ${material === 'diamond' ? 'carat' : 'troy ounce'} · Demonstration data`;
    } catch {
      latestCandles = [];
      if (thisRender === renderSequence && host.isConnected) showChartError(host);
    } finally {
      if (thisRender === renderSequence && host.isConnected) host.removeAttribute('aria-busy');
    }
  };

  materialSelect.addEventListener('change', update);
  root.querySelectorAll<HTMLButtonElement>('[data-market-range]').forEach(button => {
    button.addEventListener('click', () => {
      const range = button.dataset.marketRange;
      if (!range || !isPriceRange(range)) return;
      host.dataset.range = range;
      root.querySelectorAll('[data-market-range]').forEach(tab => {
        tab.setAttribute('aria-pressed', String(tab === button));
      });
      void update();
    });
  });
  host.addEventListener('click', event => {
    if (event.target instanceof HTMLElement && event.target.closest('[data-market-retry]')) void update();
  });
  void update();
}
