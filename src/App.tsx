import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowLeft, ArrowUpRight, Facebook, Mail, MapPin, Menu, MessageCircle, Star, X } from 'lucide-react';
import { Link, Route, Switch, Router as WouterRouter, useRoute } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import products from '@/data/products.json';

type Channel = 'retail' | 'wholesale';
type Product = {
  id: string;
  title: string;
  description: string;
  category: string;
  brand: string;
  channel: Channel[];
  minOrderQty: number;
  sizes: string[];
  images: string[];
  video?: string;
  featured?: boolean;
  featuredLimit?: number;
  soldOut?: boolean;
  fabric?: string;
  includes?: string;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const productGroupKey = (product: Product, image: string) => {
  const filename = decodeURI(image).split('/').pop() ?? '';
  const stem = filename.replace(/\.[^.]+$/, '');

  if (product.category === 'casual-wears') {
    return stem.replace(/-\d+$/, '');
  }

  if (product.category === 'semi-formals') {
    return stem.replace(/ \(\d+\)$/, '');
  }

  return stem.match(/^\d+/)?.[0] ?? stem;
};

const productTitle = (product: Product, groupKey: string, index: number) => {
  if (product.category === 'casual-wears') return groupKey;
  const number = String(index + 1).padStart(2, '0');
  if (product.category === 'semi-formals') return `Exclusive Embroidered Edit ${number}`;
  if (product.category === 'shawls') return `Signature Shawl ${number}`;
  return `${product.title} ${number}`;
};

const expandCatalog = (rows: Product[]) =>
  rows.flatMap((product) => {
    const grouped = new Map<string, string[]>();
    product.images.forEach((image) => {
      const key = productGroupKey(product, image);
      grouped.set(key, [...(grouped.get(key) ?? []), image]);
    });

    return [...grouped.entries()].map(([groupKey, images], index) => ({
      ...product,
      id: `${product.id}-${slugify(groupKey)}-${index + 1}`,
      title: productTitle(product, groupKey, index),
      images,
      video: index === 0 ? product.video : undefined,
      featured: product.featured === true && index < (product.featuredLimit ?? 6),
    }));
  });

const catalog = expandCatalog(products as Product[]);
const categories = [
  { slug: 'casual-wears', label: 'Casual Wear', note: 'Easy layers for every day', image: '/images/casual-wears/Amber Rose Maroon-2.png' },
  { slug: 'wedding-season', label: 'Wedding Season', note: 'For the days that gather us', image: '/images/wedding-season/3-1.jpeg' },
  { slug: 'semi-formals', label: 'Semi Formal', note: 'The art of being just dressed', image: '/images/semi-formals/WhatsApp Image 2026-09-05 at 2.34.44 PM.jpeg' },
  { slug: 'winter-season', label: 'Winter Season', note: 'Warmth with a little theatre', image: '/images/winter-season/10-1.png' },
  { slug: 'summer-season', label: 'Summer Season', note: 'Lawn, made luminous', image: '/images/summer-season/1-1.png' },
  { slug: 'shawls', label: 'Shawls', note: 'The finishing gesture', image: '/images/shawls/WhatsApp Image 2026-09-05 at 3.03.05 PM.jpeg' },
];
const categoryMeta: Record<string, { heading: string; description?: string }> = {
  'summer-season': {
    heading: 'Lawn Collection Vol 70',
    description: 'Ayesha Attires bring the luxurious fabric and impeccable designs, representing the perfect balance of tradition and contemporary flair - intricate heavy embroidery, banarasi dora lawn fabrics, flapper/palazzo/trousers, and printed voile dupatta.',
  },
  'casual-wears': { heading: 'BIN SAEED KHADDAR', description: '3 Pcs Stitched Collection' },
  'winter-season': {
    heading: 'WINTER COLLECTIONS - VOL 67',
    description: 'Gul-e-Rana - stun this season in smart 3-piece suits featuring an elegant premium banarasi dora, intricate printed and embroidered patch bordering, includes munar dupatta and flapper/palazzo/trousers.',
  },
  'semi-formals': { heading: 'Semi Formal Exclusive Embroidered Collections' },
  'wedding-season': { heading: '' },
  shawls: { heading: '' },
};
const reviews = [
  { name: 'Misses Owais', text: 'Amazing collection, best stuff, outclassed quality.' },
  { name: 'GFX Consultant', text: 'This is the best store for prices. Amazing customer support and return policies. Best store and customer driven.' },
  { name: 'Malikahmad', text: 'They have an extensive range of original clothes. World standards customer service with easy returns. Highly recommended.' },
  { name: 'Malik Awais', text: 'This store works only with original products, amazing customer-driven policies. 100% satisfied seller.' },
  { name: 'asma umair', text: 'Excellent customer dealing. Good fabric. Highly recommended to Libasaljannah.' },
  { name: 'Gaming By M.A.', text: 'Yaha se mujhe humesha behtareen cheez mili hai.' },
];
type BlogPost = {
  slug: string;
  title: string;
  category: string;
  body: string;
};

const blogPosts: BlogPost[] = [
  {
    slug: 'lawn-collection-vol-70-styling',
    title: 'How to Style the Lawn Collection Vol 70 for Everyday Wear',
    category: 'summer-season',
    body: 'Lawn season is when comfort and elegance finally meet, and the Lawn Collection Vol 70 makes that pairing effortless. Built on banarasi dora fabric with intricate heavy embroidery, each piece balances traditional craftsmanship with a silhouette that feels current. For daytime wear, pair the printed voile dupatta loosely over the shoulder and keep accessories minimal so the embroidery stays the focal point. For evening get-togethers, switch the flapper trousers for a straight-cut palazzo and add statement earrings. The breathable lawn fabric means these pieces move with you through long, warm days without losing their shape or structure - which is exactly what makes a lawn suit worth investing in season after season.',
  },
  {
    slug: 'bin-saeed-khaddar-winter-essential',
    title: '3-Piece Stitched Suits: Why Bin Saeed Khaddar is a Winter Wardrobe Essential',
    category: 'casual-wears',
    body: 'Khaddar has earned its place as a winter staple because it does something few fabrics manage: it keeps you warm without feeling heavy. The Bin Saeed Khaddar 3-piece stitched collection takes that comfort a step further by arriving ready to wear, so there\'s no tailoring wait between you and your next outfit. The slightly textured weave holds prints and embroidery beautifully, which is why these suits photograph as well as they feel. Layer a plain shawl over a printed khaddar set for the office, or let the outfit stand on its own for a casual weekend outing - either way, this is the kind of suit that earns repeat wear all winter long.',
  },
  {
    slug: 'gul-e-rana-winter-2026-styling',
    title: 'Gul-e-Rana Edit: Styling Premium Banarasi Dora Suits for Winter 2026',
    category: 'winter-season',
    body: 'The Gul-e-Rana edit is built for the days when you want winter dressing to feel a little more special. Each 3-piece suit features a premium banarasi dora fabric with intricate printed and embroidered patch bordering, paired with a munar dupatta and your choice of flapper, palazzo, or trouser. Style it for a family gathering by keeping the dupatta draped in a single elegant fold across the front, letting the patch bordering show at the hem. For something more relaxed, swap the dupatta drape for a simple shoulder throw and let the embroidery on the kameez carry the look. This is a collection designed to move easily between smart-casual and semi-formal without ever feeling like you\'re overdressed.',
  },
  {
    slug: 'semi-formal-embroidered-buyers-guide',
    title: 'A Buyer\'s Guide to Semi-Formal Embroidered Collections',
    category: 'semi-formals',
    body: 'Semi-formal dressing sits in a tricky middle ground - too casual and you under-dress for the event, too elaborate and you overshoot it. Our Exclusive Embroidered Collection is designed specifically for that middle ground: rich enough for an evening event, wearable enough for a daytime one. When choosing a piece, look at the embroidery placement first - necklines and hems with concentrated detailing photograph better and need fewer accessories, while all-over embroidered pieces work best kept simple elsewhere. Darker tones suit evening functions, while lighter, pastel embroidered sets are better suited to daytime semi-formal events like lunches or engagement ceremonies.',
  },
  {
    slug: 'munar-vs-printed-voile-dupatta',
    title: 'How to Pick the Right Dupatta: Munar vs Printed Voile',
    category: 'winter-season',
    body: 'The dupatta is often the piece that decides how an entire outfit feels, and choosing between a munar dupatta and a printed voile one comes down to the occasion. Munar dupattas, with their textured weave and richer finish, suit suits meant for gatherings and semi-formal events - they hold their shape well when draped and add visual weight to embroidered suits. Printed voile dupattas, on the other hand, are lighter and airier, better suited to everyday and daytime wear where you want the outfit to feel effortless rather than occasion-heavy. As a simple rule: if the suit is already heavily embroidered, a plainer munar dupatta balances it out, while a printed voile dupatta works best over simpler, solid-colored suits.',
  },
  {
    slug: 'wholesale-buying-guide',
    title: 'Wholesale Buying Guide: How to Order in Bulk from Libas Al Janna',
    category: 'wholesale',
    body: 'Ordering wholesale from Libas Al Janna is simple and built around direct communication rather than a fixed online checkout. Browse any of our six categories or the brand page in Wholesale mode, where every product displays its minimum order quantity instead of a price. Once you\'ve picked your products, tap "Inquire on WhatsApp" and our team will confirm availability, bulk pricing, and delivery timelines directly with you. This approach lets us offer better rates than fixed online pricing would allow, since every bulk order is confirmed individually based on quantity and fabric availability.',
  },
];

const imagePath = (path: string) => encodeURI(path);
const whatsapp = (message: string) => `https://wa.me/923137517390?text=${encodeURIComponent(message)}`;

function useSeo(title: string, description: string, image?: string) {
  useEffect(() => {
    const previousTitle = document.title;
    const previousTags = new Map<string, { element: HTMLMetaElement; content: string | null }>();
    const createdTags: HTMLMetaElement[] = [];
    const setMeta = (selector: string, attributes: Record<string, string>, content: string) => {
      const existing = document.head.querySelector<HTMLMetaElement>(selector);
      const tag = existing ?? document.createElement('meta');
      if (existing) previousTags.set(selector, { element: existing, content: existing.getAttribute('content') });
      else {
        Object.entries(attributes).forEach(([key, value]) => tag.setAttribute(key, value));
        createdTags.push(tag);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    document.title = title;
    setMeta('meta[name="description"]', { name: 'description' }, description);
    setMeta('meta[property="og:title"]', { property: 'og:title' }, title);
    setMeta('meta[property="og:description"]', { property: 'og:description' }, description);
    setMeta('meta[property="og:type"]', { property: 'og:type' }, image ? 'article' : 'website');
    setMeta('meta[property="og:url"]', { property: 'og:url' }, window.location.href);
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, title);
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, description);
    if (image) {
      setMeta('meta[property="og:image"]', { property: 'og:image' }, new URL(image, window.location.origin).toString());
      setMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, new URL(image, window.location.origin).toString());
    }

    return () => {
      document.title = previousTitle;
      previousTags.forEach(({ element, content }) => {
        if (content === null) element.removeAttribute('content');
        else element.setAttribute('content', content);
      });
      createdTags.forEach((tag) => tag.remove());
    };
  }, [title, description, image]);
}

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.08 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''} ${className}`}>{children}</div>;
}

function Logo() {
  return <Link href="/" className="wordmark" data-testid="link-home-logo"><img className="brand-logo" src="/images/libas-al-janna-logo.jpg" alt="Libas Al Janna" /><span>Libas Al Janna</span></Link>;
}

function Header({ wholesale = false }: { wholesale?: boolean }) {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const close = () => setMenu(false);
  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`} data-testid="site-header">
      <Logo />
      <nav className="nav-links" aria-label="Main navigation">
        <Link href="/retail" data-testid="link-retail">Retail</Link>
        <Link href="/wholesale" data-testid="link-wholesale">Wholesale</Link>
        <Link href="/journal" data-testid="link-journal">Journal</Link>
      </nav>
      <a className="header-action" href={whatsapp('Hi, I would like to speak with Libas Al Janna.')} target="_blank" rel="noreferrer" data-testid="link-header-contact">Contact Us</a>
      <button className="mobile-toggle" onClick={() => setMenu(!menu)} aria-label="Toggle navigation" data-testid="button-mobile-menu">
        {menu ? <X size={20} /> : <Menu size={20} />}
      </button>
      {menu && <div className="mobile-menu">
        <Link href="/retail" onClick={close} data-testid="mobile-link-retail">Retail</Link>
        <Link href="/wholesale" onClick={close} data-testid="mobile-link-wholesale">Wholesale</Link>
        <Link href="/journal" onClick={close} data-testid="mobile-link-journal">Journal</Link>
        <a href={whatsapp('Hi, I would like to speak with Libas Al Janna.')} target="_blank" rel="noreferrer" onClick={close} data-testid="mobile-link-contact">Contact Us</a>
      </div>}
    </header>
  );
}

function Footer({ wholesale = false }: { wholesale?: boolean }) {
  return (
    <footer className={`site-footer ${wholesale ? 'wholesale-footer' : ''}`} data-testid="site-footer">
      <div className="footer-brand">
        <div className="eyebrow">Libas Al Janna</div>
        <h2 className="display">Wear the feeling.</h2>
        <p>Beautifully presented Pakistani clothing, shared directly from Lahore.</p>
      </div>
      <div className="footer-column">
        <h3>Visit</h3>
        <p className="footer-link"><MapPin size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />Shanghai Rd, Lahore, Pakistan</p>
        <a className="footer-link" href="mailto:malikahts@gmail.com" data-testid="link-footer-email"><Mail size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />malikahts@gmail.com</a>
        {!wholesale && <div className="footer-blog-block"><h3>Blog</h3><Link className="footer-link" href="/blog" data-testid="link-footer-blog">Read styling guides <ArrowUpRight size={13} style={{ verticalAlign: 'middle', marginLeft: 4 }} /></Link></div>}
      </div>
      <div className="footer-column">
        <h3>Connect</h3>
        <a className="footer-link" href="https://www.facebook.com/libasaljanna.pk" target="_blank" rel="noreferrer" data-testid="link-footer-facebook"><Facebook size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />Facebook</a>
        <a className="footer-link" href={whatsapp('Hi, I would like to speak with Libas Al Janna.')} target="_blank" rel="noreferrer" data-testid="link-footer-contact"><MessageCircle size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />Contact Us</a>
      </div>
      <div className="footer-column">
        <h3>Care</h3>
        <p>Having an issue or complaint? Email us at malikahts@gmail.com.</p>
      </div>
      <div className="footer-bottom"><span>Libas Al Janna, Lahore</span><span>Personal ordering, beautifully simple</span></div>
    </footer>
  );
}

function Shell({ children, wholesale = false, header = true }: { children: ReactNode; wholesale?: boolean; header?: boolean }) {
  return <div className={`site-shell ${wholesale ? 'wholesale' : ''}`}>{header && <Header wholesale={wholesale} />}{children}<Footer wholesale={wholesale} /></div>;
}

function Splash() {
  const [typed, setTyped] = useState('');
  const text = 'Libas Al Janna';
  useEffect(() => {
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(text.slice(0, index));
      if (index === text.length) window.clearInterval(timer);
    }, 105);
    return () => window.clearInterval(timer);
  }, []);
  return <div className="splash" data-testid="splash-screen"><div className="splash-inner"><div className="eyebrow splash-kicker">A Lahore wardrobe journal</div><h1 className="display splash-title">{typed}<span className="splash-cursor" /></h1><div className="splash-note">Collections for the days you remember</div></div></div>;
}

function HomeChoice() {
  const [splash, setSplash] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setSplash(false), 5000);
    return () => window.clearTimeout(timer);
  }, []);
  if (splash) return <Splash />;
  return (
    <Shell>
      <main className="choice-page">
        <div className="choice-intro reveal is-visible">
          <div className="eyebrow">Choose your edit</div>
          <h1 className="display">A wardrobe, <i>in two ways.</i></h1>
          <p>Explore the pieces as a personal order for yourself, or discover the collection for your store.</p>
        </div>
        <div className="choice-grid">
          <Link href="/retail" className="choice-panel" data-testid="choice-retail">
            <div className="choice-content"><div className="eyebrow">For your wardrobe</div><h2 className="display">Retail</h2><p>Seasonal Pakistani clothing selected with room to feel like yourself.</p><span className="text-link">Enter collection <span /></span></div>
          </Link>
          <Link href="/wholesale" className="choice-panel" data-testid="choice-wholesale">
            <div className="choice-content"><div className="eyebrow">For your edit</div><h2 className="display">Wholesale</h2><p>Thoughtful bulk buying, direct from our Lahore team.</p><span className="text-link">Explore wholesale <span /></span></div>
          </Link>
        </div>
      </main>
    </Shell>
  );
}

function VideoHero() {
  const video = catalog.find((product) => product.video)?.video ?? '/images/semi-formals/WhatsApp Video 2026-09-05 at 2.34.44 PM.mp4';
  return <section className="video-hero" data-testid="retail-video-hero"><Header /><video src={imagePath(video)} autoPlay muted loop playsInline poster={imagePath('/images/semi-formals/WhatsApp Image 2026-09-05 at 2.34.44 PM.jpeg')} /><div className="scroll-cue">Scroll to discover<i /></div></section>;
}

function Reviews() {
  const loop = [...reviews, ...reviews];
  return <section className="reviews-section section-wrap" data-testid="reviews-section"><Reveal><div className="section-heading"><div className="eyebrow" style={{ color: 'var(--rose-gold)' }}>Notes from the fitting room</div><h2 className="display">What Our Customers Say</h2><p>Good clothes should arrive with a good feeling. Here is what our customers have shared.</p></div></Reveal><div className="marquee-window"><div className="marquee-track">{loop.map((review, index) => <article className="review-card" key={`${review.name}-${index}`} data-testid={`review-card-${index}`}><div className="stars" aria-label="5 out of 5 stars">{[0, 1, 2, 3, 4].map((star) => <Star key={star} size={12} fill="currentColor" strokeWidth={1} />)}</div><h3>{review.name}</h3><p>{review.text}</p></article>)}</div></div></section>;
}

function CategoryBrowse({ wholesale = false }: { wholesale?: boolean }) {
  return <section className="section-wrap" data-testid="category-browse"><Reveal><div className="section-heading"><div className="eyebrow">{wholesale ? 'Wholesale edit' : 'The collection'}</div><h2 className="display">Find your next favourite.</h2><p>Six ways to enter the season, each with its own rhythm, texture, and occasion.</p></div></Reveal><div className="category-grid">{categories.map((category) => { const tile = <Link href={`/${wholesale ? 'wholesale' : 'retail'}/category/${category.slug}`} className="category-tile" style={{ '--tile': `url("${imagePath(category.image)}")` } as CSSProperties} data-testid={`link-category-${category.slug}`}><div className="category-copy"><div className="eyebrow">{category.note}</div><h3 className="display">{category.label}</h3><p>View collection <ArrowUpRight size={12} style={{ verticalAlign: 'middle' }} /></p></div></Link>; return wholesale ? <div key={category.slug}>{tile}</div> : <Reveal key={category.slug}>{tile}</Reveal>; })}</div></section>;
}

function BrandBrowse({ wholesale = false }: { wholesale?: boolean }) {
  return <section className="section-wrap" style={{ paddingTop: 0 }} data-testid="brand-browse"><Reveal><div className="section-heading"><div className="eyebrow">{wholesale ? 'A considered source' : 'Shop by brand'}</div><h2 className="display">One name to know.</h2></div></Reveal><Reveal><Link href={`/${wholesale ? 'wholesale' : 'retail'}/brand/munira-designers`} className="brand-card" data-testid="link-brand-munira"><div className="brand-card-content"><div className="eyebrow">The Munira edit</div><h3 className="display">Munira<br />Designers</h3><span className="text-link">Enter brand <span /></span></div></Link></Reveal></section>;
}

function CustomStitching({ wholesale = false }: { wholesale?: boolean }) {
  return <section id={`custom-stitching-${wholesale ? 'wholesale' : 'retail'}`} className={`service-section ${wholesale ? 'service-section-dark' : ''}`} data-testid={`custom-stitching-${wholesale ? 'wholesale' : 'retail'}`}><div className="service-section-inner"><div className="eyebrow">Made to measure</div><h2 className="display">Custom Stitching Available</h2><p>Customers and retailers can request custom stitching to their measurements, with a considered fit for the pieces they plan to wear or stock.</p><a className="order-button service-button" href={whatsapp("Hi, I'd like to ask about custom stitching.")} target="_blank" rel="noreferrer" data-testid={`link-custom-stitching-${wholesale ? 'wholesale' : 'retail'}`}>Ask About Custom Stitching</a></div></section>;
}

type TradeAccountForm = {
  name: string;
  business: string;
  city: string;
  whatsapp: string;
};

function TradeAccount() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TradeAccountForm>({ name: '', business: '', city: '', whatsapp: '' });
  const update = (field: keyof TradeAccountForm) => (event: ChangeEvent<HTMLInputElement>) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = `Trade Account Application - Name: ${form.name}, Business: ${form.business}, City: ${form.city}, WhatsApp: ${form.whatsapp}`;
    window.open(whatsapp(message), '_blank', 'noopener,noreferrer');
  };

  return <section id="trade-account-section" className="trade-account section-wrap" data-testid="trade-account-section"><div className="trade-account-inner"><div className="eyebrow">FOR BOUTIQUES & RETAILERS</div><h2 className="display">Order Wholesale</h2><p>Register for a trade account to unlock bulk pricing tiers, the full lookbook, and custom stitching runs.</p><button className="order-button trade-account-toggle" type="button" onClick={() => setOpen((current) => !current)} data-testid="button-trade-account">{open ? 'Close Application' : 'Apply for a Trade Account'}</button>{open && <form className="trade-account-form" onSubmit={submit}><label>Name<input required value={form.name} onChange={update('name')} /></label><label>Business Name<input required value={form.business} onChange={update('business')} /></label><label>City<input required value={form.city} onChange={update('city')} /></label><label>WhatsApp Number<input required type="tel" value={form.whatsapp} onChange={update('whatsapp')} /></label><button className="order-button" type="submit" data-testid="button-submit-trade-account">Send Application on WhatsApp</button></form>}</div></section>;
}

function RetailHome() {
  return <Shell header={false}><VideoHero /><Reviews /><CategoryBrowse /><BrandBrowse /><CustomStitching /></Shell>;
}

function ProductCard({ product, wholesale }: { product: Product; wholesale: boolean }) {
  const [tapped, setTapped] = useState(false);
  return <Link href={`/${wholesale ? 'wholesale' : 'retail'}/product/${product.id}`} className={`product-card ${tapped ? 'is-tapped' : ''} ${product.soldOut ? 'is-sold-out' : ''}`} onClick={() => setTapped(!tapped)} data-testid={`card-product-${product.id}`}>
    <div className="product-image"><img src={imagePath(product.images[0])} alt={product.title} loading="lazy" /><img src={imagePath(product.images[1] ?? product.images[0])} alt={`${product.title} alternate view`} loading="lazy" />{product.soldOut && <span className="sold-out-overlay">Sold Out</span>}{wholesale && <span className="moq-ribbon">MOQ: {product.minOrderQty} pcs</span>}</div>
    <div className={`product-meta ${wholesale ? 'wholesale-meta' : ''}`}>{wholesale && <div className="wholesale-card-specs"><span>{product.fabric}</span><span>{product.includes}</span></div>}<div><h3 data-testid={`text-product-title-${product.id}`}>{product.title}</h3><p>{product.category.replace('-', ' ')}</p></div></div>
  </Link>;
}

function CategoryPage({ wholesale }: { wholesale: boolean }) {
  const [, params] = useRoute(`/${wholesale ? 'wholesale' : 'retail'}/category/:category`);
  const category = params?.category ?? '';
  const meta = categoryMeta[category] ?? { heading: '' };
  const list = catalog.filter((product) => product.category === category && product.channel.includes(wholesale ? 'wholesale' : 'retail') && product.featured);
  const semi = category === 'semi-formals';
  const semiVideo = catalog.find((product) => product.category === 'semi-formals')?.video;
  return <Shell wholesale={wholesale}><main>{!wholesale && semi && semiVideo && <video className="category-video" src={imagePath(semiVideo)} autoPlay muted loop playsInline poster={imagePath('/images/semi-formals/WhatsApp Image 2026-09-05 at 2.34.44 PM.jpeg')} data-testid="semi-formals-video" />}<header className={`page-header ${semi ? 'semi-page-header' : ''}`}><div className="eyebrow">{wholesale ? 'Wholesale collection' : 'Collection'}</div>{meta.heading && <h1 className="display" data-testid="text-category-heading">{meta.heading}</h1>}{meta.description && <p data-testid="text-category-description">{meta.description}</p>}</header><section className="section-wrap" style={{ paddingTop: 0 }}><div className="product-grid">{list.map((product) => wholesale ? <ProductCard key={product.id} product={product} wholesale /> : <Reveal key={product.id}><ProductCard product={product} wholesale={false} /></Reveal>)}</div>{list.length === 0 && <div className="empty-state">This edit is being prepared. Return soon for the next story.</div>}</section></main></Shell>;
}

function BrandPage({ wholesale }: { wholesale: boolean }) {
  const list = catalog.filter((product) => product.brand === 'Munira Designers' && ['winter-season', 'summer-season', 'casual-wears'].includes(product.category) && product.channel.includes(wholesale ? 'wholesale' : 'retail'));
  return <Shell wholesale={wholesale}><main className="brand-page"><header className="page-header"><div className="eyebrow">{wholesale ? 'Wholesale brand edit' : 'Shop by brand'}</div><h1 className="display">Munira Designers</h1><p>A warm, expressive edit of winter, summer, and everyday pieces, gathered under one thoughtful name.</p><div className="brand-pills"><span className="brand-pill">Winter Season</span><span className="brand-pill">Summer Season</span><span className="brand-pill">Casual Wear</span></div></header><section className="section-wrap" style={{ paddingTop: 0 }}><div className="product-grid">{list.map((product) => wholesale ? <ProductCard key={product.id} product={product} wholesale /> : <Reveal key={product.id}><ProductCard product={product} wholesale={false} /></Reveal>)}</div></section></main></Shell>;
}

function ProductSpecs({ product, compact = false }: { product: Product; compact?: boolean }) {
  return <div className={`product-specs ${compact ? 'product-specs-compact' : ''}`}><div><strong>Fabric</strong><span>{product.fabric ?? 'Selected Libas Al Janna fabric'}</span></div><div><strong>Includes</strong><span>{product.includes ?? 'See product description'}</span></div>{!compact && <div><strong>Sizes</strong><span>{product.sizes.join(' / ')}</span></div>}</div>;
}

function ProductDetail({ wholesale }: { wholesale: boolean }) {
  const [, retailParams] = useRoute('/retail/product/:id');
  const [, wholesaleParams] = useRoute('/wholesale/product/:id');
  const id = (wholesale ? wholesaleParams?.id : retailParams?.id) ?? '';
  const product = catalog.find((item) => item.id === id);
  const [selected, setSelected] = useState('');
  const [gallery, setGallery] = useState(0);
  if (!product) return <Shell wholesale={wholesale}><div className="not-found"><div><div className="eyebrow">The piece moved on</div><h1 className="display">Not found.</h1><Link href={wholesale ? '/wholesale' : '/retail'} className="text-link">Back to collections <span /></Link></div></div></Shell>;
  const message = wholesale
    ? `Hi, I'd like to inquire about bulk pricing and availability for ${product.title}. The minimum order quantity is ${product.minOrderQty}.`
    : `Hi, I'd like to order ${product.title} in size ${selected}.`;
  return <Shell wholesale={wholesale}><main className="detail-page"><Link href={wholesale ? '/wholesale' : '/retail'} className="back-link" data-testid="link-back-collection"><ArrowLeft size={14} /> Back to collection</Link><div className="detail-layout"><div className="gallery"><div className="thumbs">{product.images.map((image, index) => <button className={`thumb ${gallery === index ? 'active' : ''}`} onClick={() => setGallery(index)} key={image} data-testid={`button-gallery-${index}`} aria-label={`View image ${index + 1}`}><img src={imagePath(image)} alt="" loading={index > 3 ? 'lazy' : 'eager'} /></button>)}</div><div className="main-image" data-testid="main-product-image"><img key={product.images[gallery]} src={imagePath(product.images[gallery])} alt={product.title} /></div></div><div className="detail-copy"><div className="eyebrow">{wholesale ? 'Wholesale inquiry' : 'A closer look'}</div><h1 className="display" data-testid="text-product-detail-title">{product.title}</h1><p>{product.description}</p>{wholesale && <><ProductSpecs product={product} /><div className="detail-moq" data-testid="text-product-moq">Minimum order quantity: {product.minOrderQty}</div></>}{product.soldOut && <div className="detail-sold-out" data-testid="text-product-sold-out">Sold Out</div>}{!wholesale && <><div className="size-title">Choose your size</div><div className="size-options" role="radiogroup">{product.sizes.map((size) => <button className={`size-option ${selected === size ? 'active' : ''}`} onClick={() => setSelected(size)} key={size} role="radio" aria-checked={selected === size} data-testid={`button-size-${size}`}>{size}</button>)}</div></>}<a className={`order-button ${product.soldOut ? 'is-disabled' : ''}`} href={product.soldOut || (!wholesale && !selected) ? undefined : whatsapp(message)} target="_blank" rel="noreferrer" aria-disabled={product.soldOut || (!wholesale && !selected)} data-testid="button-whatsapp-order" onClick={(event) => { if (product.soldOut) event.preventDefault(); }}>{product.soldOut ? 'Sold Out' : wholesale ? 'Inquire on WhatsApp' : 'Order Now on WhatsApp'}</a></div></div></main></Shell>;
}

function Blog() {
  useSeo('Libas Al Janna Blog | Styling Guides', 'Style guides and wholesale advice from Libas Al Janna, covering lawn, khaddar, winter suits, semi-formal embroidery, dupattas, and bulk ordering.');
  return <Shell><main><section className="blog-hero" data-testid="blog-hero"><div className="blog-hero-content"><div className="eyebrow">The Libas blog</div><h1 className="display">Notes on<br /><i>wearing well.</i></h1></div></section><section className="section-wrap"><div className="journal-grid">{blogPosts.map((post) => <Reveal key={post.slug}><Link href={`/blog/${post.slug}`} className="journal-card" data-testid={`card-blog-${post.slug}`}><div><div className="eyebrow">{post.category === 'wholesale' ? 'Wholesale' : post.category.replace('-', ' ')}</div><h2 className="display">{post.title}</h2><p>{post.body.split('. ')[0]}.</p></div><span className="read-more">Read Article <span /></span></Link></Reveal>)}</div></section></main></Shell>;
}

function BlogPost() {
  const [, blogParams] = useRoute('/blog/:slug');
  const [, journalParams] = useRoute('/journal/:slug');
  const params = blogParams ?? journalParams;
  const post = blogPosts.find((item) => item.slug === params?.slug);
  const description = post?.body.split('. ')[0] ? `${post.body.split('. ')[0]}.` : 'Read styling and buying guides from Libas Al Janna.';
  useSeo(post ? `${post.title} | Libas Al Janna` : 'Blog | Libas Al Janna', description);
  if (!post) return <Shell><div className="not-found"><div><div className="eyebrow">No entry here</div><h1 className="display">Not found.</h1><Link href="/blog" className="text-link">Back to blog <span /></Link></div></div></Shell>;
  const categoryLink = post.category === 'wholesale' ? '/wholesale' : `/retail/category/${post.category}`;
  return <Shell><article className="article-page"><Link href="/blog" className="back-link"><ArrowLeft size={14} /> Back to blog</Link><div className="eyebrow">Field note / {post.category.replace('-', ' ')}</div><h1 className="display">{post.title}</h1><div className="article-body">{post.body.split('. ').map((sentence, index, all) => <p key={index}>{sentence}{index < all.length - 1 ? '.' : ''}</p>)}</div><Link href={categoryLink} className="text-link">Explore this edit <span /></Link></article></Shell>;
}

function Router() {
  return <ErrorBoundary resetKey={window.location.pathname}><Switch>
    <Route path="/" component={HomeChoice} />
    <Route path="/retail" component={RetailHome} />
    <Route path="/retail/category/:category" component={() => <CategoryPage wholesale={false} />} />
    <Route path="/retail/brand/munira-designers" component={() => <BrandPage wholesale={false} />} />
    <Route path="/retail/product/:id" component={() => <ProductDetail wholesale={false} />} />
    <Route path="/wholesale" component={() => <WholesaleHome />} />
    <Route path="/wholesale/category/:category" component={() => <CategoryPage wholesale />} />
    <Route path="/wholesale/brand/munira-designers" component={() => <BrandPage wholesale />} />
    <Route path="/wholesale/product/:id" component={() => <ProductDetail wholesale />} />
    <Route path="/blog" component={Blog} />
    <Route path="/blog/:slug" component={BlogPost} />
    <Route path="/journal" component={Blog} />
    <Route path="/journal/:slug" component={BlogPost} />
    <Route component={NotFound} />
  </Switch></ErrorBoundary>;
}

function WholesaleHome() {
  return <Shell wholesale><main><section className="page-header" style={{ minHeight: '66vh', display: 'grid', placeItems: 'center' }}><div><div className="eyebrow">The considered trade edit</div><h1 className="display">Wholesale,<br /><i>with feeling.</i></h1><p>Build a collection your customers will remember. Browse the six edits, note the minimums, then speak with our Lahore team directly.</p><div style={{ marginTop: '2rem' }}><Link href="/wholesale/category/winter-season" className="text-link">Enter the edit <span /></Link></div></div></section><CategoryBrowse wholesale /><BrandBrowse wholesale /><TradeAccount /><CustomStitching wholesale /></main></Shell>;
}

const queryClient = new QueryClient();
function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;