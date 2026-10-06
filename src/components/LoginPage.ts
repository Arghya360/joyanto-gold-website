import { renderHeader } from './Header';
import { renderFalaqFooter } from './Footer';

export interface LoginPageProps {
  cartCount: number;
  topSearchQuery?: string;
  selectedNavCategory?: string;
}

export function renderLoginPage(props: LoginPageProps): string {
  const { cartCount, topSearchQuery = '', selectedNavCategory = '' } = props;

  return `
    <div class="customer-login-page-wrapper">
      <!-- ── HEADER ── -->
      ${renderHeader({
        activeNav: '',
        cartCount,
        searchQuery: topSearchQuery,
        selectedNavCategory,
      })}

      <!-- ── MAIN CONTENT ── -->
      <main class="customer-login-main-content">
        <div class="shop-container customer-login-container">
          
          <div class="customer-login-card">
            <h1 class="customer-login-title">Login</h1>
            <p class="customer-login-subtitle">
              Sign in to your account to continue shopping, track orders, and manage your profile.
            </p>

            <form class="customer-login-form" id="customer-login-form">
              <!-- Phone Number Input -->
              <div class="login-field-group">
                <label class="login-field-label" for="login-phone">
                  Your Phone Number <span class="login-star">*</span>
                </label>
                <input 
                  type="tel" 
                  id="login-phone" 
                  class="login-field-input" 
                  placeholder="Your phone number" 
                  required 
                  autocomplete="tel"
                />
              </div>

              <!-- Password Input with Toggle -->
              <div class="login-field-group">
                <label class="login-field-label" for="login-password">
                  Password <span class="login-star">*</span>
                </label>
                <div class="login-password-box">
                  <input 
                    type="password" 
                    id="login-password" 
                    class="login-field-input login-password-input" 
                    placeholder="Enter your password" 
                    required 
                    autocomplete="current-password"
                  />
                  <button 
                    type="button" 
                    class="btn-password-visibility-toggle" 
                    id="btn-toggle-login-password" 
                    aria-label="Toggle password visibility"
                  >
                    <svg class="eye-open-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Remember me -->
              <div class="login-remember-row">
                <label class="remember-checkbox-wrapper" for="login-remember">
                  <input type="checkbox" id="login-remember" class="remember-checkbox-input" checked />
                  <span class="remember-text">Remember me</span>
                </label>
              </div>

              <!-- Log In Button -->
              <button type="submit" class="btn-customer-login-submit" id="btn-customer-login-submit">
                LOG IN
              </button>

              <!-- Lost Password -->
              <div class="login-lost-pwd-wrap">
                <a href="#" class="link-lost-password" id="btn-lost-password">Lost your password?</a>
              </div>

              <!-- Create Account Button -->
              <button type="button" class="btn-create-account-outline" id="btn-create-account-view">
                CREATE NEW ACCOUNT
              </button>
            </form>

          </div>

        </div>
      </main>

      <!-- ── FOOTER ── -->
      ${renderFalaqFooter()}
    </div>
  `;
}
