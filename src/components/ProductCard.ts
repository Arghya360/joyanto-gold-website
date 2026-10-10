import type { Product } from '../data/products';

export function renderProductCard(product: Product): string {
  const canAddToCart = product.stockStatus === 'in_stock' || product.stockStatus === 'unconfirmed';
  const isDiscounted = product.priceSource === 'verified' && Boolean(product.oldPrice && product.oldPrice > product.price);
  const displayBadge = product.priceSource === 'verified'
    ? product.badge
    : product.stockStatus === 'pre_order' ? 'Pre-order' : '';
  const productHref = product.slug ? `/catalogue/${product.slug}` : '';
  const productLink = product.slug
    ? `href="${productHref}" data-modern-path="${productHref}"`
    : '';
  
  return `
    <div class="shop-product-card" data-product-id="${product.id}" ${product.slug ? '' : `role="link" tabindex="0" aria-label="View ${product.title}"`}>
      <div class="product-card-top">
        ${displayBadge ? `<span class="product-discount-badge">${displayBadge}</span>` : ''}
        <div class="product-image-box">
          ${product.slug ? `<a ${productLink} aria-label="View ${product.title}">` : ''}
            <img src="${product.image}" alt="${product.title}" class="product-pack-img" loading="lazy" />
          ${product.slug ? '</a>' : ''}
        </div>
      </div>

      <div class="product-info-box">
        <h3 class="shop-product-title" title="${product.title}">${product.slug ? `<a ${productLink}>${product.title}</a>` : product.title}</h3>
        
        <div class="shop-product-price">
          ${product.priceSource === 'unavailable' ? `
            <span class="price-current">Price unavailable</span>
          ` : isDiscounted ? `
            <span class="price-old">AED ${product.oldPrice}</span>
            <span class="price-current">AED ${product.price}</span>
          ` : `
            <span class="price-current">${product.priceDisplay}</span>
          `}
        </div>

        <button 
          class="shop-btn-add-to-cart" 
          data-action="add-to-cart" 
          data-id="${product.id}"
          aria-label="${canAddToCart ? `Add ${product.title} to cart` : `${displayBadge || 'Purchasing unavailable'} for ${product.title}`}"
          ${canAddToCart ? '' : 'disabled'}
        >
          <svg class="cart-btn-icon" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="20" r="1.5"></circle>
            <circle cx="19" cy="20" r="1.5"></circle>
            <path d="M2.5 3h3l2.4 12.2a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6.5"></path>
          </svg>
          <span class="btn-text">${canAddToCart ? 'Add to Cart' : product.stockStatus === 'out_of_stock' ? 'Out of stock' : displayBadge || 'Unavailable'}</span>
        </button>
        ${product.slug ? `<a class="shop-btn-add-to-cart" href="${productHref}" data-modern-path="${productHref}" aria-label="View details for ${product.title}">View Details</a>` : ''}
        ${product.stockStatus === 'enquire' ? `<a class="shop-btn-add-to-cart" href="/contact?type=buying" data-modern-path="/contact?type=buying">Enquire</a>` : ''}
      </div>
    </div>
  `;
}
