import React, { useState } from 'react';
import { Heart, Eye, ShoppingCart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  isWishlisted: boolean;
  onAddToCart: (product: Product, variantName: string) => void;
}

export default function ProductCard({
  product,
  onProductClick,
  onQuickView,
  onToggleWishlist,
  isWishlisted,
  onAddToCart
}: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const nextImage = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextImage(e);
      } else {
        prevImage(e);
      }
    }
    setTouchStartX(null);
  };

  return (
    <div className="group relative bg-white border border-border-warm rounded-xs overflow-hidden hover:shadow-lg hover:border-gold/40 transition-all duration-300 flex flex-col justify-between">
      {/* Badges / Indicators */}
      <div className="absolute top-3 left-3 z-10 flex flex-col space-y-1">
        {product.isBestSeller && (
          <span className="bg-gold text-white text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-xs shadow-xs">
            Bestseller
          </span>
        )}
        {product.isNewArrival && (
          <span className="bg-charcoal text-gold text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-xs shadow-xs">
            New
          </span>
        )}
        {discountPercent > 0 && (
          <span className="bg-red-600 text-white text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-xs shadow-xs">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Action Hover Triggers */}
      <div className="absolute top-3 right-3 z-10 flex flex-col space-y-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className={`p-2 rounded-full shadow-xs transition-all duration-300 hover:scale-105 ${
            isWishlisted
              ? 'bg-red-50 text-red-500 border border-red-100'
              : 'bg-white text-charcoal hover:text-red-500'
          }`}
          title="Add to Wishlist"
        >
          <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          className="p-2 bg-white text-charcoal hover:text-gold rounded-full shadow-xs hover:scale-105 transition-all duration-300"
          title="Quick View"
        >
          <Eye size={14} />
        </button>
      </div>

      {/* Image Gallery Container */}
      <div 
        onClick={() => onProductClick(product)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="cursor-pointer relative pt-[100%] overflow-hidden bg-gray-50 border-b border-border-warm select-none"
      >
        <img
          src={product.images[currentImageIndex] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600'}
          alt={product.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Hover Navigation Controls */}
        {product.images && product.images.length > 1 && (
          <>
            {/* Left Arrow */}
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-charcoal p-1.5 rounded-full shadow-xs transition-all opacity-0 group-hover:opacity-100 z-10 hover:scale-110 flex items-center justify-center border border-gold/10"
              title="Previous Image"
            >
              <ChevronLeft size={13} className="stroke-[2.5]" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-charcoal p-1.5 rounded-full shadow-xs transition-all opacity-0 group-hover:opacity-100 z-10 hover:scale-110 flex items-center justify-center border border-gold/10"
              title="Next Image"
            >
              <ChevronRight size={13} className="stroke-[2.5]" />
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-2.5 inset-x-0 flex justify-center space-x-1.5 z-10">
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentImageIndex 
                      ? 'bg-gold w-3.5' 
                      : 'bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </>
        )}
        <div className="absolute bottom-0 inset-x-0 h-10 bg-linear-to-t from-black/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-grow justify-between bg-white">
        <div className="space-y-1 text-left">
          {/* Category & Occasion */}
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-gray-400 font-sans">
            <span>{product.category}</span>
            <span className="text-gold font-bold px-1.5 py-0.5 bg-beige-soft rounded-xs">{product.occasion}</span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onProductClick(product)}
            className="font-serif text-sm font-semibold text-charcoal hover:text-gold cursor-pointer transition-colors line-clamp-1"
          >
            {product.title}
          </h3>

          {/* Ratings & Review Counts */}
          <div className="flex items-center space-x-1 py-0.5">
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={11}
                  fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                  className="stroke-none"
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-400 font-sans">({product.reviewsCount})</span>
          </div>
        </div>

        {/* Price & Cart Actions Row */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col text-left">
            <span className="text-sm font-bold text-charcoal">₹{product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-[11px] text-gray-400 line-through">₹{product.originalPrice}</span>
            )}
          </div>

          <button
            onClick={() => onAddToCart(product, product.variants[0]?.name || 'Standard')}
            disabled={product.stock <= 0}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xs text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${
              product.stock > 0
                ? 'bg-charcoal hover:bg-black text-white hover:shadow-xs'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart size={11} />
            <span>{product.stock > 0 ? 'Buy' : 'Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
