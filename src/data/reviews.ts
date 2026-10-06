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
    name: "Tariq Al-Mansoor",
    role: "Private Client, UAE",
    avatar: "/uploads/assets/avatar.avif",
    rating: 5,
    quote: "The allocation process was methodical and clear. The bars arrived in tamper-sealed assay packaging with complete serial provenance."
  },
  {
    id: 2,
    name: "Elena Rostova",
    role: "Verified Purchaser, Switzerland",
    avatar: "/uploads/assets/user-3.jpeg",
    rating: 5,
    quote: "Insured international transit was executed flawlessly. Documentation, assay cards, and customs handling met the highest institutional standards."
  },
  {
    id: 3,
    name: "Marcus Vance",
    role: "Family Office Trustee, UK",
    avatar: "/uploads/assets/user-2.jpeg",
    rating: 5,
    quote: "Clear pricing mechanics without unnecessary complexity. Having access to allocated Dubai depository custody provides substantial confidence."
  },
  {
    id: 4,
    name: "Kareem Haddad",
    role: "Private Investor, Dubai",
    avatar: "/uploads/assets/user-1.jpeg",
    rating: 5,
    quote: "The Dubai Collection craftsmanship is exceptional. Seamless execution from initial inquiry through to secure depository allocation."
  },
  {
    id: 5,
    name: "Sarah Jenkins",
    role: "MC Reserve Member, Singapore",
    avatar: "/uploads/assets/user-3.jpeg",
    rating: 5,
    quote: "Professional consultation with genuine discretion. The buy-back liquidity terms and transparent settlement framework are unmatched."
  }
];
