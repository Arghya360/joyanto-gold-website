import { PRODUCTS } from '../data/products';
import { renderProductCard } from './ProductCard';

export function renderWishlistPage(productIds: number[]): string {
  const products = productIds
    .map(id => PRODUCTS.find(product => product.id === id))
    .filter(product => product !== undefined);
  return `
    <main class="commerce-page wishlist-page">
      <nav class="commerce-breadcrumbs" aria-label="Breadcrumb"><a href="/" data-route="home">Home</a><span>/</span><span>Wishlist</span></nav>
      <h1>Wishlist</h1>
      ${products.length
        ? `<div class="wishlist-products-grid">${products.map(product => `
            <div class="wishlist-product">
              ${renderProductCard(product)}
              <button type="button" class="wishlist-remove-button" data-wishlist-remove="${product.id}">Remove from Wishlist</button>
            </div>
          `).join('')}</div>`
        : `<div class="commerce-empty-state"><h2>Your wishlist is empty</h2><p>Save products you would like to come back to.</p><button type="button" class="product-detail-add-button" data-route="shop">Browse Products</button></div>`
      }
    </main>
  `;
}
