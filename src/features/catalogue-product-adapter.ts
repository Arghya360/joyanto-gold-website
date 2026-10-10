import type { Product, ProductStockStatus, ShopCategory } from '../data/products';
import { catalogueImages, formatCataloguePriceAed } from './modern-data';
import type { CatalogueProduct } from './modern-data';

const categoryMap: Record<CatalogueProduct['category'], ShopCategory> = {
  'Gold Bars': 'gold-bars',
  'Silver Bars': 'silver-bars',
  'Gold Coins': 'gold-coins',
  'Silver Coins': 'silver-coins',
  'Dubai Collection': 'dubai-collection',
  'Gift Range': 'gift-range',
};

export function toStorefrontProduct(product: CatalogueProduct): Product {
  const stockStatus: ProductStockStatus = product.category === 'Dubai Collection' ? 'pre_order' : 'unconfirmed';
  const priceAed = product.priceAed ?? 0;
  const isGift = product.category === 'Gift Range';
  const isBar = product.category === 'Gold Bars' || product.category === 'Silver Bars';
  const weightUnit = product.grams >= 1000 && product.grams % 1000 === 0
    ? 'kg'
    : Math.abs(product.grams - 31.1035) < 0.001 ? 'oz' : 'g';
  const weightValue = weightUnit === 'kg'
    ? product.grams / 1000
    : weightUnit === 'oz' ? product.grams / 31.1035 : product.grams;

  return {
    id: product.id,
    slug: product.slug,
    title: product.name,
    image: catalogueImages[product.slug] ?? '',
    price: priceAed,
    priceDisplay: product.priceAed === undefined ? 'Price unavailable' : formatCataloguePriceAed(priceAed),
    regularPrice: priceAed,
    category: categoryMap[product.category],
    metal: product.metal === 'Gold' ? 'gold' : product.metal === 'Silver' ? 'silver' : 'other',
    type: isGift ? 'gift' : isBar ? 'bar' : 'coin',
    weightValue: product.grams > 0 ? weightValue : undefined,
    weightUnit: product.grams > 0 ? weightUnit : undefined,
    fineWeightGrams: undefined,
    priceSource: product.priceAed === undefined ? 'unavailable' : 'indicative',
    stockStatus,
    badge: stockStatus === 'pre_order' ? 'Pre-order' : '',
    packSize: product.grams > 0 ? `${product.grams} g` : undefined,
    description: product.priceAed === undefined
      ? 'Product specifications and price are awaiting client confirmation.'
      : 'Indicative Dubai price supplied by the client. Availability and order terms are awaiting confirmation.',
  };
}
