import React, { useState } from 'react';
import { X, Heart, ShoppingBag, Check, MessageCircle, AlertTriangle } from 'lucide-react';
import { Product } from '../types';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, variantName: string, quantity: number) => void;
  onToggleWishlist: (productId: string) => void;
  isWishlisted: boolean;
}

export default function QuickViewModal({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted
}: QuickViewModalProps) {
  if (!product) return null;

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]?.name || 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [zoomStyle, setZoomStyle] = useState({});

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const activeVariantObj = product.variants.find(v => v.name === selectedVariant);
  const variantStock = activeVariantObj ? activeVariantObj.stock : product.stock;

  const handleAddToCart = () => {
    onAddToCart(product, selectedVariant, quantity);
    onClose();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.8)'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: 'center',
      transform: 'scale(1)'
    });
  };

  // Generate pre-filled WhatsApp enquiry link for Indian customers
  const getWhatsAppEnquiryLink = () => {
    const text = `Namaste AmreetJewels! 🌸 I am highly interested in purchasing the beautiful "${product.title}" (${selectedVariant}). 

• SKU: ${product.sku}
• Price: ₹${product.price} (Special Price)
• Occasion: ${product.occasion} style

Could you please confirm if this item is currently in stock for immediate shipment? Dhanyavad!`;
    
    return `https://api.whatsapp.com/send?phone=919876543210&text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-gold/10 flex flex-col md:flex-row animate-in fade-in-50 zoom-in-95 duration-200 max-h-[95vh] md:max-h-none overflow-y-auto md:overflow-visible">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-charcoal bg-white/80 backdrop-blur-xs rounded-full border border-gray-100 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Left Side: Dynamic Gallery with Zoom */}
        <div className="w-full md:w-1/2 p-6 bg-beige-soft flex flex-col justify-center border-b md:border-b-0 md:border-r border-gold/10">
          <div 
            className="relative w-full aspect-square overflow-hidden rounded-xl border border-gold/15 bg-white cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={product.images[activeImageIdx]}
              alt={product.title}
              style={zoomStyle}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-100 ease-out"
            />
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex space-x-2 mt-4 justify-center">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === activeImageIdx ? 'border-gold shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-gold uppercase tracking-wider font-sans">
                {product.category}
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal leading-tight mt-1">
                {product.title}
              </h2>
              <p className="text-xs text-gray-400 font-sans mt-0.5">SKU: {product.sku}</p>
            </div>

            {/* Price section */}
            <div className="flex items-baseline space-x-3 bg-beige-soft/60 px-4 py-3 rounded-xl border border-gold/5">
              <span className="text-2xl font-bold text-charcoal">₹{product.price}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
                  <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-sm">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-gray-600 leading-relaxed font-sans">
              {product.description}
            </p>

            {/* Materials summary */}
            <div className="text-[11px] text-gray-500 space-y-1 py-2 border-t border-b border-gold/10 font-sans">
              <p><strong>Composition:</strong> {product.materials}</p>
              <p><strong>Color Plating:</strong> {product.color}</p>
              <p><strong>Suitable For:</strong> {product.occasion}</p>
            </div>

            {/* Variants Selector */}
            {product.variants.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-charcoal uppercase tracking-wider font-sans">
                  Select Shade / Size
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVariant(v.name);
                        setQuantity(1); // reset quantity to safe limits
                      }}
                      className={`text-xs px-4 py-2.5 rounded-lg font-medium border transition-all ${
                        selectedVariant === v.name
                          ? 'border-gold bg-gold/10 text-gold-dark font-bold'
                          : 'border-gray-200 text-gray-600 hover:border-gold/50'
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Warning */}
            <div className="flex items-center text-xs font-sans">
              {variantStock > 0 ? (
                <div className="flex items-center text-green-600 space-x-1.5">
                  <Check size={14} className="stroke-[3]" />
                  <span>In Stock (Only {variantStock} pieces left!)</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600 space-x-1.5">
                  <AlertTriangle size={14} />
                  <span>Sold Out in this shade</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
            {variantStock > 0 && (
              <div className="flex items-center space-x-3">
                {/* Quantity adjust stepper */}
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3.5 py-2.5 hover:bg-beige-soft font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2.5 text-xs font-bold text-charcoal font-sans w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(variantStock, q + 1))}
                    className="px-3.5 py-2.5 hover:bg-beige-soft font-bold transition-colors"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-grow flex items-center justify-center space-x-2 bg-gold hover:bg-gold-dark text-white font-bold py-3 px-6 rounded-lg text-xs uppercase tracking-widest transition-all shadow-xs"
                >
                  <ShoppingBag size={15} />
                  <span>Add To Shopping Bag</span>
                </button>
              </div>
            )}

            {/* WhatsApp Enquiry option */}
            <a
              href={getWhatsAppEnquiryLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg text-xs uppercase tracking-widest transition-all w-full shadow-xs"
            >
              <MessageCircle size={16} fill="currentColor" />
              <span>Enquire on WhatsApp</span>
            </a>

            {/* Wishlist toggle */}
            <button
              onClick={() => onToggleWishlist(product.id)}
              className={`flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg text-xs font-semibold tracking-wide w-full border transition-all ${
                isWishlisted
                  ? 'bg-red-50 text-red-500 border-red-200'
                  : 'bg-white border-gray-200 text-charcoal hover:bg-beige-soft'
              }`}
            >
              <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} />
              <span>{isWishlisted ? 'Added to Wishlist' : 'Save to Wishlist'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
