import React, { useEffect, useMemo, useState } from 'react';
import aboutBanner from './assets/about.png';
import catalogueBanner from './assets/Catalogue banner.png';
import storageBanner from './assets/Storage banner.png';
import livePricesBanner from './assets/live-prices banner.png';
import sellToUsBanner from './assets/Sell to Us.png';
import privateAssetsBanner from './assets/main header logo/Montague Cole Private Assets Banner.png';
import gold1g from './assets/catalogue/1 g Gold Bar.png';
import gold5g from './assets/catalogue/5 g Gold Bar.png';
import gold10g from './assets/catalogue/10 g Gold Bar.png';
import gold20g from './assets/catalogue/20 g Gold Bar.png';
import gold50g from './assets/catalogue/50 g Gold Bar.png';
import gold100g from './assets/catalogue/100 g Gold Bar.png';
import gold1kg from './assets/catalogue/1 kg Gold Bar.png';
import silver100g from './assets/catalogue/100 g Silver Bar.png';
import silver250g from './assets/catalogue/250 g Silver Bar.png';
import silver500g from './assets/catalogue/500 g Silver Bar.png';
import silver1kg from './assets/catalogue/1 kg Silver Bar.png';
import dubaiGoldCoin from './assets/catalogue/1 oz Dubai Gold Coin.png';
import dubaiSilverCoin from './assets/catalogue/1 oz Dubai Silver Coin.png';
import dubaiPrototype from './assets/catalogue/Dubai Collection Burj Khalifa Prototype.png';
import giftBox from './assets/catalogue/Presentation Gift Box.png';

const pages = [
  ['/live-prices', 'Live Prices'],
  ['/catalogue', 'Catalogue'],
  ['/storage', 'Storage'],
  ['/mc-reserve', 'MC Reserve'],
  ['/sell-to-us', 'Sell to Us'],
  ['/about', 'About'],
  ['/contact', 'Contact'],
];

const products = [
  { name: '1 g Gold Bar', slug: '1-g-gold-bar', metal: 'Gold', grams: 1, category: 'Gold Bars', image: gold1g, featured: true },
  { name: '5 g Gold Bar', slug: '5-g-gold-bar', metal: 'Gold', grams: 5, category: 'Gold Bars', image: gold5g },
  { name: '10 g Gold Bar', slug: '10-g-gold-bar', metal: 'Gold', grams: 10, category: 'Gold Bars', image: gold10g, featured: true },
  { name: '20 g Gold Bar', slug: '20-g-gold-bar', metal: 'Gold', grams: 20, category: 'Gold Bars', image: gold20g },
  { name: '50 g Gold Bar', slug: '50-g-gold-bar', metal: 'Gold', grams: 50, category: 'Gold Bars', image: gold50g, featured: true },
  { name: '100 g Gold Bar', slug: '100-g-gold-bar', metal: 'Gold', grams: 100, category: 'Gold Bars', image: gold100g, featured: true },
  { name: '1 kg Gold Bar', slug: '1-kg-gold-bar', metal: 'Gold', grams: 1000, category: 'Gold Bars', image: gold1kg, featured: true },
  { name: '100 g Silver Bar', slug: '100-g-silver-bar', metal: 'Silver', grams: 100, category: 'Silver Bars', image: silver100g, featured: true },
  { name: '250 g Silver Bar', slug: '250-g-silver-bar', metal: 'Silver', grams: 250, category: 'Silver Bars', image: silver250g },
  { name: '500 g Silver Bar', slug: '500-g-silver-bar', metal: 'Silver', grams: 500, category: 'Silver Bars', image: silver500g },
  { name: '1 kg Silver Bar', slug: '1-kg-silver-bar', metal: 'Silver', grams: 1000, category: 'Silver Bars', image: silver1kg, featured: true },
  { name: '1 oz Dubai Gold Coin', slug: '1-oz-dubai-gold-coin', metal: 'Gold', grams: 31.1035, category: 'Gold Coins', image: dubaiGoldCoin, featured: true },
  { name: '1 oz Dubai Silver Coin', slug: '1-oz-dubai-silver-coin', metal: 'Silver', grams: 31.1035, category: 'Silver Coins', image: dubaiSilverCoin },
  { name: 'Dubai Collection Burj Khalifa Prototype', slug: 'dubai-collection-burj-prototype', metal: 'Gold', grams: 10, category: 'Dubai Collection', image: dubaiPrototype, preorder: true },
  { name: 'Presentation Gift Box', slug: 'gift-presentation-box', metal: 'Gift range', grams: 0, category: 'Gift Range', image: giftBox },
];

const categories = ['Gold Bars', 'Silver Bars', 'Gold Coins', 'Silver Coins', 'Dubai Collection', 'Gift Range'];
const styles = `
  :root{font-family:Arial,Helvetica,sans-serif;color:#252820;background:#f7f6f2;font-synthesis:none}
  *{box-sizing:border-box}
  .mc-site{--green:#174d39;--gold:#9b7a43;--muted:#666a60;--line:#deddd5;min-height:100vh;background:#f7f6f2}
  .mc-nav{position:sticky;top:0;z-index:5;background:#fff;border-bottom:1px solid var(--line)}
  .mc-nav-inner{max-width:1280px;margin:auto;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;gap:20px}
  .mc-brand{font:22px Georgia,serif;letter-spacing:.08em;color:var(--green);text-decoration:none;white-space:nowrap}
  .mc-nav-links{display:flex;flex-wrap:wrap;gap:18px}
  .mc-nav a{color:#35382f;text-decoration:none;font-size:13px}
  .mc-nav-links a[aria-current=page],.mc-nav a:hover{color:var(--gold)}
  .mc-ticker{background:#173f31;color:#fff}
  .mc-ticker-inner{max-width:1280px;margin:auto;padding:9px 24px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;font-size:12px}
  .mc-ticker a{color:#fff}
  .mc-main{max-width:1280px;margin:auto;padding:30px 24px 64px}
  .mc-hero{position:relative;overflow:hidden;min-height:250px;padding:48px;display:flex;align-items:center;background:#20392e;color:#fff;border-radius:5px;margin-bottom:34px}
  .mc-hero-image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.58}
  .mc-hero-copy{position:relative;z-index:1;max-width:720px}
  .mc-eyebrow{font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:var(--gold)}
  .mc-hero h1{font:clamp(34px,5vw,56px)/1.08 Georgia,serif;font-weight:400;margin:12px 0}
  .mc-hero p{line-height:1.65;max-width:650px}
  .mc-heading{margin:36px 0 18px}
  .mc-heading span{font-size:11px;letter-spacing:.13em;text-transform:uppercase;color:var(--gold)}
  .mc-heading h2{font:30px Georgia,serif;font-weight:400;margin:8px 0}
  .mc-heading p,.mc-muted,.mc-panel p{color:var(--muted);line-height:1.65}
  .mc-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
  .mc-product-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
  .mc-panel,.mc-product{background:#fff;border:1px solid var(--line);border-radius:5px;padding:22px}
  .mc-product{padding:0;overflow:hidden}
  .mc-product img{display:block;width:100%;aspect-ratio:1/1;object-fit:contain;background:#fff;padding:16px}
  .mc-product-copy{padding:16px}
  .mc-product h3{font:20px Georgia,serif;margin:8px 0}
  .mc-product-copy p{font-size:13px;color:var(--muted)}
  .mc-product-action,.mc-button{display:inline-block;border:1px solid var(--green);background:var(--green);color:#fff;padding:11px 16px;text-decoration:none;font:inherit;font-size:13px;cursor:pointer;border-radius:2px}
  .mc-button-outline{background:#fff;color:var(--green)}
  .mc-status{display:inline-block;border:1px solid #d8c9a9;color:#705b30;padding:5px 9px;font-size:11px}
  .mc-disclaimer,.mc-notice{margin:22px 0;padding:14px;background:#efeee8;color:#5e625a;font-size:12px;line-height:1.6}
  .mc-category-row,.mc-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:18px 0}
  .mc-chip{border:1px solid var(--line);background:#fff;color:#35382f;padding:9px 12px;cursor:pointer}
  .mc-chip[aria-pressed=true]{border-color:var(--green);background:var(--green);color:white}
  .mc-toolbar input,.mc-toolbar select,.mc-form input,.mc-form select,.mc-form textarea,.mc-converter input,.mc-converter select{font:inherit;padding:11px;border:1px solid #c9c9c1;background:#fff;min-width:0}
  .mc-toolbar input{flex:1;min-width:220px}
  .mc-product .mc-eyebrow{padding:0 16px}
  .mc-option-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
  .mc-panel h2,.mc-panel h3{font-family:Georgia,serif;font-weight:400}
  .mc-table-wrap{overflow:auto;background:#fff}
  .mc-table{border-collapse:collapse;width:100%;min-width:700px}
  .mc-table th,.mc-table td{text-align:left;padding:13px;border-bottom:1px solid var(--line);font-size:13px}
  .mc-timeline,.mc-formula{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin:24px 0}
  .mc-timeline article,.mc-formula article{background:#fff;border:1px solid var(--line);padding:18px}
  .mc-timeline article>span,.mc-formula article>span{color:var(--gold);font-size:12px}
  .mc-timeline h3,.mc-formula h3{font:18px Georgia,serif}
  .mc-converter,.mc-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
  .mc-form label,.mc-converter label{display:grid;gap:7px;font-size:13px}
  .mc-form-full{grid-column:1/-1}
  .mc-form textarea{resize:vertical}
  .mc-about-intro{display:grid;grid-template-columns:1.2fr .8fr;gap:30px;align-items:center;margin:38px 0}
  .mc-about-intro h2{font:34px/1.2 Georgia,serif;font-weight:400}
  .mc-about-intro p{color:var(--muted);line-height:1.65}
  .mc-about-image{width:100%;height:auto;border-radius:5px}
  .mc-metal-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
  .mc-price{font:26px Georgia,serif;color:var(--green)}
  .mc-chart{height:200px;width:100%;background:linear-gradient(180deg,#fff,#f1f0e9);border:1px solid var(--line);display:flex;align-items:end;gap:8px;padding:16px}
  .mc-chart i{flex:1;background:#527b62;min-height:20%;opacity:.75}
  .mc-faq details{background:#fff;border:1px solid var(--line);padding:15px;margin:8px 0}
  .mc-cta{margin-top:36px;padding:28px;background:#173f31;color:white;display:flex;align-items:center;justify-content:space-between;gap:18px}
  .mc-cta h2{font:26px Georgia,serif}
  .mc-footer{background:#173f31;color:#fff;padding:28px 24px;text-align:center;font-size:12px}
  .mc-footer nav{display:flex;justify-content:center;flex-wrap:wrap;gap:16px;margin-bottom:12px}
  .mc-footer a{color:#fff}
  .mc-site button:focus-visible,.mc-site a:focus-visible,.mc-site input:focus-visible,.mc-site select:focus-visible,.mc-site textarea:focus-visible{outline:3px solid #b89b60;outline-offset:3px}
  @media(max-width:900px){.mc-product-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.mc-grid,.mc-option-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.mc-metal-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.mc-about-intro{grid-template-columns:1fr}}
  @media(max-width:600px){.mc-nav-inner{align-items:flex-start;flex-direction:column}.mc-nav-links{gap:12px}.mc-main{padding:18px 14px 42px}.mc-hero{min-height:220px;padding:28px 22px}.mc-product-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.mc-grid,.mc-option-grid,.mc-timeline,.mc-formula{grid-template-columns:1fr}.mc-converter,.mc-form{grid-template-columns:1fr}.mc-form-full{grid-column:auto}.mc-cta{align-items:flex-start;flex-direction:column}.mc-product-copy{padding:12px}}
`;

function Hero({ title, eyebrow, copy, image }) {
  return <section className="mc-hero">
    {image && <img className="mc-hero-image" src={image} alt="" />}
    <div className="mc-hero-copy"><span className="mc-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div>
  </section>;
}

function SectionHeading({ label, title, copy }) {
  return <header className="mc-heading"><span>{label}</span><h2>{title}</h2>{copy && <p>{copy}</p>}</header>;
}

function PageLink({ href, children, outline = false }) {
  return <a className={`mc-button${outline ? ' mc-button-outline' : ''}`} href={href}>{children}</a>;
}

function LivePrices() {
  const [metal, setMetal] = useState('Gold');
  const [weight, setWeight] = useState('10');
  const value = Number(weight) > 0 ? 'Indicative value unavailable · demo data only' : 'Enter a valid weight';
  return <>
    <Hero title="Live Prices" eyebrow="Market reference · Demonstration data" copy="Gold, silver, platinum and palladium. This mock feed is not connected to a live market source." image={livePricesBanner}/>
    <div className="mc-notice" role="status">Demonstration prices only. Prices shown are not live and cannot be used to place an order.</div>
    <section className="mc-metal-grid">{['Gold','Silver','Platinum','Palladium'].map(item => <article className="mc-panel" key={item}><div className="mc-eyebrow">{item}</div><p className="mc-price">Indicative unavailable</p><p>24h change unavailable · demo data</p><small>Demo snapshot · not a live quote</small></article>)}</section>
    <SectionHeading label="Market reference" title="Price chart" copy="Chart display is illustrative only; it does not represent live market history."/>
    <div className="mc-chart" aria-label="Illustrative price chart">{[28,45,34,64,53,78,58,86,67,94,72,82].map((n,i)=><i key={i} style={{height:`${n}%`}}/>)}</div>
    <SectionHeading label="Indicative tool" title="Metal value converter" copy="Metal-only estimate; premiums, delivery, insurance and taxes are not included."/>
    <form className="mc-panel mc-converter" onSubmit={event=>event.preventDefault()}><label>Metal<select value={metal} onChange={event=>setMetal(event.target.value)}>{['Gold','Silver','Platinum','Palladium'].map(item=><option key={item}>{item}</option>)}</select></label><label>Weight<input type="number" min="0.001" step="any" value={weight} onChange={event=>setWeight(event.target.value)}/></label><label>Unit<select><option>Grams</option><option>Troy ounces</option><option>Kilograms</option><option>Tola</option></select></label><output>{value}</output></form>
    <SectionHeading label="Pricing, explained" title="How a product price is built"/>
    <section className="mc-formula">{['Live metal value','Product premium','Delivery','Insurance','Applicable taxes'].map((item,index)=><article key={item}><span>0{index+1}</span><h3>{item}</h3><p>Shown separately at the time of a confirmed order.</p></article>)}</section>
    <p className="mc-disclaimer">Prices are indicative until an order is confirmed and price-locked. Prices can go down as well as up. This is not investment advice.</p>
    <div className="mc-cta"><h2>Explore the catalogue</h2><PageLink href="/catalogue" outline>Browse the Catalogue</PageLink></div>
  </>;
}

function Catalogue() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('featured');
  const featured = useMemo(() => products.filter(product => product.featured), []);
  const visible = useMemo(() => {
    const search = query.trim().toLowerCase();
    const matched = products.filter(product =>
      (!category || product.category === category) &&
      (!search || `${product.name} ${product.metal} ${product.category}`.toLowerCase().includes(search))
    );
    if (sort === 'weight-asc') matched.sort((a,b)=>a.grams-b.grams);
    if (sort === 'weight-desc') matched.sort((a,b)=>b.grams-a.grams);
    if (sort === 'featured') matched.sort((a,b)=>(featured.indexOf(a)<0?99:featured.indexOf(a))-(featured.indexOf(b)<0?99:featured.indexOf(b)));
    return matched;
  }, [category, query, sort, featured]);
  return <>
    <Hero title="Catalogue" eyebrow="Physical precious metals · Placeholder catalogue" copy="Explore a planned selection of gold and silver bars and coins. Product information and prices are placeholders pending confirmation." image={catalogueBanner}/>
    <div className="mc-toolbar"><input type="search" aria-label="Search products" placeholder="Search by metal, type or weight" value={query} onChange={event=>setQuery(event.target.value)}/><label>Sort by <select value={sort} onChange={event=>setSort(event.target.value)}><option value="featured">Featured</option><option value="weight-asc">Weight low to high</option><option value="weight-desc">Weight high to low</option></select></label></div>
    <div className="mc-category-row" role="group" aria-label="Product category"><button className="mc-chip" aria-pressed={!category} onClick={()=>setCategory('')}>All ({products.length})</button>{categories.map(item=><button className="mc-chip" key={item} aria-pressed={category===item} onClick={()=>setCategory(item)}>{item} ({products.filter(p=>p.category===item).length})</button>)}</div>
    <p className="mc-muted" aria-live="polite">Showing {visible.length} of {products.length} products</p>
    <section className="mc-product-grid">{visible.map(product=><article className="mc-product" key={product.slug}>
      <img src={product.image} alt={product.name} loading="lazy"/><div className="mc-eyebrow">{product.metal} · Placeholder</div>
      <div className="mc-product-copy"><h3>{product.name}</h3><p>{product.preorder ? 'Prototype / Pre-order' : 'Placeholder product · details pending'}</p><strong>Indicative price unavailable</strong><p>{product.preorder ? <span className="mc-status">Pre-order</span> : <span className="mc-status">Purchasing paused</span>}</p><PageLink href={`/catalogue/${product.slug}`} outline>View Details</PageLink></div>
    </article>)}</section>
    <p className="mc-disclaimer">All listed products are placeholder data. Live prices are unavailable in this demo. Purchasing is paused. Product premiums, delivery, insurance and applicable taxes must be disclosed separately.</p>
  </>;
}

function ProductDetail({ slug }) {
  const product = products.find(item => item.slug === slug);
  if (!product) return <><Hero title="Product not found" eyebrow="Catalogue" copy="We could not find the product you requested."/><PageLink href="/catalogue">Back to Catalogue</PageLink></>;
  return <>
    <Hero title={product.name} eyebrow={`Placeholder product · ${product.metal}`} copy="Product specifications, availability and pricing are awaiting confirmation."/>
    <section className="mc-grid">
      <article className="mc-panel"><img src={product.image} alt={product.name} style={{width:'100%',height:'auto'}}/></article>
      <article className="mc-panel"><h2>Product information</h2><p><b>Metal:</b> {product.metal}</p><p><b>Gross weight:</b> {product.grams || '[PENDING CLIENT]'} g</p><p><b>Fineness:</b> Placeholder</p><p><b>Availability:</b> {product.preorder?'Prototype / Pre-order':'[PENDING CLIENT]'}</p><p>Fine weight, dimensions, refiner, packaging, certificate, dispatch and buy-back eligibility: [PENDING CLIENT].</p><p className="mc-disclaimer">A purchasable price is not available in this demo.</p><PageLink href="/contact?type=buying">Request a private quote</PageLink></article>
    </section>
    <p className="mc-disclaimer">Prices can go down as well as up. This is not investment advice.</p>
  </>;
}

function Storage() {
  const options = [
    ['Delivered to you','For clients who prefer physical delivery.','Delivery coverage and insurance: [PENDING LEGAL REVIEW]'],
    ['Collect in Dubai','Collection by private appointment.','Collection location and process: [PENDING CLIENT]'],
    ['Stored in Dubai','Ask us about potential storage arrangements.','Custody and ownership terms: [PENDING LEGAL REVIEW]'],
  ];
  return <>
    <Hero title="Storage" eyebrow="Options for physical metal" copy="Secure options for your physical metal. Terms and availability are subject to confirmation." image={storageBanner}/>
    <section className="mc-option-grid">{options.map(([title,copy,note])=><article className="mc-panel" key={title}><span className="mc-eyebrow">Storage option</span><h2>{title}</h2><p>{copy}</p><p>{note}</p><details><summary>Learn more</summary><p>Confirmed service scope and terms are pending.</p></details></article>)}</section>
    <SectionHeading label="At a glance" title="Compare your options"/>
    <div className="mc-table-wrap"><table className="mc-table"><thead><tr>{['Option','Where held','Access','Insurance','Fees','MC Reserve records'].map(t=><th key={t}>{t}</th>)}</tr></thead><tbody>
      <tr><th>Delivered to you</th><td>Client address [PENDING CLIENT]</td><td>Following delivery</td><td>[PENDING LEGAL REVIEW]</td><td>[PENDING CLIENT]</td><td>Order records only</td></tr>
      <tr><th>Collect in Dubai</th><td>[PENDING CLIENT]</td><td>By appointment</td><td>[PENDING LEGAL REVIEW]</td><td>[PENDING CLIENT]</td><td>Order records only</td></tr>
      <tr><th>Stored in Dubai</th><td>[PENDING LEGAL REVIEW]</td><td>[PENDING LEGAL REVIEW]</td><td>[PENDING LEGAL REVIEW]</td><td>[PENDING CLIENT]</td><td>Subject to confirmed service</td></tr>
    </tbody></table></div>
    <SectionHeading label="Illustrative only" title="Storage fee estimator"/>
    <form className="mc-panel mc-converter" onSubmit={event=>event.preventDefault()}><label>Metal<select><option>Gold</option><option>Silver</option></select></label><label>Total weight (g)<input type="number" min="1" defaultValue="100"/></label><label>Years<input type="number" min="1" max="50" defaultValue="1"/></label><output>Illustrative estimate only · fee schedule pending</output></form>
    <SectionHeading label="Common questions" title="Storage FAQs"/>
    <section className="mc-faq">{[['Can I collect my purchase?','Collection terms are pending confirmation.'],['Can I sell stored metal?','Sale and inspection process is pending confirmation.'],['Is stored metal insured?','Insurance terms are pending legal review.'],['Who owns stored metal?','Ownership terms are pending legal review.'],['How do I access stored metal?','Access terms are pending legal review.'],['What are the storage fees?','Fee schedule is pending confirmation.']].map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</section>
    <div className="mc-cta"><h2>Start a conversation</h2><PageLink href="/contact?type=storage" outline>Storage enquiry</PageLink></div>
  </>;
}

function Reserve() {
  const [email,setEmail] = useState('');
  const [signedIn,setSignedIn] = useState(false);
  if(signedIn) return <><Hero title="Welcome to MC Reserve" eyebrow="Private client area · Demo" copy={`Signed in as ${email} · Demo data only.`}/><section className="mc-grid">{['Orders','Documents','Owned products','Open requests'].map(label=><article className="mc-panel" key={label}><span className="mc-eyebrow">{label}</span><h2>0</h2><p>No demo {label.toLowerCase()}.</p></article>)}</section><article className="mc-panel"><h2>Demo account</h2><p>This frontend demonstration does not provide real authentication or private records.</p><button className="mc-button" onClick={()=>setSignedIn(false)}>Sign out</button></article></>;
  return <><Hero title="MC Reserve" eyebrow="Private client area" copy="A place for documents, order and delivery tracking, and asset records."/>
    <section className="mc-grid">{[['Documents in one place','A demo space for order documents.'],['Order and delivery tracking','View order milestones when available.'],['Asset records','Keep personal records together.']].map(([title,copy])=><article className="mc-panel" key={title}><h2>{title}</h2><p>{copy}</p></article>)}</section>
    <form className="mc-panel mc-form" onSubmit={event=>{event.preventDefault();setSignedIn(true);}}><div className="mc-form-full"><span className="mc-eyebrow">Demo access</span><h2>Sign in</h2><p>Use the demo account shown below. This is not production authentication.</p></div><label className="mc-form-full">Email<input type="email" value={email} onChange={event=>setEmail(event.target.value)} placeholder="demo@montaguecole.example" required/></label><label className="mc-form-full">Password<input type="password" minLength="12" required/></label><button className="mc-button mc-form-full">Continue to demo</button><small className="mc-form-full">Demo account: demo@montaguecole.example · Demo data only</small></form>
    <p className="mc-disclaimer">No real-time valuation or custody claims are made. This demo sign-in is not secure authentication.</p>
  </>;
}

function SellToUs() {
  const [sent,setSent] = useState(false);
  return <>
    <Hero title="Sell to Us" eyebrow="Gold Depot · Quote requests" copy="A private, transparent route to sell your gold and silver." image={sellToUsBanner}/>
    <section className="mc-timeline">{['Request a quote','Bring your metal for inspection','Testing and valuation','Settlement'].map((label,index)=><article key={label}><span>0{index+1}</span><h3>{label}</h3><p>{index===3?'Subject to legal review.':'The next step will be confirmed with you.'}</p></article>)}</section>
    <SectionHeading label="What we consider" title="Gold and silver items" copy="Eligibility is confirmed after inspection and testing."/>
    <section className="mc-option-grid">{[['Gold bars and coins','Bring any available purchase or product documentation.'],['Silver bars and coins','Bring the item and any available product details.'],['Scrap gold and jewellery','Metal content is assessed after inspection.'],['Scrap silver','Metal content is assessed after inspection.']].map(([a,b])=><article className="mc-panel" key={a}><h2>{a}</h2><p>{b}</p></article>)}</section>
    <SectionHeading label="Indicative only" title="Estimate a metal value" copy="The demo price feed and buy-back rate are placeholders; no offer or payout is generated."/>
    <form className="mc-panel mc-converter" onSubmit={event=>event.preventDefault()}><label>Metal<select><option>Gold</option><option>Silver</option></select></label><label>Item type<select><option>Bar or coin</option><option>Scrap jewellery</option><option>Other</option></select></label><label>Weight<input type="number" min="0.001" step="any" defaultValue="10"/></label><label>Unit<select><option>Grams</option><option>Troy ounces</option><option>Kilograms</option><option>Tola</option></select></label><output>Live pricing unavailable · indicative only</output></form>
    <SectionHeading label="Get in touch" title="Request a quote" copy="No instant payout. Any settlement follows inspection and testing."/>
    <form className="mc-panel mc-form" onSubmit={event=>{event.preventDefault();setSent(true);}}><label>Name<input required autoComplete="name"/></label><label>Email<input type="email" required autoComplete="email"/></label><label>Phone<input type="tel" required/></label><label>Country<input required autoComplete="country-name"/></label><label>Metal<select><option>Gold</option><option>Silver</option></select></label><label>Item type<select><option>Bar</option><option>Coin</option><option>Scrap</option></select></label><label>Estimated weight (g)<input type="number" min="0.001" required/></label><label>Purity<input placeholder="Not sure"/></label><label className="mc-form-full">Message<textarea rows="3"/></label><label className="mc-form-full"><input type="checkbox" required/> I agree to be contacted regarding this enquiry.</label><button className="mc-button mc-form-full">Send quote request</button>{sent&&<p className="mc-form-full" role="status">This demo form does not send enquiries. Please connect it to your service.</p>}</form>
    <p className="mc-disclaimer">A request is not an offer to buy or a commitment to pay.</p>
  </>;
}

function About() {
  return <>
    <Hero title="About Montague Cole" eyebrow="Montague Cole Bullion" copy="" image={aboutBanner}/>
    <section className="mc-about-intro"><div><span className="mc-eyebrow">Our story</span><h2>A Dubai house for physical precious metals.</h2><p>Montague Cole Bullion is the online precious-metals arm of Montague Cole Private Assets. It is being developed to serve retail investors, international buyers, collectors, Dubai visitors, corporate gifting buyers and private clients.</p><p>Founded [PENDING CLIENT]. Founders and team [PENDING CLIENT].</p></div><img className="mc-about-image" src={privateAssetsBanner} alt="Montague Cole Private Assets banner showcasing precious metals, diamonds, fine art and luxury watches"/></section>
    <SectionHeading label="Our proposition" title="A considered service" copy="Built around practical needs, with details subject to confirmation."/>
    <section className="mc-formula">{[['Buy','Explore physical gold and silver.'],['Sell','Request a quote through Gold Depot.'],['Store','Discuss available storage options.'],['Document','Keep order records in MC Reserve.'],['Manage','Enquire about private tangible assets.']].map(([h,p])=><article key={h}><span>MC</span><h3>{h}</h3><p>{p}</p></article>)}</section>
    <SectionHeading label="Our brands" title="A connected house"/>
    <section className="mc-option-grid">{[['Private Assets','A private-asset enquiry channel.'],['Bullion','Physical gold and silver.'],['Dubai Collection','Prototype / Pre-order designs inspired by Dubai.'],['MC Reserve','Private client records and requests.'],['Gold Depot','Sell-to-us quote requests.']].map(([h,p])=><article className="mc-panel" key={h}><h2>{h}</h2><p>{p}</p></article>)}</section>
    <article className="mc-panel"><span className="mc-eyebrow">Prototype / Pre-order</span><h2>The Dubai Collection</h2><p>Design concepts draw inspiration from Dubai’s skyline, Burj Khalifa and palm forms. These are prototypes, not in-stock products.</p></article>
    <SectionHeading label="Our approach" title="Standards we are working toward"/>
    <section className="mc-formula">{[['Product details','Clear specifications, once confirmed.'],['Pricing','A transparent breakdown of price components.'],['Packaging','Packaging information [PENDING CLIENT].'],['Delivery','Delivery and insurance terms [PENDING LEGAL REVIEW].'],['Storage','Storage options subject to final terms.'],['Support','Private client support. Contact details [PENDING CLIENT].']].map(([h,p])=><article key={h}><span>MC</span><h3>{h}</h3><p>{p}</p></article>)}</section>
    <article className="mc-panel"><h2>Private Assets</h2><p>Diamonds, gemstones, watches, jewellery, fine art and antiques are enquiry-only. No fixed prices or checkout.</p><PageLink href="/contact">Request a private consultation</PageLink></article>
    <p className="mc-disclaimer">Licences and compliance disclosures: [PENDING LEGAL REVIEW].</p>
    <div className="mc-cta"><h2>A private conversation, at your pace.</h2><PageLink href="/contact" outline>Contact the team</PageLink></div>
  </>;
}

function Contact() {
  const [sent,setSent] = useState(false);
  return <>
    <Hero title="Contact" eyebrow="Montague Cole Bullion" copy="Contact details and business hours are pending confirmation."/>
    <section className="mc-grid">{[['Email','[PENDING CLIENT]'],['Phone','[PENDING CLIENT]'],['WhatsApp','[PENDING CLIENT]']].map(([title,value])=><article className="mc-panel" key={title}><span className="mc-eyebrow">{title}</span><p>{value}</p></article>)}</section>
    <SectionHeading label="Get in touch" title="Send an enquiry"/>
    <form className="mc-panel mc-form" onSubmit={event=>{event.preventDefault();setSent(true);}}><label>Name<input required autoComplete="name"/></label><label>Email<input type="email" required autoComplete="email"/></label><label>Phone<input type="tel" autoComplete="tel"/></label><label>Enquiry type<select defaultValue={new URLSearchParams(window.location.search).get('type')||'Buying'}><option>Buying</option><option>Selling</option><option>Storage</option><option>Private Assets</option><option>Other</option></select></label><label className="mc-form-full">Message<textarea rows="5" minLength="20" maxLength="1000" required/></label><label className="mc-form-full"><input type="checkbox" required/> I agree to be contacted regarding this enquiry.</label><button className="mc-button mc-form-full">Send enquiry</button>{sent&&<p className="mc-form-full" role="status">This demo form does not send enquiries. Please connect it to your service.</p>}</form>
    <p className="mc-disclaimer">Address, hours and complaint process are pending confirmation. Complaints procedure: [PENDING LEGAL REVIEW].</p>
  </>;
}

const pageContent = {
  '/live-prices': LivePrices,
  '/catalogue': Catalogue,
  '/storage': Storage,
  '/mc-reserve': Reserve,
  '/sell-to-us': SellToUs,
  '/about': About,
  '/contact': Contact,
};

export default function NewPageCode() {
  const [path,setPath] = useState(() => `${window.location.pathname}${window.location.search}`);
  useEffect(() => {
    const onPopState = () => setPath(`${window.location.pathname}${window.location.search}`);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  const pathname = path.split('?')[0];
  const productMatch = pathname.match(/^\/catalogue\/([^/]+)$/);
  const detailProduct = productMatch ? products.find(item => item.slug === productMatch[1]) : undefined;
  const Page = pageContent[pathname];
  const navigate = (event, href) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    window.history.pushState({}, '', href);
    setPath(`${window.location.pathname}${window.location.search}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return <div className="mc-site">
    <style>{styles}</style>
    <header className="mc-nav"><div className="mc-nav-inner">
      <a className="mc-brand" href="/catalogue" onClick={event=>navigate(event,'/catalogue')}>MONTAGUE COLE</a>
      <nav className="mc-nav-links" aria-label="Main navigation">{pages.map(([href,label])=><a key={href} href={href} aria-current={pathname===href?'page':undefined} onClick={event=>navigate(event,href)}>{label}</a>)}</nav>
    </div></header>
    <aside className="mc-ticker"><div className="mc-ticker-inner"><span>Indicative demonstration feed</span><span>Gold · Indicative only</span><span>Silver · Indicative only</span><span>Platinum · Indicative only</span><a href="/live-prices" onClick={event=>navigate(event,'/live-prices')}>View prices</a></div></aside>
    <main className="mc-main">{Page ? <Page/> : productMatch ? <ProductDetail slug={productMatch[1]}/> : <Catalogue/>}</main>
    <footer className="mc-footer"><nav aria-label="Footer navigation">{pages.map(([href,label])=><a key={href} href={href} onClick={event=>navigate(event,href)}>{label}</a>)}</nav><span>Montague Cole Bullion · Demonstration content</span></footer>
  </div>;
}
