export interface HomeProductSelection {
  featured?: boolean;
  featuredOrder?: number;
  isNew?: boolean;
  category: string;
}

export function getFeaturedProducts<T extends HomeProductSelection>(products: readonly T[]): T[] {
  return products
    .filter(product => product.featured === true)
    .sort((first, second) => (first.featuredOrder ?? Number.MAX_SAFE_INTEGER) - (second.featuredOrder ?? Number.MAX_SAFE_INTEGER));
}

export function getNewProducts<T extends HomeProductSelection>(products: readonly T[], limit = 8): T[] {
  return products.filter(product => product.isNew === true).slice(0, limit);
}

export function getPreOrderProducts<T extends HomeProductSelection>(products: readonly T[]): T[] {
  return products.filter(product => product.category === 'Dubai Collection');
}
