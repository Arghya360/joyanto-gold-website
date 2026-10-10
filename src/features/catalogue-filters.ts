export const CATALOGUE_CATEGORIES = [
  { value: 'gold-bars', label: 'Gold Bars' },
  { value: 'silver-bars', label: 'Silver Bars' },
  { value: 'gold-coins', label: 'Gold Coins' },
  { value: 'silver-coins', label: 'Silver Coins' },
  { value: 'dubai-collection', label: 'Dubai Collection' },
  { value: 'gift-range', label: 'Gift Range' },
] as const;

export type CatalogueCategory = typeof CATALOGUE_CATEGORIES[number]['value'];
export type CatalogueMetal = 'Gold' | 'Silver';
export type CatalogueType = 'bar' | 'coin' | 'gift';
export type CatalogueAvailability = 'in_stock' | 'pre_order' | 'enquire' | 'out_of_stock';
export type CatalogueWeightUnit = 'g' | 'oz' | 'kg';
export type CatalogueWeightPreset = 'up-to-10' | '10-to-100' | '100-to-1000' | '1000-plus';
export type CatalogueView = 'grid' | 'list';
export type CatalogueSort = 'featured' | 'price-asc' | 'price-desc' | 'weight-asc' | 'weight-desc' | 'newest';

export interface CatalogueFilterProduct {
  slug: string;
  name: string;
  category: string;
  metal: string;
  grams: number;
  priceAed?: number;
  description?: string;
  fineness?: string;
}

export interface CatalogueFilters {
  query: string;
  category: CatalogueCategory | '';
  metal: CatalogueMetal | '';
  type: CatalogueType | '';
  availability: CatalogueAvailability | '';
  minWeight: number | null;
  maxWeight: number | null;
  weightUnit: CatalogueWeightUnit;
}

export interface CatalogueFacets {
  categories: Array<{ value: CatalogueCategory; label: string; count: number }>;
  metals: Array<{ value: CatalogueMetal; count: number }>;
  types: Array<{ value: CatalogueType; count: number }>;
  availability: Array<{ value: CatalogueAvailability; label: string; count: number }>;
}

export interface CatalogueUrlState {
  filters: CatalogueFilters;
  sort: CatalogueSort;
  view: CatalogueView;
}

const METALS: readonly CatalogueMetal[] = ['Gold', 'Silver'];
const TYPES: readonly CatalogueType[] = ['bar', 'coin', 'gift'];
const AVAILABILITY: readonly { value: CatalogueAvailability; label: string }[] = [
  { value: 'in_stock', label: 'In stock' },
  { value: 'pre_order', label: 'Pre-order' },
  { value: 'enquire', label: 'Enquire only' },
  { value: 'out_of_stock', label: 'Out of stock' },
];
const UNITS: readonly CatalogueWeightUnit[] = ['g', 'oz', 'kg'];
const VALID_SORTS: readonly CatalogueSort[] = ['featured', 'weight-asc', 'weight-desc'];

export function createEmptyCatalogueFilters(): CatalogueFilters {
  return {
    query: '',
    category: '',
    metal: '',
    type: '',
    availability: '',
    minWeight: null,
    maxWeight: null,
    weightUnit: 'g',
  };
}

export function gramsForWeight(value: number, unit: CatalogueWeightUnit): number {
  const multiplier: Record<CatalogueWeightUnit, number> = { g: 1, oz: 31.1035, kg: 1000 };
  return value * multiplier[unit];
}

export function validateWeightRange(min: number | null, max: number | null): boolean {
  return (min === null || Number.isFinite(min) && min >= 0)
    && (max === null || Number.isFinite(max) && max >= 0)
    && (min === null || max === null || min <= max);
}

export function catalogueWeightPreset(preset: CatalogueWeightPreset): { min: number | null; max: number | null } {
  switch (preset) {
    case 'up-to-10': return { min: null, max: 10 };
    case '10-to-100': return { min: 10, max: 100 };
    case '100-to-1000': return { min: 100, max: 1000 };
    case '1000-plus': return { min: 1000, max: null };
  }
}

export function parseCatalogueNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed.includes('-')) return null;
  const parsedDirectly = Number(trimmed);
  if (Number.isFinite(parsedDirectly) && parsedDirectly >= 0) return parsedDirectly;
  const sanitized = trimmed.replace(/[^0-9.]/g, '');
  if (!sanitized || (sanitized.match(/\./g)?.length ?? 0) > 1) return null;
  const parsed = Number(sanitized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function getCatalogueType(product: CatalogueFilterProduct): CatalogueType | null {
  if (product.category === 'Gold Bars' || product.category === 'Silver Bars') return 'bar';
  if (product.category === 'Gold Coins' || product.category === 'Silver Coins') return 'coin';
  if (product.category === 'Gift Range') return 'gift';
  return null;
}

export function getCatalogueAvailability(product: CatalogueFilterProduct): CatalogueAvailability | null {
  if (product.category === 'Dubai Collection') return 'pre_order';
  return null;
}

export function formatCatalogueWeight(grams: number): string {
  if (Math.abs(grams - 31.1035) < 0.001) return '1 oz';
  if (Math.abs(grams - 1000) < 0.001) return '1 kg';
  return `${Number(grams.toFixed(4))} g`;
}

function matchesSearch(product: CatalogueFilterProduct, query: string): boolean {
  if (!query) return true;
  const grams = Number(product.grams.toFixed(4)).toString();
  const weight = formatCatalogueWeight(product.grams);
  const aliases = product.grams >= 1000 ? ' kilo kilos kilogram kilograms kg ' : '';
  const ounceAliases = Math.abs(product.grams - 31.1035) < 0.001 ? ' ounce ounces troy ounce ' : '';
  const type = getCatalogueType(product) ?? '';
  const availability = getCatalogueAvailability(product) ?? '';
  const haystack = [
    product.name, product.category, product.metal, type, availability, weight,
    `${grams}g`, `${grams} g`, aliases, ounceAliases, product.fineness ?? '',
    product.description ?? '',
  ].join(' ').toLowerCase();
  return haystack.includes(query)
    || haystack.replace(/\s+/g, '').includes(query.replace(/\s+/g, ''));
}

export function filterCatalogueProducts<T extends CatalogueFilterProduct>(
  products: readonly T[],
  filters: CatalogueFilters,
  omit?: keyof Pick<CatalogueFilters, 'category' | 'metal' | 'type' | 'availability' | 'minWeight' | 'maxWeight'>,
): T[] {
  return products.filter(product => {
    if (!matchesSearch(product, filters.query.trim().toLowerCase())) return false;
    if (omit !== 'category' && filters.category && categoryToSlug(product.category) !== filters.category) return false;
    if (omit !== 'metal' && filters.metal && product.metal !== filters.metal) return false;
    if (omit !== 'type' && filters.type && getCatalogueType(product) !== filters.type) return false;
    if (omit !== 'availability' && filters.availability && getCatalogueAvailability(product) !== filters.availability) return false;
    if (omit !== 'minWeight' && filters.minWeight !== null
      && product.grams < gramsForWeight(filters.minWeight, filters.weightUnit)) return false;
    if (omit !== 'maxWeight' && filters.maxWeight !== null
      && product.grams > gramsForWeight(filters.maxWeight, filters.weightUnit)) return false;
    return true;
  });
}

export function computeCatalogueFacets(
  products: readonly CatalogueFilterProduct[],
  filters: CatalogueFilters,
): CatalogueFacets {
  const categories = CATALOGUE_CATEGORIES.map(category => ({
    ...category,
    count: filterCatalogueProducts(products, filters, 'category')
      .filter(product => categoryToSlug(product.category) === category.value).length,
  }));
  const metals = METALS.map(value => ({
    value,
    count: filterCatalogueProducts(products, filters, 'metal').filter(product => product.metal === value).length,
  }));
  const types = TYPES.map(value => ({
    value,
    count: filterCatalogueProducts(products, filters, 'type').filter(product => getCatalogueType(product) === value).length,
  }));
  const availability = AVAILABILITY.map(status => ({
    ...status,
    count: filterCatalogueProducts(products, filters, 'availability')
      .filter(product => getCatalogueAvailability(product) === status.value).length,
  }));
  return { categories, metals, types, availability };
}

export function sortCatalogueProducts<T extends CatalogueFilterProduct>(
  products: readonly T[],
  sort: CatalogueSort,
): T[] {
  const sorted = [...products];
  if (sort === 'weight-asc') sorted.sort((left, right) => left.grams - right.grams);
  if (sort === 'weight-desc') sorted.sort((left, right) => right.grams - left.grams);
  return sorted;
}

export function categoryToSlug(category: string): CatalogueCategory | '' {
  return CATALOGUE_CATEGORIES.find(item => item.label === category)?.value ?? '';
}

export function categoryLabel(value: CatalogueCategory | ''): string {
  return CATALOGUE_CATEGORIES.find(category => category.value === value)?.label ?? '';
}

export function parseCatalogueUrl(search: string): CatalogueUrlState {
  const params = new URLSearchParams(search);
  const categoryValue = params.get('category') ?? '';
  const metalValue = params.get('metal') ?? '';
  const typeValue = params.get('type') ?? '';
  const availabilityValue = params.get('stock') ?? '';
  const weightUnitValue = params.get('wUnit') ?? 'g';
  const sortValue = params.get('sort') ?? 'featured';
  const viewValue = params.get('view') ?? '';
  const minWeight = parseCatalogueNumber(params.get('minW') ?? '');
  const maxWeight = parseCatalogueNumber(params.get('maxW') ?? '');
  const filters = createEmptyCatalogueFilters();

  filters.query = safeQuery(params.get('q'));
  filters.category = isCategory(categoryValue) ? categoryValue : '';
  filters.metal = isMetal(metalValue) ? metalValue : '';
  filters.type = isType(typeValue) ? typeValue : '';
  filters.availability = isAvailability(availabilityValue) ? availabilityValue : '';
  filters.weightUnit = isUnit(weightUnitValue) ? weightUnitValue : 'g';
  if (validateWeightRange(minWeight, maxWeight)) {
    filters.minWeight = minWeight;
    filters.maxWeight = maxWeight;
  }

  return {
    filters,
    sort: VALID_SORTS.find(sort => sort === sortValue) ?? 'featured',
    view: viewValue === 'list' ? 'list' : 'grid',
  };
}

export function serializeCatalogueUrl(
  search: string,
  filters: CatalogueFilters,
  sort: CatalogueSort,
  view: CatalogueView,
  resetPage: boolean,
): string {
  const params = new URLSearchParams(search);
  for (const key of ['q', 'category', 'metal', 'type', 'stock', 'minW', 'maxW', 'wUnit', 'maxPrice']) {
    params.delete(key);
  }
  const query = filters.query.trim();
  if (query) params.set('q', query);
  if (filters.category) params.set('category', filters.category);
  if (filters.metal) params.set('metal', filters.metal);
  if (filters.type) params.set('type', filters.type);
  if (filters.availability) params.set('stock', filters.availability);
  if (filters.minWeight !== null) params.set('minW', String(filters.minWeight));
  if (filters.maxWeight !== null) params.set('maxW', String(filters.maxWeight));
  if ((filters.minWeight !== null || filters.maxWeight !== null) && filters.weightUnit !== 'g') {
    params.set('wUnit', filters.weightUnit);
  }
  if (sort !== 'featured') params.set('sort', sort);
  else params.set('sort', 'featured');
  params.set('view', view);
  if (resetPage) params.set('page', '1');
  return params.toString();
}

export function catalogueFiltersActive(filters: CatalogueFilters): boolean {
  return Boolean(filters.query.trim() || filters.category || filters.metal || filters.type || filters.availability
    || filters.minWeight !== null || filters.maxWeight !== null);
}

function safeQuery(value: string | null): string {
  const query = value?.trim() ?? '';
  return query.length <= 200 ? query : '';
}

function isCategory(value: string): value is CatalogueCategory {
  return CATALOGUE_CATEGORIES.some(category => category.value === value);
}

function isMetal(value: string): value is CatalogueMetal {
  return METALS.includes(value as CatalogueMetal);
}

function isType(value: string): value is CatalogueType {
  return TYPES.includes(value as CatalogueType);
}

function isAvailability(value: string): value is CatalogueAvailability {
  return AVAILABILITY.some(status => status.value === value);
}

function isUnit(value: string): value is CatalogueWeightUnit {
  return UNITS.includes(value as CatalogueWeightUnit);
}
