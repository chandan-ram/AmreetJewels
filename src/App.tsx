import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Heart, ShoppingBag, Eye, Star, ArrowRight, Check, X, 
  ChevronRight, Trash2, ShieldCheck, Percent, HelpCircle, MessageCircle 
} from 'lucide-react';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import QuickViewModal from './components/QuickViewModal';
import CheckoutSection from './components/CheckoutSection';
import TrackOrderSection from './components/TrackOrderSection';
import AdminSection from './components/AdminSection';
import AISearchAdvisor from './components/AISearchAdvisor';
import Footer from './components/Footer';
import { Product, CartItem, Order, Coupon } from './types';
import { 
  getStoredProducts, saveProducts, 
  getStoredCart, saveCart, 
  getStoredWishlist, saveWishlist, 
  getStoredOrders, saveOrders 
} from './lib/storage';

export default function App() {
  // Navigation & Page State
  const [activePage, setActivePage] = useState<'home' | 'shop' | 'track' | 'checkout' | 'admin'>('home');
  const [initialTrackingId, setInitialTrackingId] = useState('');

  // Products and Database State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('');
  const [priceRange, setPriceRange] = useState<number>(5000);
  const [sortBy, setSortBy] = useState<string>('featured');

  // Interactive drawers and overlays
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Quick View State
  const [selectedQuickViewProduct, setSelectedQuickViewProduct] = useState<Product | null>(null);

  // Initialize DB on mount
  useEffect(() => {
    setProducts(getStoredProducts());
    setCart(getStoredCart());
    setWishlist(getStoredWishlist());
    setOrders(getStoredOrders());

    // Check URL pathname for routes (e.g. /admin, /track, /shop, /checkout)
    const pathname = window.location.pathname;
    if (pathname === '/admin') {
      setActivePage('admin');
    } else if (pathname === '/track') {
      setActivePage('track');
    } else if (pathname === '/shop') {
      setActivePage('shop');
    } else if (pathname === '/checkout') {
      setActivePage('checkout');
    } else {
      setActivePage('home');
    }

    // Check for custom url parameters (e.g. for tracking ID redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const trackId = urlParams.get('trackId');
    if (trackId) {
      setInitialTrackingId(trackId);
      setActivePage('track');
    }
  }, []);

  // Listen to popstate for browser back/forward routing
  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname;
      if (pathname === '/admin') {
        setActivePage('admin');
      } else if (pathname === '/track') {
        setActivePage('track');
      } else if (pathname === '/shop') {
        setActivePage('shop');
      } else if (pathname === '/checkout') {
        setActivePage('checkout');
      } else {
        setActivePage('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync state functions
  const handleAddToCart = (product: Product, variantName: string, quantity = 1) => {
    let currentCart = [...cart];
    const existingIdx = currentCart.findIndex(
      item => item.product.id === product.id && item.selectedVariant === variantName
    );

    if (existingIdx > -1) {
      currentCart[existingIdx].quantity += quantity;
    } else {
      currentCart.push({ product, selectedVariant: variantName, quantity });
    }

    setCart(currentCart);
    saveCart(currentCart);
    setIsCartOpen(true); // Open drawer for premium interaction
  };

  const handleUpdateCartQty = (idx: number, newQty: number) => {
    let currentCart = [...cart];
    if (newQty <= 0) {
      currentCart.splice(idx, 1);
    } else {
      currentCart[idx].quantity = newQty;
    }
    setCart(currentCart);
    saveCart(currentCart);
  };

  const handleRemoveFromCart = (idx: number) => {
    let currentCart = [...cart];
    currentCart.splice(idx, 1);
    setCart(currentCart);
    saveCart(currentCart);
  };

  const handleClearCart = () => {
    setCart([]);
    saveCart([]);
  };

  const handleToggleWishlist = (productId: string) => {
    let currentWishlist = [...wishlist];
    const index = currentWishlist.indexOf(productId);

    if (index > -1) {
      currentWishlist.splice(index, 1);
    } else {
      currentWishlist.push(productId);
    }

    setWishlist(currentWishlist);
    saveWishlist(currentWishlist);
  };

  // Custom Navigation proxy
  const handleNavigate = (pageString: string) => {
    if (pageString === 'wishlist') {
      setIsWishlistOpen(true);
      return;
    }
    if (pageString.startsWith('track?id=')) {
      const trackingId = pageString.split('=')[1];
      setInitialTrackingId(trackingId);
      setActivePage('track');
      window.history.pushState(null, '', '/track?trackId=' + trackingId);
    } else if (pageString.startsWith('shop?category=')) {
      const categoryName = decodeURIComponent(pageString.split('=')[1]);
      setSelectedCategory(categoryName);
      setActivePage('shop');
      window.history.pushState(null, '', '/shop?category=' + encodeURIComponent(categoryName));
    } else {
      setActivePage(pageString as any);
      const urlPath = pageString === 'home' ? '/' : '/' + pageString;
      window.history.pushState(null, '', urlPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Live filter computation
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    const matchesColor = selectedColor ? p.color === selectedColor : true;
    const matchesOccasion = selectedOccasion ? p.occasion === selectedOccasion : true;
    const matchesPrice = p.price <= priceRange;

    return matchesSearch && matchesCategory && matchesColor && matchesOccasion && matchesPrice;
  });

  // Sort computation
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // featured/default
  });

  // Clear filters helper
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedColor('');
    setSelectedOccasion('');
    setPriceRange(5000);
    setSortBy('featured');
  };

  return (
    <div className="min-h-screen bg-beige-soft text-charcoal selection:bg-gold/20 flex flex-col justify-between">
      {/* HEADER BAR */}
      <Header 
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        currentPage={activePage}
        onNavigate={handleNavigate}
        products={products}
        onProductClick={(p) => setSelectedQuickViewProduct(p)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* RENDER PAGES DYNAMICALLY */}
      <main className="flex-grow pt-24">
        {activePage === 'home' && (
          <div className="space-y-16 animate-in fade-in duration-300">
            {/* Elegant Hero Banner - Artistic Flair Edition */}
            <section className="relative py-12 lg:py-24 overflow-hidden border-b border-border-warm bg-[#F9F5F0]">
              {/* Abstract decorative ambient shapes */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-5 flex flex-col text-left space-y-6">
                  <span className="text-gold uppercase tracking-[0.3em] text-[11px] font-bold italic block">
                    Handcrafted in Jaipur
                  </span>
                  
                  <h1 className="font-serif text-5xl sm:text-6xl leading-[1.1] text-charcoal font-bold tracking-tight">
                    The Festive<br/>
                    <span className="italic font-normal">Radiance</span> Edit
                  </h1>
                  
                  <p className="text-gray-600 leading-relaxed text-sm max-w-md font-sans">
                    Discover our latest collection of tarnish-free, 22k Gold-plated kundan and meenakari jewellery designed for the modern woman who cherishes royal traditions.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 pt-2 font-sans">
                    <button 
                      onClick={() => handleNavigate('shop')}
                      className="bg-charcoal hover:bg-black text-white px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all shadow-xs rounded-xs border border-charcoal text-center"
                    >
                      Shop Collection
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedCategory('Jewellery Sets');
                        handleNavigate('shop');
                      }}
                      className="border border-charcoal text-charcoal hover:bg-charcoal/5 px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-xs text-center"
                    >
                      View Lookbook
                    </button>
                  </div>
                </div>

                {/* Hero side image showcase with custom rounded-tr-120px and floating badge */}
                <div className="lg:col-span-7 relative flex justify-center lg:justify-end">
                  <div className="w-full max-w-[520px] h-[360px] bg-white rounded-tr-[120px] relative overflow-hidden flex items-center justify-center border-4 border-white shadow-xl">
                    <img 
                      src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800" 
                      alt="Premium Artificial Kundan Set"
                      className="absolute inset-0 w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-charcoal/60 via-transparent to-transparent" />
                    
                    {/* Foreground title overlay matching featured piece design */}
                    <div className="relative text-center px-12 py-6 bg-white/70 backdrop-blur-xs max-w-sm rounded-xs border border-white/50 shadow-sm">
                      <div className="font-serif text-2xl italic text-gold mb-1">Featured Piece</div>
                      <div className="font-serif text-lg text-charcoal font-bold">The Meenakari Bridal Choker</div>
                      <div className="mt-3 h-[1px] w-12 bg-gold mx-auto"></div>
                    </div>
                    
                    <div className="absolute bottom-4 right-6 font-serif italic text-xs text-white/90">
                      Model wears 'Utsav' Collection
                    </div>
                  </div>

                  {/* Floating Trust Badge */}
                  <div className="absolute -bottom-6 left-4 lg:-left-12 bg-white p-5 shadow-lg border border-border-warm flex items-center gap-4 w-64 rounded-xs z-10">
                    <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center text-gold font-serif font-bold text-base">4.9</div>
                    <div className="text-left">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-charcoal">Trusted by 50K+ Women</div>
                      <div className="text-[10px] text-gray-400">Across India and Globally</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Featured Collections / Categories - Artistic Flair Style */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="flex justify-between items-end border-b border-border-warm pb-3">
                <h2 className="font-serif text-2xl text-charcoal font-bold">Shop by Category</h2>
                <button 
                  onClick={() => {
                    handleClearFilters();
                    handleNavigate('shop');
                  }}
                  className="text-[11px] uppercase font-bold tracking-widest border-b border-[#1A1A1A] pb-1 hover:text-gold hover:border-gold transition-colors"
                >
                  View All
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {[
                  { name: 'Necklaces', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=300', count: products.filter(p => p.category === 'Necklaces').length },
                  { name: 'Earrings', image: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=300', count: products.filter(p => p.category === 'Earrings').length },
                  { name: 'Rings', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=300', count: products.filter(p => p.category === 'Rings').length },
                  { name: 'Bangles', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=300', count: products.filter(p => p.category === 'Bangles').length },
                  { name: 'Jewellery Sets', image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=300', count: products.filter(p => p.category === 'Jewellery Sets').length }
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleNavigate(`shop?category=${encodeURIComponent(item.name)}`)}
                    className="bg-white p-4 flex flex-col items-center group cursor-pointer border border-border-warm hover:border-gold/50 rounded-xs transition-all duration-300"
                  >
                    <div className="w-full aspect-[4/5] bg-[#F3F0EC] mb-4 overflow-hidden rounded-xs flex items-center justify-center relative">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-[12px] font-bold uppercase tracking-widest text-charcoal group-hover:text-gold transition-colors">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1">
                      {item.count} Styles
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Bestselling Showcases */}
            <section className="bg-white border-t border-b border-gold/10 py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gold/10 pb-4">
                  <div>
                    <span className="text-gold uppercase tracking-widest text-[11px] font-bold font-sans">Hot Right Now</span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">Best Selling Treasures</h2>
                  </div>
                  <button 
                    onClick={() => {
                      handleClearFilters();
                      handleNavigate('shop');
                    }}
                    className="text-xs font-bold text-gold hover:text-gold-dark flex items-center space-x-1 uppercase tracking-wider font-sans shrink-0"
                  >
                    <span>View Full Catalog</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.slice(0, 4).map(product => (
                    <ProductCard 
                      key={product.id}
                      product={product}
                      onProductClick={(p) => setSelectedQuickViewProduct(p)}
                      onQuickView={(p) => setSelectedQuickViewProduct(p)}
                      onToggleWishlist={handleToggleWishlist}
                      isWishlisted={wishlist.includes(product.id)}
                      onAddToCart={(prod, variantName) => handleAddToCart(prod, variantName, 1)}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Countdown Promo Banner */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-charcoal text-white rounded-3xl border border-gold/30 p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
                {/* Decorative glows */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-gold/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="space-y-4 max-w-xl text-left z-10">
                  <div className="inline-flex items-center space-x-2 bg-gold/15 border border-gold/30 px-3 py-1 rounded-sm text-gold text-[10px] font-bold uppercase tracking-wider font-sans">
                    <Percent size={12} />
                    <span>Limited Time Festive Promo</span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-4xl font-bold">Enjoy Extra 20% Off Storewide</h3>
                  <p className="text-xs text-gray-300 font-sans leading-relaxed">
                    Celebrate the auspicious season with premium, tarnish-free, and hypoallergenic Indian boutique jewellery. Apply coupon code at shopping bag checkout.
                  </p>
                  
                  <div className="flex items-center space-x-3.5 bg-white/5 border border-white/10 px-4 py-3 rounded-xl max-w-xs">
                    <span className="text-[11px] text-gray-400 font-semibold font-sans">PROMO CODE:</span>
                    <span className="text-sm font-bold text-gold font-mono uppercase tracking-widest bg-gold/10 px-2.5 py-0.5 rounded-sm">FESTIVE20</span>
                  </div>
                </div>

                <div className="z-10 shrink-0 text-center space-y-2">
                  <div className="flex space-x-3 justify-center">
                    {[
                      { val: '02', label: 'Days' },
                      { val: '14', label: 'Hours' },
                      { val: '45', label: 'Mins' },
                      { val: '22', label: 'Secs' }
                    ].map((t, idx) => (
                      <div key={idx} className="bg-white/10 border border-white/15 px-3.5 py-3 rounded-lg min-w-[60px]">
                        <p className="text-xl font-bold text-gold font-mono">{t.val}</p>
                        <p className="text-[9px] text-gray-300 font-sans uppercase tracking-widest">{t.label}</p>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => handleNavigate('shop')}
                    className="bg-gold hover:bg-gold-dark text-white font-bold py-3 px-8 rounded-lg text-xs uppercase tracking-widest transition-all w-full font-sans"
                  >
                    Claim Discount Now
                  </button>
                </div>
              </div>
            </section>

            {/* Verified Customer Testimonials */}
            <section className="bg-beige-soft py-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                <div className="text-center space-y-2">
                  <span className="text-gold uppercase tracking-widest text-[11px] font-bold font-sans font-medium">Stories of Sparkle</span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">Trusted by Over 10,000 Verified Brides</h2>
                  <div className="w-12 h-0.5 bg-gold mx-auto mt-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans text-xs">
                  {[
                    { name: "Anjali Deshmukh", city: "Pune", text: "I ordered the Vandana Kundan Choker for my brother's wedding, and I was shocked by how heavy and premium it looked! It looks exactly like pure gold. Everyone kept asking if it was real. Best purchase!", stars: 5 },
                    { name: "Riya Sen", city: "Kolkata", text: "The anti-allergic alloy works perfectly. I usually get bad rashes from artificial earrings within 2 hours, but I wore AmreetJewels' Peacock Jhumkas for an entire 8-hour Diwali event with zero reactions. Absolute lifesaver!", stars: 5 },
                    { name: "Meera Nair", city: "Bangalore", text: "Incredibly fast shipment! Tracked my order easily, and it arrived in a gorgeous red velvet box. The meenakari work is flawless. Sona the AI stylist recommended this based on my green saree, and she was 100% correct!", stars: 5 }
                  ].map((t, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-gold/10 shadow-2xs space-y-3 flex flex-col justify-between">
                      <div className="space-y-2 text-left">
                        <div className="flex text-amber-400">
                          {Array.from({ length: t.stars }).map((_, i) => (
                            <Star key={i} size={13} fill="currentColor" className="stroke-none" />
                          ))}
                        </div>
                        <p className="text-gray-600 leading-relaxed italic">"{t.text}"</p>
                      </div>
                      <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-[10px]">
                        <span className="font-bold text-charcoal">{t.name}</span>
                        <span className="text-gray-400 uppercase font-semibold">{t.city}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* SHOP PAGE */}
        {activePage === 'shop' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Sidebar Filters */}
              <aside className="w-full lg:w-1/4 shrink-0 space-y-6 font-sans">
                <div className="bg-white border border-gold/15 rounded-2xl p-5 shadow-2xs space-y-6 sticky top-28">
                  <div className="flex items-center justify-between border-b border-gold/10 pb-3">
                    <span className="font-serif text-sm font-bold text-charcoal uppercase tracking-wider">Filters</span>
                    <button 
                      onClick={handleClearFilters}
                      className="text-[10px] text-gray-400 hover:text-gold font-bold uppercase transition-colors"
                    >
                      Clear All
                    </button>
                  </div>

                  {/* Search box within shop */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Keyword Search</label>
                    <input
                      type="text"
                      placeholder="e.g. Choker, Kundan, Jhumka..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-50 text-charcoal text-xs p-2.5 rounded-lg border border-gray-150 focus:outline-hidden focus:border-gold"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Category</label>
                    <div className="space-y-1 text-xs">
                      {['All', 'Necklaces', 'Earrings', 'Rings', 'Bangles', 'Jewellery Sets'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat === 'All' ? '' : cat)}
                          className={`w-full text-left py-1.5 px-2.5 rounded-md transition-colors flex items-center justify-between ${
                            (cat === 'All' && !selectedCategory) || (selectedCategory === cat)
                              ? 'bg-gold/10 text-gold-dark font-bold'
                              : 'text-gray-600 hover:bg-beige-soft/50'
                          }`}
                        >
                          <span>{cat}</span>
                          <span className="text-[10px] text-gray-400">
                            ({cat === 'All' ? products.length : products.filter(p => p.category === cat).length})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Plating Color Filter */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Plating Type / Shade</label>
                    <div className="space-y-1 text-xs">
                      {['All', 'Kundan', 'Gold Plated', 'Rose Gold', 'Silver Plated'].map(color => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color === 'All' ? '' : color)}
                          className={`w-full text-left py-1.5 px-2.5 rounded-md transition-colors ${
                            (color === 'All' && !selectedColor) || (selectedColor === color)
                              ? 'bg-gold/10 text-gold-dark font-bold'
                              : 'text-gray-600 hover:bg-beige-soft/50'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Occasion Filter */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Occasion</label>
                    <div className="space-y-1 text-xs">
                      {['All', 'Wedding', 'Festive', 'Daily Wear', 'Party Wear'].map(occ => (
                        <button
                          key={occ}
                          onClick={() => setSelectedOccasion(occ === 'All' ? '' : occ)}
                          className={`w-full text-left py-1.5 px-2.5 rounded-md transition-colors ${
                            (occ === 'All' && !selectedOccasion) || (selectedOccasion === occ)
                              ? 'bg-gold/10 text-gold-dark font-bold'
                              : 'text-gray-600 hover:bg-beige-soft/50'
                          }`}
                        >
                          {occ}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <span>Price Limit</span>
                      <span className="text-gold-dark font-mono font-bold">₹{priceRange}</span>
                    </div>
                    <input
                      type="range"
                      min={300}
                      max={5000}
                      step={100}
                      value={priceRange}
                      onChange={(e) => setPriceRange(Number(e.target.value))}
                      className="w-full accent-gold bg-gray-200 h-1.5 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-gray-400">
                      <span>₹300</span>
                      <span>₹5,000</span>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Product Grid Results */}
              <div className="flex-grow space-y-6">
                {/* Result header count & sort */}
                <div className="bg-white border border-gold/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs">
                  <p className="text-gray-500">
                    Showing <strong className="text-charcoal">{sortedProducts.length}</strong> of <strong>{products.length}</strong> luxurious designs
                  </p>

                  <div className="flex items-center space-x-2.5">
                    <span className="text-gray-400 font-medium">Sort By:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-beige-soft border border-gold/15 rounded-md px-2.5 py-1.5 text-charcoal font-bold text-[11px] focus:outline-hidden"
                    >
                      <option value="featured">Featured Favorites</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Top Rated</option>
                    </select>
                  </div>
                </div>

                {/* Grid */}
                {sortedProducts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    {sortedProducts.map(product => (
                      <ProductCard 
                        key={product.id}
                        product={product}
                        onProductClick={(p) => setSelectedQuickViewProduct(p)}
                        onQuickView={(p) => setSelectedQuickViewProduct(p)}
                        onToggleWishlist={handleToggleWishlist}
                        isWishlisted={wishlist.includes(product.id)}
                        onAddToCart={(prod, variantName) => handleAddToCart(prod, variantName, 1)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-gold/10 rounded-2xl p-16 text-center text-gray-400 font-sans space-y-2">
                    <HelpCircle className="mx-auto text-gold/30 mb-2" size={40} />
                    <p className="text-sm font-bold text-charcoal">No Matching Sparkles Found</p>
                    <p className="text-xs">Try adjusting your filters or search keywords, or clear all filters to start fresh.</p>
                    <button 
                      onClick={handleClearFilters}
                      className="mt-4 bg-gold hover:bg-gold-dark text-white font-bold py-2 px-6 rounded-lg text-[10px] uppercase tracking-wider"
                    >
                      Clear Shop Filters
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* SECURE CHECKOUT PAGE */}
        {activePage === 'checkout' && (
          <CheckoutSection 
            cart={cart}
            onNavigate={handleNavigate}
            onOrderPlaced={(order) => {
              // Append to order lists instantly
              setOrders(prev => [order, ...prev]);
            }}
            onClearCart={handleClearCart}
          />
        )}

        {/* LOGISTICS TRACK ORDER PAGE */}
        {activePage === 'track' && (
          <TrackOrderSection initialTrackingId={initialTrackingId} />
        )}

        {/* WOOCOMMERCE ADMIN PANEL PAGE */}
        {activePage === 'admin' && (
          <AdminSection 
            products={products}
            onProductsUpdate={(updated) => setProducts(updated)}
            orders={orders}
            onOrdersUpdate={(updated) => setOrders(updated)}
          />
        )}
      </main>

      {/* FOOTER & TRUST BUILDERS */}
      <Footer onNavigate={handleNavigate} />

      {/* FLOAT AI SEARCH & STYLING ADVISOR */}
      <AISearchAdvisor 
        products={products}
        onProductClick={(product) => setSelectedQuickViewProduct(product)}
      />

      {/* SHOPPING CART SLIDE-OUT DRAWER OVERLAY */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs font-sans">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="bg-charcoal text-white p-5 flex items-center justify-between border-b border-gold/20">
              <h3 className="font-serif text-base font-bold text-gold flex items-center gap-1.5">
                <ShoppingBag size={18} />
                <span>Your Shopping Bag ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
              </h3>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* List Drawer Items */}
            <div className="flex-grow overflow-y-auto p-5 divide-y divide-gray-100">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
                  <ShoppingBag size={48} className="text-gold/20 stroke-[1.5]" />
                  <div>
                    <p className="text-xs font-bold text-charcoal">Your Shopping Bag is Empty</p>
                    <p className="text-[10px] text-gray-400 mt-1">Browse our exquisite collections to add beautiful jewelry.</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      handleNavigate('shop');
                    }}
                    className="bg-gold hover:bg-gold-dark text-white font-bold py-2 px-6 rounded-lg text-[10px] uppercase tracking-widest"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="flex py-4 items-center justify-between text-xs font-medium">
                    <div className="flex items-center space-x-3.5">
                      <img 
                        src={item.product.images[0]} 
                        alt="" 
                        className="w-12 h-12 object-cover rounded-md border border-gold/10"
                      />
                      <div>
                        <h4 className="font-bold text-charcoal truncate max-w-[150px]">{item.product.title}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">Shade: {item.selectedVariant}</p>
                        <p className="text-[10px] font-bold text-gold-dark mt-1">₹{item.product.price} each</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      {/* Qty Stepper */}
                      <div className="flex items-center border border-gray-150 rounded-md overflow-hidden bg-white text-[11px]">
                        <button
                          onClick={() => handleUpdateCartQty(idx, item.quantity - 1)}
                          className="px-2 py-1 hover:bg-gray-100 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-1 text-charcoal font-bold w-7 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateCartQty(idx, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-gray-100 font-bold"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveFromCart(idx)}
                        className="text-gray-400 hover:text-red-500 font-bold text-[10px] flex items-center space-x-1"
                      >
                        <Trash2 size={11} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Checkout footer details */}
            {cart.length > 0 && (
              <div className="bg-beige-soft/60 border-t border-gold/15 p-5 space-y-4 text-xs font-sans">
                <div className="space-y-1.5 text-gray-600">
                  <div className="flex justify-between">
                    <span>Bag Subtotal</span>
                    <span className="font-bold text-charcoal">₹{cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Courier</span>
                    <span className="text-emerald-700 font-bold">FREE (India Priority)</span>
                  </div>
                  <p className="text-[10px] text-gray-400">All prices include Indian GST. Packaging includes velvet keepsake box.</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      handleNavigate('checkout');
                    }}
                    className="flex-grow bg-gold hover:bg-gold-dark text-white font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs text-center shadow-md transition-all"
                  >
                    Proceed To Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WISHLIST DRAWER OVERLAY */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs font-sans">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="bg-charcoal text-white p-5 flex items-center justify-between border-b border-gold/20">
              <h3 className="font-serif text-base font-bold text-gold flex items-center gap-1.5">
                <Heart size={18} fill="currentColor" />
                <span>Saved Wishlist ({wishlist.length})</span>
              </h3>
              <button 
                onClick={() => setIsWishlistOpen(false)}
                className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Wishlist list */}
            <div className="flex-grow overflow-y-auto p-5 divide-y divide-gray-100">
              {wishlist.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
                  <Heart size={48} className="text-gold/20 stroke-[1.5]" />
                  <div>
                    <p className="text-xs font-bold text-charcoal">Wishlist is Empty</p>
                    <p className="text-[10px] text-gray-400 mt-1 font-sans">Save your favorite treasures for a quick look or festive planning.</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsWishlistOpen(false);
                      handleNavigate('shop');
                    }}
                    className="bg-gold hover:bg-gold-dark text-white font-bold py-2 px-6 rounded-lg text-[10px] uppercase tracking-widest"
                  >
                    Explore Treasures
                  </button>
                </div>
              ) : (
                wishlist.map(productId => {
                  const product = products.find(p => p.id === productId);
                  if (!product) return null;

                  return (
                    <div key={productId} className="flex py-4 items-center justify-between text-xs font-medium">
                      <div className="flex items-center space-x-3.5">
                        <img 
                          src={product.images[0]} 
                          alt="" 
                          className="w-12 h-12 object-cover rounded-md border border-gold/10"
                        />
                        <div>
                          <h4 className="font-bold text-charcoal truncate max-w-[150px]">{product.title}</h4>
                          <p className="text-[10px] font-bold text-gold mt-0.5">₹{product.price}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <button
                          onClick={() => {
                            handleAddToCart(product, product.variants[0]?.name || 'Standard', 1);
                            setIsWishlistOpen(false);
                          }}
                          className="bg-gold hover:bg-gold-dark text-white font-bold text-[10px] px-3 py-1.5 rounded-md uppercase tracking-wider"
                        >
                          Add To Bag
                        </button>
                        <button
                          onClick={() => handleToggleWishlist(productId)}
                          className="text-gray-400 hover:text-red-500 text-[10px]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* AJAX QUICK VIEW MODAL OVERLAY */}
      {selectedQuickViewProduct && (
        <QuickViewModal 
          product={selectedQuickViewProduct}
          onClose={() => setSelectedQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          isWishlisted={wishlist.includes(selectedQuickViewProduct.id)}
        />
      )}
    </div>
  );
}
