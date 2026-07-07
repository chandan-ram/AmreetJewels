import React, { useState, useEffect, useRef } from 'react';
import { Search, Heart, ShoppingBag, User, Package, Settings, Sparkles, Menu, X, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  currentPage: string;
  onNavigate: (page: string) => void;
  products: Product[];
  onProductClick: (product: Product) => void;
  onOpenCart: () => void;
}

export default function Header({
  cartCount,
  wishlistCount,
  currentPage,
  onNavigate,
  products,
  onProductClick,
  onOpenCart
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = products.filter(
      p =>
        p.title.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query)) ||
        p.color.toLowerCase().includes(query) ||
        p.materials.toLowerCase().includes(query)
    );
    setFilteredProducts(filtered.slice(0, 5));
  }, [searchQuery, products]);

  // Handle clicking outside search dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchResultClick = (product: Product) => {
    onProductClick(product);
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`shop?search=${encodeURIComponent(searchQuery)}`);
      setShowSearchDropdown(false);
    }
  };

  const navItems = [
    { label: 'Home', page: 'home' },
    { label: 'Shop All', page: 'shop' },
    { label: 'Jewellery Sets', page: 'shop?category=Jewellery Sets' },
    { label: 'Earrings', page: 'shop?category=Earrings' },
    { label: 'Rings & Bangles', page: 'shop?category=Rings' },
    { label: 'About Us', page: 'about' },
    { label: 'Contact', page: 'contact' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-border-warm shadow-xs">
      {/* Announcement Bar */}
      <div className="w-full bg-[#1A1A1A] text-white text-[10px] py-2.5 px-4 text-center uppercase tracking-[0.2em] font-semibold flex justify-center items-center overflow-x-auto whitespace-nowrap scrollbar-none">
        <div className="flex items-center space-x-2 mx-auto">
          <span>FREE SHIPPING ON ORDERS ABOVE ₹1999 • CASH ON DELIVERY AVAILABLE • EASY 7-DAY RETURNS</span>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Mobile menu button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-charcoal hover:text-gold transition-colors"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('home')} 
          className="cursor-pointer flex flex-col items-center md:items-start select-none"
        >
          <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-widest text-charcoal flex items-center">
            AMREET JEWELS
            <Sparkles size={16} className="text-gold ml-1 animate-pulse" />
          </span>
          <span className="text-[9px] uppercase tracking-widest text-gold font-medium -mt-1 font-sans">
            ROYAL ARTIFICIAL JEWELLERY
          </span>
        </div>

        {/* Search Bar - Desktop */}
        <div ref={searchRef} className="hidden md:block relative w-96">
          <form onSubmit={handleSearchSubmit} className="flex items-center">
            <input
              type="text"
              placeholder="Search jhumkas, chokers, kada bracelets..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className="w-full bg-white text-charcoal placeholder-gray-400 text-sm px-4 py-2.5 pr-10 rounded-full border border-gold/30 focus:outline-hidden focus:border-gold focus:ring-1 focus:ring-gold font-sans transition-all"
            />
            <button type="submit" className="absolute right-3 text-gold hover:text-gold-dark transition-colors">
              <Search size={18} />
            </button>
          </form>

          {/* Autocomplete drop-down */}
          {showSearchDropdown && searchQuery && (
            <div className="absolute left-0 mt-2 w-full bg-white border border-gold/20 rounded-lg shadow-xl overflow-hidden z-50">
              {filteredProducts.length > 0 ? (
                <div className="py-2">
                  <div className="px-4 py-1 text-xs text-gray-400 font-semibold uppercase tracking-wider font-sans">
                    Matching Pieces
                  </div>
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      onClick={() => handleSearchResultClick(product)}
                      className="flex items-center px-4 py-2 hover:bg-beige-soft cursor-pointer transition-colors"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-10 h-10 object-cover rounded-md border border-gold/10"
                      />
                      <div className="ml-3">
                        <p className="text-xs font-semibold text-charcoal">{product.title}</p>
                        <p className="text-[11px] text-gold font-medium">₹{product.price}</p>
                      </div>
                    </div>
                  ))}
                  <div 
                    onClick={handleSearchSubmit}
                    className="border-t border-gray-100 px-4 py-2 text-xs text-gold hover:text-gold-dark font-medium flex items-center justify-between cursor-pointer hover:bg-beige-soft/50 transition-all"
                  >
                    <span>View all matching items</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-gray-500 font-sans">
                  No matching treasures found. Try "kundan" or "necklace"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          {/* Tracking */}
          <button
            onClick={() => onNavigate('track')}
            className={`p-2 rounded-full hover:bg-beige-soft text-charcoal hover:text-gold transition-all relative group ${
              currentPage === 'track' ? 'text-gold' : ''
            }`}
            title="Track Order"
          >
            <Package size={20} />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-charcoal text-white text-[10px] px-2 py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md">
              Track Order
            </span>
          </button>

          {/* Wishlist */}
          <button
            onClick={() => onNavigate('wishlist')}
            className={`p-2 rounded-full hover:bg-beige-soft text-charcoal hover:text-gold transition-all relative ${
              currentPage === 'wishlist' ? 'text-gold' : ''
            }`}
            title="Wishlist"
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 bg-gold text-white text-[9px] w-4.5 h-4.5 font-bold rounded-full flex items-center justify-center animate-bounce">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart */}
          <button
            onClick={onOpenCart}
            className="p-2 rounded-full hover:bg-beige-soft text-charcoal hover:text-gold transition-all relative"
            title="Cart"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-charcoal text-gold text-[9px] w-4.5 h-4.5 font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Admin Panel Link */}
          <button
            onClick={() => onNavigate('admin')}
            className={`p-2 rounded-full hover:bg-beige-soft text-charcoal hover:text-gold transition-all relative group ${
              currentPage === 'admin' ? 'text-gold' : ''
            }`}
            title="Admin Dashboard"
          >
            <Settings size={20} />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-charcoal text-white text-[10px] px-2 py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md">
              Admin Portal
            </span>
          </button>
        </div>
      </div>

      {/* Navigation Row - Desktop */}
      <nav className="hidden md:block border-t border-border-warm bg-white">
        <div className="max-w-7xl mx-auto px-4 flex justify-center space-x-8 py-3">
          {navItems.map((item, idx) => {
            const isActive = currentPage === item.page || (currentPage.startsWith('shop') && item.page.startsWith('shop') && currentPage === item.page);
            return (
              <button
                key={idx}
                onClick={() => onNavigate(item.page)}
                className={`text-xs uppercase tracking-widest font-semibold hover:text-gold transition-all duration-200 relative pb-1 ${
                  isActive ? 'text-gold font-bold' : 'text-charcoal/80'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gold rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Search & Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-50 backdrop-blur-xs flex justify-start">
          <div className="w-80 max-w-[85vw] bg-beige-soft h-full p-6 flex flex-col justify-between shadow-2xl relative">
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-6 right-6 text-charcoal hover:text-gold transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col space-y-8 mt-8">
              {/* Logo */}
              <div className="flex flex-col select-none">
                <span className="font-serif text-2xl font-bold tracking-widest text-charcoal flex items-center">
                  AMREET JEWELS
                  <Sparkles size={14} className="text-gold ml-1 animate-pulse" />
                </span>
                <span className="text-[8px] uppercase tracking-widest text-gold font-medium">
                  ROYAL ARTIFICIAL JEWELLERY
                </span>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search earrings, necklaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white text-charcoal placeholder-gray-400 text-sm px-4 py-2.5 pr-10 rounded-full border border-gold/30 focus:outline-hidden focus:border-gold"
                />
                <button type="submit" className="absolute right-3 top-3 text-gold">
                  <Search size={18} />
                </button>
              </form>

              {/* Mobile Navigation Links */}
              <div className="flex flex-col space-y-4">
                {navItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onNavigate(item.page);
                      setMobileMenuOpen(false);
                    }}
                    className="text-sm font-semibold tracking-wider text-charcoal hover:text-gold text-left pb-2 border-b border-gold/10 flex justify-between items-center"
                  >
                    <span>{item.label}</span>
                    <ArrowRight size={14} className="text-gold/40" />
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gold/20 pt-6">
              <p className="text-[10px] text-gray-400 font-sans tracking-wider text-center">
                © {new Date().getFullYear()} AMREET JEWELS INDIA
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
