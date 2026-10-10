import { REVIEWS } from '../data/reviews';
import { renderFalaqFooter } from './Footer';

export interface HomePageProps {
  currentSlide: number;
}

export function renderHomePage(_props: HomePageProps): string {
  return `
    <div class="falaq-home-wrapper">
      <section class="reviews-section">
        <div class="elementor-container">
          <div class="reviews-divider">
            <span>CLIENT REVIEWS</span>
          </div>
          <h2 class="elementor-heading-title" style="text-align: center; margin-bottom: 24px; color: #0d874c; font-size: 24px; font-weight: 700;">Client Experiences &amp; Allocations</h2>

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

      ${renderFalaqFooter()}
    </div>
  `;
}
