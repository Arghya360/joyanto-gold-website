import type { Product } from '../data/products';

export function renderProductCard(product: Product): string {
  const isDiscounted = Boolean(product.oldPrice && product.oldPrice > product.price);
  
  return `
    <div class="shop-product-card" data-product-id="${product.id}" role="link" tabindex="0" aria-label="View ${product.title}">
      <div class="product-card-top">
        ${product.badge ? `<span class="product-discount-badge">${product.badge}</span>` : ''}
        <div class="product-image-box">
          <img 
            src="${product.image}" 
            alt="${product.title}" 
            class="product-pack-img" 
            loading="lazy" 
          />
        </div>
      </div>

      <div class="product-info-box">
        <h3 class="shop-product-title" title="${product.title}">${product.title}</h3>
        
        <div class="shop-product-price">
          ${isDiscounted ? `
            <span class="price-old">${product.oldPrice}৳</span>
            <span class="price-current">${product.price}৳</span>
          ` : `
            <span class="price-current">${product.priceDisplay}</span>
          `}
        </div>

        <button 
          class="shop-btn-add-to-cart" 
          data-action="add-to-cart" 
          data-id="${product.id}"
          aria-label="Add ${product.title} to cart"
        >
          <svg class="cart-btn-icon" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="20" r="1.5"></circle>
            <circle cx="19" cy="20" r="1.5"></circle>
            <path d="M2.5 3h3l2.4 12.2a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6.5"></path>
          </svg>
          <span class="btn-text">Add to Cart</span>
        </button>
      </div>
    </div>
  `;
}
