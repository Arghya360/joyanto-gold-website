export type FooterPendingType = 'client' | 'legal';

export type FooterItem = {
  label: string;
  path?: string;
  pending?: FooterPendingType;
  comingSoon?: boolean;
};

export type FooterGroup = {
  title: string;
  items: readonly FooterItem[];
};

export const FOOTER_GROUPS: readonly FooterGroup[] = [
  {
    title: 'Shop',
    items: [
      { label: 'All Products', path: '/catalogue' },
      { label: 'Gold Bars', path: '/catalogue?category=gold-bars' },
      { label: 'Silver Bars', path: '/catalogue?category=silver-bars' },
      { label: 'Sovereign Coins', path: '/catalogue?category=coins' },
      { label: 'Dubai Collection', path: '/catalogue?category=dubai-collection' },
      { label: 'Live Prices', path: '/live-prices' },
    ],
  },
  {
    title: 'Services',
    items: [
      { label: 'Sell to Us', path: '/sell-to-us' },
      { label: 'Allocated Storage', path: '/storage', pending: 'legal' },
      { label: 'Insured Transit', path: '/storage', pending: 'legal' },
      { label: 'MC Reserve', path: '/mc-reserve' },
      { label: 'Private Assets', path: '/about#private-assets', pending: 'client' },
      { label: 'Private Consultation', path: '/contact?type=private-consultation' },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'About Our House', path: '/about' },
      { label: 'Depository Standards', path: '/storage', pending: 'legal' },
      { label: 'Dubai Depository Address', path: '/storage', pending: 'client' },
      { label: 'Contact', path: '/contact' },
    ],
  },
  {
    title: 'Legal & Trust',
    items: [
      { label: 'Terms of Sale', pending: 'legal', comingSoon: true },
      { label: 'Privacy Policy', pending: 'legal', comingSoon: true },
      { label: 'Price-Lock Terms', pending: 'legal', comingSoon: true },
      { label: 'Returns & Cancellation', pending: 'legal', comingSoon: true },
      { label: 'Complaints Procedure', pending: 'legal', comingSoon: true },
      { label: 'Cookie Policy', pending: 'legal', comingSoon: true },
      { label: 'Regulatory Disclosures', pending: 'legal', comingSoon: true },
    ],
  },
];

export const SHOW_PLACEHOLDER_MARKERS = import.meta.env.DEV;
export const SHOW_APP_BADGES = false;
export const FOOTER_HOME_PATH = '/';
export const DEVELOPER_PROFILE_URL = 'https://www.linkedin.com/in/arghyabiswas360/';

export const SOCIAL_LINKS = [
  { platform: 'Instagram', url: 'https://www.instagram.com/', pending: true },
  { platform: 'Facebook', url: 'https://www.facebook.com/', pending: true },
  { platform: 'YouTube', url: 'https://www.youtube.com/', pending: true },
  { platform: 'X', url: 'https://x.com/', pending: true },
] as const;

export const APP_BADGES = [
  { label: 'App Store', url: '#pending-client-app-store', pending: true },
  { label: 'Google Play', url: '#pending-client-google-play', pending: true },
] as const;

export const ACCEPTED_PAYMENTS: readonly { label: string; pending: boolean }[] = [
  { label: 'Bank transfer', pending: false },
  { label: 'Visa', pending: true },
  { label: 'Mastercard', pending: true },
  { label: 'American Express', pending: true },
];
