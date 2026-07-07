import React, { useState } from 'react';
import { 
  ShieldCheck, Truck, RotateCcw, Sparkles, PhoneCall, Mail, MapPin, 
  Facebook, Instagram, MessageCircle, X, ChevronRight, FileText 
} from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  // Modal states for Policies
  const [activePolicy, setActivePolicy] = useState<'privacy' | 'shipping' | 'returns' | 'terms' | null>(null);

  const policies = {
    privacy: {
      title: "Privacy & Cookie Policy",
      content: `Namaste, AmreetJewels ("we", "our", "us") values your trust. This Privacy Policy details how we handle personal data collected from customers across India.

1. Information We Collect
We collect billing information (name, address, telephone numbers, email) to process purchases and coordinate shipping via BlueDart. Optional GSTIN numbers are recorded solely for business tax invoicing.

2. Securing Payments
All online credit transactions, UPI transfers, and net banking are processed securely through certified gateways (such as Razorpay). We do not record or store your bank credentials or credit card numbers.

3. Cookies & Analytics
We use cookies to retain item caches (keeping your Shopping Bag and Wishlist active across sessions). Simulated Meta Pixel and Google Analytics schema are deployed to optimize your shopping experience.

If you have questions, please reach out to care@amreetjewels.com.`
    },
    shipping: {
      title: "Indian Shipping & Delivery Policy",
      content: `At Amreet Jewels, we focus on safe, insured, and prompt logistics to ensure your precious jewels reach you in pristine condition.

1. Shipping Carriers & Logistics
We partner with India's premium courier services including BlueDart Priority, Delhivery, and Speed Post to coordinate express delivery across all states.

2. Packaging Integrity
Every single order is packaged in a premium, tamper-evident royal velvet box, bubble-wrapped heavily and shipped in a sturdy hard-board outer carton to ensure zero damage in transit.

3. Delivery Timelines & Charges
• Orders above ₹1,499: FREE EXPRESS SHIPPING across India.
• Orders below ₹1,499: Flat ₹99 shipping fee.
• Metro Cities (Mumbai, Delhi, Bangalore, Chennai): 2 to 4 business days.
• Rest of India & Jammu/Kashmir/North-East: 4 to 7 business days.

A unique Tracking ID is generated upon package dispatch, enabling you to track your milestone progress under our "Track Order" page.`
    },
    returns: {
      title: "Returns, Exchange & Refund Policy",
      content: `We take immense pride in our premium craftsmanship. However, if you are not entirely satisfied, we offer an easy 7-day hassle-free return and exchange cycle.

1. Eligibility for Return
• Return requests must be initiated within 7 days of package delivery.
• Jewellery must be unworn, in its original box, with all tag seals intact.
• Free gifts or accessories received with the order must be returned together.

2. Non-Returnable Items
Due to hygiene safety, customized nose pins or earrings with broken seal tags cannot be returned unless delivered with a verified manufacturing defect.

3. Refund Processing
Once your return is inspected at our Mumbai fulfillment center, refunds are processed within 48 hours:
• Pre-paid orders: Credited back to original UPI/Card account.
• COD orders: Transferred securely to your validated Bank Account or UPI handle.

For assistance, initiate a WhatsApp request using our support buttons.`
    },
    terms: {
      title: "Terms & Conditions of Service",
      content: `Welcome to AmreetJewels. By accessing or purchasing from our platform, you agree to comply with the following legal terms:

1. Intellectual Property
All product photographs, typography pairings, brand naming, meenakari designs, and AI advisor parameters are the exclusive intellectual property of AmreetJewels Royal Jewellery India.

2. Metals & Artificial Plating
We specialize in high-end Fashion & Artificial Jewellery. Our pieces utilize premium brass, copper, and stainless steel bases finished with high-density gold/silver plating (such as 18k and 22k micro plating). We disclose all materials clearly. Our metals are lead and nickel-free, minimizing allergic skin reactions.

3. Pricing & Billing
Prices listed are in Indian Rupees (₹) and include standard GST charges. We reserve the right to modify prices or terminate discount coupons (e.g. FESTIVE20) without prior notice.`
    }
  };

  return (
    <footer className="bg-white text-charcoal font-sans mt-16 border-t border-border-warm">
      
      {/* Brand Trust Builders Banner - Light Artistic Flair Theme */}
      <div className="bg-[#F9F5F0] border-b border-border-warm py-10 text-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-gold/10 text-gold rounded-xs border border-gold/20">
              <Truck size={20} />
            </div>
            <div className="text-left">
              <h4 className="font-serif text-sm font-bold tracking-wide text-charcoal">Free India Shipping</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Complimentary express shipping across India on orders above ₹1,499.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-gold/10 text-gold rounded-xs border border-gold/20">
              <ShieldCheck size={20} />
            </div>
            <div className="text-left">
              <h4 className="font-serif text-sm font-bold tracking-wide text-charcoal">100% Anti-Allergic Alloys</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Lead, nickel and cadmium-free metals. Safe for highly sensitive skin.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-gold/10 text-gold rounded-xs border border-gold/20">
              <RotateCcw size={20} />
            </div>
            <div className="text-left">
              <h4 className="font-serif text-sm font-bold tracking-wide text-charcoal">Easy 7-Day Returns</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Hassle-free reverse pick-up and instant digital refunds.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-gold/10 text-gold rounded-xs border border-gold/20">
              <Sparkles size={20} />
            </div>
            <div className="text-left">
              <h4 className="font-serif text-sm font-bold tracking-wide text-charcoal">Royal Velvet Packing</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Every piece comes boxed elegantly in ready-to-gift red velvet containers.</p>
            </div>
          </div>

        </div>
      </div>

      {/* Main Footer Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* Col 1: Brand Info */}
        <div className="md:col-span-4 space-y-4 text-left">
          <span className="font-serif text-2xl font-bold tracking-widest text-gold block">
            AMREET JEWELS
          </span>
          <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
            AmreetJewels brings India's rich wedding and festive heritage to life. We manufacture high-end fashion, Kundan, Polki, temple style and cubic zirconia jewellery designed to deliver luxury feelings with affordable positioning.
          </p>
          {/* Social Icons */}
          <div className="flex space-x-3.5 pt-2">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-[#F9F5F0] hover:bg-gold text-charcoal hover:text-white rounded-full transition-all duration-300 border border-border-warm">
              <Instagram size={15} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-[#F9F5F0] hover:bg-gold text-charcoal hover:text-white rounded-full transition-all duration-300 border border-border-warm">
              <Facebook size={15} />
            </a>
            <a href="https://api.whatsapp.com/send?phone=919876543210&text=Hello%20AmreetJewels!" target="_blank" rel="noopener noreferrer" className="p-2 bg-[#F9F5F0] hover:bg-gold text-charcoal hover:text-white rounded-full transition-all duration-300 border border-border-warm">
              <MessageCircle size={15} />
            </a>
          </div>
        </div>

        {/* Col 2: Categories */}
        <div className="md:col-span-3 space-y-3 text-left">
          <h4 className="text-xs uppercase tracking-widest font-bold text-charcoal border-b border-border-warm pb-2">
            Shop Treasures
          </h4>
          <ul className="text-xs text-gray-500 space-y-2">
            {['Earrings', 'Necklaces', 'Rings', 'Bangles', 'Jewellery Sets'].map(cat => (
              <li key={cat}>
                <button 
                  onClick={() => onNavigate(`shop?category=${encodeURIComponent(cat)}`)}
                  className="hover:text-gold transition-colors flex items-center space-x-1 text-left"
                >
                  <ChevronRight size={10} className="text-gold/40" />
                  <span>{cat}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Policies & Help */}
        <div className="md:col-span-2 space-y-3 text-left">
          <h4 className="text-xs uppercase tracking-widest font-bold text-charcoal border-b border-border-warm pb-2">
            Store Policies
          </h4>
          <ul className="text-xs text-gray-500 space-y-2 text-left">
            <li>
              <button onClick={() => setActivePolicy('privacy')} className="hover:text-gold transition-colors flex items-center space-x-1">
                <FileText size={11} className="text-gold/40" />
                <span>Privacy Policy</span>
              </button>
            </li>
            <li>
              <button onClick={() => setActivePolicy('shipping')} className="hover:text-gold transition-colors flex items-center space-x-1">
                <FileText size={11} className="text-gold/40" />
                <span>Shipping Policy</span>
              </button>
            </li>
            <li>
              <button onClick={() => setActivePolicy('returns')} className="hover:text-gold transition-colors flex items-center space-x-1">
                <FileText size={11} className="text-gold/40" />
                <span>Returns Policy</span>
              </button>
            </li>
            <li>
              <button onClick={() => setActivePolicy('terms')} className="hover:text-gold transition-colors flex items-center space-x-1">
                <FileText size={11} className="text-gold/40" />
                <span>Terms of Service</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Corporate Info */}
        <div className="md:col-span-3 space-y-3 text-xs text-gray-500 text-left">
          <h4 className="text-xs uppercase tracking-widest font-bold text-charcoal border-b border-border-warm pb-2">
            AmreetJewels Support
          </h4>
          <div className="space-y-2">
            <p className="flex items-start space-x-2">
              <MapPin size={14} className="text-gold shrink-0 mt-0.5" />
              <span>P-13, First Floor LHS Mohan Garden, New Delhi 110059</span>
            </p>
            <p className="flex items-center space-x-2">
              <PhoneCall size={14} className="text-gold shrink-0" />
              <span>+91 9555050001 (10 AM - 7 PM)</span>
            </p>
            <p className="flex items-center space-x-2">
              <Mail size={14} className="text-gold shrink-0" />
              <span>care@amreetjewels.com</span>
            </p>
          </div>
        </div>

      </div>

      {/* Copywrite Bar - High-Contrast Charcoal */}
      <div className="bg-[#1A1A1A] py-6 text-center text-[10px] text-gray-400 font-sans tracking-widest uppercase">
        <p>© {new Date().getFullYear()} AMREET JEWELS ROYAL JEWELLERY PVT. LTD. ALL RIGHTS RESERVED.</p>
        <p className="mt-1 text-gray-500 normal-case tracking-normal">Simulated premium eCommerce demo inspired by Indian boutique standards. Protected by Razorpay secure checkout protocols.</p>
        <button
          onClick={() => onNavigate('admin')}
          className="mt-4 inline-block text-[9px] text-gray-600 hover:text-gold transition-all tracking-wider uppercase font-bold hover:underline"
        >
          Staff & Admin Login
        </button>
      </div>

      {/* FLOATING GENERAL WHATSAPP BUTTON */}
      <a
        href="https://api.whatsapp.com/send?phone=919876543210&text=Namaste%20AmreetJewels!%20🌸%20I%20am%20browsing%20your%20gorgeous%20artificial%20jewellery%20collection%20and%20would%20love%20to%20know%20more%20about%20custom%20bridal%20consultations."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 scale-100 hover:scale-105 active:scale-95 group border border-emerald-400"
        title="Chat on WhatsApp"
      >
        <MessageCircle fill="currentColor" size={24} />
      </a>

      {/* INTERACTIVE POLICY DRAWER MODAL */}
      {activePolicy && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-charcoal rounded-2xl border border-gold/25 p-6 max-w-xl w-full relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setActivePolicy(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 text-gray-400 hover:text-charcoal rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="font-serif text-lg font-bold text-charcoal border-b border-gold/15 pb-3 mb-4 flex items-center space-x-1.5">
              <span className="text-gold">✦</span>
              <span>{policies[activePolicy].title}</span>
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed font-sans whitespace-pre-line">
              {policies[activePolicy].content}
            </p>
            <div className="mt-6 flex justify-end border-t border-gray-100 pt-4">
              <button
                onClick={() => setActivePolicy(null)}
                className="bg-charcoal text-gold font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg hover:bg-black transition-colors"
              >
                Close Policy View
              </button>
            </div>
          </div>
        </div>
      )}

    </footer>
  );
}
