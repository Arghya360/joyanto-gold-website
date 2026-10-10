import assert from 'node:assert/strict';
import test from 'node:test';
import { getFeaturedProducts, getNewProducts, getPreOrderProducts } from './home-products.ts';

const products = [
  { slug: 'latest', category: 'Gold Bars', isNew: true },
  { slug: 'featured-second', category: 'Gold Bars', featured: true, featuredOrder: 2 },
  { slug: 'dubai', category: 'Dubai Collection' },
  { slug: 'featured-first', category: 'Silver Bars', featured: true, featuredOrder: 1 },
];

test('featured products are selected and ordered by featuredOrder', () => {
  assert.deepEqual(getFeaturedProducts(products).map(product => product.slug), ['featured-first', 'featured-second']);
});

test('new arrivals are selected only when flagged and capped at eight', () => {
  const arrivals = Array.from({ length: 10 }, (_, index) => ({
    slug: `new-${index}`,
    category: 'Gold Bars',
    isNew: true,
  }));
  assert.equal(getNewProducts(products).length, 1);
  assert.equal(getNewProducts(arrivals).length, 8);
});

test('pre-order selection only includes Dubai Collection entries', () => {
  assert.deepEqual(getPreOrderProducts(products).map(product => product.slug), ['dubai']);
  assert.deepEqual(getNewProducts(products.filter(product => !product.isNew)), []);
});
