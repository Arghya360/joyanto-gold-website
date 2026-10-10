import {
  ACCEPTED_PAYMENTS,
  APP_BADGES,
  FOOTER_GROUPS,
  DEVELOPER_PROFILE_URL,
  FOOTER_HOME_PATH,
  SHOW_APP_BADGES,
  SOCIAL_LINKS,
} from '../config/footer';

const socialIcons: Record<typeof SOCIAL_LINKS[number]['platform'], string> = {
  Instagram: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>',
  Facebook: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>',
  YouTube: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#fff"></polygon></svg>',
  X: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>',
};

const appBadgeIcons = {
  'App Store': '<svg class="app-btn-icon" viewBox="0 0 384 512" width="20" height="20" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 66.8 30.6 122.9c15.2 27.6 34.6 55.4 62.7 54.8 28.1-.6 38.6-18.6 71.9-18.6 33.5 0 43.2 18.6 72.3 18.2 29.5-.4 48.7-25.1 63.8-52.6 17.7-32.3 25-63.5 25.4-65.2-1.1-.5-49.9-20.1-52-64.3zM245.9 89.8c14.2-18.2 24.3-43.2 21.4-68.8-21.7 1-47.4 14.8-62.4 32.7-13.4 15.7-24.8 41.2-21.6 65.7 24.2 1.9 48.7-12 62.6-29.6z"/></svg>',
  'Google Play': '<svg class="app-btn-icon" viewBox="0 0 512 512" width="20" height="20" fill="currentColor"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg>',
};

function renderFooterItem(item: typeof FOOTER_GROUPS[number]['items'][number]): string {
  const content = item.path && !item.comingSoon
    ? `<a href="${item.path}" class="footer-nav-item-link" data-modern-path="${item.path}">${item.label}</a>`
    : `<span class="footer-nav-item-link footer-link-coming-soon" title="Coming soon">${item.label}</span>`;
  return `<li>${content}</li>`;
}

function renderFooterGroup(group: typeof FOOTER_GROUPS[number], index: number): string {
  const listId = `footer-group-links-${index}`;
  return `<section class="footer-nav-col">
    <h3 class="footer-nav-col-title"><button class="footer-accordion-trigger" type="button" aria-expanded="true" aria-controls="${listId}">${group.title}</button></h3>
    <ul class="footer-col-nav-links" id="${listId}">${group.items.map(renderFooterItem).join('')}</ul>
  </section>`;
}

function renderAppBadges(): string {
  return `<div class="footer-app-badges" ${SHOW_APP_BADGES ? '' : 'hidden'}>
    ${APP_BADGES.map(badge => `<a href="${badge.url}" class="footer-app-btn" aria-label="Open ${badge.label}">
      ${appBadgeIcons[badge.label]}
      <span class="app-btn-text"><span class="app-btn-sub">${badge.label === 'App Store' ? 'Download on the' : 'GET IT ON'}</span><span class="app-btn-title">${badge.label}</span></span>
    </a>`).join('')}
  </div>`;
}

function renderPayments(): string {
  if (ACCEPTED_PAYMENTS.length === 0) return '';
  return `<div class="footer-we-accept-wrap">
    <span class="footer-we-accept-text">We accept</span>
    <ul class="footer-payment-list">${ACCEPTED_PAYMENTS.map(payment => `<li class="footer-payment-logo" role="img" aria-label="${payment.label}">${payment.label}</li>`).join('')}</ul>
  </div>`;
}

export function renderFalaqFooter(): string {
  return `<footer class="falaq-site-footer fresh-theme-footer">
    <div class="shop-container footer-container wide-screen-container">
      <div class="footer-main-grid">
        <section class="footer-newsletter-col" aria-label="Montague Cole Bullion">
          <a href="${FOOTER_HOME_PATH}" class="footer-brand-logo" data-modern-path="${FOOTER_HOME_PATH}" aria-label="Montague Cole Bullion home">
            <img src="/logo.png" alt="Montague Cole Bullion" class="footer-brand-logo-img">
          </a>
          <h2 class="footer-inbox-heading">DUBAI BULLION<br>GLOBAL DELIVERY</h2>
          <p class="footer-brand-description">Investment-grade gold and silver from Dubai.</p>
          <form class="footer-subscribe-form" id="footer-newsletter-form">
            <label class="footer-newsletter-label" for="footer-newsletter-email">Join our private mailing list</label>
            <div class="footer-input-wrapper">
              <input id="footer-newsletter-email" name="email" type="email" class="footer-inbox-input" placeholder="Enter your email address" autocomplete="email" required>
              <button type="submit" class="footer-inbox-submit-btn" aria-label="Subscribe to newsletter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
            </div>
            <p class="footer-newsletter-status" aria-live="polite"></p>
            <small class="footer-newsletter-consent">By subscribing you agree to our Privacy Policy.</small>
          </form>
          <div class="footer-social-wrapper">
            <span class="footer-follow-label">Follow Us</span>
            <div class="footer-social-icons">${SOCIAL_LINKS.map(social => `<a href="${social.url}" target="_blank" rel="noopener noreferrer" class="footer-social-icon" aria-label="${social.platform}">${socialIcons[social.platform]}</a>`).join('')}</div>
          </div>
          ${renderAppBadges()}
        </section>
        <nav class="footer-links-grid" aria-label="Footer">
          ${FOOTER_GROUPS.map(renderFooterGroup).join('')}
        </nav>
      </div>
      ${renderPayments()}
      <div class="footer-bottom-bar-row">
        <div class="footer-copyright-terms-right">© ${new Date().getFullYear()} Montague Cole Bullion. All rights reserved.</div>
        <div class="footer-currency-box">
          <select class="footer-currency-dropdown" aria-label="Select Country and Currency">
            <option value="AED" selected>United Arab Emirates (AED د.إ)</option>
            <option value="USD">United States (USD $)</option>
            <option value="EUR">European Union (EUR €)</option>
            <option value="GBP">United Kingdom (GBP £)</option>
            <option value="INR">India (INR ₹)</option>
            <option value="SAR">Saudi Arabia (SAR ﷼)</option>
          </select>
          <span class="currency-dropdown-arrow"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></span>
        </div>
        <div class="footer-developer-credit">Designed &amp; Developed by <a href="${DEVELOPER_PROFILE_URL}" target="_blank" rel="noopener noreferrer" class="developer-profile-link">Arghya Biswas</a></div>
      </div>
    </div>
  </footer>`;
}
