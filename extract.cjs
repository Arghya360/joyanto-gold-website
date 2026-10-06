const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../falaqfood.borbila.net/index.html'), 'utf8');

// Find all product titles, images, categories, and prices
const products = [];
const seenTitles = new Set();

// Let's find each e-loop-item that has class product
const loopItemRegex = /<div data-elementor-type="loop-item"[^>]*class="[^"]*product[^"]*"[\s\S]*?(?=(?:<div data-elementor-type="loop-item"|$))/g;
let match;

while ((match = loopItemRegex.exec(html)) !== null) {
  const block = match[0];
  
  // Extract title
  const titleMatch = block.match(/<h1 class="product_title[^>]*><a[^>]*>(.*?)<\/a><\/h1>/);
  if (!titleMatch) continue;
  const title = titleMatch[1].trim();
  if (seenTitles.has(title)) continue;
  seenTitles.add(title);
  
  // Extract image
  const imgMatch = block.match(/<img[^>]*src="([^"]*)"[^>]*>/);
  let image = imgMatch ? imgMatch[1] : '';
  // Convert https://falaqfood.borbila.net/wp-content/uploads/ to /uploads/
  image = image.replace('https://falaqfood.borbila.net/wp-content/uploads/', '/uploads/');
  
  // Extract price
  const priceMatches = [...block.matchAll(/<bdi>([\d,]+)<span[^>]*>.*?<\/bdi>/g)];
  let price = 0;
  let regularPrice = null;
  if (priceMatches.length === 1) {
    price = parseInt(priceMatches[0][1].replace(/,/g, ''), 10);
  } else if (priceMatches.length >= 2) {
    // If range or sale:
    // Check if del and ins exist
    if (block.includes('<del>') && block.includes('<ins>')) {
      const delMatch = block.match(/<del[^>]*>[\s\S]*?<bdi>([\d,]+)<\/bdi>[\s\S]*?<\/del>/);
      const insMatch = block.match(/<ins[^>]*>[\s\S]*?<bdi>([\d,]+)<\/bdi>[\s\S]*?<\/ins>/);
      if (delMatch && insMatch) {
        regularPrice = parseInt(delMatch[1].replace(/,/g, ''), 10);
        price = parseInt(insMatch[1].replace(/,/g, ''), 10);
      }
    } else {
      // Range: e.g. 100 - 420
      price = parseInt(priceMatches[0][1].replace(/,/g, ''), 10);
      const maxPrice = parseInt(priceMatches[1][1].replace(/,/g, ''), 10);
      regularPrice = maxPrice;
    }
  }

  // Extract category from classes
  const catMatch = block.match(/product_cat-([a-z0-9-]+)/);
  const category = catMatch ? catMatch[1] : 'general';

  // Extract badges (discount percentage if any)
  const badgeMatch = block.match(/<span class="borbila-sale-badge[^>]*>(.*?)<\/span>/);
  const badge = badgeMatch && !badgeMatch[1].includes('empty') ? badgeMatch[1].trim() : '';

  products.push({
    id: products.length + 1,
    title,
    image,
    price: price || 250,
    regularPrice: regularPrice || Math.round((price || 250) * 1.15),
    category,
    badge,
    rating: 5.0,
    reviewsCount: Math.floor(Math.random() * 20) + 5,
    unit: '১ কেজি / ১ প্যাক',
    inStock: true
  });
}

console.log('Extracted products count:', products.length);
fs.writeFileSync(path.join(__dirname, 'src/data/products.json'), JSON.stringify(products, null, 2));
