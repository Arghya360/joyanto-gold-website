# Content Audit & Map — Montague Cole Bullion Migration

**Client:** Montague Cole Bullion (part of Montague Cole Private Assets, Dubai, UAE)  
**Tagline:** "Dubai bullion. Global delivery. A higher standard."  
**Voice:** Calm, precise, confident, understated. No hype words, no urgency gimmicks.  
**Audit Date:** October 6, 2026  
**Scope:** Complete inventory of all existing content locations across the codebase prior to migration.

---

## 1. Document Head & Global SEO

### `index.html`
| Content Field / Element | Current Existing Text / Value | Notes |
| :--- | :--- | :--- |
| `<html lang="...">` | `bn` (Bengali) | Language attribute |
| `<title>` | `Shop \| Archives: Shop – Falaq Food \| ১০০% প্রাকৃতিক, অর্গানিক ও নিরাপদ খাবারের অনলাইন শপ` | Global site page title |
| `<meta name="description">` | `ফলক ফুড (Falaq Food) Shop Page – খাঁটি মধু, কাঠিগানি ভাঙা সরিষার তেল, সুগন্ধি চাল, ডাল, গাওয়া ঘি ও অর্গানিক সুপারফুড সরাসরি আপনার দোরগোড়ায়। ক্যাশ অন ডেলিভারি সুবিধা।` | SEO meta description |
| `<meta property="og:title">` | `Falaq Food Shop – Archives: Shop` | Open Graph title |
| `<meta property="og:description">` | `Browse all natural, organic Falaq Food products – spices, nuts, rice, dal, sweeteners and more.` | Open Graph description |
| `<meta name="theme-color">` | `#078B4B` (Falaq Food Green) | Mobile browser address bar tint |

---

## 2. Global Navigation & Header

### `src/components/Header.ts`
| Location / Selector | Current Existing Text / Label | Notes |
| :--- | :--- | :--- |
| `.mobile-nav-toggle` | `aria-label="Toggle navigation"` | Accessibility label |
| `#header-brand-logo img` | `alt="E-Commerce Shopping"` | Brand logo alt text |
| `.desktop-main-nav` links | `Home`, `Shop`, `Offers`, `New Arrivals` | Primary desktop nav items |
| `#top-search-input` | `placeholder="Search for Products..."` | Search box placeholder |
| `#btn-search-clear` | `aria-label="Clear search"`, `title="Clear"` | Search clear button |
| `#btn-top-search` | `aria-label="Search"` | Search action button |
| `#search-suggestions-dropdown` | `aria-label="Search suggestions"` | Dropdown accessibility label |
| `#btn-user-profile` | `title="Account"`, `aria-label="User Account"` | Header user account icon |
| `#btn-header-cart` | `title="Shopping Cart"`, `aria-label="Shopping Cart"` | Header cart basket icon |
| `.second-category-nav` | Items rendered dynamically from `NAV_CATEGORIES` (`Honey`, `Nuts & Fruits`, `Cooking Oil`, `Dal & Pulses`, `Flour & Atta`, `Spices & Masala`, `Rice`, `Sweeteners`, `Superfoods`, `Organic Foods`) | Secondary horizontal category navigation bar |
| `#mobile-nav-drawer .mobile-drawer-header img` | `alt="E-Commerce Shopping"` | Mobile drawer logo alt |
| `#btn-close-mobile-nav` | `aria-label="Close menu"`, `&times;` | Mobile drawer close icon |
| `.mobile-menu-links` | `Home`, `Shop`, `Offers`, `New Arrivals`, `Customer Login`, `Shopping Cart`, `Wishlist` | Mobile navigation menu items |
| `.mobile-drawer-categories h4` | `Categories` | Mobile categories drawer title |
| `.mobile-cat-link` | Items rendered dynamically from `NAV_CATEGORIES` | Mobile category list |
| `.mobile-bottom-nav-item[data-bottom-menu]` | `aria-label="Open menu"`, `<span>Menu</span>` | Mobile sticky bottom nav item |
| `.mobile-bottom-nav-item[data-route="shop"]` | `<span>Shop</span>` | Mobile sticky bottom nav item |
| `.mobile-bottom-home` | `<span>Home</span>` | Mobile sticky bottom nav item |
| `.mobile-bottom-nav-item[data-route="cart"]` | `<span>Cart</span>` | Mobile sticky bottom nav item |
| `.mobile-bottom-nav-item[data-route="login"]` | `<span>Account</span>` | Mobile sticky bottom nav item |

---

## 3. Global Footer

### `src/components/Footer.ts`
| Location / Selector | Current Existing Text / Label | Notes |
| :--- | :--- | :--- |
| `.footer-brand-logo` | `aria-label="E-Commerce Shopping Home"`, `alt="E-Commerce Shopping"` | Footer logo link & alt text |
| `.footer-inbox-heading` | `GET FRESH FOOD<br />IN YOUR INBOX` | Newsletter headline |
| `.footer-inbox-input` | `placeholder="Enter your email address"`, `aria-label="Email address"` | Newsletter input placeholder |
| `.footer-inbox-submit-btn` | `aria-label="Subscribe to newsletter"` | Newsletter submit button |
| Inline newsletter toast | `Thank you for subscribing!` | Toast on newsletter submit |
| `.footer-follow-label` | `Follow Us` | Social icons header |
| Social links | `aria-label="Instagram"`, `Facebook`, `YouTube`, `Twitter` | Social links labels |
| App store badges | `Download on the App Store`, `GET IT ON Google Play` | Mobile app badges |
| `.footer-we-accept-text` | `We Accept` | Payment methods header |
| `.footer-paywith-ssl-img` | `alt="Payment Methods"` | Payment gateway banner alt |
| Column 1: `.footer-nav-col-title` | `SHOP` | Footer Nav Column 1 Heading |
| Column 1 links | `All Products`, `Fresh Fruits`, `Vegetables`, `Dairy & Eggs`, `Meat & Seafood`, `Bakery`, `Gift Cards` | Column 1 link labels |
| Column 2: `.footer-nav-col-title` | `LEARN` | Footer Nav Column 2 Heading |
| Column 2 links | `About Us`, `Blog`, `Healthy Recipes`, `Organic Guide`, `Nutrition Tips`, `Help & FAQ`, `Store Locator` | Column 2 link labels |
| Column 3: `.footer-nav-col-title` | `ABOUT` | Footer Nav Column 3 Heading |
| Column 3 links | `Our Story`, `Careers`, `Track Your Order`, `Shipping & Returns`, `Contact Us`, `Open Your Store`, `Privacy Policy`, `Terms of Service` | Column 3 link labels |
| `.footer-currency-dropdown` | `Bangladesh (USD $)`, `Bangladesh (BDT ৳)`, `United States (USD $)`, `United Kingdom (GBP £)` | Currency selector options |
| `.footer-currency-dropdown` | `aria-label="Select Country and Currency"` | Dropdown accessibility label |
| `.footer-developer-credit` | `Designed & Developed by Arghya Biswas` | Developer attribution text |
| `.footer-copyright-terms-right` | `© 2026 Fresh Food. All rights reserved.`, `Privacy`, `Terms` | Copyright and bottom legal links |

---

## 4. Categories Data

### `src/data/categories.ts`
| Identifier | Current English Name (`name`) | Current Bengali Name (`nameBn`) | Count |
| :--- | :--- | :--- | :--- |
| `spices-masala` | Spices & Masala | মসলা গুঁড়া | 6 |
| `dal-pulses` | Dal & Pulses | ডাল ও ডালজাতীয় | 3 |
| `nuts-fruits` | Nuts & Fruits | বাদাম ও কিশমিশ | 2 |
| `sweeteners` | Sweeteners | প্রাকৃতিক মিষ্টি | 2 |
| `rice` | Rice | সুগন্ধি চাল | 2 |
| `organic-foods` | Organic Foods | অর্গানিক ফুডস | 1 |
| `superfoods` | Superfoods | সুপারফুড | 1 |
| `flour-atta` | Flour & Atta | আটা ও ময়দা | 1 |
| `cooking-oil` | Cooking Oil | খাঁটি তেল | 1 |
| `honey` | Honey | খাঁটি মধু | 1 |

`NAV_CATEGORIES` mirrors the same 10 items in display order: `Honey`, `Nuts & Fruits`, `Cooking Oil`, `Dal & Pulses`, `Flour & Atta`, `Spices & Masala`, `Rice`, `Sweeteners`, `Superfoods`, `Organic Foods`.

---

## 5. Home Page

### `src/components/HomePage.ts`
| Location / Selector | Current Existing Text / Label | Notes |
| :--- | :--- | :--- |
| `HERO_SLIDES[0]` | Title: `খাঁটি ঘি ও প্রাকৃতিক খাবার` (Pure Ghee & Natural Food) | Hero slide 1 |
| `HERO_SLIDES[1]` | Title: `খাঁটি সুন্দরবনের মধু` (Pure Sundarbans Honey) | Hero slide 2 |
| `HERO_SLIDES[2]` | Title: `কাঠিগানি ভাঙা খাঁটি সরিষার তেল` (Wood-Pressed Mustard Oil) | Hero slide 3 |
| `HERO_SLIDES[3]` | Title: `অর্গানিক সুপারফুড ও বাদাম` (Organic Superfoods & Nuts) | Hero slide 4 |
| Side Promo 1 (`promo-1.png`) | Alt: `ঘানিভাঙা সরিষার তেল ও অন্যান্য পণ্য` | Promo tile 1 |
| Side Promo 2 (`promo-2.png`) | Alt: `খাঁটি গাওয়া ঘি ও মধু` | Promo tile 2 |
| Categories section title | `Shop by Category` | Category carousel header |
| Carousel controls | `aria-label="Previous categories"`, `aria-label="Next categories"` | Carousel buttons |
| `HOME_CATEGORIES` | 12 items (Honey, Nuts & Fruits, Organic Foods, Cooking Oil, Dal & Pulses, Flour & Atta, Honey, Nuts & Fruits, Spices & Masala, Rice, Sweeteners, Superfoods) | Category pills |
| Recent Products section title | `Recent Products` | Grid heading |
| Recent Products items | 16 products loaded from `PRODUCTS` (IDs 1–16) | Product cards |
| Product card elements | `badge` (e.g. `-6%`, `NEW`), `aria-label="Add ${p.title} to wishlist"`, `aria-label="${rating} out of 5 stars"`, `priceDisplay` (`${price}৳ – ${regularPrice}৳`), `Add to Cart` | Card markup |
| CTA Button | `SHOP ALL PRODUCTS` (`#btn-shop-all-products`) | Category CTA |
| Blogs section title | `নতুন ব্লগ পড়ুন` (Read New Blogs) | Blog section heading |
| Blog card items | Title, excerpt, tag, author, date from `BLOG_POSTS`, link `READ MORE »`, meta `No Comments` | Blog cards |
| Reviews section badge | `CUSTOMER REVIEWS` | Sub-label |
| Reviews section title | `আমাদের গ্রাহকদের অভিজ্ঞতা` (Our Customers' Experiences) | Heading |
| Review cards | Quotes, star ratings, reviewer names, roles (`ভেরিফায়েড ক্রেতা` = Verified Buyer) from `REVIEWS` | Testimonial carousel |
| Carousel controls | `aria-label="Previous reviews"`, `aria-label="Next reviews"` | Carousel buttons |
| Bottom Banners artwork alts | `চিয়া সিড পুষ্টিগুণ` (Chia Seed Nutritional Value), `প্রাকৃতিক লিচু ফুলের মধু` (Natural Litchi Honey), `মাস্টার্ড অয়েল ও খাঁটি খাবার কম্বো` (Mustard Oil Combo), `দেশের যে কোন প্রান্তে পৌঁছে যাই আমরা - ফলক ফুড` (We Deliver Across The Country) | Bottom 4 banners |

---

## 6. Shop Page & Filter Sidebar

### `src/components/PageBanner.ts`
| Location | Current Existing Text | Notes |
| :--- | :--- | :--- |
| `.shop-banner-heading` | `Archives: Shop` (default prop fallback) | Banner heading on Shop page |

### `src/components/FilterSidebar.ts`
| Section / Control | Current Existing Text / Label | Notes |
| :--- | :--- | :--- |
| Search section heading | `Search Products` | Section header |
| `#sidebar-search-input` | `placeholder="Find your product..."` | Input placeholder |
| `#btn-sidebar-search` | `aria-label="Search products"` | Submit button |
| Categories heading | `Categories` | Section toggle |
| Category items | Checkbox rows with category name & product count | From `CATEGORIES` |
| Pack Size heading | `Pack Size` | Section toggle |
| Pack sizes | `100g`, `200g`, `250g`, `400g`, `500g`, `1kg`, `2kg`, `5kg`, `1L` | Filter checkboxes |
| Price Range heading | `Price Range` | Section toggle |
| Price inputs | `Min ৳`, `Max ৳`, placeholders `0`, `5000` | Min/Max inputs & range slider |
| Average Rating heading | `Average Rating` | Section toggle |
| Rating options | `5+ stars`, `4+ stars`, `3+ stars`, `2+ stars`, `1+ stars` | Radio buttons |
| Stock Status heading | `Stock Status` | Section toggle |
| Stock options | `All Products`, `In Stock Only` | Radio buttons |
| Action buttons | `Apply Filter`, `Reset All` | Filter control buttons |

### `src/components/ProductCard.ts`
| Element | Current Existing Text / Label | Notes |
| :--- | :--- | :--- |
| `.shop-product-card` | `aria-label="View ${product.title}"` | Link accessibility |
| `.product-discount-badge` | `${product.badge}` (e.g. `-6%`) | Discount label |
| `.price-old` / `.price-current` | `${product.oldPrice}৳`, `${product.price}৳` / `${product.priceDisplay}` | Price formatting with Bangladeshi Taka symbol |
| `.shop-btn-add-to-cart` | `aria-label="Add ${product.title} to cart"`, `Add to Cart` | Cart CTA |

### `src/main.ts` (Shop view)
| Element | Current Existing Text | Notes |
| :--- | :--- | :--- |
| `.mobile-filter-toggle-btn` | `Filters` | Mobile filter button |
| `.results-count` | `${filteredProducts.length} product(s) found` | Filter count indicator |
| `.no-products-found` | `No products found`<br />`Try adjusting your filters or search term` | Empty search state |

---

## 7. Offers Page & New Arrivals Page

### `src/components/OffersPage.ts`
| Location | Current Existing Text / Label | Notes |
| :--- | :--- | :--- |
| Active Nav | `Offers` | Passed to Header |
| Hero Banner title | `Exclusive Discounts – Limited Time Only!` | Banner h1 |
| CTA Button | `More Products` (`#btn-offers-more-products`) | Bottom CTA |
| Products shown | 10 products filtered by `OFFER_PRODUCT_IDS` | Uses `renderProductCard` |

### `src/components/NewArrivalsPage.ts`
| Location | Current Existing Text / Label | Notes |
| :--- | :--- | :--- |
| Active Nav | `New Arrivals` | Passed to Header |
| Header bar title | `New Arrivals` | Heading |
| View all link | `View All`, `aria-label="View All New Arrivals"` | Header link to Shop |
| CTA Button | `More Products` (`#btn-new-arrivals-more-products`) | Bottom CTA |
| Products shown | 15 products filtered by `NEW_ARRIVALS_PRODUCT_IDS` | Uses `renderProductCard` |

---

## 8. Customer Login / Account Page

### `src/components/LoginPage.ts`
| Location / Selector | Current Existing Text / Label | Notes |
| :--- | :--- | :--- |
| `.customer-login-title` | `Login` | Main heading |
| `.customer-login-subtitle` | `Sign in to your account to continue shopping, track orders, and manage your profile.` | Subtitle |
| Phone label & input | `Your Phone Number *`, `placeholder="Your phone number"` | Phone field |
| Password label & input | `Password *`, `placeholder="Enter your password"` | Password field |
| Password toggle | `aria-label="Toggle password visibility"` | Show/hide password icon |
| Remember me | `Remember me` | Checkbox |
| Submit button | `LOG IN` | Primary button |
| Lost password link | `Lost your password?` | Action link |
| Create account button | `CREATE NEW ACCOUNT` | Secondary button |

---

## 9. Product Details Page

### `src/components/ProductDetailsPage.ts`
| Location / Selector | Current Existing Text / Label | Notes |
| :--- | :--- | :--- |
| Breadcrumbs | `Home / Shop / ${product.title}` | Navigation breadcrumb |
| Not found state | `← Back to Shop`, `Product not found`, `This product may have been removed or the link may be incorrect.` | 404 container |
| `#btn-product-back` | `← Back` | Back button |
| Sale badge | `${product.badge} OFF` | Discount pill |
| Rating info | `${rating} / 5`, `·`, `${reviewCount} reviews` | Rating counter |
| Price & pack size | `${originalPrice}৳`, `${price}৳`, `${product.packSize}` | Price displays |
| Fallback description | `${product.title} — carefully selected and packed by Falaq Food.` | Default when missing |
| Product facts table | `Category`, `Weight / Size`, `Availability` | Fact labels |
| Stock availability | `In stock` / `Out of stock` | Stock badge text |
| Add to cart button | `Add to Cart` | Primary CTA |
| Wishlist button | `♡ Add to Wishlist` / `♥ Added to Wishlist` | Wishlist toggle |
| Share section | `Share:`, Facebook (`f`), WhatsApp (`wa`), Copy link (`↗`) | Social share buttons |
| Tabs | `Description`, `Reviews (${count})` | Tab navigation buttons |
| Description tab headings | `Product Description`, `Key Features & Specifications` | Tab headers |
| Reviews tab headings | `Customer Reviews`, `${rating} out of 5 · ${count} reviews` | Tab headers |

---

## 10. Cart Page & Cart Drawer

### `src/components/CartPage.ts`
| Location / Selector | Current Existing Text / Label | Notes |
| :--- | :--- | :--- |
| Breadcrumbs | `Home / Shopping Cart` | Breadcrumbs |
| Page title | `CART` | Main h1 |
| Empty cart state | Icon 🛒, `Your cart is empty`, `Explore the shop and add something you love.`, button `CONTINUE SHOPPING` | Empty state |
| Table headers | `Product`, `Price`, `Quantity`, `Subtotal` | Table header row |
| Item remove button | `aria-label="Remove ${product.title}"`, `&times;` | Remove item |
| Quantity controls | `aria-label="Quantity for ${product.title}"`, `−`, `+` | Counter buttons |
| Coupon form | `placeholder="Coupon code"`, `APPLY COUPON` / `APPLIED`, `Remove` | Coupon box |
| Continue link | `← Continue shopping` | Return link |
| Summary heading | `Cart Totals` | Aside header |
| Summary row 1 | `Subtotal`, `${subtotal}৳` | Subtotal |
| Shipping section | `Shipment`, `Shipping · ${deliveryFee}৳`, `Shipping to Dhaka / outside Dhaka.` | Shipping info |
| Change address button | `Change address` (`#btn-cart-change-address`) | Scroll to area selector |
| Delivery area legend & options | `Delivery area`, `Inside Dhaka · 70৳`, `Outside Dhaka · 130৳` | Delivery zone radios |
| Discount row | `Discount (${couponCode})`, `−${discountTotal}৳` | Coupon deduction |
| Total row | `Total`, `${total}৳` | Grand total |
| Checkout button | `PROCEED TO CHECKOUT` | Proceed CTA |

### `src/main.ts` (Side-Cart Drawer)
| Location / Selector | Current Existing Text / Label | Notes |
| :--- | :--- | :--- |
| Drawer header | `Shopping Cart`, `aria-label="Close cart"` | Drawer top bar |
| Empty drawer state | `No products in the cart.`, button `Return to shop` | Empty state |
| Item line | `${price} ৳ × ${quantity} = ${subtotal} ৳` | Item row |
| Drawer footer | `Subtotal:`, `${cartSubtotal} ৳`, button `View Shopping Cart` | Bottom action |

---

## 11. Checkout Page & Modals

### `src/components/CheckoutPage.ts`
| Location / Selector | Current Existing Text / Label | Notes |
| :--- | :--- | :--- |
| Breadcrumbs | `Home / Shopping Cart / Checkout` | Breadcrumb trail |
| Empty state | `Your cart is empty`, `Add products before proceeding to checkout.`, button `Continue Shopping` | Empty state |
| Header banner | `COMPLETE YOUR ORDER`, `Checkout`, `Almost there! Enter your details to get your order delivered.` | Header text |
| Section 01 | `01 Contact information`, `Where can we reach you about your order?` | Step 1 |
| Section 01 fields | `Full name` (placeholder: "Enter your full name"), `Email address` ("you@example.com"), `Phone number` ("01XXXXXXXXX"), hint: `Use a Bangladesh mobile number, e.g. 01XXXXXXXXX.` | Step 1 inputs |
| Section 02 | `02 Delivery address`, `Choose your delivery area and enter the address.` | Step 2 |
| Section 02 options | `Inside Dhaka` (fee: 70৳), `Outside Dhaka` (fee: 130৳) | Delivery radios |
| Section 02 fields | `Street address` ("House, road and area"), `Order notes (optional)` ("Anything we should know about delivery?") | Step 2 inputs |
| Section 03 | `03 Payment method`, `Pay safely when your order arrives.` | Step 3 |
| Section 03 option | `Cash on delivery` ("Pay the delivery person when your order arrives.") | Payment choice |
| Submit button | `PLACE ORDER · ${total}৳` | Primary order CTA |
| Privacy note | `Your information is used only to process and deliver your order.` | Footnote |
| Order summary aside | `Order summary ${items.length} item(s)`, `Coupon code`, `APPLY` / `APPLIED`, `Subtotal`, `Discount`, `Shipping`, `Total` | Summary panel |
| Shipping note | `No online payment is collected. Pay the delivery person when your order arrives.` | COD disclosure |

### `src/main.ts` (Checkout submission & Modal)
| Location / State | Current Existing Text | Notes |
| :--- | :--- | :--- |
| Checkout page submitting | `PLACING ORDER…` | Button disabled text |
| Checkout page success panel | `Order placed successfully!`, `Order ID: #${orderId}`, `Your order confirmation is shown for this session. Online order processing is not connected.`, Labels: `Name:`, `Email:`, `Phone:`, `Address:`, `Payment: Cash on delivery`, button `Continue Shopping` | Post-order view |
| Quick COD Modal (Header) | `ক্যাশ অন ডেলিভারি অর্ডার (Cash on Delivery)` | Modal title |
| Quick COD Modal fields | `আপনার নাম *` ("আপনার সম্পূর্ণ নাম লিখুন"), `মোবাইল নম্বর *` ("01XXXXXXXXX"), `ডেলিভারি ঠিকানা *` ("বাড়ি/রোড/এলাকা/জেলা"), `ডেলিভারি এরিয়া` ("ঢাকার ভেতর (৭০ ৳)", "ঢাকার বাইরে (১৩০ ৳)") | Modal inputs |
| Quick COD Modal breakdown | `মোট পণ্যের মূল্য:`, `ডেলিভারি চার্জ:`, `সর্বমোট:`, button `অর্ডার নিশ্চিত করুন (Confirm Order)` | Summary & submit |
| Quick COD Modal success | `অর্ডার সফল হয়েছে! (Order Placed)`, `Order ID: #${orderId}`, `নাম:`, `মোবাইল:`, `ঠিকানা:`, `পেমেন্ট: ক্যাশ অন ডেলিভারি (Cash on Delivery)`, button `Continue Shopping` | Modal success |

---

## 12. Wishlist Page

### `src/components/WishlistPage.ts`
| Location | Current Existing Text / Label | Notes |
| :--- | :--- | :--- |
| Breadcrumbs | `Home / Wishlist` | Breadcrumb |
| Heading | `Wishlist` | Main h1 |
| Remove button | `Remove from Wishlist` (`[data-wishlist-remove]`) | Action button |
| Empty state | `Your wishlist is empty`, `Save products you would like to come back to.`, button `Browse Products` | Empty state |

---

## 13. System Notifications & Toasts

### `src/main.ts`
| Trigger / Action | Current Toast / Feedback Text |
| :--- | :--- |
| Product added to cart | `"${product.title}" added to cart!` |
| Customer Login submit | `Login successful! Welcome back (${phone})` |
| Lost password click | `Password reset link sent to your registered phone/email.` |
| Create account click | `Registration is open! Please enter your phone number to sign up.` |
| Coupon success | `Coupon AR10 applied — 10% off your products.` |
| Coupon error | `That coupon code is not valid. Try AR10.` |
| Coupon removal | `Coupon removed.` |
| Product link copied | `Product link copied.` |
| Copy link failed | `Unable to copy the product link.` |
| Wishlist read failure | `Unable to load wishlist. Please check browser storage settings.` |
| Wishlist save failure | `Unable to update wishlist. Please check browser storage settings.` |
| Search dropdown footer | `See all results for "${query}"` |

---

## 14. Blog Data & Content Modal

### `src/data/blogs.ts`
| Post ID | Current Title | Current Excerpt & Highlights |
| :--- | :--- | :--- |
| 1 | খাঁটি মধু চেনার সহজ উপায় ও গুরুত্বপূর্ণ টিপস | How to test pure honey (water test, thumb test, fire test), Falaq Food Sundarbans honey sourcing |
| 2 | সরিষার তেল কেন প্রতিদিনের রান্নায় জনপ্রিয় ও স্বাস্থ্যকর | Benefits of wood-pressed mustard oil, heart health, digestion |
| 3 | ঘি, মধু ও মসলার সঠিক সংরক্ষণ পদ্ধতি | Storage tips for ghee, honey, and ground spices |

### `src/main.ts` (Blog Detail Modal)
| Location | Current Fields Displayed |
| :--- | :--- |
| Modal header & body | `${selectedBlog.title}`, image, `${date} • ${author} • ${category}`, `${content}` |

---

## 15. Customer Reviews Data

### `src/data/reviews.ts`
| Review ID | Name | Role | Quote |
| :--- | :--- | :--- | :--- |
| 1 | Rony Hasan | ভেরিফায়েড ক্রেতা | পণ্যের মান সত্যিই দারুণ, প্যাকেজিং সুন্দর ছিল এবং ডেলিভারিও সময়মতো পেয়েছি। খুব সন্তুষ্ট। |
| 2 | Nusrat Jahan | ভেরিফায়েড ক্রেতা | মধুর স্বাদ একদম প্রাকৃতিক, পরিবারের সবাই পছন্দ করেছে এবং আবারও অর্ডার করব। |
| 3 | Rakib Hasan | ভেরিফায়েড ক্রেতা | মসলার ঘ্রাণ ও স্বাদ খুব ভালো, রান্নায় ব্যবহার করে সত্যিই পার্থক্য বুঝেছি |
| 4 | Sabbir Ahmed | ভেরিফায়েড ক্রেতা | চালের কোয়ালিটি খুব ভালো ছিল, ভাত ঝরঝরে হয়েছে এবং স্বাদও বেশ চমৎকার। |
| 5 | Nusrat Jahan | ভেরিফায়েড ক্রেতা | প্যাকেট খুলেই ফ্রেশ ঘ্রাণ পেয়েছি, প্রোডাক্টের মান দেখে আমি সত্যিই সন্তুষ্ট হয়েছি। |

---

## 16. Products Data Architecture

### `src/data/products.ts`
- Total 55 products loaded, each adhering to:
  ```typescript
  export interface Product {
    id: number;
    title: string;
    image: string;
    price: number;
    oldPrice?: number;
    priceDisplay: string;
    regularPrice: number;
    category: string;
    badge: string;
    packSize?: string;
    rating?: number;
    reviewCount?: number;
    inStock?: boolean;
    description?: string;
    features?: string[];
    slug?: string;
  }
  ```
- Current catalog consists of demo grocery items: honeys, mustard oils, rice varieties, spices, nuts, lentils, ghee.
- All product names, descriptions, and feature bullets are in Bengali or mixed English/Bengali grocery terms.
- Prices are hardcoded static numeric values in BDT (Bangladeshi Taka).

---

## 17. Legal Pages, Email Templates, and Route Inventory

1. **Dedicated Legal Pages:**
   - In the existing codebase, there are no dedicated legal route pages (such as `/terms`, `/privacy`, `/returns`, etc.).
   - The footer currently has placeholder anchors (`#`) for `Privacy Policy`, `Terms of Service`, `Shipping & Returns`, `Privacy`, and `Terms`.
   - Per client instructions, the structure must be maintained without modifying routing or styling, and any legal text/links must use `[PENDING LEGAL REVIEW]`.
2. **Email Templates:**
   - There are currently no email template files in the repository.
3. **Cart Store & Currency:**
   - `src/store/cart.ts` contains references to `inside_dhaka` / `outside_dhaka` delivery zones, `AR10` coupon code, and `৳` currency logic.
