import type { Product, ProductStockStatus, ProductWeightUnit, ShopCategory } from '../data/products.ts';
import { convertCurrencyAmount, type Currency } from './currency.ts';

export const SHOP_CATEGORIES: readonly { id: ShopCategory; name: string }[] = [
  { id: 'gold-bars', name: 'Gold Bars' },
  { id: 'silver-bars', name: 'Silver Bars' },
  { id: 'gold-coins', name: 'Gold Coins' },
  { id: 'silver-coins', name: 'Silver Coins' },
  { id: 'dubai-collection', name: 'Dubai Collection' },
  { id: 'gift-range', name: 'Gift Range' },
  { id: 'private-assets', name: 'Private Assets' },
];

export const STOCK_STATUSES: readonly { id: ProductStockStatus; name: string }[] = [
  { id: 'in_stock', name: 'In stock' },
  { id: 'pre_order', name: 'Pre-order' },
  { id: 'enquire', name: 'Enquire only' },
  { id: 'out_of_stock', name: 'Out of stock' },
  { id: 'unconfirmed', name: 'Awaiting confirmation' },
];

export interface ProductFilters {
  query: string;
  categories: ShopCategory[];
  weights: string[];
  minPrice: number | null;
  maxPrice: number | null;
  stock: ProductStockStatus[];
}

export interface FilterUrlState {
  filters: ProductFilters;
  sort: string;
  page: number;
}

export interface ProductFacets {
  categoryCounts: Record<ShopCategory, number>;
  weightCounts: Record<string, number>;
  stockCounts: Record<ProductStockStatus, number>;
  weightOptions: Array<{ value: string; label: string; count: number }>;
  minPrice: number;
  maxPrice: number;
}

const GRAMS_PER_UNIT: Partial<Record<ProductWeightUnit, number>> = {
  g: 1,
  kg: 1000,
  oz: 31.1035,
};

const CATEGORY_IDS: ReadonlySet<string> = new Set(SHOP_CATEGORIES.map(category => category.id));
const STOCK_STATUS_IDS: ReadonlySet<string> = new Set(STOCK_STATUSES.map(status => status.id));
const FILTER_QUERY_KEYS = ['q', 'category', 'weight', 'minPrice', 'maxPrice', 'stock'];

export function createEmptyFilters(): ProductFilters {
  return {
    query: '',
    categories: [],
    weights: [],
    minPrice: null,
    maxPrice: null,
    stock: [],
  };
}

export function cloneFilters(filters: ProductFilters): ProductFilters {
  return {
    ...filters,
    categories: [...filters.categories],
    weights: [...filters.weights],
    stock: [...filters.stock],
  };
}

export function filtersEqual(left: ProductFilters, right: ProductFilters): boolean {
  return left.query.trim() === right.query.trim()
    && sameItems(left.categories, right.categories)
    && sameItems(left.weights, right.weights)
    && left.minPrice === right.minPrice
    && left.maxPrice === right.maxPrice
    && sameItems(left.stock, right.stock);
}

function sameItems(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every(value => right.includes(value));
}

export function weightInGrams(value: number, unit: ProductWeightUnit): number | null {
  const gramsPerUnit = GRAMS_PER_UNIT[unit];
  return gramsPerUnit ? value * gramsPerUnit : null;
}

function weightKey(value: number, unit: ProductWeightUnit): string {
  const grams = weightInGrams(value, unit);
  if (grams === null) return `${trimNumber(value)}${unit}`;
  if (Math.abs(grams - 31.1035) < 0.001) return '1oz';
  if (Math.abs(grams - 7.775875) < 0.001) return '1/4oz';
  if (Math.abs(grams - 1000) < 0.001) return '1kg';
  return `${trimNumber(grams)}g`;
}

function trimNumber(value: number): string {
  return Number(value.toFixed(4)).toString();
}

function displayWeight(value: number, unit: ProductWeightUnit): string {
  if (unit === 'oz' && value === 0.25) return '1/4 oz';
  const labels: Record<ProductWeightUnit, string> = {
    g: 'g',
    kg: 'kg',
    oz: 'oz',
    carat: 'carat',
    allocation: '',
  };
  return `${trimNumber(value)}${labels[unit] ? ` ${labels[unit]}` : ''}`;
}

export function productWeightLabel(product: Product): string {
  return product.weightValue === undefined || product.weightUnit === undefined
    ? ''
    : displayWeight(product.weightValue, product.weightUnit);
}

export function getWeightOptions(products: readonly Product[]): Array<{ value: string; label: string }> {
  const grouped = new Map<string, { value: string; label: string; grams: number | null }>();

  for (const product of products) {
    if (product.weightValue === undefined || product.weightUnit === undefined) continue;
    const key = weightKey(product.weightValue, product.weightUnit);
    const grams = weightInGrams(product.weightValue, product.weightUnit);
    const current = grouped.get(key);
    const label = displayWeight(product.weightValue, product.weightUnit);
    if (!current || preferWeightLabel(product.weightUnit, current.label)) {
      grouped.set(key, { value: key, label, grams });
    }
  }

  return [...grouped.values()]
    .sort((left, right) => {
      if (left.grams !== null && right.grams !== null) return left.grams - right.grams;
      if (left.grams !== null) return -1;
      if (right.grams !== null) return 1;
      return left.label.localeCompare(right.label);
    })
    .map(({ value, label }) => ({ value, label }));
}

function preferWeightLabel(unit: ProductWeightUnit, currentLabel: string): boolean {
  const currentUnit = currentLabel.endsWith(' oz') ? 'oz' : currentLabel.endsWith(' kg') ? 'kg' : 'g';
  const rank: Record<string, number> = { g: 0, kg: 1, oz: 2 };
  return (rank[unit] ?? 0) > (rank[currentUnit] ?? 0);
}

export function convertAedPrice(price: number, currency: Currency): number {
  return convertCurrencyAmount(price, 'AED', currency);
}

export function convertPriceCurrency(price: number, from: Currency, to: Currency): number {
  return convertCurrencyAmount(price, from, to);
}

function matchesQuery(product: Product, query: string): boolean {
  if (!query) return true;
  const weight = productWeightLabel(product).toLowerCase();
  const unitAliases = product.weightUnit === 'kg'
    ? ' kilo kilogram kilograms'
    : product.weightUnit === 'oz' ? ' ounce ounces troy ounce' : '';
  const haystack = [
    product.title,
    product.category.replace(/-/g, ' '),
    product.metal,
    product.type,
    weight,
    product.description ?? '',
    ...(product.features ?? []),
    unitAliases,
  ].join(' ').toLowerCase().replace(/(\d)(g|kg|oz)\b/g, '$1 $2');
  const compactHaystack = haystack.replace(/\s+/g, '');
  return haystack.includes(query) || compactHaystack.includes(query.replace(/\s+/g, ''));
}

export function matchesProductQuery(product: Product, query: string): boolean {
  return matchesQuery(product, query.trim().toLowerCase());
}

export function filterProducts(
  products: readonly Product[],
  filters: ProductFilters,
  currency: Currency = 'AED',
  omitFacet?: 'category' | 'weight' | 'stock',
): Product[] {
  const query = filters.query.trim().toLowerCase();
  return products.filter(product => {
    if (!matchesQuery(product, query)) return false;
    if (omitFacet !== 'category' && filters.categories.length > 0 && !filters.categories.includes(product.category)) return false;
    if (omitFacet !== 'weight' && filters.weights.length > 0
      && (product.weightValue === undefined || product.weightUnit === undefined
        || !filters.weights.includes(weightKey(product.weightValue, product.weightUnit)))) return false;
    if (filters.minPrice !== null || filters.maxPrice !== null) {
      if (product.priceSource !== 'indicative' || product.price <= 0) return false;
      const price = convertAedPrice(product.price, currency);
      if (filters.minPrice !== null && price < filters.minPrice) return false;
      if (filters.maxPrice !== null && price > filters.maxPrice) return false;
    }
    if (omitFacet !== 'stock' && filters.stock.length > 0 && !filters.stock.includes(product.stockStatus)) return false;
    return true;
  });
}

export function computeFacets(
  products: readonly Product[],
  filters: ProductFilters,
  currency: Currency = 'AED',
): ProductFacets {
  const categoryProducts = filterProducts(products, filters, currency, 'category');
  const weightProducts = filterProducts(products, filters, currency, 'weight');
  const stockProducts = filterProducts(products, filters, currency, 'stock');
  const categoryCounts: Record<ShopCategory, number> = {
    'gold-bars': 0,
    'silver-bars': 0,
    'gold-coins': 0,
    'silver-coins': 0,
    'dubai-collection': 0,
    'gift-range': 0,
    'private-assets': 0,
  };
  for (const product of categoryProducts) categoryCounts[product.category] += 1;
  const stockCounts: Record<ProductStockStatus, number> = {
    in_stock: 0,
    pre_order: 0,
    enquire: 0,
    out_of_stock: 0,
    unconfirmed: 0,
  };
  for (const product of stockProducts) stockCounts[product.stockStatus] += 1;
  const options = getWeightOptions(products);
  const weightCounts: Record<string, number> = {};
  for (const option of options) {
    weightCounts[option.value] = weightProducts.filter(product => product.weightValue !== undefined
      && product.weightUnit !== undefined
      && weightKey(product.weightValue, product.weightUnit) === option.value).length;
  }
  const priced = products.filter(product => product.priceSource === 'indicative' && product.price > 0)
    .map(product => convertAedPrice(product.price, currency));

  return {
    categoryCounts,
    weightCounts,
    stockCounts,
    weightOptions: options.map(option => ({ ...option, count: weightCounts[option.value] ?? 0 })),
    minPrice: priced.length ? Math.floor(Math.min(...priced)) : 0,
    maxPrice: priced.length ? Math.ceil(Math.max(...priced)) : 0,
  };
}

export function parseFilterUrl(search: string, products: readonly Product[]): FilterUrlState {
  const params = new URLSearchParams(search);
  const filters = createEmptyFilters();
  const validWeights = new Set(getWeightOptions(products).map(option => option.value));

  filters.query = safeText(params.get('q'));
  filters.categories = parseList(params.get('category'), isCategoryId);
  filters.weights = parseList(params.get('weight'), (value): value is string => validWeights.has(value));
  filters.stock = parseList(params.get('stock'), isStockStatusId);

  const minPrice = parsePrice(params.get('minPrice'));
  const maxPrice = parsePrice(params.get('maxPrice'));
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    filters.minPrice = null;
    filters.maxPrice = null;
  } else {
    filters.minPrice = minPrice;
    filters.maxPrice = maxPrice;
  }

  const pageValue = Number(params.get('page'));
  return {
    filters,
    sort: params.get('sort') ?? 'featured',
    page: Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1,
  };
}

function safeText(value: string | null): string {
  const text = value?.trim() ?? '';
  return text.length <= 200 ? text : '';
}

function isCategoryId(value: string): value is ShopCategory {
  return CATEGORY_IDS.has(value);
}

function isStockStatusId(value: string): value is ProductStockStatus {
  return STOCK_STATUS_IDS.has(value);
}

function parseList<T extends string>(value: string | null, isValid: (item: string) => item is T): T[] {
  return [...new Set((value ?? '').split(',').map(item => item.trim()).filter(isValid))];
}

function parsePrice(value: string | null): number | null {
  if (value === null || value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function serializeFilterUrl(search: string, filters: ProductFilters, resetPage: boolean): string {
  const params = new URLSearchParams(search);
  for (const key of FILTER_QUERY_KEYS) params.delete(key);
  const query = filters.query.trim();
  if (query) params.set('q', query);
  if (filters.categories.length) params.set('category', [...filters.categories].sort().join(','));
  if (filters.weights.length) params.set('weight', [...filters.weights].sort().join(','));
  if (filters.minPrice !== null) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== null) params.set('maxPrice', String(filters.maxPrice));
  if (filters.stock.length) params.set('stock', [...filters.stock].sort().join(','));
  if (resetPage && params.has('page')) params.set('page', '1');
  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}
