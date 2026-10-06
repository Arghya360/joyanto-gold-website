import { PRODUCTS, getProductOriginalPrice } from '../data/products';
import { BLOG_POSTS } from '../data/blogs';
import { REVIEWS } from '../data/reviews';
import { renderFalaqFooter } from './Footer';

const HERO_SLIDES = [
  { img: "/uploads/assets/banner-1.png", title: "খাঁটি ঘি ও প্রাকৃতিক খাবার" },
  { img: "/uploads/assets/banner-3.png", title: "খাঁটি সুন্দরবনের মধু" },
  { img: "/uploads/assets/banner-2.png", title: "কাঠিগানি ভাঙা খাঁটি সরিষার তেল" },
  { img: "/uploads/assets/banner-4.png", title: "অর্গানিক সুপারফুড ও বাদাম" },
];

const HOME_CATEGORIES = [
  { id: "prices", name: "Live Prices", image: "/uploads/assets/cat-honey.png" },
  { id: "catalog", name: "Catalogue", image: "/uploads/assets/cat-nuts.png" },
  { id: "storage", name: "Storage", image: "/uploads/assets/cat-organic.png" },
  { id: "mc-reserve", name: "MC Reserve", image: "/uploads/assets/cat-oil.png" },
  { id: "sell", name: "Sell to Us", image: "/uploads/assets/cat-dal.png" },
  { id: "about", name: "About", image: "/uploads/assets/cat-flour.png" },
  { id: "contact", name: "Contact", image: "/uploads/assets/cat-honey.png" },
  { id: "gold-bars", name: "Gold Bars", image: "/uploads/assets/cat-nuts.png" },
  { id: "silver-bars", name: "Silver Bars", image: "/uploads/products/product-4.png" },
  { id: "coins", name: "Coins", image: "/uploads/products/product-7.png" },
  { id: "dubai-collection", name: "Dubai Collection", image: "/uploads/products/product-2.png" },
  { id: "private-assets", name: "Private Assets", image: "/uploads/products/product-8.png" }
];

export interface HomePageProps {
  currentSlide: number;
}

export function renderHomePage(props: HomePageProps): string {
  const { currentSlide } = props;

  // Recent 16 products in exact original order 1 to 16 matching screenshot
  const recentProducts = [...PRODUCTS]
    .filter(p => p.id >= 1 && p.id <= 16)
    .sort((a, b) => a.id - b.id);

  return `
    <div class="falaq-home-wrapper">
      
      <!-- ── HERO SECTION (Slider + Side 2 Promos) ── -->
      <section class="hero-section">
        <div class="elementor-container">
          <div class="hero-container-inner">
            <!-- Main Carousel Slider -->
            <div class="hero-carousel-wrap">
              <div class="hero-carousel-track" id="hero-track" style="transform: translateX(-${currentSlide * 100}%);">
                ${HERO_SLIDES.map((slide, idx) => `
                  <div class="hero-slide" data-idx="${idx}">
                    <img src="${slide.img}" alt="${slide.title}" />
                  </div>
                `).join('')}
              </div>
              <div class="hero-dots">
                ${HERO_SLIDES.map((_, idx) => `
                  <div class="hero-dot ${idx === currentSlide ? 'active' : ''}" data-dot="${idx}"></div>
                `).join('')}
              </div>
            </div>

            <!-- Side 2 Promos -->
            <div class="hero-side-promos">
              <div class="side-promo-box" data-promo-cat="cooking-oil">
                <img src="/uploads/assets/promo-1.png" alt="ঘানিভাঙা সরিষার তেল ও অন্যান্য পণ্য" />
              </div>
              <div class="side-promo-box" data-promo-cat="honey">
                <img src="/uploads/assets/promo-2.png" alt="খাঁটি গাওয়া ঘি ও মধু" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── SHOP BY CATEGORY ── -->
      <section class="categories-section">
        <div class="elementor-container">
          <h2 class="elementor-heading-title" style="text-align: left; font-size: 26px; font-weight: 700; margin-bottom: 18px;">Shop by Category</h2>
          <div class="category-carousel-wrapper">
            <button class="category-carousel-btn btn-prev" id="cat-carousel-prev" aria-label="Previous categories">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div class="category-loop-carousel" id="category-track">
              ${HOME_CATEGORIES.map(cat => `
                <div class="category-card" data-cat-card="${cat.id}">
                  <div class="category-img-wrap">
                    <img src="${cat.image}" alt="${cat.name}" loading="lazy" />
                  </div>
                  <h3 class="category-title">${cat.name}</h3>
                </div>
              `).join('')}
            </div>
            <button class="category-carousel-btn btn-next" id="cat-carousel-next" aria-label="Next categories">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
          <div class="category-carousel-indicators" id="category-carousel-indicators" aria-label="Category pages">
            ${Array.from({ length: Math.ceil(HOME_CATEGORIES.length / 3) }, (_, index) => `
              <button type="button" class="category-carousel-indicator ${index === 0 ? 'active' : ''}" data-category-page="${index}" aria-label="Show category group ${index + 1}" aria-pressed="${index === 0}"></button>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- ── RECENT PRODUCTS (Exact Falaq Food 16 Products Grid) ── -->
      <section class="products-section" id="products">
        <div class="elementor-container">
          <h2 class="elementor-heading-title recent-products-title">Recent Products</h2>
          <div class="products-loop-grid">
            ${recentProducts.map(p => `
              <div class="product-card" data-product-id="${p.id}" role="link" tabindex="0" aria-label="View ${p.title}">
                ${p.badge ? `<span class="sale-badge">${p.badge}</span>` : ''}
                <button type="button" class="home-product-wishlist" data-home-wishlist="${p.id}" aria-label="Add ${p.title} to wishlist" aria-pressed="false">♡</button>
                <div class="product-img-wrap">
                  <img src="${p.image}" alt="${p.title}" loading="lazy" />
                </div>
                <h3 class="product-title">${p.title}</h3>
                <div class="product-card-rating" aria-label="${p.rating ?? 5} out of 5 stars">${'★'.repeat(Math.round(p.rating ?? 5))}${'☆'.repeat(5 - Math.round(p.rating ?? 5))} <span>(${p.reviewCount ?? 0})</span></div>
                <div class="product-price">
                  <span class="product-price-desktop">${p.priceDisplay}</span>
                  <span class="product-price-mobile">${getProductOriginalPrice(p) ? `<del>${getProductOriginalPrice(p)}৳</del> ` : ''}${p.price}৳</span>
                </div>
                <button class="btn-add-to-cart" data-add="${p.id}" aria-label="Add ${p.title} to cart">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 5L19 12H7.37671M20 16H8L6 3H3M16 5.5H13.5M13.5 5.5H11M13.5 5.5V8M13.5 5.5V3M9 20C9 20.5523 8.55228 21 8 21C7.44772 21 7 20.5523 7 20C7 19.4477 7.44772 19 8 19C8.55228 19 9 19.4477 9 20ZM20 20C20 20.5523 19.5523 21 19 21C18.4477 21 18 20.5523 18 20C18 19.4477 18.4477 19 19 19C19.5523 19 20 19.4477 20 20Z"></path></svg>
                  <span>Add to Cart</span>
                </button>
              </div>
            `).join('')}
          </div>

          <!-- Shop All Products Button -->
          <div class="shop-all-wrap">
            <button class="shop-all-products-btn" id="btn-shop-all-products">
              SHOP ALL PRODUCTS
            </button>
          </div>
        </div>
      </section>

      <!-- ── নতুন ব্লগ পড়ুন (3 Articles) ── -->
      <section class="blogs-section">
        <div class="elementor-container">
          <h2 class="elementor-heading-title" style="text-align: center; font-size: 24px; font-weight: 700; margin-bottom: 24px;">নতুন ব্লগ পড়ুন</h2>
          <div class="blogs-grid">
            ${BLOG_POSTS.map(blog => `
              <div class="blog-card">
                <div class="blog-thumb-wrap">
                  <img src="${blog.image}" alt="${blog.title}" />
                  <span class="blog-badge-tag">${blog.category}</span>
                </div>
                <div class="blog-content">
                  <h3 class="blog-title">${blog.title}</h3>
                  <p class="blog-excerpt">${blog.excerpt}</p>
                  <a href="#" class="blog-read-more" data-blog-id="${blog.id}">READ MORE »</a>
                </div>
                <div class="blog-meta-footer">
                  <div class="blog-meta-author-wrap">
                    <span class="blog-avatar-placeholder">
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="#9ca3af"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    </span>
                  </div>
                  <div class="blog-meta-date-info">
                    <span>${blog.date}</span> • <span>No Comments</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- ── CUSTOMER REVIEWS (আমাদের গ্রাহকদের অভিজ্ঞতা) ── -->
      <section class="reviews-section">
        <div class="elementor-container">
          <div class="reviews-divider">
            <span>CUSTOMER REVIEWS</span>
          </div>
          <h2 class="elementor-heading-title" style="text-align: center; margin-bottom: 24px; color: #0d874c; font-size: 24px; font-weight: 700;">আমাদের গ্রাহকদের অভিজ্ঞতা</h2>
          
          <div class="reviews-carousel-wrapper">
            <button class="review-carousel-btn btn-prev" id="review-prev" aria-label="Previous reviews">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>

            <div class="reviews-grid" id="reviews-track">
              ${REVIEWS.slice(0, 3).map(rev => `
                <div class="review-card">
                  <div class="review-card-top">
                    <div class="review-stars">
                      ${Array(rev.rating).fill('<svg class="star-icon" viewBox="0 0 1000 1000" width="15" height="15" fill="#f5a623"><path d="M450 75L338 312 88 350C46 354 25 417 58 450L238 633 196 896C188 942 238 975 275 954L500 837 725 954C767 975 813 942 804 896L763 633 942 450C975 417 954 358 913 350L663 312 550 75C529 33 471 33 450 75Z"></path></svg>').join('')}
                    </div>
                    <div class="review-quote-mark">
                      <svg viewBox="0 0 512 512" width="22" height="22" fill="#0D874C" opacity="0.4"><path d="M464 32H336c-26.5 0-48 21.5-48 48v128c0 26.5 21.5 48 48 48h80v64c0 35.3-28.7 64-64 64h-8c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24h8c88.4 0 160-71.6 160-160V80c0-26.5-21.5-48-48-48zm-288 0H48C21.5 32 0 53.5 0 80v128c0 26.5 21.5 48 48 48h80v64c0 35.3-28.7 64-64 64h-8c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24h8c88.4 0 160-71.6 160-160V80c0-26.5-21.5-48-48-48z"></path></svg>
                    </div>
                  </div>
                  <p class="review-text">"${rev.quote}"</p>
                  <div class="review-user-box">
                    <img src="${rev.avatar}" alt="${rev.name}" class="review-avatar" />
                    <div>
                      <div class="review-name">${rev.name}</div>
                      <div class="review-role">${rev.role}</div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <button class="review-carousel-btn btn-next" id="review-next" aria-label="Next reviews">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>

          <div class="reviews-dots">
            <span class="review-dot active"></span>
            <span class="review-dot"></span>
            <span class="review-dot"></span>
            <span class="review-dot"></span>
          </div>
        </div>
      </section>

      <!-- ── BOTTOM PROMO ARTWORK (4 Banners matching screenshot) ── -->
      <section class="bottom-banners-section">
        <div class="elementor-container">
          <div class="bottom-banners-layout">
            <!-- Left side: top wide banner + bottom 2 square banners -->
            <div class="bottom-banners-left">
              <div class="banner-top-wide">
                <img src="/uploads/assets/bottom-1.png" alt="চিয়া সিড পুষ্টিগুণ" />
              </div>
              <div class="banner-bottom-squares">
                <div class="banner-square">
                  <img src="/uploads/assets/bottom-3.png" alt="প্রাকৃতিক লিচু ফুলের মধু" />
                </div>
                <div class="banner-square">
                  <img src="/uploads/assets/bottom-2.png" alt="মাস্টার্ড অয়েল ও খাঁটি খাবার কম্বো" />
                </div>
              </div>
            </div>
            <!-- Right side: tall delivery banner -->
            <div class="bottom-banners-right">
              <div class="banner-tall">
                <img src="/uploads/assets/bottom-4.png" alt="দেশের যে কোন প্রান্তে পৌঁছে যাই আমরা - ফলক ফুড" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── FOOTER ── -->
      ${renderFalaqFooter()}

    </div>
  `;
}
