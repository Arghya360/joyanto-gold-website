export interface Category {
  id: string;
  name: string;
  nameBn: string;
  image: string;
  count: number;
}

export const CATEGORIES: Category[] = [
  {
    id: "prices",
    name: "Live Prices",
    nameBn: "লাইভ মেটাল মূল্য",
    image: "/uploads/products/product-4.png",
    count: 7
  },
  {
    id: "catalog",
    name: "Catalogue",
    nameBn: "বুলিয়ন ক্যাটালগ",
    image: "/uploads/assets/cat-dal.png",
    count: 18
  },
  {
    id: "storage",
    name: "Storage",
    nameBn: "সুরক্ষিত ভল্ট সংরক্ষণ",
    image: "/uploads/assets/cat-nuts.png",
    count: 2
  },
  {
    id: "mc-reserve",
    name: "MC Reserve",
    nameBn: "এমসি রিজার্ভ",
    image: "/uploads/products/product-2.png",
    count: 4
  },
  {
    id: "sell",
    name: "Sell to Us",
    nameBn: "আমাদের কাছে বিক্রি করুন",
    image: "/uploads/products/product-7.png",
    count: 2
  },
  {
    id: "about",
    name: "About",
    nameBn: "আমাদের ঐতিহ্য",
    image: "/uploads/assets/cat-organic.png",
    count: 1
  },
  {
    id: "contact",
    name: "Contact",
    nameBn: "যোগাযোগ ও পরামর্শ",
    image: "/uploads/products/product-8.png",
    count: 1
  },
  {
    id: "gold-bars",
    name: "Gold Bars",
    nameBn: "স্বর্ণের বার",
    image: "/uploads/assets/cat-flour.png",
    count: 7
  },
  {
    id: "silver-bars",
    name: "Silver Bars",
    nameBn: "রৌপ্য বার",
    image: "/uploads/assets/cat-oil.png",
    count: 4
  },
  {
    id: "coins",
    name: "Coins",
    nameBn: "বুলিয়ন মুদ্রা",
    image: "/uploads/assets/cat-honey.png",
    count: 4
  }
];

export const NAV_CATEGORIES = [
  { id: "prices", name: "Live Prices" },
  { id: "catalog", name: "Catalogue" },
  { id: "storage", name: "Storage" },
  { id: "mc-reserve", name: "MC Reserve" },
  { id: "sell", name: "Sell to Us" },
  { id: "about", name: "About" },
  { id: "contact", name: "Contact" }
];
