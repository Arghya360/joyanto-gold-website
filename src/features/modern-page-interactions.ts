import type { ModernNavigation } from './modern-pages';
import { moveQuoteStep, restoreCatalogueFilters, restoreDraft, saveDraft, showFormMessage, updateCatalogue, updateConverter, updateSellEstimate, updateStorageEstimate } from './modern-page-helpers';
import { isPriceStale } from '../lib/pricing';
import { initializeMarketChart } from './market-terminal/chart';
import { catalogueWeightPreset } from './catalogue-filters';

export function attachModernPageHandlers(
  root: HTMLElement,
  navigate: ModernNavigation,
  addCatalogueProduct: (slug: string) => void,
): void {
  const failDemo = import.meta.env.DEV && new URLSearchParams(location.search).get('feed') === 'fail';
  const isLivePrices = location.pathname === '/live-prices';
  if (isLivePrices) initializeMarketChart(root);
  let lastMockRefresh = Date.now();
  const setStaleState = () => {
    const stale = failDemo || !navigator.onLine || isPriceStale(lastMockRefresh);
    const notice = root.querySelector<HTMLElement>('#price-notice');
    const health = root.querySelector<HTMLElement>('#feed-health');
    const tickerHealth = root.querySelector<HTMLElement>('#ticker-health');
    if (notice) {
      notice.hidden = !stale;
      if (stale) notice.textContent = 'Live pricing is temporarily unavailable. Prices shown are indicative and purchasing is paused.';
    }
    if (health) health.textContent = stale ? 'Indicative only · price feed unavailable' : 'Indicative only · mock feed';
    if (tickerHealth) tickerHealth.textContent = stale ? 'Indicative only · unavailable' : 'Indicative demonstration feed';
  };
  setStaleState();
  const dubaiDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dubai', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
  root.querySelectorAll<HTMLInputElement>('input[type="date"]').forEach(input => input.min = dubaiDate);
  if (isLivePrices) {
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible' && !failDemo && navigator.onLine) lastMockRefresh = Date.now();
      setStaleState();
    }, 7000);
    window.addEventListener('pagehide', () => window.clearInterval(timer), { once: true });
    window.addEventListener('online', setStaleState);
    window.addEventListener('offline', setStaleState);
  }

  const hasCatalogue = root.querySelector('#catalogue-grid') !== null;
  let catalogueDebounce: number | undefined;
  let catalogueSheetOpen = false;
  const applyCatalogueChange = (resetPage = true) => {
    if (catalogueDebounce !== undefined) window.clearTimeout(catalogueDebounce);
    updateCatalogue(root, { history: catalogueSheetOpen ? 'none' : 'push', resetPage });
  };
  const setCatalogueSheetOpen = (open: boolean) => {
    const sheet = root.querySelector<HTMLElement>('#catalogue-filter-sheet');
    const overlay = root.querySelector<HTMLElement>('#catalogue-filter-overlay');
    const opener = root.querySelector<HTMLButtonElement>('#catalogue-filter-open');
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    if (!sheet || !overlay || !mobile) return;
    if (!open && catalogueSheetOpen) {
      restoreCatalogueFilters(root);
      updateCatalogue(root, { history: 'none' });
    }
    catalogueSheetOpen = open;
    sheet.hidden = !open;
    overlay.hidden = !open;
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', String(open));
    document.body.classList.toggle('mc-catalogue-sheet-open', open);
    document.documentElement.classList.toggle('mc-catalogue-sheet-open', open);
    opener?.setAttribute('aria-expanded', String(open));
    if (open) root.querySelector<HTMLButtonElement>('#catalogue-filter-close')?.focus();
    else opener?.focus();
  };
  const catalogueMobileQuery = window.matchMedia('(max-width: 767px)');
  const syncCatalogueLayout = () => {
    if (!root.isConnected) {
      catalogueMobileQuery.removeEventListener('change', syncCatalogueLayout);
      return;
    }
    catalogueSheetOpen = false;
    restoreCatalogueFilters(root);
    updateCatalogue(root, { history: 'none' });
  };
  if (hasCatalogue) catalogueMobileQuery.addEventListener('change', syncCatalogueLayout);
  const clearCatalogueFilters = () => {
    const search = root.querySelector<HTMLInputElement>('#catalogue-search');
    if (search) search.value = '';
    root.querySelectorAll<HTMLButtonElement>('[data-catalogue-category]').forEach(button => {
      const active = button.dataset.catalogueCategory === '';
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    for (const selector of ['#filter-metal', '#filter-type', '#filter-availability']) {
      const select = root.querySelector<HTMLSelectElement>(selector);
      if (select) select.value = '';
    }
    for (const selector of ['#filter-weight-min', '#filter-weight-max']) {
      const input = root.querySelector<HTMLInputElement>(selector);
      if (input) input.value = '';
    }
    const unit = root.querySelector<HTMLSelectElement>('#filter-weight-unit');
    if (unit) unit.value = 'g';
    if (catalogueSheetOpen) {
      if (catalogueDebounce !== undefined) window.clearTimeout(catalogueDebounce);
      catalogueSheetOpen = false;
      updateCatalogue(root, { history: 'push', resetPage: true });
      setCatalogueSheetOpen(false);
    } else {
      applyCatalogueChange(true);
    }
  };

  root.addEventListener('click', event => {
    const element = event.target instanceof Element ? event.target : null;
    if (!element) return;
    const target = element instanceof HTMLElement ? element : element.parentElement;
    if (!target) return;
    const addButton = target.closest<HTMLButtonElement>('[data-catalogue-add]');
    if (addButton && !addButton.disabled && addButton.dataset.catalogueAdd) {
      addCatalogueProduct(addButton.dataset.catalogueAdd);
      return;
    }
    const purchasePausedButton = target.closest<HTMLButtonElement>('[data-purchase-paused]');
    if (purchasePausedButton) {
      const note = root.querySelector<HTMLElement>('#purchase-paused-note');
      if (note) {
        note.hidden = !note.hidden;
        purchasePausedButton.setAttribute('aria-expanded', String(!note.hidden));
      }
      return;
    }
    if (target.id === 'load-map') {
      const slot = root.querySelector<HTMLElement>('#map-slot');
      if (slot) slot.innerHTML = '<p>Map unavailable until the business address is confirmed. [PENDING CLIENT]</p>';
    }
    if (hasCatalogue && target.closest('#catalogue-filter-open')) {
      setCatalogueSheetOpen(true);
    }
    if (hasCatalogue && (target.closest('#catalogue-filter-close') || target.closest('#catalogue-filter-overlay'))) {
      setCatalogueSheetOpen(false);
    }
    if (hasCatalogue && target.closest('#catalogue-filter-apply')) {
      if (catalogueDebounce !== undefined) window.clearTimeout(catalogueDebounce);
      updateCatalogue(root, { history: 'push', resetPage: true });
      catalogueSheetOpen = false;
      setCatalogueSheetOpen(false);
    }
    if (hasCatalogue && (target.closest('#clear-filters') || target.closest('#catalogue-clear-desktop') || target.closest('[data-clear-all-filters]'))) {
      clearCatalogueFilters();
    }
    if (hasCatalogue && target.closest('#catalogue-search-clear')) {
      const search = root.querySelector<HTMLInputElement>('#catalogue-search');
      if (search) {
        search.value = '';
        search.focus();
      }
      applyCatalogueChange(true);
    }
    const categoryButton = hasCatalogue ? target.closest<HTMLButtonElement>('[data-catalogue-category]') : null;
    if (categoryButton && !categoryButton.disabled) {
      root.querySelectorAll<HTMLButtonElement>('[data-catalogue-category]').forEach(button => {
        const active = button === categoryButton;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      applyCatalogueChange(true);
    }
    const viewButton = hasCatalogue ? target.closest<HTMLButtonElement>('[data-catalogue-view]') : null;
    if (viewButton) {
      root.querySelectorAll<HTMLButtonElement>('[data-catalogue-view]').forEach(button => {
        const active = button === viewButton;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      applyCatalogueChange(false);
    }
    const removeFilter = hasCatalogue ? target.closest<HTMLButtonElement>('[data-remove-filter]') : null;
    if (removeFilter) {
      const key = removeFilter.dataset.removeFilter;
      if (key === 'query') {
        const input = root.querySelector<HTMLInputElement>('#catalogue-search');
        if (input) input.value = '';
      } else if (key === 'category') {
        root.querySelector<HTMLButtonElement>('[data-catalogue-category=""]')?.click();
        return;
      } else if (key === 'metal' || key === 'type' || key === 'availability') {
        const selector = key === 'availability' ? '#filter-availability' : `#filter-${key}`;
        const select = root.querySelector<HTMLSelectElement>(selector);
        if (select) select.value = '';
      } else if (key === 'weight') {
        for (const selector of ['#filter-weight-min', '#filter-weight-max']) {
          const input = root.querySelector<HTMLInputElement>(selector);
          if (input) input.value = '';
        }
        const unit = root.querySelector<HTMLSelectElement>('#filter-weight-unit');
        if (unit) unit.value = 'g';
      }
      applyCatalogueChange(true);
    }
    const presetButton = hasCatalogue ? target.closest<HTMLButtonElement>('[data-weight-preset]') : null;
    if (presetButton) {
      const min = root.querySelector<HTMLInputElement>('#filter-weight-min');
      const max = root.querySelector<HTMLInputElement>('#filter-weight-max');
      const unit = root.querySelector<HTMLSelectElement>('#filter-weight-unit');
      if (unit) unit.value = 'g';
      if (min && max) {
        const presetName = presetButton.dataset.weightPreset;
        if (presetName === 'up-to-10' || presetName === '10-to-100' || presetName === '100-to-1000' || presetName === '1000-plus') {
          const preset = catalogueWeightPreset(presetName);
          min.value = preset.min === null ? '' : String(preset.min);
          max.value = preset.max === null ? '' : String(preset.max);
        }
      }
      applyCatalogueChange(true);
    }
    if (target.id === 'quote-next' || target.id === 'quote-back') moveQuoteStep(root, target.id === 'quote-next' ? 1 : -1);
    if (target.id === 'quote-clear') {
      localStorage.removeItem('mc-quote-draft');
      root.querySelector<HTMLFormElement>('#sell-quote-form')?.reset();
      showFormMessage(root.querySelector<HTMLElement>('#quote-status'), 'Draft cleared.');
    }
    if (target.id === 'reserve-logout') {
      sessionStorage.removeItem('mc-demo-user');
      navigate('/mc-reserve');
    }
  });

  root.addEventListener('input', event => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) return;
    if (target.id.startsWith('convert-')) updateConverter(root);
    if (target.id.startsWith('sell-')) updateSellEstimate(root);
    if (hasCatalogue && (target.id === 'catalogue-search' || target.id === 'filter-weight-min' || target.id === 'filter-weight-max')) {
      if (catalogueDebounce !== undefined) window.clearTimeout(catalogueDebounce);
      catalogueDebounce = window.setTimeout(() => {
        updateCatalogue(root, { history: catalogueSheetOpen ? 'none' : 'push', resetPage: true });
      }, 300);
    }
    if (target.name === 'message') {
      const count = root.querySelector<HTMLElement>('#message-count');
      if (count) count.textContent = `${target.value.length} / 1000`;
    }
    if (target.id.startsWith('storage-')) updateStorageEstimate(root);
    if (target.name && target.form?.id === 'sell-quote-form' && target.type !== 'file') saveDraft(target.form);
  });
  root.addEventListener('change', event => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
    if (hasCatalogue && (target.id.startsWith('catalogue-') || target.id.startsWith('filter-'))) {
      applyCatalogueChange(target.id !== 'catalogue-sort' && target.id !== 'filter-weight-unit');
    }
    if (target.type === 'file' && target.form?.id === 'sell-quote-form') {
      const files = target.files;
      if (files && (files.length > 5 || [...files].some(file => !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024))) {
        target.value = '';
        showFormMessage(root.querySelector<HTMLElement>('#quote-status'), 'Choose up to five image files, each smaller than 5 MB.');
      }
    }
    if (target.name && target.form?.id === 'sell-quote-form') saveDraft(target.form);
  });
  root.addEventListener('keydown', event => {
    if (!hasCatalogue) return;
    if (event.key === 'Enter' && event.target instanceof HTMLInputElement && event.target.id === 'catalogue-search') {
      event.preventDefault();
      applyCatalogueChange(true);
      return;
    }
    if (!window.matchMedia('(max-width: 767px)').matches) return;
    const sheet = root.querySelector<HTMLElement>('#catalogue-filter-sheet');
    if (!sheet || sheet.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setCatalogueSheetOpen(false);
      return;
    }
    if (event.key === 'Tab') {
      const focusable = [...sheet.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),select:not([disabled]),a[href]')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  root.addEventListener('submit', event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (form.matches('[data-contact-form]')) {
      event.preventDefault();
      const status = form.querySelector<HTMLElement>('.mc-form-status');
      const honeypot = form.elements.namedItem('website');
      if (honeypot instanceof HTMLInputElement && honeypot.value) return;
      const limitKey = 'mc-contact-last-submit';
      const lastSubmit = Number(localStorage.getItem(limitKey) ?? 0);
      if (Date.now() - lastSubmit < 30_000) {
        showFormMessage(status, 'Please wait briefly before sending another enquiry.');
        return;
      }
      localStorage.setItem(limitKey, String(Date.now()));
      showFormMessage(status, `Thank you. Your enquiry has been received in this demo. Reference: MC-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${Math.random().toString(36).slice(2,6).toUpperCase()}`);
      form.reset();
    } else if (form.id === 'appointment-form') {
      event.preventDefault();
      showFormMessage(form.querySelector('.mc-form-status'), 'Appointment request saved in this demo. A time is not reserved until confirmed.');
    } else if (form.id === 'reserve-login') {
      event.preventDefault();
      const email = String(new FormData(form).get('email') ?? '');
      if (email !== 'demo@montaguecole.example') {
        showFormMessage(form.querySelector('.mc-form-status'), 'Only the clearly labelled demo account is available.');
        return;
      }
      sessionStorage.setItem('mc-demo-user', email);
      navigate('/mc-reserve/dashboard');
    } else if (form.id === 'sell-quote-form') {
      event.preventDefault();
      const step = Number(root.querySelector<HTMLProgressElement>('#quote-progress')?.value ?? 1);
      if (step < 4) {
        moveQuoteStep(root, 1);
        return;
      }
      if (!form.reportValidity()) return;
      showFormMessage(form.querySelector('#quote-status'), `Quote request submitted in this demo. No offer or instant payout is created. Reference: SQ-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${Math.random().toString(36).slice(2,6).toUpperCase()}`);
      localStorage.removeItem('mc-quote-draft');
    }
  });
  restoreCatalogueFilters(root);
  restoreDraft(root);
  updateCatalogue(root, { history: 'replace' });
  updateConverter(root);
  updateSellEstimate(root);
  updateStorageEstimate(root);
}
