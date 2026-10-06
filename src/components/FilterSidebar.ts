import { CATEGORIES } from '../data/categories';

export interface FilterState {
  searchQuery: string;
  selectedCategories: string[];
  priceMin: number;
  priceMax: number;
  selectedPackSizes: string[];
  minRating: number;
  inStockOnly: boolean;
}

export interface FilterSidebarProps {
  filters: FilterState;
  expandedSections: string[];
}

const PACK_SIZES = ['100g', '200g', '250g', '400g', '500g', '1kg', '2kg', '5kg', '1L'];

export function renderFilterSidebar(props: FilterSidebarProps): string {
  const { filters, expandedSections } = props;

  const categoriesExpanded = expandedSections.includes('categories');
  const packSizeExpanded  = expandedSections.includes('pack-size');
  const priceExpanded     = expandedSections.includes('price-range');
  const ratingExpanded    = expandedSections.includes('rating');
  const stockExpanded     = expandedSections.includes('stock');

  return `
    <aside class="filter-sidebar" id="filter-sidebar">

      <!-- Section: Search Products -->
      <div class="filter-section filter-search-section">
        <h3 class="filter-section-heading">Search Products</h3>
        <div class="sidebar-search-row">
          <input
            type="text"
            id="sidebar-search-input"
            class="sidebar-search-input"
            placeholder="Find your product..."
            value="${filters.searchQuery}"
            autocomplete="off"
          />
          <button class="sidebar-search-btn" id="btn-sidebar-search" aria-label="Search products">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </div>

      <hr class="filter-divider" />

      <!-- Section: Categories (expanded by default) -->
      <div class="filter-section filter-categories-section">
        <div class="filter-section-header" data-toggle="categories">
          <h3 class="filter-section-heading">Categories</h3>
          <button class="filter-toggle-btn ${categoriesExpanded ? 'minus' : 'plus'}" aria-label="Toggle categories" data-toggle="categories">
            ${categoriesExpanded
              ? `<svg width="11" height="3" viewBox="0 0 11 3"><rect y="0.5" width="11" height="2" rx="1" fill="#078B4B"/></svg>`
              : `<svg width="11" height="11" viewBox="0 0 11 11"><rect y="4.5" width="11" height="2" rx="1" fill="#078B4B"/><rect x="4.5" width="2" height="11" rx="1" fill="#078B4B"/></svg>`
            }
          </button>
        </div>

        ${categoriesExpanded ? `
          <div class="categories-checkbox-list" id="categories-list">
            ${CATEGORIES.map(cat => `
              <label class="category-checkbox-row" for="cat-${cat.id}">
                <input
                  type="checkbox"
                  id="cat-${cat.id}"
                  class="cat-checkbox"
                  value="${cat.id}"
                  data-filter-cat="${cat.id}"
                  ${filters.selectedCategories.includes(cat.id) ? 'checked' : ''}
                />
                <span class="cat-name">${cat.name}</span>
                <span class="cat-count">(${cat.count})</span>
              </label>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <hr class="filter-divider" />

      <!-- Collapsible: Pack Size -->
      <div class="filter-section collapsible-filter ${packSizeExpanded ? 'open' : ''}">
        <div class="filter-section-header" data-toggle="pack-size">
          <h3 class="filter-section-heading">Pack Size</h3>
          <button class="filter-toggle-btn ${packSizeExpanded ? 'minus' : 'plus'}" aria-label="Toggle pack size" data-toggle="pack-size">
            ${packSizeExpanded
              ? `<svg width="11" height="3" viewBox="0 0 11 3"><rect y="0.5" width="11" height="2" rx="1" fill="#078B4B"/></svg>`
              : `<svg width="11" height="11" viewBox="0 0 11 11"><rect y="4.5" width="11" height="2" rx="1" fill="#078B4B"/><rect x="4.5" width="2" height="11" rx="1" fill="#078B4B"/></svg>`
            }
          </button>
        </div>
        ${packSizeExpanded ? `
          <div class="pack-size-options">
            ${PACK_SIZES.map(size => `
              <label class="size-checkbox-row">
                <input type="checkbox" class="size-checkbox" value="${size}" ${filters.selectedPackSizes.includes(size) ? 'checked' : ''} data-filter-size="${size}" />
                <span>${size}</span>
              </label>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <hr class="filter-divider" />

      <!-- Collapsible: Price Range -->
      <div class="filter-section collapsible-filter ${priceExpanded ? 'open' : ''}">
        <div class="filter-section-header" data-toggle="price-range">
          <h3 class="filter-section-heading">Price Range</h3>
          <button class="filter-toggle-btn ${priceExpanded ? 'minus' : 'plus'}" aria-label="Toggle price range" data-toggle="price-range">
            ${priceExpanded
              ? `<svg width="11" height="3" viewBox="0 0 11 3"><rect y="0.5" width="11" height="2" rx="1" fill="#078B4B"/></svg>`
              : `<svg width="11" height="11" viewBox="0 0 11 11"><rect y="4.5" width="11" height="2" rx="1" fill="#078B4B"/><rect x="4.5" width="2" height="11" rx="1" fill="#078B4B"/></svg>`
            }
          </button>
        </div>
        ${priceExpanded ? `
          <div class="price-range-content">
            <div class="price-inputs-row">
              <div class="price-input-group">
                <label>Min ৳</label>
                <input type="number" id="price-min-input" class="price-input" value="${filters.priceMin || 0}" min="0" max="5000" placeholder="0" />
              </div>
              <span class="price-dash">—</span>
              <div class="price-input-group">
                <label>Max ৳</label>
                <input type="number" id="price-max-input" class="price-input" value="${filters.priceMax || 5000}" min="0" max="5000" placeholder="5000" />
              </div>
            </div>
            <input
              type="range"
              id="price-range-slider"
              class="price-slider"
              min="0" max="5000"
              value="${filters.priceMax || 5000}"
            />
          </div>
        ` : ''}
      </div>

      <hr class="filter-divider" />

      <!-- Collapsible: Average Rating -->
      <div class="filter-section collapsible-filter ${ratingExpanded ? 'open' : ''}">
        <div class="filter-section-header" data-toggle="rating">
          <h3 class="filter-section-heading">Average Rating</h3>
          <button class="filter-toggle-btn ${ratingExpanded ? 'minus' : 'plus'}" aria-label="Toggle rating" data-toggle="rating">
            ${ratingExpanded
              ? `<svg width="11" height="3" viewBox="0 0 11 3"><rect y="0.5" width="11" height="2" rx="1" fill="#078B4B"/></svg>`
              : `<svg width="11" height="11" viewBox="0 0 11 11"><rect y="4.5" width="11" height="2" rx="1" fill="#078B4B"/><rect x="4.5" width="2" height="11" rx="1" fill="#078B4B"/></svg>`
            }
          </button>
        </div>
        ${ratingExpanded ? `
          <div class="rating-options">
            ${[5,4,3,2,1].map(r => `
              <label class="rating-row">
                <input type="radio" name="min-rating" value="${r}" ${filters.minRating === r ? 'checked' : ''} data-filter-rating="${r}" />
                <span class="stars-display">${'★'.repeat(r)}${'☆'.repeat(5 - r)}</span>
                <span class="rating-label">${r}+ stars</span>
              </label>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <hr class="filter-divider" />

      <!-- Collapsible: Stock Status -->
      <div class="filter-section collapsible-filter ${stockExpanded ? 'open' : ''}">
        <div class="filter-section-header" data-toggle="stock">
          <h3 class="filter-section-heading">Stock Status</h3>
          <button class="filter-toggle-btn ${stockExpanded ? 'minus' : 'plus'}" aria-label="Toggle stock status" data-toggle="stock">
            ${stockExpanded
              ? `<svg width="11" height="3" viewBox="0 0 11 3"><rect y="0.5" width="11" height="2" rx="1" fill="#078B4B"/></svg>`
              : `<svg width="11" height="11" viewBox="0 0 11 11"><rect y="4.5" width="11" height="2" rx="1" fill="#078B4B"/><rect x="4.5" width="2" height="11" rx="1" fill="#078B4B"/></svg>`
            }
          </button>
        </div>
        ${stockExpanded ? `
          <div class="stock-options">
            <label class="stock-radio-row">
              <input type="radio" name="stock-status" value="all" ${!filters.inStockOnly ? 'checked' : ''} data-filter-stock="all" /> All Products
            </label>
            <label class="stock-radio-row">
              <input type="radio" name="stock-status" value="in-stock" ${filters.inStockOnly ? 'checked' : ''} data-filter-stock="in-stock" /> In Stock Only
            </label>
          </div>
        ` : ''}
      </div>

      <!-- Action Buttons -->
      <div class="filter-actions">
        <button class="btn-apply-filter" id="btn-apply-filter">Apply Filter</button>
        <button class="btn-reset-filter" id="btn-reset-filter">Reset All</button>
      </div>

    </aside>
  `;
}
