export interface Review {
  id: number;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  quote: string;
}

export const REVIEWS: Review[] = [
  {
    id: 1,
    name: "Rony Hasan",
    role: "ভেরিফায়েড ক্রেতা",
    avatar: "/uploads/assets/avatar.avif",
    rating: 5,
    quote: "পণ্যের মান সত্যিই দারুণ, প্যাকেজিং সুন্দর ছিল এবং ডেলিভারিও সময়মতো পেয়েছি। খুব সন্তুষ্ট।"
  },
  {
    id: 2,
    name: "Nusrat Jahan",
    role: "ভেরিফায়েড ক্রেতা",
    avatar: "/uploads/assets/user-3.jpeg",
    rating: 5,
    quote: "মধুর স্বাদ একদম প্রাকৃতিক, পরিবারের সবাই পছন্দ করেছে এবং আবারও অর্ডার করব।"
  },
  {
    id: 3,
    name: "Rakib Hasan",
    role: "ভেরিফায়েড ক্রেতা",
    avatar: "/uploads/assets/user-2.jpeg",
    rating: 5,
    quote: "মসলার ঘ্রাণ ও স্বাদ খুব ভালো, রান্নায় ব্যবহার করে সত্যিই পার্থক্য বুঝেছি"
  },
  {
    id: 4,
    name: "Sabbir Ahmed",
    role: "ভেরিফায়েড ক্রেতা",
    avatar: "/uploads/assets/user-1.jpeg",
    rating: 5,
    quote: "চালের কোয়ালিটি খুব ভালো ছিল, ভাত ঝরঝরে হয়েছে এবং স্বাদও বেশ চমৎকার।"
  },
  {
    id: 5,
    name: "Nusrat Jahan",
    role: "ভেরিফায়েড ক্রেতা",
    avatar: "/uploads/assets/user-3.jpeg",
    rating: 5,
    quote: "প্যাকেট খুলেই ফ্রেশ ঘ্রাণ পেয়েছি, প্রোডাক্টের মান দেখে আমি সত্যিই সন্তুষ্ট হয়েছি।"
  }
];
