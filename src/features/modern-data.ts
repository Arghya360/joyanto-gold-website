import goldBar1gImage from '../assets/catalogue/1 g Gold Bar.png';
import goldBar5gImage from '../assets/catalogue/5 g Gold Bar.png';
import goldBar10gImage from '../assets/catalogue/10 g Gold Bar.png';
import goldBar20gImage from '../assets/catalogue/20 g Gold Bar.png';
import goldBar50gImage from '../assets/catalogue/50 g Gold Bar.png';
import goldBar100gImage from '../assets/catalogue/100 g Gold Bar.png';
import goldBar1kgImage from '../assets/catalogue/1 kg Gold Bar.png';
import silverBar100gImage from '../assets/catalogue/100 g Silver Bar.png';
import silverBar250gImage from '../assets/catalogue/250 g Silver Bar.png';
import silverBar500gImage from '../assets/catalogue/500 g Silver Bar.png';
import silverBar1kgImage from '../assets/catalogue/1 kg Silver Bar.png';
import dubaiGoldCoinImage from '../assets/catalogue/1 oz Dubai Gold Coin.png';
import dubaiSilverCoinImage from '../assets/catalogue/1 oz Dubai Silver Coin.png';
import dubaiCollectionPrototypeImage from '../assets/catalogue/Dubai Collection Burj Khalifa Prototype.png';
import presentationGiftBoxImage from '../assets/catalogue/Presentation Gift Box.png';

export interface CatalogueProduct {
  id: number;
  slug: string;
  name: string;
  metal: 'Gold' | 'Silver' | 'Gift range';
  grams: number;
  fineness: string;
  category: 'Gold Bars' | 'Silver Bars' | 'Gold Coins' | 'Silver Coins' | 'Dubai Collection' | 'Gift Range';
  priceAed?: number;
  featured?: boolean;
  featuredOrder?: number;
  isNew?: boolean;
}

export function formatCataloguePriceAed(price: number): string {
  return `AED ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const catalogueItems: CatalogueProduct[] = [
  { id: 1001, slug: '1-g-gold-bar', name: '1 g Gold Bar', metal: 'Gold', grams: 1, fineness: 'Placeholder', category: 'Gold Bars', priceAed: 542.91, featured: true, featuredOrder: 1 },
  { id: 1002, slug: '5-g-gold-bar', name: '5 g Gold Bar', metal: 'Gold', grams: 5, fineness: 'Placeholder', category: 'Gold Bars', priceAed: 2566.49 },
  { id: 1003, slug: '10-g-gold-bar', name: '10 g Gold Bar', metal: 'Gold', grams: 10, fineness: 'Placeholder', category: 'Gold Bars', priceAed: 5058.95, featured: true, featuredOrder: 2 },
  { id: 1004, slug: '20-g-gold-bar', name: '20 g Gold Bar', metal: 'Gold', grams: 20, fineness: 'Placeholder', category: 'Gold Bars', priceAed: 10200 },
  { id: 1005, slug: '50-g-gold-bar', name: '50 g Gold Bar', metal: 'Gold', grams: 50, fineness: 'Placeholder', category: 'Gold Bars', priceAed: 25122.03, featured: true, featuredOrder: 3 },
  { id: 1006, slug: '100-g-gold-bar', name: '100 g Gold Bar', metal: 'Gold', grams: 100, fineness: 'Placeholder', category: 'Gold Bars', priceAed: 50000, featured: true, featuredOrder: 4 },
  { id: 1007, slug: '1-kg-gold-bar', name: '1 kg Gold Bar', metal: 'Gold', grams: 1000, fineness: 'Placeholder', category: 'Gold Bars', priceAed: 495000, featured: true, featuredOrder: 5 },
  { id: 1008, slug: '100-g-silver-bar', name: '100 g Silver Bar', metal: 'Silver', grams: 100, fineness: 'Placeholder', category: 'Silver Bars', priceAed: 350, featured: true, featuredOrder: 6 },
  { id: 1009, slug: '250-g-silver-bar', name: '250 g Silver Bar', metal: 'Silver', grams: 250, fineness: 'Placeholder', category: 'Silver Bars', priceAed: 800 },
  { id: 1010, slug: '500-g-silver-bar', name: '500 g Silver Bar', metal: 'Silver', grams: 500, fineness: 'Placeholder', category: 'Silver Bars', priceAed: 1550 },
  { id: 1011, slug: '1-kg-silver-bar', name: '1 kg Silver Bar', metal: 'Silver', grams: 1000, fineness: 'Placeholder', category: 'Silver Bars', priceAed: 3000, featured: true, featuredOrder: 7 },
  { id: 1012, slug: '1-oz-dubai-gold-coin', name: '1 oz Dubai Gold Coin', metal: 'Gold', grams: 31.1035, fineness: 'Placeholder', category: 'Gold Coins', priceAed: 17332, featured: true, featuredOrder: 8 },
  { id: 1013, slug: '1-oz-dubai-silver-coin', name: '1 oz Dubai Silver Coin', metal: 'Silver', grams: 31.1035, fineness: 'Placeholder', category: 'Silver Coins', priceAed: 381 },
  { id: 1014, slug: 'dubai-collection-burj-prototype', name: 'Dubai Collection Burj Khalifa Prototype', metal: 'Gold', grams: 10, fineness: 'Placeholder', category: 'Dubai Collection' },
  { id: 1015, slug: 'gift-presentation-box', name: 'Presentation Gift Box', metal: 'Gift range', grams: 0, fineness: 'Not applicable', category: 'Gift Range', priceAed: 2500 },
];

export const catalogueImages: Partial<Record<CatalogueProduct['slug'], string>> = {
  '1-g-gold-bar': goldBar1gImage,
  '5-g-gold-bar': goldBar5gImage,
  '10-g-gold-bar': goldBar10gImage,
  '20-g-gold-bar': goldBar20gImage,
  '50-g-gold-bar': goldBar50gImage,
  '100-g-gold-bar': goldBar100gImage,
  '1-kg-gold-bar': goldBar1kgImage,
  '100-g-silver-bar': silverBar100gImage,
  '250-g-silver-bar': silverBar250gImage,
  '500-g-silver-bar': silverBar500gImage,
  '1-kg-silver-bar': silverBar1kgImage,
  '1-oz-dubai-gold-coin': dubaiGoldCoinImage,
  '1-oz-dubai-silver-coin': dubaiSilverCoinImage,
  'dubai-collection-burj-prototype': dubaiCollectionPrototypeImage,
  'gift-presentation-box': presentationGiftBoxImage,
};
