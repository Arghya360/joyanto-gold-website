import { PRODUCTS } from '../data/products';
import { renderHeader } from './Header';
import { renderProductCard } from './ProductCard';
import { renderFalaqFooter } from './Footer';

export const NEW_ARRIVALS_PRODUCT_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

export interface NewArrivalsPageProps {
  cartCount: number;
  topSearchQuery?: string;
  selectedNavCategory?: string;
}

export function renderNewArrivalsPage(props: NewArrivalsPageProps): string {
  const { cartCount, topSearchQuery = '', selectedNavCategory = '' } = props;

  // Retrieve the 15 New Arrivals products in the exact order shown in the reference screenshot
  const newArrivalsProducts = NEW_ARRIVALS_PRODUCT_IDS
    .map(id => PRODUCTS.find(p => p.id === id))
    .filter(Boolean);

  return `
    <div class="new-arrivals-page-wrapper">
      <!-- ── HEADER ── -->
      ${renderHeader({
        activeNav: 'New Arrivals',
        cartCount,
        searchQuery: topSearchQuery,
        selectedNavCategory,
      })}

      <!-- ── MAIN CONTENT ── -->
      <main class="new-arrivals-main-content">
        <div class="shop-container new-arrivals-container">
          
          <!-- Green Header Bar with "New Arrivals" & "View All ➔" -->
          <div class="new-arrivals-header-bar">
            <h1 class="new-arrivals-title">New Arrivals</h1>
            <a href="#" class="btn-new-arrivals-view-all" data-nav="Shop" aria-label="View All New Arrivals">
              <span>View All</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>

          <!-- 5-Column Products Grid -->
          <div class="new-arrivals-products-grid" id="new-arrivals-products-grid">
            ${newArrivalsProducts.map(product => renderProductCard(product!)).join('')}
          </div>

          <!-- More Products CTA Button -->
          <div class="new-arrivals-more-wrap">
            <button class="btn-new-arrivals-more" id="btn-new-arrivals-more-products" data-nav="Shop">
              More Products
            </button>
          </div>

        </div>
      </main>

      <!-- ── FOOTER ── -->
      ${renderFalaqFooter()}
    </div>
  `;
}
