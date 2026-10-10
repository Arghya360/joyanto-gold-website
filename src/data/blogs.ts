import goldBarsOrCoinsImage from '../assets/Market Insights & Depository Notes/Gold Bars or Coins.png';
import sellingGoldOrSilverImage from '../assets/Market Insights & Depository Notes/How to Sell Your Gold or Silver.png';
import mcReserveRecordsImage from '../assets/Market Insights & Depository Notes/Keeping Every Document in One Place with MC Reserve.png';

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  image: string;
  author: string;
  category: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    title: "Gold Bars or Coins: Choosing the Right Form of Physical Gold",
    excerpt: "A clear comparison of bars and coins, covering value per gram, divisibility, recognisability and gifting, with an introduction to our proprietary Dubai Collection.",
    content: `Choosing between gold bars and coins depends on what matters most to you as a buyer.

Gold bars are available in a range of weights, making it straightforward to compare their value per gram and select a size that suits your budget. Coins offer convenient divisibility: smaller denominations can be easier to sell or gift individually.

Recognisability is another consideration. Well-known coins may be familiar to buyers in many markets, while bars offer a simple format focused on weight and purity. Presentation can also matter; coins are often chosen for personal or commemorative gifts.

The Montague Cole Dubai Collection brings a distinctive, architecture-inspired design to physical gold. Compare the form, weight, and purpose of each piece to find the option that fits your needs.`,
    date: "October 05, 2026",
    image: goldBarsOrCoinsImage,
    author: "Montague Cole Bullion Research",
    category: "Product Guide"
  },
  {
    id: 2,
    title: "How to Sell Your Gold or Silver: The Quote, Inspection and Settlement Process",
    excerpt: "A step-by-step overview of requesting a private quote, bringing your metal for testing, and understanding how settlement works through our Sell to Us service.",
    content: `Selling gold or silver through our Sell to Us service starts with a private quote request. Share the details of the metal you would like to sell so the team can discuss the next steps with you.

The metal is then brought in for inspection and testing. This assessment helps confirm its characteristics before a final offer is discussed. The quote and settlement arrangements can depend on the results of that inspection.

Once you have reviewed and accepted the confirmed terms, the settlement is arranged through the agreed process. If you are considering a sale, request a quote first so you know what information to prepare and what to expect at each stage.`,
    date: "September 28, 2026",
    image: sellingGoldOrSilverImage,
    author: "Depository Custody Team",
    category: "Selling & Buy-Back"
  },
  {
    id: 3,
    title: "Keeping Every Document in One Place with MC Reserve",
    excerpt: "How invoices, certificates, serial numbers and delivery records are organised in your private MC Reserve account, so your holdings are always documented and easy to review.",
    content: `MC Reserve helps bring the key records for your holdings together in one private account.

Your account can organise documents such as purchase invoices, certificates, product serial numbers, and delivery records. Keeping these details together makes it easier to review the information associated with your assets when you need it.

Use your MC Reserve account as a clear record of your holdings and their documentation. For details about account access and the records available for your assets, contact the Montague Cole team.`,
    date: "September 19, 2026",
    image: mcReserveRecordsImage,
    author: "Private Client Services",
    category: "Private Client"
  }
];
