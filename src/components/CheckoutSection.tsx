import React, { useState, useEffect } from 'react';
import { ShoppingBag, Tag, CreditCard, ShieldCheck, HelpCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import { CartItem, Order, Coupon, User } from '../types';
import { getStoredCoupons, addOrder } from '../lib/storage';

interface CheckoutSectionProps {
  cart: CartItem[];
  onOrderPlaced: (order: Order) => void;
  onNavigate: (page: string) => void;
  onClearCart: () => void;
  currentUser?: User | null;
}

export default function CheckoutSection({
  cart,
  onOrderPlaced,
  onNavigate,
  onClearCart,
  currentUser
}: CheckoutSectionProps) {
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  // Shipping form state
  const [formData, setFormData] = useState({
    customerName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    city: currentUser?.city || '',
    state: currentUser?.state || '',
    zip: currentUser?.zip || '',
    gstNumber: ''
  });

  // Autofill if currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        customerName: prev.customerName || currentUser.name || '',
        email: prev.email || currentUser.email || '',
        phone: prev.phone || currentUser.phone || '',
        address: prev.address || currentUser.address || '',
        city: prev.city || currentUser.city || '',
        state: prev.state || currentUser.state || '',
        zip: prev.zip || currentUser.zip || '',
      }));
    }
  }, [currentUser]);

  // Errors state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Razorpay' | 'Cashfree' | 'Cards' | 'NetBanking' | 'COD'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Math totals
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  // Calculate discount
  let discountAmount = 0;
  if (activeCoupon) {
    if (activeCoupon.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * activeCoupon.value) / 100);
    } else {
      discountAmount = activeCoupon.value;
    }
  }

  // GST Calculation (18% for jewellery included in price simulation, we split it for tax representation)
  const gstEstimated = Math.round((subtotal - discountAmount) * 0.18);
  const shippingCharges = subtotal > 1499 ? 0 : 99;
  const finalTotal = subtotal - discountAmount + shippingCharges;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const coupons = getStoredCoupons();
    const found = coupons.find(c => c.code.toLowerCase() === couponCode.trim().toLowerCase());

    if (!found) {
      setCouponError('Invalid coupon code!');
      return;
    }
    if (!found.active) {
      setCouponError('This coupon has expired!');
      return;
    }
    if (found.minSpend && subtotal < found.minSpend) {
      setCouponError(`Min spend for this coupon is ₹${found.minSpend}!`);
      return;
    }

    setActiveCoupon(found);
    setCouponCode('');
  };

  const handleRemoveCoupon = () => {
    setActiveCoupon(null);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.customerName.trim()) errors.customerName = 'Name is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Valid email is required';
    if (!formData.phone.trim() || formData.phone.length < 10) errors.phone = 'Valid 10-digit Indian mobile number is required';
    if (!formData.address.trim()) errors.address = 'Full address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.zip.trim() || formData.zip.length !== 6) errors.zip = 'Valid 6-digit Pincode is required';
    
    if (formData.gstNumber.trim() && formData.gstNumber.length !== 15) {
      errors.gstNumber = 'Valid 15-character GSTIN is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);

    // Simulate Razorpay / UPI Gateway Handshake delay
    setTimeout(() => {
      const orderId = 'KNK-2026-' + Math.floor(100000 + Math.random() * 900000);
      const trackingId = 'TRK-' + Math.floor(10000000 + Math.random() * 90000000);

      const newOrder: Order = {
        id: orderId,
        userId: currentUser?.id,
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        gstNumber: formData.gstNumber || undefined,
        paymentMethod: paymentMethod,
        items: [...cart],
        totalAmount: finalTotal,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        trackingId: trackingId
      };

      addOrder(newOrder);
      setPlacedOrder(newOrder);
      setIsProcessing(false);
      onOrderPlaced(newOrder);
      onClearCart();
    }, 2000);
  };

  if (placedOrder) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6 animate-in fade-in duration-300">
        <div className="inline-flex items-center justify-center bg-emerald-100 text-emerald-600 p-4 rounded-full">
          <CheckCircle size={48} className="stroke-[2]" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-3xl font-bold text-charcoal">Order Placed Successfully!</h2>
          <p className="text-gray-500 text-sm font-sans">
            Namaste {placedOrder.customerName}, thank you for shopping with AmreetJewels! A confirmation email has been sent to <strong>{placedOrder.email}</strong>.
          </p>
        </div>

        <div className="bg-beige-soft border border-gold/25 p-6 rounded-2xl text-left space-y-3 shadow-xs">
          <div className="flex justify-between text-xs font-sans">
            <span className="text-gray-400 font-medium">Order Number:</span>
            <span className="font-bold text-charcoal">{placedOrder.id}</span>
          </div>
          <div className="flex justify-between text-xs font-sans">
            <span className="text-gray-400 font-medium">Tracking Number:</span>
            <span className="font-bold text-gold-dark">{placedOrder.trackingId}</span>
          </div>
          <div className="flex justify-between text-xs font-sans">
            <span className="text-gray-400 font-medium">Payment Method:</span>
            <span className="font-semibold text-charcoal uppercase">{placedOrder.paymentMethod}</span>
          </div>
          <div className="flex justify-between text-xs font-sans border-t border-gold/10 pt-3">
            <span className="text-gray-400 font-bold">Total Paid:</span>
            <span className="font-bold text-charcoal text-base">₹{placedOrder.totalAmount}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={() => onNavigate('shop')}
            className="flex-grow bg-gold hover:bg-gold-dark text-white font-bold py-3 rounded-lg text-xs uppercase tracking-widest transition-all"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => onNavigate(`track?id=${placedOrder.trackingId}`)}
            className="flex-grow bg-charcoal hover:bg-black text-white font-bold py-3 rounded-lg text-xs uppercase tracking-widest transition-all"
          >
            Track My Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center space-x-2 mb-8">
        <button 
          onClick={() => onNavigate('shop')}
          className="p-2 hover:bg-beige-soft rounded-full text-gray-500 hover:text-charcoal transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-gray-400 font-medium">Back to Shopping</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Billing Form and Payment */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white border border-gold/10 rounded-2xl p-6 shadow-xs">
            <h2 className="font-serif text-xl font-bold text-charcoal border-b border-gold/10 pb-4 mb-6">
              1. Delivery & Billing Address
            </h2>

            <form onSubmit={handlePlaceOrder} className="space-y-4 font-sans">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className={`w-full bg-white text-charcoal text-sm p-3 rounded-lg border focus:outline-hidden ${
                      formErrors.customerName ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-gold'
                    }`}
                    placeholder="Priya Sharma"
                  />
                  {formErrors.customerName && <p className="text-[10px] text-red-500 mt-1">{formErrors.customerName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full bg-white text-charcoal text-sm p-3 rounded-lg border focus:outline-hidden ${
                      formErrors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-gold'
                    }`}
                    placeholder="priya@example.com"
                  />
                  {formErrors.email && <p className="text-[10px] text-red-500 mt-1">{formErrors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Mobile Phone (10 digits)</label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-gray-400 text-sm font-semibold">+91</span>
                  <input
                    type="tel"
                    value={formData.phone}
                    maxLength={10}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    className={`w-full bg-white text-charcoal text-sm p-3 pl-12 rounded-lg border focus:outline-hidden ${
                      formErrors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-gold'
                    }`}
                    placeholder="9876543210"
                  />
                </div>
                {formErrors.phone && <p className="text-[10px] text-red-500 mt-1">{formErrors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Street Address (Building, Flat, Area)</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className={`w-full bg-white text-charcoal text-sm p-3 rounded-lg border focus:outline-hidden ${
                    formErrors.address ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-gold'
                  }`}
                  placeholder="Apartment 402, Royal Gardens, MG Road"
                />
                {formErrors.address && <p className="text-[10px] text-red-500 mt-1">{formErrors.address}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`w-full bg-white text-charcoal text-sm p-3 rounded-lg border focus:outline-hidden ${
                      formErrors.city ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-gold'
                    }`}
                    placeholder="Mumbai"
                  />
                  {formErrors.city && <p className="text-[10px] text-red-500 mt-1">{formErrors.city}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className={`w-full bg-white text-charcoal text-sm p-3 rounded-lg border focus:outline-hidden ${
                      formErrors.state ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-gold'
                    }`}
                    placeholder="Maharashtra"
                  />
                  {formErrors.state && <p className="text-[10px] text-red-500 mt-1">{formErrors.state}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Pincode (6 digits)</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value.replace(/\D/g, '') })}
                    className={`w-full bg-white text-charcoal text-sm p-3 rounded-lg border focus:outline-hidden ${
                      formErrors.zip ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-gold'
                    }`}
                    placeholder="400001"
                  />
                  {formErrors.zip && <p className="text-[10px] text-red-500 mt-1">{formErrors.zip}</p>}
                </div>
              </div>

              {/* GST Field */}
              <div className="border-t border-gold/10 pt-4 mt-2">
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1 flex items-center space-x-1">
                  <span>GSTIN Number (Optional - for business billing)</span>
                  <span title="Add your 15-character GSTIN to claim tax inputs">
                    <HelpCircle size={12} className="text-gray-400" />
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                  className={`w-full bg-white text-charcoal text-sm p-3 rounded-lg border focus:outline-hidden uppercase ${
                    formErrors.gstNumber ? 'border-red-500' : 'border-gray-200 focus:border-gold'
                  }`}
                  placeholder="27AAAAA1111A1Z1"
                />
                {formErrors.gstNumber && <p className="text-[10px] text-red-500 mt-1">{formErrors.gstNumber}</p>}
              </div>
            </form>
          </div>

          {/* Secure Payment Gateway */}
          <div className="bg-white border border-gold/10 rounded-2xl p-6 shadow-xs space-y-6">
            <h2 className="font-serif text-xl font-bold text-charcoal border-b border-gold/10 pb-4">
              2. Secured Payment Option (UPI, Card, COD)
            </h2>

            {/* Payment Selectors */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-sans">
              {[
                { id: 'UPI', label: 'Instant UPI', subtitle: 'Razorpay Security' },
                { id: 'Cards', label: 'Credit/Debit', subtitle: 'Visa / Mastercard' },
                { id: 'Razorpay', label: 'Razorpay Hub', subtitle: 'Net Banking' },
                { id: 'COD', label: 'Cash On Delivery', subtitle: '₹50 fee may apply' }
              ].map(method => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`p-3.5 border rounded-xl text-left transition-all ${
                    paymentMethod === method.id
                      ? 'border-gold bg-gold/5 ring-1 ring-gold'
                      : 'border-gray-100 hover:border-gold/30'
                  }`}
                >
                  <p className="text-xs font-bold text-charcoal">{method.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{method.subtitle}</p>
                </button>
              ))}
            </div>

            {/* Sub-interfaces for simulated payment */}
            <div className="bg-beige-soft/60 border border-gold/10 p-4 rounded-xl font-sans">
              {paymentMethod === 'UPI' && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-charcoal">Enter your UPI ID</p>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="sharma@okaxis"
                      className="flex-grow bg-white text-charcoal text-sm p-3 rounded-lg border border-gray-200 focus:outline-hidden focus:border-gold"
                    />
                    <button className="bg-charcoal text-gold px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider">
                      Verify
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400">Works with Google Pay, PhonePe, Paytm, BHIM and all banking apps.</p>
                </div>
              )}

              {paymentMethod === 'Cards' && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-charcoal">Credit / Debit Card Details</p>
                  <input
                    type="text"
                    maxLength={16}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="4312 8765 4321 0987"
                    className="w-full bg-white text-charcoal text-sm p-3 rounded-lg border border-gray-200 focus:outline-hidden focus:border-gold"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="bg-white text-charcoal text-sm p-3 rounded-lg border border-gray-200 focus:outline-hidden focus:border-gold"
                    />
                    <input
                      type="password"
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      placeholder="CVV"
                      className="bg-white text-charcoal text-sm p-3 rounded-lg border border-gray-200 focus:outline-hidden focus:border-gold"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'Razorpay' && (
                <div className="p-2 text-center text-xs text-gray-500 space-y-2">
                  <CreditCard className="mx-auto text-gold mb-1" size={24} />
                  <p className="font-semibold text-charcoal">Secured Gateway Redirect Enabled</p>
                  <p>In production, this launches the Razorpay Checkout pop-up supporting Net Banking, Wallets, and EMI options.</p>
                </div>
              )}

              {paymentMethod === 'COD' && (
                <div className="p-2 space-y-1 text-xs">
                  <p className="font-bold text-emerald-700">✓ Free Cash On Delivery Selected</p>
                  <p className="text-gray-500">Please pay in cash or via mobile UPI code to the courier executive upon delivery at your doorstep.</p>
                </div>
              )}
            </div>

            {/* Terms and placement */}
            <div className="space-y-4 font-sans">
              <div className="flex items-start space-x-2.5 text-[11px] text-gray-500">
                <ShieldCheck size={18} className="text-gold shrink-0 mt-0.5" />
                <p>
                  By clicking Place Order, you agree to our 100% Secure Transaction Policies. We guarantee premium anti-allergic metals and strict high-density 18k/22k plating standards.
                </p>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing || cart.length === 0}
                className={`w-full text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center space-x-2 ${
                  isProcessing ? 'bg-gold-light cursor-wait' : 'bg-gold hover:bg-gold-dark'
                }`}
              >
                <span>{isProcessing ? 'Verifying Coordinates via Razorpay...' : `Pay & Place Order (₹${finalTotal})`}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-gold/10 rounded-2xl p-6 shadow-xs space-y-6 sticky top-28">
            <h2 className="font-serif text-lg font-bold text-charcoal border-b border-gold/10 pb-4 flex items-center justify-between">
              <span>Shopping Bag Summary</span>
              <ShoppingBag size={18} className="text-gold" />
            </h2>

            {/* List items */}
            <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 pr-2 scrollbar-none">
              {cart.map((item, idx) => (
                <div key={idx} className="flex py-3 items-center justify-between font-sans">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-12 h-12 object-cover rounded-md border border-gold/10"
                    />
                    <div>
                      <p className="text-xs font-semibold text-charcoal line-clamp-1">{item.product.title}</p>
                      <p className="text-[10px] text-gray-400">Variant: {item.selectedVariant} • Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-charcoal">₹{item.product.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Coupon Code Input */}
            <div className="border-t border-b border-gold/10 py-4 space-y-3 font-sans">
              <p className="text-xs font-bold text-charcoal flex items-center space-x-1">
                <Tag size={13} className="text-gold" />
                <span>Apply Store Promo / Coupon</span>
              </p>

              {activeCoupon ? (
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg flex justify-between items-center text-xs">
                  <span className="text-emerald-700 font-bold">
                    ✓ Code Applied: "{activeCoupon.code}" ({activeCoupon.discountType === 'percentage' ? `${activeCoupon.value}%` : `₹${activeCoupon.value}`} OFF)
                  </span>
                  <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-red-500 font-bold px-1.5">
                    ✕
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponError('');
                    }}
                    placeholder="Enter FESTIVE20 or ROYAL30"
                    className="flex-grow bg-white text-charcoal text-sm px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:border-gold"
                  />
                  <button
                    type="submit"
                    className="bg-charcoal text-gold font-semibold text-xs px-4 py-2 rounded-lg uppercase tracking-wider hover:bg-black transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-[10px] text-red-500 font-medium">{couponError}</p>}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 text-xs font-sans text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {activeCoupon && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Promo Discount ("{activeCoupon.code}")</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Charges (India Post / BlueDart)</span>
                <span>{shippingCharges === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${shippingCharges}`}</span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>Inclusive of GST (18%)</span>
                <span>₹{gstEstimated}</span>
              </div>
              <div className="flex justify-between border-t border-gold/15 pt-3 text-sm text-charcoal font-bold">
                <span>Grand Total</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
