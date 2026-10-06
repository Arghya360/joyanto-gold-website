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

export const PRODUCTS: Product[] = [
  // ── Initial 6 Reference Screenshot Products ──────────────────
  {
    id: 12,
    title: "Premium কিশমিশ Natural Sweet Dry Fruit",
    image: "/uploads/products/product-12.png",
    price: 190,
    priceDisplay: "190৳ – 649৳",
    regularPrice: 649,
    category: "nuts-fruits",
    badge: "-6%",
    packSize: "500g",
    rating: 5,
    reviewCount: 48,
    inStock: true,
    slug: "premium-kishmish-natural-sweet-dry-fruit-12",
    description: "আমাদের প্রিমিয়াম কিশমিশ ১০০% প্রাকৃতিক এবং কোনো কৃত্রিম রং বা সংরক্ষক ছাড়াই প্রস্তুত। এটি প্রাকৃতিক মিষ্টি স্বাদে ভরপুর এবং শরীরের জন্য অত্যন্ত উপকারী। প্রতিদিনের খাদ্য তালিকায় এই কিশমিশ যোগ করুন এবং সুস্থ থাকুন।\n\nএই কিশমিশ সরাসরি প্রাকৃতিক আঙুর থেকে তৈরি এবং রোদে শুকিয়ে প্রস্তুত করা হয়েছে। আয়রন, ফাইবার ও অ্যান্টিঅক্সিডেন্টে ভরপুর এই ড্রাই ফ্রুটটি আপনার দৈনন্দিন পুষ্টির চাহিদা পূরণে সাহায্য করবে।",
    features: [
      "১০০% প্রাকৃতিক, কোনো কৃত্রিম রং বা সংরক্ষক নেই",
      "আয়রন ও ফাইবারে সমৃদ্ধ",
      "প্রাকৃতিক অ্যান্টিঅক্সিডেন্টের উৎস",
      "রোদে শুকানো, প্রাকৃতিক প্রক্রিয়ায় তৈরি",
      "হাইজিনিক এবং বায়ু-নিরোধক প্যাকেজিং",
      "শিশু থেকে বয়স্ক সবার জন্য উপযুক্ত"
    ]
  },
  {
    id: 14,
    title: "অর্গানিক কাজুবাদাম Premium Crunchy Natural Nuts",
    image: "/uploads/products/product-14.png",
    price: 350,
    priceDisplay: "350৳ – 1,240৳",
    regularPrice: 1240,
    category: "nuts-fruits",
    badge: "-6%",
    packSize: "500g",
    rating: 5,
    reviewCount: 62,
    inStock: true,
    slug: "organic-cashew-premium-crunchy-natural-nuts-14",
    description: "আমাদের অর্গানিক কাজুবাদাম সর্বোচ্চ মানের। প্রতিটি কাজুবাদাম সাবধানে বাছাই করা এবং হাইজিনিক পরিবেশে প্যাক করা। প্রোটিন, ম্যাগনেসিয়াম ও হেলদি ফ্যাটে ভরপুর এই বাদাম আপনার শরীর ও মস্তিষ্কের জন্য উপকারী।\n\nস্ন্যাকস হিসেবে, রান্নায়, বা মিষ্টিতে ব্যবহার করুন — সব ক্ষেত্রেই এই কাজুবাদামের ক্রিমি ও সমৃদ্ধ স্বাদ আপনাকে মুগ্ধ করবে।",
    features: [
      "প্রিমিয়াম গ্রেডের অর্গানিক কাজুবাদাম",
      "প্রোটিন ও হেলদি মনোআনস্যাচুরেটেড ফ্যাটে সমৃদ্ধ",
      "ম্যাগনেসিয়াম ও জিংকের চমৎকার উৎস",
      "কোলেস্টেরল-মুক্ত এবং গ্লুটেন-মুক্ত",
      "রিসিলেবল জিপলক প্যাকেজিং",
      "কোনো রোস্টিং অয়েল বা লবণ ছাড়া"
    ]
  },
  {
    id: 8,
    title: "Premium Chia Seed Natural Superfood Pack",
    image: "/uploads/products/product-8.png",
    price: 130,
    priceDisplay: "130৳ – 499৳",
    regularPrice: 499,
    category: "superfoods",
    badge: "-8%",
    packSize: "250g",
    rating: 5,
    reviewCount: 37,
    inStock: true,
    slug: "premium-chia-seed-natural-superfood-pack-8",
    description: "চিয়া সিড একটি অত্যন্ত পুষ্টিকর সুপারফুড যা ওমেগা-৩ ফ্যাটি অ্যাসিড, ফাইবার, প্রোটিন ও ক্যালসিয়ামে সমৃদ্ধ। আমাদের প্রিমিয়াম চিয়া সিড সম্পূর্ণ প্রাকৃতিক এবং কোনো প্রিজার্ভেটিভ ছাড়াই।\n\nস্মুদি, দই, ওটমিল বা পানিতে মিশিয়ে খান। প্রতিদিন মাত্র ২ চামচ চিয়া সিড আপনার শরীরে ১০গ্রাম ফাইবার সরবরাহ করে।",
    features: [
      "ওমেগা-৩ ফ্যাটি অ্যাসিডের উৎকৃষ্ট উৎস",
      "প্রতি ২৮গ্রামে ১১গ্রাম ফাইবার",
      "প্লান্ট-বেসড প্রোটিনে সমৃদ্ধ",
      "ক্যালসিয়াম ও ম্যাগনেসিয়াম সমৃদ্ধ",
      "গ্লুটেন-মুক্ত ও ভেগান-বান্ধব",
      "৩০০% বেশি ক্যালসিয়াম দুধের চেয়ে"
    ]
  },
  {
    id: 2,
    title: "Natural Brown Sugar Premium Unrefined Sweetener",
    image: "/uploads/products/product-2.png",
    price: 190,
    priceDisplay: "190৳ – 360৳",
    regularPrice: 360,
    category: "sweeteners",
    badge: "",
    packSize: "1kg",
    rating: 5,
    reviewCount: 29,
    inStock: true,
    slug: "natural-brown-sugar-premium-unrefined-sweetener-2",
    description: "আমাদের প্রাকৃতিক ব্রাউন সুগার আখের রস থেকে তৈরি এবং রিফাইনড সাদা চিনির মতো অতিরিক্ত প্রক্রিয়াজাত নয়। এতে ক্যালসিয়াম, পটাসিয়াম ও আয়রন সহ প্রাকৃতিক মিনারেল বিদ্যমান।\n\nরান্নায়, চা বা কফিতে এবং বেকিং-এ সাদা চিনির বিকল্প হিসেবে ব্যবহার করুন। এর ক্যারামেল-সদৃশ স্বাদ আপনার খাবারে বিশেষ মাত্রা যোগ করবে।",
    features: [
      "অপরিশোধিত, প্রাকৃতিক ব্রাউন সুগার",
      "ক্যালসিয়াম ও পটাসিয়ামের উৎস",
      "কোনো কৃত্রিম রং বা সুগন্ধি নেই",
      "আখের রস থেকে সরাসরি প্রস্তুত",
      "বেকিং ও রান্নায় উপযুক্ত",
      "গ্লাইসেমিক ইনডেক্স সাদা চিনির চেয়ে কম"
    ]
  },
  {
    id: 17,
    title: "প্রিমিয়াম খেজুরের গুড় Best Natural Deshi Taste",
    image: "/uploads/products/product-khejurer-gur.jpg",
    price: 289,
    oldPrice: 320,
    priceDisplay: "320৳ 289৳",
    regularPrice: 320,
    category: "sweeteners",
    badge: "-10%",
    packSize: "400g",
    rating: 5,
    reviewCount: 54,
    inStock: true,
    slug: "premium-khejurer-gur-best-natural-deshi-taste-17",
    description: "খেজুরের গুড় বাংলার ঐতিহ্যবাহী মিষ্টান্ন। শীতকালে সংগ্রহ করা খেজুরের রস থেকে তৈরি এই গুড় প্রাকৃতিক মিষ্টি ও পুষ্টিগুণে ভরপুর। প্রতিটি পিতলের পাত্রে তৈরি এবং কোনো রাসায়নিক ছাড়াই সংরক্ষিত।\n\nপিঠা, পায়েস, চা বা সরাসরি খাওয়ার জন্য আদর্শ। এই খেজুরের গুড়ের অনন্য স্বাদ আপনাকে গ্রামবাংলার স্মৃতি মনে করিয়ে দেবে।",
    features: [
      "১০০% খাঁটি খেজুরের রস থেকে তৈরি",
      "কোনো চিনি, রং বা কৃত্রিম উপাদান নেই",
      "আয়রন ও ম্যাগনেসিয়ামের প্রাকৃতিক উৎস",
      "ঐতিহ্যবাহী পদ্ধতিতে তৈরি",
      "পিঠা ও মিষ্টান্ন তৈরিতে আদর্শ",
      "হাইজিনিক এয়ারটাইট প্যাকেজিং"
    ]
  },
  {
    id: 3,
    title: "Organic Chola Boot Premium Selected Grade",
    image: "/uploads/products/product-3.png",
    price: 120,
    priceDisplay: "120৳ – 450৳",
    regularPrice: 450,
    category: "dal-pulses",
    badge: "",
    packSize: "1kg",
    rating: 5,
    reviewCount: 22,
    inStock: true,
    slug: "organic-chola-boot-premium-selected-grade-3",
    description: "আমাদের অর্গানিক ছোলা বুট সর্বোচ্চ মানের এবং সরাসরি নির্বাচিত খামার থেকে সংগৃহীত। প্রোটিন ও ফাইবারে ভরপুর এই ছোলা আপনার পরিবারের পুষ্টির চাহিদা পূরণ করবে।\n\nভাজা, সিদ্ধ বা কারি — যেকোনোভাবে রান্না করুন। সকালের নাস্তায় বা রাতের খাবারে ছোলার ব্যবহার আপনার খাদ্য তালিকাকে স্বাস্থ্যকর করে তুলবে।",
    features: [
      "প্রিমিয়াম গ্রেডের অর্গানিক ছোলা",
      "প্রোটিন ও ডায়েটারি ফাইবারে সমৃদ্ধ",
      "কোলেস্টেরল-মুক্ত এবং লো-ফ্যাট",
      "কীটনাশক ও রাসায়নিক মুক্ত",
      "দ্রুত সিদ্ধ হওয়ার জন্য সাইজ অনুযায়ী বাছাই",
      "ফোলেট ও আয়রনের চমৎকার উৎস"
    ]
  },

  // ── Spices & Masala ──────────────────────────────────────────
  {
    id: 1,
    title: "Fresh ধনিয়া গুঁড়া Natural Aroma Pack",
    image: "/uploads/products/product-1.png",
    price: 100,
    priceDisplay: "100৳ – 420৳",
    regularPrice: 420,
    category: "spices-masala",
    badge: "",
    packSize: "250g",
    rating: 5,
    reviewCount: 41,
    inStock: true,
    slug: "fresh-dhoniya-gura-natural-aroma-pack-1",
    description: "আমাদের তাজা ধনিয়া গুঁড়া সম্পূর্ণ প্রাকৃতিক ধনিয়া থেকে তৈরি। রান্নায় অনন্য সুবাস ও স্বাদ যোগ করে এই মসলা। কোনো কৃত্রিম রং বা সুগন্ধি ছাড়াই প্যাক করা।\n\nতরকারি, ভাজি বা কারিতে ব্যবহার করুন। প্রাকৃতিক ধনিয়ার সুবাস আপনার রান্নাকে অনন্য করে তুলবে।",
    features: [
      "১০০% বিশুদ্ধ ও প্রাকৃতিক ধনিয়া গুঁড়া",
      "তাজা ধনিয়া থেকে সরাসরি তৈরি",
      "কোনো কৃত্রিম রং বা সুগন্ধি নেই",
      "BSTI সার্টিফাইড",
      "এয়ারটাইট প্যাকেজিং — সতেজতা বজায় রাখে",
      "অ্যান্টিঅক্সিডেন্ট ও ভিটামিন সিতে সমৃদ্ধ"
    ]
  },
  {
    id: 4,
    title: "Organic Turmeric Powder Premium Grade Pack",
    image: "/uploads/products/product-4.png",
    price: 120,
    priceDisplay: "120৳ – 470৳",
    regularPrice: 470,
    category: "spices-masala",
    badge: "-6%",
    packSize: "250g",
    rating: 5,
    reviewCount: 67,
    inStock: true,
    slug: "organic-turmeric-powder-premium-grade-pack-4",
    description: "হলুদ গুঁড়া বাংলাদেশের সবচেয়ে প্রয়োজনীয় মসলাগুলির মধ্যে একটি। আমাদের অর্গানিক হলুদ গুঁড়া উচ্চ কার্কিউমিন কন্টেন্টের জন্য বিশেষভাবে পরিচিত। এটি রান্নায় সুন্দর রং ও স্বাদ যোগ করার পাশাপাশি স্বাস্থ্য উপকারেও অতুলনীয়।\n\nকার্কিউমিন, হলুদের প্রধান উপাদান, একটি শক্তিশালী অ্যান্টি-ইনফ্লেমেটরি এবং অ্যান্টিঅক্সিডেন্ট।",
    features: [
      "উচ্চ কার্কিউমিন কন্টেন্ট (৩-৫%)",
      "USDA অর্গানিক সার্টিফাইড",
      "প্রাকৃতিক অ্যান্টি-ইনফ্লেমেটরি গুণাবলী",
      "কৃত্রিম রং ও ফিলার মুক্ত",
      "তাজা মাটির হলুদ থেকে তৈরি",
      "হাইজিনিক গ্রাইন্ডিং ও প্যাকেজিং"
    ]
  },
  {
    id: 5,
    title: "Organic কালোজিরা Seed Premium Natural Pack",
    image: "/uploads/products/product-5.png",
    price: 110,
    priceDisplay: "110৳ – 460৳",
    regularPrice: 460,
    category: "spices-masala",
    badge: "",
    packSize: "250g",
    rating: 5,
    reviewCount: 33,
    inStock: true,
    slug: "organic-kalojira-seed-premium-natural-pack-5",
    description: "কালোজিরা (Nigella Sativa) হাজার বছর ধরে স্বাস্থ্য ও রান্নায় ব্যবহৃত হয়ে আসছে। 'প্রতিটি রোগের ওষুধ কালোজিরা' — এই প্রবাদ বাক্য এর গুণাগুণের কথাই বলে।\n\nআমাদের প্রিমিয়াম অর্গানিক কালোজিরা রুটি, নান, ভাজি এবং ঔষধি উদ্দেশ্যে ব্যবহারের জন্য আদর্শ।",
    features: [
      "১০০% বিশুদ্ধ অর্গানিক কালোজিরা",
      "থাইমোকুইনোনে সমৃদ্ধ — শক্তিশালী অ্যান্টিঅক্সিডেন্ট",
      "রোগপ্রতিরোধ ক্ষমতা বাড়াতে সাহায্য করে",
      "প্রাকৃতিক অ্যান্টি-ব্যাকটেরিয়াল গুণ",
      "কোনো রং বা সংরক্ষক নেই",
      "সুন্দরভাবে ক্লিনড এবং প্যাকড"
    ]
  },
  {
    id: 9,
    title: "Premium Cumin Powder 100% Natural Spice",
    image: "/uploads/products/product-9.png",
    price: 190,
    priceDisplay: "190৳ – 799৳",
    regularPrice: 799,
    category: "spices-masala",
    badge: "-6%",
    packSize: "250g",
    rating: 5,
    reviewCount: 28,
    inStock: true,
    slug: "premium-cumin-powder-100-natural-spice-9",
    description: "জিরা গুঁড়া প্রতিটি বাংলাদেশি রান্নাঘরের অপরিহার্য উপাদান। আমাদের প্রিমিয়াম জিরা গুঁড়া সর্বোচ্চ মানের জিরা থেকে তৈরি এবং কোনো ভেজাল ছাড়াই।\n\nডাল, তরকারি, রাইতা এবং বিরিয়ানিতে জিরার অনন্য সুবাস ও স্বাদ আপনার রান্নাকে অসাধারণ করে তুলবে।",
    features: [
      "১০০% প্রাকৃতিক জিরা গুঁড়া",
      "কোনো ভেজাল বা স্টার্চ যোগ করা নেই",
      "শক্তিশালী সুবাস ও তীব্র স্বাদ",
      "পরিপাকতন্ত্রের জন্য উপকারী",
      "আয়রন ও ম্যাঙ্গানিজের উৎস",
      "BSTI প্রত্যয়িত"
    ]
  },
  {
    id: 16,
    title: "দেশি খাঁটি মরিচ গুঁড়া প্রিমিয়াম কোয়ালিটি",
    image: "/uploads/products/product-16.png",
    price: 140,
    priceDisplay: "140৳ – 550৳",
    regularPrice: 550,
    category: "spices-masala",
    badge: "-7%",
    packSize: "250g",
    rating: 5,
    reviewCount: 45,
    inStock: true,
    slug: "deshi-khati-morich-gura-premium-quality-16",
    description: "দেশি মরিচ গুঁড়া বাংলাদেশের ঐতিহ্যবাহী স্বাদের অবিচ্ছেদ্য অংশ। আমাদের খাঁটি মরিচ গুঁড়া সরাসরি স্থানীয় কৃষকদের কাছ থেকে সংগৃহীত এবং হাইজিনিক পরিবেশে প্রক্রিয়াজাত।\n\nএই মরিচের তীব্র ঝাঁজ ও গাঢ় লাল রং আপনার রান্নায় অনন্য মাত্রা যোগ করবে।",
    features: [
      "স্থানীয় দেশি মরিচ থেকে তৈরি",
      "উচ্চ ক্যাপসাইসিন কন্টেন্ট",
      "কোনো ভুট্টার ময়দা বা রং মেশানো নেই",
      "ভিটামিন সি ও অ্যান্টিঅক্সিডেন্ট সমৃদ্ধ",
      "এয়ারটাইট প্যাকেজিং",
      "BSTI সার্টিফাইড মান নিয়ন্ত্রিত"
    ]
  },
  {
    id: 18,
    title: "Premium Garam Masala Whole Spice Blend",
    image: "/uploads/products/product-1.png",
    price: 180,
    priceDisplay: "180৳ – 520৳",
    regularPrice: 520,
    category: "spices-masala",
    badge: "",
    packSize: "200g",
    rating: 5,
    reviewCount: 19,
    inStock: true,
    slug: "premium-garam-masala-whole-spice-blend-18",
    description: "গরম মসলা হলো বিভিন্ন সুগন্ধি মশলার একটি বিশেষ মিশ্রণ যা বাংলাদেশ ও ভারতীয় রান্নায় ব্যাপকভাবে ব্যবহৃত হয়। আমাদের প্রিমিয়াম গরম মসলা তৈরিতে এলাচ, দারুচিনি, লবঙ্গ, জিরা ও কালো মরিচ ব্যবহার করা হয়।\n\nবিরিয়ানি, কোরমা, কারি ও মাংসের রান্নায় এই মসলা ব্যবহার করুন এবং অসাধারণ সুবাস উপভোগ করুন।",
    features: [
      "১০টি প্রিমিয়াম মসলার সুষম মিশ্রণ",
      "এলাচ, দারুচিনি, লবঙ্গ সহ সম্পূর্ণ মসলা",
      "কোনো কৃত্রিম সুবাস বা রং নেই",
      "ঐতিহ্যবাহী রেসিপি অনুযায়ী তৈরি",
      "শেফ রিকমেন্ডেড ব্লেন্ড",
      "বায়ুরোধী সংরক্ষণ"
    ]
  },

  // ── Dal & Pulses ─────────────────────────────────────────────
  {
    id: 10,
    title: "Premium Masoor Dal Fresh Selected Quality",
    image: "/uploads/products/product-10.png",
    price: 115,
    priceDisplay: "115৳ – 430৳",
    regularPrice: 430,
    category: "dal-pulses",
    badge: "",
    packSize: "1kg",
    rating: 5,
    reviewCount: 31,
    inStock: true,
    slug: "premium-masoor-dal-fresh-selected-quality-10",
    description: "মসুর ডাল বাংলাদেশের সবচেয়ে জনপ্রিয় ডালগুলির মধ্যে একটি। আমাদের প্রিমিয়াম মসুর ডাল সর্বোচ্চ মানের এবং ভালোভাবে সাফ করা, কোনো পাথর বা অন্য ময়লা নেই।\n\nসহজে ও দ্রুত সিদ্ধ হয়, স্বাদে অনন্য এবং পুষ্টিগুণে ভরপুর।",
    features: [
      "প্রিমিয়াম গ্রেড, পাথর ও ময়লামুক্ত",
      "উচ্চ প্রোটিন ও ফাইবার কন্টেন্ট",
      "দ্রুত সিদ্ধ হয় — সময় ও জ্বালানি সাশ্রয়",
      "ফোলেট ও আয়রনের উৎকৃষ্ট উৎস",
      "লো গ্লাইসেমিক ইনডেক্স",
      "হাইজিনিক প্যাকেজিং"
    ]
  },
  {
    id: 19,
    title: "Premium Moong Dal Special Washed Quality",
    image: "/uploads/products/product-6.png",
    price: 145,
    priceDisplay: "145৳ – 480৳",
    regularPrice: 480,
    category: "dal-pulses",
    badge: "",
    packSize: "1kg",
    rating: 5,
    reviewCount: 18,
    inStock: true,
    slug: "premium-moong-dal-special-washed-quality-19",
    description: "মুগ ডাল একটি হালকা ও সহজপাচ্য ডাল যা শিশু থেকে বৃদ্ধ সকলের জন্য উপযুক্ত। ধুয়ে প্যাক করা আমাদের মুগ ডাল রান্নার আগে আর ধোয়ার প্রয়োজন নেই।\n\nখিচুড়ি, ডালের স্যুপ বা মুগ ডালের হালুয়া — সব রান্নায় এই মুগ ডাল আদর্শ।",
    features: [
      "বিশেষভাবে ধুয়ে প্রস্তুত — সরাসরি রান্নায় ব্যবহারযোগ্য",
      "সহজপাচ্য ও অ্যান্টি-ব্লোটিং",
      "উচ্চ প্রোটিন ও পটাসিয়াম কন্টেন্ট",
      "ভিটামিন বি কমপ্লেক্সের উৎস",
      "শিশুদের পরিপূরক খাদ্য হিসেবে আদর্শ",
      "হাইজিনিক জিপলক প্যাকেজিং"
    ]
  },

  // ── Rice ─────────────────────────────────────────────────────
  {
    id: 7,
    title: "Premium Basmati Rice Long Grain Aromatic",
    image: "/uploads/products/product-7.png",
    price: 330,
    priceDisplay: "330৳ – 1,450৳",
    regularPrice: 1450,
    category: "rice",
    badge: "-6%",
    packSize: "5kg",
    rating: 5,
    reviewCount: 73,
    inStock: true,
    slug: "premium-basmati-rice-long-grain-aromatic-7",
    description: "আমাদের প্রিমিয়াম বাসমতি চাল দীর্ঘ দানার জন্য পরিচিত। রান্নার পর এটি ঝরঝরে থাকে এবং এর প্রাকৃতিক সুবাস খাবারকে অনন্য করে তোলে।\n\nবিরিয়ানি, পোলাও ও সাদা ভাতের জন্য আদর্শ। প্রতিটি চাল সমান সাইজের এবং কোনো ভাঙা চাল নেই।",
    features: [
      "দীর্ঘ ও সমান দানার বাসমতি চাল",
      "রান্নার পর ঝরঝরে ও আঠাবিহীন",
      "প্রাকৃতিক পান্ডানাস সুবাস",
      "লো আর্সেনিক কন্টেন্ট",
      "বিরিয়ানি ও পোলাওয়ের জন্য শেফ-রিকমেন্ডেড",
      "বায়ুরোধী প্যাকেজিং — সতেজতা বজায় রাখে"
    ]
  },
  {
    id: 20,
    title: "Chinigura Aromatic Rice Premium Deshi Polao",
    image: "/uploads/products/product-7.png",
    price: 160,
    priceDisplay: "160৳ – 780৳",
    regularPrice: 780,
    category: "rice",
    badge: "",
    packSize: "1kg",
    rating: 5,
    reviewCount: 42,
    inStock: true,
    slug: "chinigura-aromatic-rice-premium-deshi-polao-20",
    description: "চিনিগুড়া চাল বাংলাদেশের একটি বিশেষ সুগন্ধি চাল যা ঈদ, পূজা বা যেকোনো বিশেষ উপলক্ষের রান্নায় ব্যবহৃত হয়। এর ছোট দানা এবং মিষ্টি সুবাস একে অনন্য করে তোলে।\n\nপোলাও, খিচুড়ি বা ফিরনি তৈরিতে চিনিগুড়া চাল ব্যবহার করুন এবং অতিথিদের মুগ্ধ করুন।",
    features: [
      "দেশীয় সুগন্ধি চিনিগুড়া ভেরাইটি",
      "ছোট ও গোলাকার দানা",
      "রান্নার পরও প্রাকৃতিক সুবাস বজায় থাকে",
      "পোলাও ও ফিরনির জন্য আদর্শ",
      "কীটনাশকমুক্ত, অর্গানিক খামার থেকে সংগ্রহ",
      "হাইজিনিক প্যাকেজিং"
    ]
  },

  // ── Organic Foods ────────────────────────────────────────────
  {
    id: 13,
    title: "Premium গাওয়া ঘি 100% Pure Quality",
    image: "/uploads/products/product-13.png",
    price: 420,
    priceDisplay: "420৳ – 1,390৳",
    regularPrice: 1390,
    category: "organic-foods",
    badge: "-6%",
    packSize: "500g",
    rating: 5,
    reviewCount: 89,
    inStock: true,
    slug: "premium-gawa-ghee-100-pure-quality-13",
    description: "খাঁটি গাওয়া ঘি তৈরি হয় দেশি গরুর দুধ থেকে। এটি ক্লারিফাইড বাটার যা হাজার বছর ধরে রান্না ও আয়ুর্বেদিক ওষুধে ব্যবহৃত হয়ে আসছে।\n\nআমাদের ঘি সম্পূর্ণ হাতে তৈরি এবং কোনো হাইড্রোজেনেটেড ভেজিটেবল অয়েল বা কৃত্রিম সুবাস নেই। রান্নায়, ডালে বা রুটিতে মাখিয়ে খান — এর অনন্য সুবাস আপনার মুখে জল আনবে।",
    features: [
      "১০০% খাঁটি দেশি গরুর দুধ থেকে তৈরি",
      "হাই স্মোক পয়েন্ট — ডিপ ফ্রাইয়ের জন্য আদর্শ",
      "CLA ও বিউটাইরেটে সমৃদ্ধ",
      "কোনো ট্রান্স ফ্যাট নেই",
      "গ্লুটেন ও ল্যাকটোজ মুক্ত",
      "ঐতিহ্যবাহী পদ্ধতিতে তৈরি"
    ]
  },

  // ── Flour & Atta ─────────────────────────────────────────────
  {
    id: 6,
    title: "Organic লাল আটা Fresh Whole Wheat Pack",
    image: "/uploads/products/product-6.png",
    price: 95,
    priceDisplay: "95৳ – 399৳",
    regularPrice: 399,
    category: "flour-atta",
    badge: "-7%",
    packSize: "2kg",
    rating: 5,
    reviewCount: 26,
    inStock: true,
    slug: "organic-lal-ata-fresh-whole-wheat-pack-6",
    description: "লাল আটা বা হোল হুইট আটা সাদা ময়দার চেয়ে অনেক বেশি পুষ্টিকর। আমাদের অর্গানিক লাল আটা সম্পূর্ণ গমের শস্য ব্যবহার করে তৈরি যেখানে ব্রান ও জার্ম অক্ষুণ্ণ থাকে।\n\nরুটি, পরোটা বা চাপাতি তৈরিতে এই আটা ব্যবহার করুন। এর সামান্য বাদামি রং ও আখরোট-সদৃশ স্বাদ আপনার খাবারকে স্বাস্থ্যকর ও সুস্বাদু করবে।",
    features: [
      "সম্পূর্ণ গমের শস্য — ব্রান ও জার্ম সহ",
      "সাদা ময়দার চেয়ে ৩ গুণ বেশি ফাইবার",
      "অর্গানিক ফার্ম থেকে সংগৃহীত গম",
      "প্রিজার্ভেটিভ ও ব্লিচিং এজেন্ট মুক্ত",
      "ভিটামিন বি ও ই সমৃদ্ধ",
      "ডায়াবেটিক-ফ্রেন্ডলি লো গ্লাইসেমিক ইনডেক্স"
    ]
  },

  // ── Cooking Oil ─────────────────────────────────────────────
  {
    id: 11,
    title: "Premium Organic Mustard Oil 1 Liter",
    image: "/uploads/products/product-11.png",
    price: 389,
    oldPrice: 420,
    priceDisplay: "420৳ 389৳",
    regularPrice: 420,
    category: "cooking-oil",
    badge: "-7%",
    packSize: "1L",
    rating: 5,
    reviewCount: 58,
    inStock: true,
    slug: "premium-organic-mustard-oil-1-liter-11",
    description: "খাঁটি সর্ষের তেল বাংলাদেশের ঐতিহ্যবাহী রান্নার তেল। আমাদের অর্গানিক সর্ষের তেল কোল্ড-প্রেসড পদ্ধতিতে তৈরি যা তেলের পুষ্টিগুণ ও সুবাস সম্পূর্ণরূপে অক্ষুণ্ণ রাখে।\n\nমাছের ভাজা, সর্ষে-ইলিশ বা আচার তৈরিতে এই তেল ব্যবহার করুন। এর তীব্র ঝাঁজ ও সুবাস আপনার রান্নাকে অনন্য করে তুলবে।",
    features: [
      "কোল্ড-প্রেসড পদ্ধতিতে তৈরি",
      "ওমেগা-৩ ও ওমেগা-৬ ফ্যাটি অ্যাসিড সমৃদ্ধ",
      "অ্যান্টি-ব্যাকটেরিয়াল ও অ্যান্টি-ফাঙ্গাল গুণ",
      "কোনো রিফাইনমেন্ট বা ব্লিচিং নেই",
      "হার্ট-হেলদি মনোআনস্যাচুরেটেড ফ্যাট",
      "BSTI সার্টিফাইড"
    ]
  },

  // ── Honey ────────────────────────────────────────────────────
  {
    id: 15,
    title: "খাঁটি সুন্দরবনের প্রাকৃতিক মধু ৫০০ গ্রাম",
    image: "/uploads/products/product-15.png",
    price: 625,
    oldPrice: 690,
    priceDisplay: "690৳ 625৳",
    regularPrice: 690,
    category: "honey",
    badge: "-9%",
    packSize: "500g",
    rating: 5,
    reviewCount: 96,
    inStock: true,
    slug: "khanti-sundarbaner-prakritik-modhu-500g-15",
    description: "সুন্দরবনের মধু বিশ্বের সেরা মধুগুলির একটি। ম্যানগ্রোভ বন থেকে সংগ্রহ করা এই মধু শতভাগ প্রাকৃতিক এবং কোনো চিনি বা কৃত্রিম উপাদান মেশানো হয় না।\n\nএই মধু অ্যান্টিব্যাকটেরিয়াল, অ্যান্টিঅক্সিডেন্ট ও এনজাইমে ভরপুর। সরাসরি খান, চায়ে বা দুধে মেশান এবং ঔষধি ব্যবহারে কাজে লাগান।",
    features: [
      "সুন্দরবনের গভীর থেকে সংগৃহীত",
      "মোম ছাড়ানো ও ফিল্টার করা কিন্তু পাস্তুরাইজড নয়",
      "উচ্চ অ্যান্টিঅক্সিডেন্ট কন্টেন্ট",
      "প্রাকৃতিক এনজাইম ও পোলেন সহ",
      "সরকারি সার্টিফিকেটপ্রাপ্ত খাঁটি মধু",
      "কাচের বোতলে সংরক্ষিত"
    ]
  }
];

export function getProductById(id: number): Product | undefined {
  return PRODUCTS.find(p => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find(p => p.slug === slug);
}

export function getProductOriginalPrice(product: Product): number | undefined {
  if (product.oldPrice && product.oldPrice > product.price) return product.oldPrice;
  const discount = product.badge.match(/(\d+)%/);
  return discount ? Math.round(product.price / (1 - Number(discount[1]) / 100)) : undefined;
}

export function makeSlug(title: string, id: number): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
    .replace(/-$/, '') + '-' + id;
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return PRODUCTS.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q)
  );
}
