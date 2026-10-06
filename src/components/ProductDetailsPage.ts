import type { Product } from '../data/products';
import { getProductOriginalPrice } from '../data/products';
import type { Review } from '../data/reviews';

export interface ProductDetailsPageProps {
  product: Product | undefined;
  reviews: Review[];
  wishlisted: boolean;
  activeTab: 'description' | 'reviews';
}

function stars(rating: number): string {
  return `<span class="product-detail-stars" aria-label="${rating} out of 5 stars">${'★'.repeat(Math.round(rating))}${'☆'.repeat(5 - Math.round(rating))}</span>`;
}

export function renderProductDetailsPage(props: ProductDetailsPageProps): string {
  const { product, reviews, wishlisted, activeTab } = props;
  if (!product) {
    return `
      <main class="commerce-page shop-container product-not-found">
        <a class="commerce-back-link" href="/shop" data-route="shop">← Back to Shop</a>
        <h1>Product not found</h1>
        <p>This product may have been removed or the link may be incorrect.</p>
      </main>
    `;
  }

  const originalPrice = getProductOriginalPrice(product);
  const categoryName = product.category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const features = product.features?.length
    ? product.features
    : [`${product.title}`, `Pack size: ${product.packSize ?? 'See product packaging'}`, `Category: ${categoryName}`];

  return `
    <main class="commerce-page shop-container product-details-page">
      <nav class="commerce-breadcrumbs" aria-label="Breadcrumb">
        <a href="/" data-route="home">Home</a><span>/</span>
        <a href="/shop" data-route="shop">Shop</a><span>/</span>
        <span aria-current="page">${product.title}</span>
      </nav>
      <button class="commerce-back-link" type="button" id="btn-product-back">← Back</button>

      <section class="product-detail-layout">
        <div class="product-detail-gallery">
          <div class="product-detail-image-wrap">
            ${product.badge ? `<span class="product-detail-sale-badge">${product.badge} OFF</span>` : ''}
            <img src="${product.image}" alt="${product.title}" class="product-detail-image" />
          </div>
          <div class="product-gallery-thumbnails">
            <button class="product-gallery-thumb active" aria-label="View ${product.title}">
              <img src="${product.image}" alt="" />
            </button>
          </div>
        </div>

        <div class="product-detail-information">
          <p class="product-detail-category">${categoryName}</p>
          <h1>${product.title}</h1>
          <div class="product-detail-rating">
            ${stars(product.rating ?? 5)}
            <span>${product.rating ?? 5} / 5</span>
            <span class="product-rating-divider">·</span>
            <a href="#product-tabs" data-product-tab-link="reviews">${product.reviewCount ?? 0} reviews</a>
          </div>
          <div class="product-detail-price">
            ${originalPrice ? `<del>${originalPrice}৳</del>` : ''}
            <strong>${product.price}৳</strong>
            ${product.packSize ? `<span class="product-detail-size">${product.packSize}</span>` : ''}
          </div>
          <p class="product-detail-description">${product.description || `${product.title} — carefully selected and packed by Falaq Food.`}</p>

          <dl class="product-detail-facts">
            <div><dt>Category</dt><dd>${categoryName}</dd></div>
            <div><dt>Weight / Size</dt><dd>${product.packSize ?? 'See product packaging'}</dd></div>
            <div><dt>Availability</dt><dd class="${product.inStock === false ? 'out-of-stock' : 'in-stock'}">${product.inStock === false ? 'Out of stock' : 'In stock'}</dd></div>
          </dl>

          <div class="product-detail-purchase">
            <div class="commerce-quantity-control" aria-label="Quantity">
              <button type="button" data-detail-quantity="decrease" aria-label="Decrease quantity">−</button>
              <output id="product-detail-quantity">1</output>
              <button type="button" data-detail-quantity="increase" aria-label="Increase quantity">+</button>
            </div>
            <button class="product-detail-add-button" id="btn-detail-add-to-cart" ${product.inStock === false ? 'disabled' : ''}>
              Add to Cart
            </button>
          </div>

          <div class="product-detail-actions">
            <button type="button" id="btn-product-wishlist" class="${wishlisted ? 'wishlisted' : ''}" aria-pressed="${wishlisted}">
              <span aria-hidden="true">${wishlisted ? '♥' : '♡'}</span> ${wishlisted ? 'Added to Wishlist' : 'Add to Wishlist'}
            </button>
            <span class="product-share-label">Share:</span>
            <button type="button" class="product-share-button" data-share="facebook" aria-label="Share on Facebook">f</button>
            <button type="button" class="product-share-button" data-share="whatsapp" aria-label="Share on WhatsApp">wa</button>
            <button type="button" class="product-share-button" data-share="copy" aria-label="Copy product link">↗</button>
          </div>
        </div>
      </section>

      <section class="product-detail-tabs" id="product-tabs">
        <div class="product-tab-list" role="tablist" aria-label="Product information">
          <button type="button" role="tab" aria-selected="${activeTab === 'description'}" class="${activeTab === 'description' ? 'active' : ''}" data-product-tab="description">Description</button>
          <button type="button" role="tab" aria-selected="${activeTab === 'reviews'}" class="${activeTab === 'reviews' ? 'active' : ''}" data-product-tab="reviews">Reviews (${product.reviewCount ?? 0})</button>
        </div>
        ${activeTab === 'description' ? `
          <div class="product-tab-content">
            <h2>Product Description</h2>
            <p>${product.description || `${product.title} — carefully selected and packed by Falaq Food.`}</p>
            <h3>Key Features &amp; Specifications</h3>
            <ul class="product-feature-list">${features.map(feature => `<li>${feature}</li>`).join('')}</ul>
          </div>
        ` : `
          <div class="product-tab-content">
            <h2>Customer Reviews</h2>
            <p class="product-reviews-summary">${stars(product.rating ?? 5)} <strong>${product.rating ?? 5} out of 5</strong> · ${product.reviewCount ?? 0} reviews</p>
            <div class="product-customer-reviews">
              ${reviews.map(review => `
                <article class="product-customer-review">
                  <img src="${review.avatar}" alt="" />
                  <div><div class="product-review-heading">${review.name} ${stars(review.rating)}</div>
                  <span>${review.role}</span><p>${review.quote}</p></div>
                </article>
              `).join('')}
            </div>
          </div>
        `}
      </section>
    </main>
  `;
}
