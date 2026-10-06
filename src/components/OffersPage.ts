import { PRODUCTS } from '../data/products';
import { renderHeader } from './Header';
import { renderProductCard } from './ProductCard';
import { renderFalaqFooter } from './Footer';

export const OFFER_PRODUCT_IDS = [4, 6, 7, 8, 9, 11, 12, 13, 14, 15];

export interface OffersPageProps {
  cartCount: number;
  topSearchQuery?: string;
  selectedNavCategory?: string;
}

export function renderOffersPage(props: OffersPageProps): string {
  const { cartCount, topSearchQuery = '', selectedNavCategory = '' } = props;

  // Retrieve the 10 offer products in the exact order shown in the reference screenshot
  const offerProducts = OFFER_PRODUCT_IDS
    .map(id => PRODUCTS.find(p => p.id === id))
    .filter(Boolean);

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
        <div class="shop-container offers-container">
          
          <!-- Exclusive Discounts Banner -->
          <div class="offers-hero-banner">
            <h1 class="offers-hero-title">Exclusive Discounts – Limited Time Only!</h1>
          </div>

          <!-- 5-Column Products Grid -->
          <div class="offers-products-grid" id="offers-products-grid">
            ${offerProducts.map(product => renderProductCard(product!)).join('')}
          </div>

          <!-- More Products CTA Button -->
          <div class="offers-more-wrap">
            <button class="btn-offers-more" id="btn-offers-more-products" data-nav="Shop">
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
