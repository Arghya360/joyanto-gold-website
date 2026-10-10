import assert from 'node:assert/strict';
import test from 'node:test';
import {
  computeFacets,
  createEmptyFilters,
  filterProducts,
  filtersEqual,
  getWeightOptions,
  matchesProductQuery,
  parseFilterUrl,
  serializeFilterUrl,
} from './shop-filters.ts';

function product(id, overrides = {}) {
  const defaults = {
    id,
    title: `${id} g Gold Bar`,
    image: '/gold-bar.png',
    price: id * 100,
    priceDisplay: `AED ${id * 100}`,
    regularPrice: id * 100,
    category: 'gold-bars',
    metal: 'gold',
    type: 'bar',
    weightValue: id,
    weightUnit: 'g',
    fineWeightGrams: id,
    priceSource: 'indicative',
    stockStatus: 'in_stock',
    badge: 'In stock',
    slug: `${id}-g-gold-bar`,
  };
  return { ...defaults, ...overrides };
}

const products = [
  product(10, { price: 367.25 }),
  product(20, { category: 'silver-bars', metal: 'silver', title: '20 g Silver Bar', stockStatus: 'out_of_stock' }),
  product(1000, { title: '1 kg Gold Bar', weightValue: 1, weightUnit: 'kg', price: 1000 }),
  product(31, { title: '1 oz Dubai Gold Coin', category: 'gold-coins', type: 'coin', weightValue: 1, weightUnit: 'oz' }),
  product(5, { title: 'Dubai Collection Burj Khalifa', category: 'dubai-collection', stockStatus: 'pre_order' }),
  product(999, { title: 'Presentation Gift Box', category: 'gift-range', metal: 'other', type: 'gift', weightValue: undefined, weightUnit: undefined }),
];

test('category facets are computed from products and sum to the product total', () => {
  const facets = computeFacets(products, createEmptyFilters());
  assert.equal(Object.values(facets.categoryCounts).reduce((sum, count) => sum + count, 0), products.length);
  assert.equal(facets.categoryCounts['gold-bars'], 2);
  assert.equal(facets.categoryCounts['silver-bars'], 1);
  assert.equal(facets.categoryCounts['dubai-collection'], 1);
});

test('weight options normalize equivalent measurements and sort by weight', () => {
  const equivalentWeights = [
    product(1, { weightValue: 1000, weightUnit: 'g' }),
    product(2, { weightValue: 1, weightUnit: 'kg' }),
    product(3, { weightValue: 31.1035, weightUnit: 'g' }),
    product(4, { weightValue: 1, weightUnit: 'oz' }),
  ];
  const options = getWeightOptions(equivalentWeights);
  assert.equal(options.filter(option => option.value === '1kg').length, 1);
  assert.equal(options.filter(option => option.value === '1oz').length, 1);
  assert.deepEqual(options.map(option => option.value), ['1oz', '1kg']);
});

test('faceted category and stock counts respect other selected filters', () => {
  const facets = computeFacets(products, {
    ...createEmptyFilters(),
    stock: ['in_stock'],
  });
  assert.equal(facets.categoryCounts['silver-bars'], 0);
  assert.equal(facets.categoryCounts['gold-bars'], 2);
  assert.equal(facets.stockCounts.in_stock, 4);
  assert.equal(facets.stockCounts.pre_order, 1);
});

test('search matches compact weights, ounces, and metal names', () => {
  assert.equal(matchesProductQuery(products[0], '10g'), true);
  assert.equal(matchesProductQuery(products[3], 'oz'), true);
  assert.equal(matchesProductQuery(products[1], 'silver'), true);
  assert.equal(matchesProductQuery(products[4], '   '), true);
});

test('price filters and facet bounds use the selected currency conversion', () => {
  const usdPrice = 100;
  const matching = filterProducts(products, {
    ...createEmptyFilters(),
    minPrice: usdPrice,
    maxPrice: usdPrice,
  }, 'USD');
  assert.deepEqual(matching.map(item => item.id), [10]);
  const facets = computeFacets(products, createEmptyFilters(), 'USD');
  assert.ok(facets.minPrice < facets.maxPrice);
});

test('URL parsing ignores invalid filter values and serialization preserves sort and resets page', () => {
  const parsed = parseFilterUrl(
    '?sort=featured&page=4&q=%20gold%20&category=gold-bars,not-a-category&weight=10g,999g&stock=in_stock,unknown&minPrice=-5&maxPrice=500',
    products,
  );
  assert.equal(parsed.sort, 'featured');
  assert.equal(parsed.page, 4);
  assert.equal(parsed.filters.query, 'gold');
  assert.deepEqual(parsed.filters.categories, ['gold-bars']);
  assert.deepEqual(parsed.filters.weights, ['10g']);
  assert.deepEqual(parsed.filters.stock, ['in_stock']);
  assert.equal(parsed.filters.minPrice, null);
  assert.equal(parsed.filters.maxPrice, 500);

  const search = serializeFilterUrl('?sort=featured&page=4&campaign=spring', parsed.filters, true);
  const params = new URLSearchParams(search);
  assert.equal(params.get('sort'), 'featured');
  assert.equal(params.get('page'), '1');
  assert.equal(params.get('campaign'), 'spring');
  assert.equal(params.get('q'), 'gold');
});

test('reset state contains no active selections', () => {
  const reset = createEmptyFilters();
  assert.equal(filtersEqual(reset, {
    query: '',
    categories: [],
    weights: [],
    minPrice: null,
    maxPrice: null,
    stock: [],
  }), true);
});
