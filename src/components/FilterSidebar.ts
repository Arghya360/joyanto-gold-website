import type { ProductFacets, ProductFilters } from '../features/shop-filters';
import { SHOP_CATEGORIES, STOCK_STATUSES } from '../features/shop-filters';
import type { Currency } from '../features/currency';
import { SHOW_RATING_FILTER } from '../config/shop-filters';

export interface FilterSidebarProps {
  filters: ProductFilters;
  facets: ProductFacets;
  currency: Currency;
  expandedSections: string[];
  hasChanges: boolean;
  hasActiveFilters: boolean;
  mobileOpen: boolean;
  invalidPriceRange: boolean;
  totalProducts: number;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character);
}

function renderSection(id: string, title: string, expanded: boolean, body: string): string {
  return `
    <div class="filter-section collapsible-filter ${expanded ? 'open' : ''}">
      <button type="button" class="filter-section-header" data-toggle="${id}" aria-expanded="${expanded}" aria-controls="filter-panel-${id}">
        <h3 class="filter-section-heading">${title}</h3>
        <span class="filter-toggle-btn ${expanded ? 'minus' : 'plus'}" aria-hidden="true">${expanded ? '−' : '+'}</span>
      </button>
      <div class="filter-section-panel" id="filter-panel-${id}" ${expanded ? '' : 'hidden'}>${body}</div>
    </div>
  `;
}

function renderRatingFilter(): string {
  return `
    <hr class="filter-divider" />
    ${renderSection('rating', 'Average Rating', false, `
      <div class="rating-options">
        ${[5, 4, 3, 2, 1].map(rating => `
          <label class="rating-row">
            <input type="radio" name="min-rating" value="${rating}" data-filter-rating="${rating}" />
            <span class="stars-display">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</span>
            <span class="rating-label">${rating}+ stars</span>
          </label>
        `).join('')}
      </div>
    `)}
  `;
}

export function renderFilterSidebar(props: FilterSidebarProps): string {
  const {
    filters,
    facets,
    currency,
    expandedSections,
    hasChanges,
    hasActiveFilters,
    mobileOpen,
    invalidPriceRange,
    totalProducts,
  } = props;
  const categoriesExpanded = expandedSections.includes('categories');
  const weightsExpanded = expandedSections.includes('pack-size');
  const pricesExpanded = expandedSections.includes('price-range');
  const stockExpanded = expandedSections.includes('stock');
  const showAllWeights = expandedSections.includes('all-weights');
  const weightOptions = showAllWeights ? facets.weightOptions : facets.weightOptions.slice(0, 8);
  const minValue = filters.minPrice ?? facets.minPrice;
  const maxValue = filters.maxPrice ?? facets.maxPrice;
  const minLabel = new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }).format(facets.minPrice);
  const maxLabel = new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }).format(facets.maxPrice);

  return `
    <aside class="filter-sidebar" id="filter-sidebar" aria-label="Product filters" aria-modal="${mobileOpen}">
      <div class="filter-mobile-heading">
        <h2>Filters</h2>
        <button type="button" class="filter-mobile-close" id="btn-mobile-filter-close" aria-label="Close filters">&times;</button>
      </div>
      <div class="filter-section filter-search-section">
        <label class="filter-section-heading" for="sidebar-search-input">Search Products</label>
        <div class="sidebar-search-row">
          <input
            type="search"
            id="sidebar-search-input"
            class="sidebar-search-input"
            placeholder="Find bullion or coin..."
            value="${escapeHtml(filters.query)}"
            autocomplete="off"
          />
          <button type="button" class="sidebar-search-clear" data-clear-search aria-label="Clear search" ${filters.query ? '' : 'hidden'}>&times;</button>
          <button type="button" class="sidebar-search-btn" id="btn-sidebar-search" aria-label="Search products">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </div>
      <hr class="filter-divider" />
      ${renderSection('categories', 'Categories', categoriesExpanded, `
        <div class="categories-checkbox-list" id="categories-list">
          <button type="button" class="category-checkbox-row all-products-filter" data-clear-categories aria-pressed="${filters.categories.length === 0}">
            <span class="cat-name">All products</span>
            <span class="cat-count">(${totalProducts})</span>
          </button>
          ${SHOP_CATEGORIES.map(category => {
            const count = facets.categoryCounts[category.id];
            return `
              <label class="category-checkbox-row ${count === 0 ? 'filter-option-disabled' : ''}" for="cat-${category.id}">
                <input
                  type="checkbox"
                  id="cat-${category.id}"
                  class="cat-checkbox"
                  value="${category.id}"
                  data-filter-cat="${category.id}"
                  ${filters.categories.includes(category.id) ? 'checked' : ''}
                  ${count === 0 ? 'disabled' : ''}
                />
                <span class="cat-name">${category.name}</span>
                <span class="cat-count">(${count})</span>
              </label>
            `;
          }).join('')}
        </div>
      `)}
      <hr class="filter-divider" />
      ${renderSection('pack-size', 'Weight / Denomination', weightsExpanded, `
        <div class="pack-size-options">
          ${weightOptions.map(option => `
            <label class="size-checkbox-row ${option.count === 0 ? 'filter-option-disabled' : ''}">
              <input
                type="checkbox"
                class="size-checkbox"
                value="${option.value}"
                data-filter-size="${option.value}"
                ${filters.weights.includes(option.value) ? 'checked' : ''}
                ${option.count === 0 ? 'disabled' : ''}
              />
              <span>${option.label}</span>
              <span class="cat-count">(${option.count})</span>
            </label>
          `).join('')}
          ${facets.weightOptions.length > 8 ? `
            <button type="button" class="filter-show-more" data-show-more-weights>
              ${showAllWeights ? 'Show less' : 'Show more'}
            </button>
          ` : ''}
        </div>
      `)}
      <hr class="filter-divider" />
      ${renderSection('price-range', 'Price Range', pricesExpanded, `
        <div class="price-range-content">
          <p class="filter-indicative-note">Prices are indicative. Range: ${minLabel} to ${maxLabel}.</p>
          <div class="price-inputs-row">
            <div class="price-input-group">
              <label for="price-min-input">Min ${currency}</label>
              <input type="number" id="price-min-input" class="price-input" value="${filters.minPrice ?? ''}" min="0" max="${facets.maxPrice}" placeholder="${facets.minPrice}" />
            </div>
            <span class="price-dash" aria-hidden="true">-</span>
            <div class="price-input-group">
              <label for="price-max-input">Max ${currency}</label>
              <input type="number" id="price-max-input" class="price-input" value="${filters.maxPrice ?? ''}" min="0" max="${facets.maxPrice}" placeholder="${facets.maxPrice}" />
            </div>
          </div>
          <div class="price-slider-track">
            <input type="range" id="price-min-slider" class="price-slider price-slider-min" min="${facets.minPrice}" max="${facets.maxPrice}" value="${minValue}" aria-label="Minimum price" aria-valuemin="${facets.minPrice}" aria-valuemax="${facets.maxPrice}" aria-valuenow="${minValue}" />
            <input type="range" id="price-max-slider" class="price-slider price-slider-max" min="${facets.minPrice}" max="${facets.maxPrice}" value="${maxValue}" aria-label="Maximum price" aria-valuemin="${facets.minPrice}" aria-valuemax="${facets.maxPrice}" aria-valuenow="${maxValue}" />
          </div>
          <p class="filter-price-error" id="filter-price-error" role="alert" ${invalidPriceRange ? '' : 'hidden'}>Enter a valid range. Minimum must not exceed maximum.</p>
        </div>
      `)}
      ${SHOW_RATING_FILTER ? renderRatingFilter() : ''}
      <hr class="filter-divider" />
      ${renderSection('stock', 'Stock Status', stockExpanded, `
        <div class="stock-options">
          ${STOCK_STATUSES.map(status => {
            const count = facets.stockCounts[status.id];
            return `
              <label class="stock-radio-row ${count === 0 ? 'filter-option-disabled' : ''}">
                <input type="checkbox" value="${status.id}" data-filter-stock="${status.id}" ${filters.stock.includes(status.id) ? 'checked' : ''} ${count === 0 ? 'disabled' : ''} />
                <span>${status.name}</span>
                <span class="cat-count">(${count})</span>
              </label>
            `;
          }).join('')}
        </div>
      `)}
      <div class="filter-actions">
        <button type="button" class="btn-apply-filter" id="btn-apply-filter" ${!hasChanges || invalidPriceRange ? 'disabled' : ''}>Apply Filter</button>
        <button type="button" class="btn-reset-filter" id="btn-reset-filter" ${!hasActiveFilters ? 'disabled' : ''}>Reset All</button>
      </div>
    </aside>
  `;
}

export function renderFilterChips(filters: ProductFilters): string {
  const chips: Array<{ key: string; label: string }> = [];
  if (filters.query) chips.push({ key: 'query', label: `Search: ${filters.query}` });
  for (const category of filters.categories) {
    chips.push({ key: `category:${category}`, label: SHOP_CATEGORIES.find(item => item.id === category)?.name ?? category });
  }
  for (const weight of filters.weights) {
    chips.push({ key: `weight:${weight}`, label: weight.replace(/(\d)(g|kg|oz|carat)/, '$1 $2') });
  }
  if (filters.minPrice !== null || filters.maxPrice !== null) {
    chips.push({ key: 'price', label: `Price: ${filters.minPrice ?? 'Any'} - ${filters.maxPrice ?? 'Any'}` });
  }
  for (const status of filters.stock) {
    chips.push({ key: `stock:${status}`, label: STOCK_STATUSES.find(item => item.id === status)?.name ?? status });
  }
  if (!chips.length) return '';
  return `
    <div class="active-filter-chips" aria-label="Active filters">
      ${chips.map(chip => `<button type="button" class="active-filter-chip" data-clear-filter="${escapeHtml(chip.key)}">${escapeHtml(chip.label)} <span aria-hidden="true">&times;</span></button>`).join('')}
      <button type="button" class="clear-all-filters" data-clear-all-filters>Clear all</button>
    </div>
  `;
}

export function renderFilterEmptyState(): string {
  return `
    <div class="no-products-found">
      <p>No products match your filters.</p>
      <button type="button" class="btn-reset-filter" data-clear-all-filters>Reset all filters</button>
      <a href="/contact?type=buying" data-modern-path="/contact?type=buying">Request a private quote</a>
    </div>
  `;
}

export function filtersActive(filters: ProductFilters): boolean {
  return Boolean(filters.query || filters.categories.length || filters.weights.length
    || filters.minPrice !== null || filters.maxPrice !== null || filters.stock.length);
}

export function filterActiveCount(filters: ProductFilters): number {
  return Number(Boolean(filters.query))
    + filters.categories.length
    + filters.weights.length
    + Number(filters.minPrice !== null)
    + Number(filters.maxPrice !== null)
    + filters.stock.length;
}
