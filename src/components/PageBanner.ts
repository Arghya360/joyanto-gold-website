export interface PageBannerProps {
  title?: string;
}

export function renderPageBanner(props?: PageBannerProps): string {
  const title = props?.title || 'Montague Cole Bullion Catalogue';
  return `
    <div class="shop-title-banner-wrap">
      <div class="shop-container">
        <div class="shop-title-banner">
          <h1 class="shop-banner-heading">${title}</h1>
        </div>
      </div>
    </div>
  `;
}
