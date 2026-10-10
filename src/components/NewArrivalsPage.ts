import { renderHeader } from './Header';
import { renderProductCard } from './ProductCard';
import { renderFalaqFooter } from './Footer';
import { catalogueItems } from '../features/modern-data';
import { toStorefrontProduct } from '../features/catalogue-product-adapter';
import { getNewProducts } from '../features/home-products';

export interface NewArrivalsPageProps {
  cartCount: number;
  topSearchQuery?: string;
  selectedNavCategory?: string;
}

export function renderNewArrivalsPage(props: NewArrivalsPageProps): string {
  const { cartCount, topSearchQuery = '', selectedNavCategory = '' } = props;

  const newArrivalsProducts = getNewProducts(catalogueItems).map(toStorefrontProduct);

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
        <div class="shop-container new-arrivals-container wide-screen-container">
          
          ${newArrivalsProducts.length
            ? `<div class="new-arrivals-header-bar">
                <h1 class="new-arrivals-title">New Releases &amp; Minted Bullion</h1>
                <a href="/catalogue" class="btn-new-arrivals-view-all" data-modern-path="/catalogue" aria-label="View All New Arrivals">
                  <span>View All</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </a>
              </div>
              <div class="new-arrivals-products-grid" id="new-arrivals-products-grid">
                ${newArrivalsProducts.map(product => renderProductCard(product)).join('')}
              </div>
              <div class="new-arrivals-more-wrap">
                <button class="btn-new-arrivals-more" id="btn-new-arrivals-more-products" data-nav="Shop">View Full Catalogue</button>
              </div>`
            : `<div class="commerce-empty-state"><h2>No new arrivals are currently listed</h2><a class="product-detail-add-button" href="/catalogue" data-modern-path="/catalogue">Browse Catalogue</a></div>`
          }

        </div>
      </main>

      <!-- ── FOOTER ── -->
      ${renderFalaqFooter()}
    </div>
  `;
}
