import { catalogueItems } from './modern-data';
import { CURRENCY_RATES_FROM_USD, formatCurrencyAmount, getSelectedCurrency } from './currency';
import {
  CATALOGUE_CATEGORIES,
  catalogueFiltersActive,
  categoryLabel,
  computeCatalogueFacets,
  createEmptyCatalogueFilters,
  filterCatalogueProducts,
  formatCatalogueWeight,
  gramsForWeight,
  parseCatalogueNumber,
  parseCatalogueUrl,
  serializeCatalogueUrl,
  sortCatalogueProducts,
  validateWeightRange,
} from './catalogue-filters';
import type {
  CatalogueAvailability,
  CatalogueCategory,
  CatalogueFilters,
  CatalogueSort,
  CatalogueView,
} from './catalogue-filters';

export type Metal = 'Gold' | 'Silver' | 'Platinum' | 'Palladium';
const metals: Metal[] = ['Gold', 'Silver', 'Platinum', 'Palladium'];
const mockUsdPerOz: Record<Metal, number> = { Gold: 2320, Silver: 29, Platinum: 990, Palladium: 1010 };
export const formatMoney = formatCurrencyAmount;
const getCurrency = getSelectedCurrency;
export const parseMetal = (value: string | null | undefined): Metal => metals.find(metal => metal === value) ?? 'Gold';
export const pricePerGram = (metal: Metal, currency = getCurrency()): number => mockUsdPerOz[metal] * CURRENCY_RATES_FROM_USD[currency] / 31.1035;
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character] ?? character));

export function showFormMessage(element: Element | null, message: string): void {
  if (element) element.textContent = message;
}

export function convertWeight(weight: number, unit: string): number {
  const toGrams: Record<string, number> = { g: 1, oz: 31.1035, kg: 1000, tola: 11.6638 };
  return weight * (toGrams[unit] ?? 1);
}

export function updateConverter(root: HTMLElement): void {
  const weight = Number(root.querySelector<HTMLInputElement>('#convert-weight')?.value ?? 0);
  const metal = parseMetal(root.querySelector<HTMLSelectElement>('#convert-metal')?.value);
  const unit = root.querySelector<HTMLSelectElement>('#convert-unit')?.value ?? 'g';
  const out = root.querySelector<HTMLOutputElement>('#convert-result');
  if (out) out.value = weight > 0 ? `${formatMoney(pricePerGram(metal) * convertWeight(weight, unit))} indicative metal value` : 'Enter a positive weight';
}

export function updateStorageEstimate(root: HTMLElement): void {
  const out = root.querySelector<HTMLOutputElement>('#storage-estimate');
  if (out) out.value = 'Illustrative estimate only · [PENDING CLIENT: fee schedule]';
}

export interface CatalogueUpdateOptions {
  history?: 'push' | 'replace' | 'none';
  resetPage?: boolean;
}

export function updateCatalogue(root: HTMLElement, options: CatalogueUpdateOptions = {}): void {
  if (!root.querySelector('#catalogue-grid')) return;
  const filters = readCatalogueFilters(root);
  const minRaw = root.querySelector<HTMLInputElement>('#filter-weight-min')?.value ?? '';
  const maxRaw = root.querySelector<HTMLInputElement>('#filter-weight-max')?.value ?? '';
  const minWeight = parseCatalogueNumber(minRaw);
  const maxWeight = parseCatalogueNumber(maxRaw);
  const invalidWeight = (minRaw.trim() !== '' && minWeight === null)
    || (maxRaw.trim() !== '' && maxWeight === null)
    || !validateWeightRange(minWeight, maxWeight);
  const error = root.querySelector<HTMLElement>('#filter-weight-error');
  if (error) {
    error.hidden = !invalidWeight;
    if (invalidWeight && !(minWeight !== null && maxWeight !== null && minWeight > maxWeight)) {
      error.textContent = 'Enter a valid non-negative weight.';
    } else if (invalidWeight) {
      error.textContent = 'Minimum must be less than maximum';
    }
  }
  if (invalidWeight) return;

  const sort = readCatalogueSort(root);
  const view = readCatalogueView(root);
  const filtered = filterCatalogueProducts(catalogueItems, filters);
  const visible = sortCatalogueProducts(filtered, sort);
  const visibleSlugs = new Set<string>(visible.map(product => product.slug));
  const grid = root.querySelector<HTMLElement>('#catalogue-grid');
  for (const card of root.querySelectorAll<HTMLElement>('[data-product-card]')) {
    card.hidden = !visibleSlugs.has(card.dataset.slug ?? '');
  }
  visible.forEach(product => {
    const card = grid?.querySelector<HTMLElement>(`[data-slug="${CSS.escape(product.slug)}"]`);
    if (card) grid?.append(card);
  });
  grid?.classList.toggle('mc-list-view', view === 'list');
  grid?.toggleAttribute('hidden', visible.length === 0);
  const emptyState = root.querySelector<HTMLElement>('#catalogue-empty-state');
  if (emptyState) emptyState.hidden = visible.length !== 0;

  const facets = computeCatalogueFacets(catalogueItems, filters);
  renderCatalogueFacets(root, filters, facets);
  renderCatalogueChips(root, filters);
  const resultCount = root.querySelector<HTMLElement>('#catalogue-result-count');
  if (resultCount) resultCount.textContent = `Showing ${visible.length} of ${catalogueItems.length} products`;
  const liveCount = root.querySelector<HTMLElement>('#catalogue-live-count');
  if (liveCount) liveCount.textContent = `${visible.length} ${visible.length === 1 ? 'product' : 'products'} found`;
  const applyButton = root.querySelector<HTMLButtonElement>('#catalogue-filter-apply');
  if (applyButton) applyButton.textContent = `Show ${visible.length} products`;

  const activeCount = [
    filters.query, filters.category, filters.metal, filters.type, filters.availability,
    filters.minWeight !== null || filters.maxWeight !== null,
  ].filter(Boolean).length;
  const countBadge = root.querySelector<HTMLElement>('#catalogue-filter-count');
  if (countBadge) {
    countBadge.textContent = String(activeCount);
    countBadge.hidden = activeCount === 0;
  }
  const clearButton = root.querySelector<HTMLButtonElement>('#catalogue-clear-desktop');
  if (clearButton) clearButton.hidden = !catalogueFiltersActive(filters);
  const searchClear = root.querySelector<HTMLButtonElement>('#catalogue-search-clear');
  if (searchClear) searchClear.hidden = filters.query.length === 0;

  try {
    localStorage.setItem('mc-catalogue-view', view);
  } catch {
    // The view remains active for this page even when storage is unavailable.
  }

  const serialized = serializeCatalogueUrl(location.search, filters, sort, view, options.resetPage ?? false);
  const nextUrl = `${location.pathname}${serialized ? `?${serialized}` : ''}${location.hash}`;
  if (nextUrl !== `${location.pathname}${location.search}${location.hash}` && options.history !== 'none') {
    if (options.history === 'push') history.pushState({}, '', nextUrl);
    else history.replaceState({}, '', nextUrl);
  }
}

function readCatalogueFilters(root: HTMLElement): CatalogueFilters {
  const filters = createEmptyCatalogueFilters();
  filters.query = root.querySelector<HTMLInputElement>('#catalogue-search')?.value.trim() ?? '';
  const category = root.querySelector<HTMLElement>('[data-catalogue-category].is-active')?.dataset.catalogueCategory ?? '';
  filters.category = CATALOGUE_CATEGORIES.some(item => item.value === category) ? category as CatalogueCategory : '';
  const metal = root.querySelector<HTMLSelectElement>('#filter-metal')?.value ?? '';
  filters.metal = metal === 'Gold' || metal === 'Silver' ? metal : '';
  const type = root.querySelector<HTMLSelectElement>('#filter-type')?.value ?? '';
  filters.type = type === 'bar' || type === 'coin' || type === 'gift' ? type : '';
  const availability = root.querySelector<HTMLSelectElement>('#filter-availability')?.value ?? '';
  filters.availability = ['in_stock', 'pre_order', 'enquire', 'out_of_stock'].includes(availability)
    ? availability as CatalogueAvailability
    : '';
  filters.weightUnit = root.querySelector<HTMLSelectElement>('#filter-weight-unit')?.value === 'oz'
    ? 'oz'
    : root.querySelector<HTMLSelectElement>('#filter-weight-unit')?.value === 'kg' ? 'kg' : 'g';
  filters.minWeight = parseCatalogueNumber(root.querySelector<HTMLInputElement>('#filter-weight-min')?.value ?? '');
  filters.maxWeight = parseCatalogueNumber(root.querySelector<HTMLInputElement>('#filter-weight-max')?.value ?? '');
  return filters;
}

function readCatalogueSort(root: HTMLElement): CatalogueSort {
  const value = root.querySelector<HTMLSelectElement>('#catalogue-sort')?.value ?? 'featured';
  return value === 'weight-asc' || value === 'weight-desc' ? value : 'featured';
}

function readCatalogueView(root: HTMLElement): CatalogueView {
  return root.querySelector<HTMLButtonElement>('[data-catalogue-view].is-active')?.dataset.catalogueView === 'list'
    ? 'list' : 'grid';
}

function renderCatalogueFacets(
  root: HTMLElement,
  filters: CatalogueFilters,
  facets: ReturnType<typeof computeCatalogueFacets>,
): void {
  const allCount = filterCatalogueProducts(catalogueItems, filters, 'category').length;
  const allButton = root.querySelector<HTMLButtonElement>('[data-catalogue-category=""]');
  if (allButton) {
    allButton.innerHTML = `All <span>${allCount}</span>`;
    allButton.classList.toggle('is-active', !filters.category);
    allButton.setAttribute('aria-pressed', String(!filters.category));
    allButton.disabled = allCount === 0 && !filters.category;
  }
  for (const category of facets.categories) {
    const button = root.querySelector<HTMLButtonElement>(`[data-catalogue-category="${category.value}"]`);
    if (!button) continue;
    button.innerHTML = `${category.label} <span>${category.count}</span>`;
    button.classList.toggle('is-active', filters.category === category.value);
    button.setAttribute('aria-pressed', String(filters.category === category.value));
    button.disabled = category.count === 0 && filters.category !== category.value;
  }
  updateSelectFacets(root, '#filter-metal', facets.metals, item => item.value, item => `${item.value} (${item.count})`);
  updateSelectFacets(root, '#filter-type', facets.types, item => item.value, item => `${typeFacetLabel(item.value)} (${item.count})`);
  updateSelectFacets(root, '#filter-availability', facets.availability, item => item.value, item => `${item.label} (${item.count})`);
}

function updateSelectFacets<T>(
  root: HTMLElement,
  selector: string,
  options: readonly T[],
  getValue: (option: T) => string,
  getLabel: (option: T) => string,
): void {
  const select = root.querySelector<HTMLSelectElement>(selector);
  if (!select) return;
  const selected = select.value;
  for (const option of Array.from(select.options).slice(1)) {
    const facet = options.find(item => getValue(item) === option.value);
    if (!facet) continue;
    option.textContent = getLabel(facet);
    option.disabled = Number(getLabel(facet).match(/\((\d+)\)$/)?.[1] ?? 0) === 0 && selected !== option.value;
  }
}

function typeFacetLabel(value: string): string {
  return value === 'bar' ? 'Bar' : value === 'coin' ? 'Coin' : 'Gift item';
}

function renderCatalogueChips(root: HTMLElement, filters: CatalogueFilters): void {
  const chips = root.querySelector<HTMLElement>('#active-filters');
  if (!chips) return;
  const entries: Array<{ key: string; label: string }> = [];
  if (filters.query) entries.push({ key: 'query', label: `Search: ${escapeHtml(filters.query)}` });
  if (filters.category) entries.push({ key: 'category', label: categoryLabel(filters.category) });
  if (filters.metal) entries.push({ key: 'metal', label: filters.metal });
  if (filters.type) entries.push({ key: 'type', label: typeFacetLabel(filters.type) });
  if (filters.availability) {
    const labels: Record<CatalogueAvailability, string> = {
      in_stock: 'In stock', pre_order: 'Pre-order', enquire: 'Enquire only', out_of_stock: 'Out of stock',
    };
    entries.push({ key: 'availability', label: labels[filters.availability] });
  }
  if (filters.minWeight !== null || filters.maxWeight !== null) {
    const min = filters.minWeight === null ? '' : formatCatalogueWeight(gramsForWeight(filters.minWeight, filters.weightUnit));
    const max = filters.maxWeight === null ? '' : formatCatalogueWeight(gramsForWeight(filters.maxWeight, filters.weightUnit));
    entries.push({ key: 'weight', label: `${min || 'Any'} to ${max || 'Any'}` });
  }
  chips.innerHTML = entries.length
    ? `${entries.map(entry => `<button type="button" class="mc-filter-chip" data-remove-filter="${entry.key}" aria-label="Remove filter ${entry.label.replace(/&amp;/g, '&')}">${entry.label}<span aria-hidden="true">×</span></button>`).join('')}<button type="button" class="mc-catalogue-clear mc-chip-clear" data-clear-all-filters>Clear all</button>`
    : '';
}

export function restoreCatalogueFilters(root: HTMLElement): void {
  const state = parseCatalogueUrl(location.search);
  const { filters } = state;
  const values: Record<string, string> = {
    'catalogue-search': filters.query,
    'catalogue-sort': state.sort,
    'filter-metal': filters.metal,
    'filter-type': filters.type,
    'filter-availability': filters.availability,
    'filter-weight-min': filters.minWeight === null ? '' : String(filters.minWeight),
    'filter-weight-max': filters.maxWeight === null ? '' : String(filters.maxWeight),
    'filter-weight-unit': filters.weightUnit,
  };
  for (const [id, value] of Object.entries(values)) {
    const input = root.querySelector<HTMLInputElement | HTMLSelectElement>(`#${id}`);
    if (input) input.value = value;
  }
  root.querySelectorAll<HTMLButtonElement>('[data-catalogue-category]').forEach(button => {
    const active = button.dataset.catalogueCategory === filters.category;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  let storedView: CatalogueView = 'grid';
  try {
    storedView = localStorage.getItem('mc-catalogue-view') === 'list' ? 'list' : 'grid';
  } catch {
    storedView = 'grid';
  }
  const view = new URLSearchParams(location.search).has('view') ? state.view : storedView;
  root.querySelectorAll<HTMLButtonElement>('[data-catalogue-view]').forEach(button => {
    const active = button.dataset.catalogueView === view;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  const sheet = root.querySelector<HTMLElement>('#catalogue-filter-sheet');
  const overlay = root.querySelector<HTMLElement>('#catalogue-filter-overlay');
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  if (sheet) {
    sheet.hidden = isMobile;
    sheet.setAttribute('role', isMobile ? 'dialog' : 'region');
    sheet.setAttribute('aria-modal', String(isMobile));
  }
  if (overlay) overlay.hidden = true;
  document.body.classList.remove('mc-catalogue-sheet-open');
  document.documentElement.classList.remove('mc-catalogue-sheet-open');
}
