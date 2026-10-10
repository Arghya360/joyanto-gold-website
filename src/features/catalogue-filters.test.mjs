import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CATALOGUE_CATEGORIES,
  catalogueFiltersActive,
  catalogueWeightPreset,
  computeCatalogueFacets,
  createEmptyCatalogueFilters,
  filterCatalogueProducts,
  formatCatalogueWeight,
  gramsForWeight,
  parseCatalogueNumber,
  parseCatalogueUrl,
  serializeCatalogueUrl,
  validateWeightRange,
} from './catalogue-filters.ts';

const products = [
  { slug: 'gold-10', name: '10 g Gold Bar', category: 'Gold Bars', metal: 'Gold', grams: 10 },
  { slug: 'gold-kilo', name: '1 kg Gold Bar', category: 'Gold Bars', metal: 'Gold', grams: 1000 },
  { slug: 'silver-250', name: '250 g Silver Bar', category: 'Silver Bars', metal: 'Silver', grams: 250 },
  { slug: 'gold-coin', name: '1 oz Dubai Gold Coin', category: 'Gold Coins', metal: 'Gold', grams: 31.1035 },
  { slug: 'dubai-prototype', name: 'Burj Khalifa prototype', category: 'Dubai Collection', metal: 'other', grams: 10 },
  { slug: 'gift-box', name: 'Presentation gift box', category: 'Gift Range', metal: 'other', grams: 0 },
];

test('all six category counts come from the product records and sum to the total', () => {
  const facets = computeCatalogueFacets(products, createEmptyCatalogueFilters());
  assert.equal(facets.categories.length, 6);
  assert.equal(facets.categories.reduce((total, category) => total + category.count, 0), products.length);
  assert.equal(facets.categories.find(category => category.value === 'gold-bars')?.count, 2);
  assert.deepEqual(facets.categories.map(category => category.value), CATALOGUE_CATEGORIES.map(category => category.value));
});

test('weight conversion normalizes kilograms and troy ounces', () => {
  assert.equal(gramsForWeight(1, 'kg'), 1000);
  assert.equal(gramsForWeight(1, 'oz'), 31.1035);
  assert.equal(formatCatalogueWeight(1000), '1 kg');
  assert.equal(formatCatalogueWeight(31.1035), '1 oz');
});

test('facets count options against the other active filters', () => {
  const filters = { ...createEmptyCatalogueFilters(), metal: 'Gold' };
  const facets = computeCatalogueFacets(products, filters);
  assert.equal(facets.categories.find(category => category.value === 'silver-bars')?.count, 0);
  assert.equal(facets.categories.find(category => category.value === 'gold-bars')?.count, 2);
  assert.equal(facets.metals.find(metal => metal.value === 'Silver')?.count, 1);
});

test('type and known availability filters use only the recorded catalogue categories', () => {
  assert.deepEqual(filterCatalogueProducts(products, { ...createEmptyCatalogueFilters(), type: 'coin' }).map(item => item.slug), ['gold-coin']);
  assert.deepEqual(filterCatalogueProducts(products, { ...createEmptyCatalogueFilters(), availability: 'pre_order' }).map(item => item.slug), ['dubai-prototype']);
  assert.deepEqual(filterCatalogueProducts(products, { ...createEmptyCatalogueFilters(), availability: 'enquire' }).map(item => item.slug), []);
});

test('filtering searches product, metal, category and normalized weight wording', () => {
  assert.deepEqual(filterCatalogueProducts(products, { ...createEmptyCatalogueFilters(), query: '10g' }).map(item => item.slug), ['gold-10', 'dubai-prototype']);
  assert.deepEqual(filterCatalogueProducts(products, { ...createEmptyCatalogueFilters(), query: 'oz' }).map(item => item.slug), ['gold-coin']);
  assert.deepEqual(filterCatalogueProducts(products, { ...createEmptyCatalogueFilters(), query: 'silver' }).map(item => item.slug), ['silver-250']);
  assert.deepEqual(filterCatalogueProducts(products, { ...createEmptyCatalogueFilters(), query: 'kilo' }).map(item => item.slug), ['gold-kilo']);
});

test('weight filters convert selected units and reject invalid ranges', () => {
  const filters = { ...createEmptyCatalogueFilters(), minWeight: 0.25, maxWeight: 0.25, weightUnit: 'kg' };
  assert.deepEqual(filterCatalogueProducts(products, filters).map(item => item.slug), ['silver-250']);
  assert.equal(validateWeightRange(10, 9), false);
  assert.equal(validateWeightRange(-1, 9), false);
  assert.equal(validateWeightRange(null, 0), true);
  assert.equal(parseCatalogueNumber('10 g'), 10);
  assert.equal(parseCatalogueNumber('-10'), null);
});

test('weight presets supply the intended inclusive bounds', () => {
  assert.deepEqual(catalogueWeightPreset('up-to-10'), { min: null, max: 10 });
  assert.deepEqual(catalogueWeightPreset('10-to-100'), { min: 10, max: 100 });
  assert.deepEqual(catalogueWeightPreset('100-to-1000'), { min: 100, max: 1000 });
  assert.deepEqual(catalogueWeightPreset('1000-plus'), { min: 1000, max: null });
});

test('URL parsing ignores invalid filter and sort values while serialization preserves unrelated state', () => {
  const parsed = parseCatalogueUrl('?sort=invalid&page=3&q=%20gold%20&category=bad&metal=platinum&type=other&stock=available&minW=-5&maxW=500&wUnit=stone&view=table');
  assert.equal(parsed.sort, 'featured');
  assert.equal(parsed.view, 'grid');
  assert.deepEqual(parsed.filters, { ...createEmptyCatalogueFilters(), query: 'gold', maxWeight: 500 });

  const search = serializeCatalogueUrl('?sort=featured&page=3&campaign=spring', {
    ...createEmptyCatalogueFilters(), query: ' gold ', category: 'gold-bars', minWeight: 10, maxWeight: 100,
  }, 'featured', 'list', true);
  const params = new URLSearchParams(search);
  assert.equal(params.get('sort'), 'featured');
  assert.equal(params.get('page'), '1');
  assert.equal(params.get('campaign'), 'spring');
  assert.equal(params.get('q'), 'gold');
  assert.equal(params.get('category'), 'gold-bars');
  assert.equal(params.get('minW'), '10');
  assert.equal(params.get('view'), 'list');
});

test('reset clears all filter state while leaving sort outside the filter model', () => {
  const empty = createEmptyCatalogueFilters();
  assert.equal(catalogueFiltersActive(empty), false);
  assert.equal(catalogueFiltersActive({ ...empty, query: 'gold' }), true);
});
