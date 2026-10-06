export function renderFalaqFooter(): string {
  return `
    <footer class="falaq-site-footer fresh-theme-footer">
      <div class="shop-container footer-container">
        
        <!-- Main Top Grid -->
        <div class="footer-main-grid">
          
          <!-- Left Column: Brand Logo, Heading, Newsletter, Socials, App Badges, We Accept -->
          <div class="footer-newsletter-col">
            <!-- Brand Logo -->
            <a href="#" class="footer-brand-logo" data-nav="Home" aria-label="E-Commerce Shopping Home">
              <img src="/logo.png" alt="E-Commerce Shopping" class="footer-brand-logo-img" />
            </a>

            <!-- Big Newsletter Heading -->
            <h2 class="footer-inbox-heading">
              GET FRESH FOOD<br />IN YOUR INBOX
            </h2>

            <!-- Newsletter Input Form -->
            <form class="footer-subscribe-form" id="footer-newsletter-form" onsubmit="event.preventDefault(); const toast = document.querySelector('.shop-toast-notification'); if(toast){ toast.textContent = 'Thank you for subscribing!'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3000); } this.reset();">
              <div class="footer-input-wrapper">
                <input 
                  type="email" 
                  class="footer-inbox-input" 
                  placeholder="Enter your email address" 
                  aria-label="Email address"
                  required 
                />
                <button type="submit" class="footer-inbox-submit-btn" aria-label="Subscribe to newsletter">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </form>

            <!-- Follow Us & Social Media Icons -->
            <div class="footer-social-wrapper">
              <span class="footer-follow-label">Follow Us</span>
              <div class="footer-social-icons">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" class="footer-social-icon" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" class="footer-social-icon" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" class="footer-social-icon" aria-label="YouTube">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#fff"></polygon>
                  </svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" class="footer-social-icon" aria-label="Twitter">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                  </svg>
                </a>
              </div>
            </div>

            <!-- App Store & Google Play Badges -->
            <div class="footer-app-badges">
              <a href="#" class="footer-app-btn" aria-label="Download on the App Store">
                <svg class="app-btn-icon" viewBox="0 0 384 512" width="20" height="20" fill="currentColor">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 66.8 30.6 122.9c15.2 27.6 34.6 55.4 62.7 54.8 28.1-.6 38.6-18.6 71.9-18.6 33.5 0 43.2 18.6 72.3 18.2 29.5-.4 48.7-25.1 63.8-52.6 17.7-32.3 25-63.5 25.4-65.2-1.1-.5-49.9-20.1-52-64.3zM245.9 89.8c14.2-18.2 24.3-43.2 21.4-68.8-21.7 1-47.4 14.8-62.4 32.7-13.4 15.7-24.8 41.2-21.6 65.7 24.2 1.9 48.7-12 62.6-29.6z"/>
                </svg>
                <div class="app-btn-text">
                  <span class="app-btn-sub">Download on the</span>
                  <span class="app-btn-title">App Store</span>
                </div>
              </a>

              <a href="#" class="footer-app-btn" aria-label="Get it on Google Play">
                <svg class="app-btn-icon" viewBox="0 0 512 512" width="20" height="20" fill="currentColor">
                  <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
                </svg>
                <div class="app-btn-text">
                  <span class="app-btn-sub">GET IT ON</span>
                  <span class="app-btn-title">Google Play</span>
                </div>
              </a>
            </div>

            <!-- We Accept Payment Section -->
            <div class="footer-we-accept-wrap">
              <span class="footer-we-accept-text">We Accept</span>
              <img src="/uploads/assets/paywith_ssl.png" alt="Payment Methods" class="footer-paywith-ssl-img" />
            </div>
          </div>

          <!-- Right 3 Navigation Columns: SHOP, LEARN, ABOUT -->
          <div class="footer-links-grid">
            <!-- Column 1: SHOP -->
            <div class="footer-nav-col">
              <h3 class="footer-nav-col-title">SHOP</h3>
              <ul class="footer-col-nav-links">
                <li><a href="#" class="footer-nav-item-link" data-nav="Shop">All Products</a></li>
                <li><a href="#" class="footer-nav-item-link" data-nav="Shop">Fresh Fruits</a></li>
                <li><a href="#" class="footer-nav-item-link" data-nav="Shop">Vegetables</a></li>
                <li><a href="#" class="footer-nav-item-link" data-nav="Shop">Dairy &amp; Eggs</a></li>
                <li><a href="#" class="footer-nav-item-link" data-nav="Shop">Meat &amp; Seafood</a></li>
                <li><a href="#" class="footer-nav-item-link" data-nav="Shop">Bakery</a></li>
                <li><a href="#" class="footer-nav-item-link" data-nav="Shop">Gift Cards</a></li>
              </ul>
            </div>

            <!-- Column 2: LEARN -->
            <div class="footer-nav-col">
              <h3 class="footer-nav-col-title">LEARN</h3>
              <ul class="footer-col-nav-links">
                <li><a href="#" class="footer-nav-item-link">About Us</a></li>
                <li><a href="#" class="footer-nav-item-link">Blog</a></li>
                <li><a href="#" class="footer-nav-item-link">Healthy Recipes</a></li>
                <li><a href="#" class="footer-nav-item-link">Organic Guide</a></li>
                <li><a href="#" class="footer-nav-item-link">Nutrition Tips</a></li>
                <li><a href="#" class="footer-nav-item-link">Help &amp; FAQ</a></li>
                <li><a href="#" class="footer-nav-item-link">Store Locator</a></li>
              </ul>
            </div>

            <!-- Column 3: ABOUT -->
            <div class="footer-nav-col">
              <h3 class="footer-nav-col-title">ABOUT</h3>
              <ul class="footer-col-nav-links">
                <li><a href="#" class="footer-nav-item-link">Our Story</a></li>
                <li><a href="#" class="footer-nav-item-link">Careers</a></li>
                <li><a href="#" class="footer-nav-item-link">Track Your Order</a></li>
                <li><a href="#" class="footer-nav-item-link">Shipping &amp; Returns</a></li>
                <li><a href="#" class="footer-nav-item-link">Contact Us</a></li>
                <li><a href="#" class="footer-nav-item-link">Open Your Store</a></li>
                <li><a href="#" class="footer-nav-item-link">Privacy Policy</a></li>
                <li><a href="#" class="footer-nav-item-link">Terms of Service</a></li>
              </ul>
            </div>
          </div>

        </div>

        <!-- Bottom Row -->
        <div class="footer-bottom-bar-row">
          <!-- Left: Country/Currency Selector -->
          <div class="footer-currency-box">
            <select class="footer-currency-dropdown" aria-label="Select Country and Currency">
              <option value="Bangladesh (USD $)" selected>Bangladesh (USD $)</option>
              <option value="Bangladesh (BDT ৳)">Bangladesh (BDT ৳)</option>
              <option value="United States (USD $)">United States (USD $)</option>
              <option value="United Kingdom (GBP £)">United Kingdom (GBP £)</option>
            </select>
            <span class="currency-dropdown-arrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </span>
          </div>

          <!-- Center: Designed & Developed by Arghya Biswas -->
          <div class="footer-developer-credit">
            Designed &amp; Developed by <a href="https://www.linkedin.com/in/arghyabiswas360/" target="_blank" rel="noreferrer" class="developer-profile-link">Arghya Biswas</a>
          </div>

          <!-- Right: Copyright & Terms -->
          <div class="footer-copyright-terms-right">
            <span>© 2026 Fresh Food. All rights reserved.</span>
            <span class="copy-sep">|</span>
            <a href="#" class="copy-link">Privacy</a>
            <span class="copy-sep">|</span>
            <a href="#" class="copy-link">Terms</a>
          </div>
        </div>

      </div>
    </footer>
  `;
}
