import { REVIEWS } from '../data/reviews';
import { renderFalaqFooter } from './Footer';
import homeHeaderPicture from '../assets/main header logo/main header picture.png';
import aboutBanner from '../assets/main header logo/ban1.png';
import whyChooseUsImage from '../assets/main header logo/why us.png';

const preciousMetalProducts = [
  {
    number: '01',
    icon: '◈',
    title: 'Gold Bullion & Bars',
    description: 'Explore gold bars and bullion in a range of weights, ideal for buyers seeking physical gold.',
    theme: 'gold',
    href: '/catalogue?category=gold-bars',
    navigationPath: '/catalogue?category=gold-bars',
  },
  {
    number: '02',
    icon: '✧',
    title: 'Platinum Collection',
    description: 'Ask our team about platinum availability, product details and current sourcing options.',
    theme: 'dark',
    href: '/contact',
    navigationPath: '/contact',
  },
  {
    number: '03',
    icon: '◇',
    title: 'Certified Diamonds',
    description: 'Enquire about available diamonds and the grading documentation provided with each piece.',
    theme: 'light',
    href: '/contact',
    navigationPath: '/contact',
  },
  {
    number: '04',
    icon: '◉',
    title: 'Silver Bullion',
    description: 'Browse silver bars and bullion products in different sizes to suit your purchasing needs.',
    theme: 'silver',
    href: '/catalogue?category=silver-bars',
    navigationPath: '/catalogue?category=silver-bars',
  },
] as const;

export interface HomePageProps {
  currentSlide: number;
}

export function renderHomePage(_props: HomePageProps): string {
  const aboutSection = `
    <section class="home-about-section">
      <div class="home-about-container">
        <div class="home-about-content">
          <span class="home-about-badge">
            <span class="home-about-badge-check" aria-hidden="true">✓</span>
            About Us
          </span>

          <h2>Your Trusted Partner In<br />Professional &amp; <span class="home-about-highlight">Reliable Service</span></h2>

          <p class="home-about-description">
            We are committed to providing quality service with
            professionalism, reliability, and attention to detail.
            Our team works to understand your needs and deliver
            solutions that make a difference.
          </p>

          <div class="home-about-bottom">
            <div class="home-about-stat">
              <div class="home-about-stat-number">100<span>%</span></div>
              <p>Customer<br />Satisfaction</p>
            </div>

            <div class="home-about-info">
              <p>
                Our team works closely with you to provide reliable
                service, careful attention, and solutions tailored
                to your needs.
              </p>

              <a href="/contact" class="home-about-button" data-modern-path="/contact">
                <span class="home-about-button-arrow" aria-hidden="true">→</span>
                Get Started Now
              </a>
            </div>
          </div>
        </div>

        <div class="home-about-image-wrapper">
          <img src="${aboutBanner}" alt="Montague Cole Bullion brand and precious metals" class="home-about-image" />
        </div>
      </div>
    </section>`;

  const whyChooseUsSection = `
    <section class="home-why-section" aria-labelledby="home-why-heading">
      <div class="home-why-container">
        <div class="home-why-image-wrapper">
          <img
            src="${whyChooseUsImage}"
            alt="Montague Cole precious metals and private assets"
            class="home-why-image"
            loading="lazy"
          />
        </div>

        <div class="home-why-content">
          <div class="home-why-label">WHY CHOOSE US <span aria-hidden="true"></span></div>

          <h2 id="home-why-heading">
            Invest with confidence.
            <br />
            <span>Hold tangible value.</span>
          </h2>

          <p class="home-why-description">
            Explore precious metals and tangible assets with clear product information,
            transparent pricing details and support from our team.
          </p>

          <div class="home-why-benefit">
            <div class="home-why-sun-icon" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="9" stroke="currentColor" stroke-width="2" />
                <path d="M24 4v5M24 39v5M4 24h5M39 24h5M9.8 9.8l3.6 3.6M34.6 34.6l3.6 3.6M38.2 9.8l-3.6 3.6M13.4 34.6l-3.6 3.6M16 43h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </div>

            <h3>
              A considered purchase.
              <br />
              Personal service.
            </h3>
          </div>

          <ul class="home-why-features">
            <li><span class="home-why-check" aria-hidden="true">✓</span>Browse a curated precious metals catalogue</li>
            <li><span class="home-why-check" aria-hidden="true">✓</span>Review indicative pricing and product details</li>
            <li><span class="home-why-check" aria-hidden="true">✓</span>Ask our team about delivery and storage options</li>
          </ul>

          <a href="/catalogue" class="home-why-button" data-modern-path="/catalogue">
            <span>Explore the Catalogue</span>
            <span class="home-why-button-arrow" aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>`;

  const preciousMetalsSection = `
    <section class="home-metals-section" id="home-products" aria-labelledby="home-metals-heading">
      <div class="home-metals-container">
        <div class="home-metals-intro">
          <div class="home-metals-heading">
            <span class="home-metals-badge">
              <span class="home-metals-badge-dot" aria-hidden="true"></span>
              PRECIOUS METALS &amp; GEMSTONES
            </span>

            <h2 id="home-metals-heading">
              Discover the Value of
              <br />
              <span>Precious Metals &amp; Diamonds</span>
            </h2>

            <p>
              At <strong>Montague Cole</strong>, explore our collection of gold and silver,
              and contact our team to enquire about platinum and diamonds. Discover
              tangible assets with a focus on quality, transparency and professional service.
            </p>
          </div>

          <div class="home-metals-stats" aria-label="Product discovery highlights">
            <div class="home-metals-stat">
              <span class="home-metals-stat-number">04</span>
              <span class="home-metals-stat-label">Precious Product<br />Categories</span>
            </div>
            <div class="home-metals-stat">
              <span class="home-metals-stat-number">24/7</span>
              <span class="home-metals-stat-label">Online Product<br />Discovery</span>
            </div>
          </div>
        </div>

        <div class="home-metals-grid">
          ${preciousMetalProducts.map(product => `
            <article class="home-metal-card home-metal-card--${product.theme}">
              <div class="home-metal-card-top">
                <div class="home-metal-icon" aria-hidden="true">${product.icon}</div>
                <span class="home-metal-number">${product.number}</span>
              </div>
              <h3>${product.title}</h3>
              <p>${product.description}</p>
              <a href="${product.href}" class="home-metal-link" data-modern-path="${product.navigationPath}">
                ${product.theme === 'dark' || product.theme === 'light' ? 'Enquire Now' : 'Explore Collection'}
                <span aria-hidden="true">↗</span>
              </a>
            </article>`).join('')}
        </div>
      </div>
    </section>`;

  const termsSection = `
    <section class="home-terms-section" aria-labelledby="home-terms-heading">
      <div class="home-terms-container">
        <h2 class="home-terms-heading" id="home-terms-heading">
          Clear terms for a<br />simple service experience.
        </h2>

        <div class="home-terms-grid">
          <article class="home-terms-item">
            <div class="home-terms-icon" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none">
                <rect x="7" y="5" width="34" height="38" rx="3" stroke="currentColor" stroke-width="2" />
                <path d="M15 16h18M15 24h18M15 32h9" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                <path d="m17 35 4 3 9-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <h3>Read</h3>
            <p>Please review the applicable Terms of Sale and price-lock terms before submitting an allocation request.</p>
          </article>

          <article class="home-terms-item">
            <div class="home-terms-icon" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="25" r="18" stroke="currentColor" stroke-width="2" />
                <path d="M24 14v12l9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                <path d="m8 7 4 4M40 7l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </div>
            <h3>Understand</h3>
            <p>Review pricing, payment, delivery, insurance, collection and any applicable product or storage terms.</p>
          </article>

          <article class="home-terms-item">
            <div class="home-terms-icon" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none">
                <rect x="5" y="7" width="38" height="34" rx="5" stroke="currentColor" stroke-width="2" />
                <circle cx="20" cy="19" r="6" stroke="currentColor" stroke-width="2" />
                <path d="M9 34c2-6 7-9 13-9s11 3 13 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                <path d="M35 13h3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </div>
            <h3>Contact Us</h3>
            <p>Contact our team with questions about products, allocation requests or applicable terms.</p>
          </article>
        </div>

        <div class="home-terms-actions">
          <h3>Here's how to get started</h3>
          <div class="home-terms-buttons">
            <a href="/contact" class="home-terms-button" data-modern-path="/contact">Request a Consultation <span aria-hidden="true">→</span></a>
            <a href="/catalogue" class="home-terms-button" data-modern-path="/catalogue">Browse the Catalogue <span aria-hidden="true">→</span></a>
            <a href="/contact" class="home-terms-button" data-modern-path="/contact">Ask About Terms <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </div>
    </section>`;

  return `
    <div class="falaq-home-wrapper">
      <section class="home-header-picture" aria-label="Montague Cole featured image">
        <img src="${homeHeaderPicture}" alt="Montague Cole: precious metals, fine art, tangible assets, and luxury watches" />
      </section>
      ${aboutSection}
      ${whyChooseUsSection}
      ${preciousMetalsSection}
      ${termsSection}
      <section class="reviews-section">
        <div class="elementor-container">
          <div class="reviews-divider">
            <span>CLIENT REVIEWS</span>
          </div>
          <h2 class="elementor-heading-title" style="text-align: center; margin-bottom: 24px; color: #fff; font-size: 24px; font-weight: 700;">Client Experiences &amp; Allocations</h2>

          <div class="reviews-carousel-wrapper">
            <button class="review-carousel-btn btn-prev" id="review-prev" aria-label="Previous reviews">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>

            <div class="reviews-grid" id="reviews-track">
              ${REVIEWS.map(rev => `
                <div class="review-card">
                  <div class="review-card-top">
                    <div class="review-stars">
                      ${Array(rev.rating).fill('<svg class="star-icon" viewBox="0 0 1000 1000" width="15" height="15" fill="#f5a623"><path d="M450 75L338 312 88 350C46 354 25 417 58 450L238 633 196 896C188 942 238 975 275 954L500 837 725 954C767 975 813 942 804 896L763 633 942 450C975 417 954 358 913 350L663 312 550 75C529 33 471 33 450 75Z"></path></svg>').join('')}
                    </div>
                    <div class="review-quote-mark">
                      <svg viewBox="0 0 512 512" width="22" height="22" fill="var(--green)" opacity="0.4"><path d="M464 32H336c-26.5 0-48 21.5-48 48v128c0 26.5 21.5 48 48 48h80v64c0 35.3-28.7 64-64 64h-8c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24h8c88.4 0 160-71.6 160-160V80c0-26.5-21.5-48-48-48zm-288 0H48C21.5 32 0 53.5 0 80v128c0 26.5 21.5 48 48 48h80v64c0 35.3-28.7 64-64 64h-8c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24h8c88.4 0 160-71.6 160-160V80c0-26.5-21.5-48-48-48z"></path></svg>
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

          <div class="reviews-dots" role="group" aria-label="Choose a client review">
            ${REVIEWS.map((_, index) => `
              <button
                type="button"
                class="review-dot${index === 0 ? ' active' : ''}"
                data-review-index="${index}"
                aria-label="Show review ${index + 1}"
                aria-current="${index === 0 ? 'true' : 'false'}"
              ></button>
            `).join('')}
          </div>
        </div>
      </section>

      ${renderFalaqFooter()}
    </div>
  `;
}
