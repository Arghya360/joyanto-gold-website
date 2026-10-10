import { renderHeader } from './Header';
import { renderProductCard } from './ProductCard';
import { renderFalaqFooter } from './Footer';
import { catalogueItems } from '../features/modern-data';
import { toStorefrontProduct } from '../features/catalogue-product-adapter';
import { getPreOrderProducts } from '../features/home-products';

export interface OffersPageProps {
  cartCount: number;
  topSearchQuery?: string;
  selectedNavCategory?: string;
}

export function renderOffersPage(props: OffersPageProps): string {
  const { cartCount, topSearchQuery = '', selectedNavCategory = '' } = props;

  const offerProducts = getPreOrderProducts(catalogueItems).map(toStorefrontProduct);

  return `
    <div class="offers-page-wrapper">
      <!-- ── HEADER ── -->
      ${renderHeader({
        activeNav: 'Offers',
        cartCount,
        searchQuery: topSearchQuery,
        selectedNavCategory,
      })}

      <!-- ── MAIN OFFERS CONTENT ── -->
      <main class="offers-main-content">
        <div class="shop-container offers-container wide-screen-container">
          
          <!-- Exclusive Discounts Banner -->
          <div class="offers-hero-banner">
            <h1 class="offers-hero-title">Dubai Collection · Pre-order</h1>
          </div>

          <!-- 5-Column Products Grid -->
          <div class="offers-products-grid" id="offers-products-grid">
            ${offerProducts.map(product => renderProductCard(product)).join('')}
          </div>

          <!-- More Products CTA Button -->
          <div class="offers-more-wrap">
            <button class="btn-offers-more" id="btn-offers-more-products" data-nav="Shop">
              View Full Catalogue
            </button>
          </div>

        </div>
      </main>

      <!-- ── FOOTER ── -->
      ${renderFalaqFooter()}
    </div>
  `;
}
