import React, { useState, useEffect } from 'react';
import { ShoppingBag, Tag, CreditCard, ShieldCheck, HelpCircle, ArrowLeft, CheckCircle, X, Code, Copy, Check, Info } from 'lucide-react';
import { CartItem, Order, Coupon, User } from '../types';
import { getStoredCoupons, addOrder, getStoredOrders, saveOrders } from '../lib/storage';

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
  const [upiVerified, setUpiVerified] = useState(false);
  const [upiVerifying, setUpiVerifying] = useState(false);
  const [upiVerifyError, setUpiVerifyError] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Developer Setup Guide states
  const [showDevGuide, setShowDevGuide] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // UPI scan simulation states
  const [isUpiSimulatedPaid, setIsUpiSimulatedPaid] = useState(false);
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);

  // COD OTP simulation states
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [codOtpInput, setCodOtpInput] = useState('');
  const [isCodVerifying, setIsCodVerifying] = useState(false);
  const [isCodVerified, setIsCodVerified] = useState(false);
  const [codVerifyError, setCodVerifyError] = useState('');

  const handleCopyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleVerifyUpi = () => {
    if (!upiId.trim()) {
      setUpiVerifyError('Please enter your UPI ID first (e.g. sharma@okaxis)');
      setUpiVerified(false);
      return;
    }
    if (!upiId.includes('@')) {
      setUpiVerifyError('Invalid UPI ID format. Must include "@" (e.g. name@upi)');
      setUpiVerified(false);
      return;
    }
    setUpiVerifying(true);
    setUpiVerifyError('');
    setUpiVerified(false);

    setTimeout(() => {
      setUpiVerifying(false);
      setUpiVerified(true);
    }, 1000);
  };

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
    setIsUpiSimulatedPaid(false);
    setIsSimulatingScan(false);
    
    // Reset COD states
    setIsCodVerified(false);
    setCodVerifyError('');
    setCodOtpInput('');
    const simulatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(simulatedOtp);

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
          <div className="flex justify-between text-xs font-sans">
            <span className="text-gray-400 font-medium">Order Status:</span>
            <span className={`font-semibold uppercase text-[10px] px-2 py-0.5 rounded-md ${
              placedOrder.status === 'Paid' 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-amber-100 text-amber-800'
            }`}>
              {placedOrder.status}
            </span>
          </div>
          <div className="flex justify-between text-xs font-sans border-t border-gold/10 pt-3">
            <span className="text-gray-400 font-bold">Total Paid:</span>
            <span className="font-bold text-charcoal text-base">₹{placedOrder.totalAmount}</span>
          </div>
        </div>

        {placedOrder.paymentMethod === 'UPI' && (
          <div className="bg-white border-2 border-dashed border-gold/40 rounded-2xl p-6 text-center space-y-4 shadow-sm animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isUpiSimulatedPaid ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                {isUpiSimulatedPaid ? 'UPI Transaction Paid' : 'Awaiting UPI Authorization'}
              </span>
              <span className="text-[10px] text-gold font-bold uppercase tracking-wider bg-gold/5 px-2 py-0.5 rounded border border-gold/15">
                Scan & Pay
              </span>
            </div>

            {/* QR Code Container */}
            <div className="mx-auto w-40 h-40 bg-beige-soft border border-gold/15 rounded-xl flex flex-col items-center justify-center p-3 relative shadow-xs">
              {isUpiSimulatedPaid ? (
                <div className="absolute inset-0 bg-emerald-500/95 rounded-xl flex flex-col items-center justify-center text-white p-3 space-y-1.5 animate-in fade-in duration-300">
                  <CheckCircle size={36} className="text-white fill-white/20" />
                  <p className="font-bold text-xs">₹{placedOrder.totalAmount} Received!</p>
                  <p className="text-[9px] text-emerald-100 uppercase tracking-widest font-mono">Status: PAID</p>
                </div>
              ) : null}

              {/* Mock QR Grid Pattern */}
              <div className="grid grid-cols-5 gap-1.5 opacity-80 w-full h-full">
                {Array.from({ length: 25 }).map((_, i) => {
                  const isCorner = i === 0 || i === 4 || i === 20 || i === 24;
                  return (
                    <div 
                      key={i} 
                      className={`rounded-xs ${
                        isCorner 
                          ? 'bg-charcoal border-2 border-charcoal' 
                          : i % 3 === 0 
                          ? 'bg-charcoal/90' 
                          : i % 5 === 1 
                          ? 'bg-gold/80' 
                          : 'bg-transparent'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-bold text-charcoal">Scan QR using Google Pay, PhonePe, or BHIM</p>
              <p className="text-[10px] text-gray-400">VPA Address: <span className="font-semibold text-gold-dark">amreetjewels@okaxis</span></p>
              <p className="text-[10px] text-gray-400">Transaction ID: <span className="font-mono text-gray-600">{placedOrder.id}</span></p>
            </div>

            {/* Simulation controls */}
            <div className="pt-2 border-t border-gray-100">
              {isUpiSimulatedPaid ? (
                <div className="bg-emerald-50 text-emerald-700 text-[11px] font-bold py-2 rounded-lg border border-emerald-200">
                  🎉 Merchant Callback Webhook Received! Order Status updated to "Paid"
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsSimulatingScan(true);
                    setTimeout(() => {
                      setIsSimulatingScan(false);
                      setIsUpiSimulatedPaid(true);
                      
                      // Also update the order status in localStorage to "Paid"
                      try {
                        const orders = getStoredOrders();
                        const updated = orders.map(o => o.id === placedOrder.id ? { ...o, status: 'Paid' as const } : o);
                        saveOrders(updated);
                        
                        // Update the current local placedOrder state
                        setPlacedOrder({
                          ...placedOrder,
                          status: 'Paid' as const
                        });
                      } catch (err) {
                        console.error('Failed to update storage order status:', err);
                      }
                    }, 1200);
                  }}
                  disabled={isSimulatingScan}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg text-[10px] uppercase tracking-wider transition-all shadow-xs flex items-center justify-center space-x-1.5"
                >
                  {isSimulatingScan ? (
                    <>
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                      <span>Simulating Authorization...</span>
                    </>
                  ) : (
                    <span>Simulate Mobile App Scan & Pay</span>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {placedOrder.paymentMethod === 'COD' && (
          <div className="bg-white border-2 border-dashed border-gold/40 rounded-2xl p-6 text-center space-y-4 shadow-sm animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isCodVerified ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                {isCodVerified ? 'COD Order Authenticated' : 'Awaiting SMS OTP Verification'}
              </span>
              <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-150">
                COD Anti-Fraud
              </span>
            </div>

            {isCodVerified ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center space-y-3 animate-in fade-in duration-300">
                <div className="mx-auto w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle size={22} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-800 text-xs">Verification Successful!</h4>
                  <p className="text-[10px] text-emerald-600 mt-1 font-medium">Your COD request has been authenticated. Order status updated to "Processing".</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-left">
                <div className="bg-beige-soft/60 border border-gold/10 p-3 rounded-xl flex items-start gap-2.5">
                  <Info size={14} className="text-gold mt-0.5 shrink-0" />
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    To prevent fraudulent orders, we have simulated sending a secure 4-digit authentication OTP to your mobile <strong className="text-charcoal">+91 {placedOrder.phone}</strong>.
                  </p>
                </div>

                {/* Simulated SMS Alert Bubble */}
                <div className="bg-charcoal/95 text-white p-3.5 rounded-xl shadow-xs space-y-1 text-[10px] font-mono border-l-4 border-gold relative animate-bounce">
                  <span className="absolute -top-1.5 -left-1.5 bg-gold text-charcoal font-sans font-bold text-[8px] px-1.5 rounded-full uppercase tracking-wider">SMS SIMULATOR</span>
                  <div className="flex justify-between text-gray-400 text-[8px]">
                    <span>Sender: AMREET</span>
                    <span>Just Now</span>
                  </div>
                  <p className="text-gold font-sans font-medium text-[11px] leading-tight pt-1">
                    Namaste! Use <span className="font-mono font-bold text-white tracking-widest bg-white/10 px-1.5 py-0.5 rounded text-sm">{generatedOtp}</span> to authorize your AmreetJewels Cash On Delivery order.
                  </p>
                </div>

                {/* OTP Input Fields */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider">Enter 4-Digit OTP Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      value={codOtpInput}
                      onChange={(e) => {
                        setCodOtpInput(e.target.value.replace(/\D/g, ''));
                        setCodVerifyError('');
                      }}
                      placeholder="e.g. 4812"
                      className="flex-grow bg-white text-charcoal font-mono tracking-widest text-center text-sm font-bold p-3 rounded-lg border border-gray-200 focus:outline-hidden focus:border-gold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (codOtpInput.length !== 4) {
                          setCodVerifyError('Please enter a complete 4-digit code.');
                          return;
                        }
                        if (codOtpInput !== generatedOtp) {
                          setCodVerifyError('Incorrect OTP code. Please copy from the SMS Simulator.');
                          return;
                        }

                        setIsCodVerifying(true);
                        setCodVerifyError('');

                        setTimeout(() => {
                          setIsCodVerifying(false);
                          setIsCodVerified(true);

                          // Update the order status in localStorage to "Processing"
                          try {
                            const orders = getStoredOrders();
                            const updated = orders.map(o => o.id === placedOrder.id ? { ...o, status: 'Processing' as const } : o);
                            saveOrders(updated);

                            // Update local state
                            setPlacedOrder({
                              ...placedOrder,
                              status: 'Processing' as const
                            });
                          } catch (err) {
                            console.error('Failed to update storage order status:', err);
                          }
                        }, 1000);
                      }}
                      disabled={isCodVerifying}
                      className="bg-charcoal hover:bg-black text-gold font-bold px-5 rounded-lg text-xs uppercase tracking-wider transition-all"
                    >
                      {isCodVerifying ? 'Verifying...' : 'Submit OTP'}
                    </button>
                  </div>
                  {codVerifyError && (
                    <p className="text-[10px] text-red-500 font-semibold">{codVerifyError}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

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
            <div className="flex items-center justify-between border-b border-gold/10 pb-4 flex-wrap gap-2">
              <h2 className="font-serif text-xl font-bold text-charcoal">
                2. Secured Payment Option (UPI, Card, COD)
              </h2>
              <button 
                type="button"
                onClick={() => setShowDevGuide(true)}
                className="text-[10px] font-bold text-gold hover:text-gold-dark flex items-center gap-1.5 bg-gold/5 hover:bg-gold/10 px-3 py-1.5 rounded-lg border border-gold/25 transition-all uppercase tracking-wider"
              >
                <Code size={12} />
                <span>🔌 Payment Setup Guide</span>
              </button>
            </div>

            {/* Payment Selectors */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-sans">
              {[
                { id: 'UPI', label: 'Instant UPI', subtitle: 'Razorpay Security' },
                { id: 'Cards', label: 'Credit/Debit', subtitle: 'Visa / Mastercard' },
                { id: 'Razorpay', label: 'Razorpay Hub', subtitle: 'Net Banking' },
                { id: 'COD', label: 'Cash On Delivery', subtitle: '₹50 fee may apply' }
              ].map(method => (
                <button
                  type="button"
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
                    <div className="relative flex-grow">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => {
                          setUpiId(e.target.value);
                          setUpiVerified(false);
                          setUpiVerifyError('');
                        }}
                        placeholder="sharma@okaxis"
                        className={`w-full bg-white text-charcoal text-sm p-3 pr-10 rounded-lg border focus:outline-hidden ${
                          upiVerified 
                            ? 'border-emerald-500 focus:border-emerald-500' 
                            : upiVerifyError 
                            ? 'border-red-500 focus:border-red-500' 
                            : 'border-gray-200 focus:border-gold'
                        }`}
                      />
                      {upiVerified && (
                        <span className="absolute right-3 top-3.5 text-emerald-600">
                          <CheckCircle size={16} className="fill-emerald-50" />
                        </span>
                      )}
                    </div>
                    <button 
                      type="button"
                      onClick={handleVerifyUpi}
                      disabled={upiVerifying || upiVerified}
                      className={`px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all ${
                        upiVerified
                          ? 'bg-emerald-100 text-emerald-700 cursor-default'
                          : upiVerifying
                          ? 'bg-gray-200 text-gray-400 cursor-wait'
                          : 'bg-charcoal text-gold hover:bg-black'
                      }`}
                    >
                      {upiVerifying ? 'Verifying...' : upiVerified ? 'Verified' : 'Verify'}
                    </button>
                  </div>
                  {upiVerifyError && (
                    <p className="text-[10px] text-red-500 font-semibold">{upiVerifyError}</p>
                  )}
                  {upiVerified && (
                    <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <span>✓ VPA linked successfully. Ready to authorize on your UPI app.</span>
                    </p>
                  )}
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

      {/* Developer Setup Guide Modal overlay */}
      {showDevGuide && (
        <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 md:p-6 animate-in fade-in duration-300">
          <div className="bg-white border border-gold/30 rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in scale-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-5 border-b border-gold/10 bg-beige-soft flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="bg-gold/10 p-2 rounded-lg text-gold-dark">
                  <Code size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-charcoal">AmreetJewels Payment Integration Hub</h3>
                  <p className="text-[10px] text-gray-400 font-sans">Full-stack technical blueprint for Indian Payment Gateways</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDevGuide(false)}
                className="p-1.5 hover:bg-gold/10 text-gray-500 hover:text-charcoal rounded-full transition-colors"
                title="Close Guide"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content Scrollable Area */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs font-sans text-gray-600 scrollbar-thin">
              <div className="bg-amber-50 border border-amber-200/60 p-4 rounded-xl flex items-start space-x-3 text-[11px] text-amber-800">
                <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="font-semibold block">⚠️ Real-time Integration Status</strong>
                  <p>
                    By default, this preview operates in <strong>Simulated Sandbox Mode</strong> to allow smooth order checkout flows without charging real bank credentials. Follow the steps below to connect a live production-grade API token.
                  </p>
                </div>
              </div>

              {/* Step 1: Razorpay Integration */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h4 className="text-sm font-bold text-charcoal flex items-center gap-1.5">
                    <span className="bg-gold text-white text-[9px] font-bold px-1.5 py-0.5 rounded-xs">METHOD 1</span>
                    <span>Razorpay Checkout Integration (Recommended)</span>
                  </h4>
                  <button
                    onClick={() => handleCopyCode('razorpay', `// 1. Load Razorpay Checkout Script inside React
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// 2. Trigger Checkout overlay via active order ID
const initRazorpayPayment = async (orderAmount) => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) return alert('Failed to connect to Razorpay server');

  // Request order_id from your secure Express backend /api/payment/order
  const response = await fetch('/api/payment/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: orderAmount * 100 }) // Razorpay expects amount in paise
  });
  const orderDetails = await response.json();

  const options = {
    key: 'YOUR_RAZORPAY_KEY_ID', // Replace with Razorpay Dashboard key
    amount: orderDetails.amount,
    currency: 'INR',
    name: 'AmreetJewels',
    description: 'Fine Kundan & Polki Bridal Wear',
    order_id: orderDetails.id, // Secure transaction ID from server
    handler: async function (res) {
      // Send receipt parameters back to server for SHA256 HMAC cryptographic check
      const verifyResponse = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_payment_id: res.razorpay_payment_id,
          razorpay_order_id: res.razorpay_order_id,
          razorpay_signature: res.razorpay_signature
        })
      });
      const verification = await verifyResponse.json();
      if (verification.status === 'success') {
        alert('Payment authorized successfully!');
      }
    }
  };

  const paymentObject = new window.Razorpay(options);
  paymentObject.open();
};`)}
                    className="text-[10px] font-semibold text-gold hover:text-gold-dark flex items-center gap-1 border border-gold/20 px-2 py-1 rounded-md bg-gold/5"
                  >
                    {copiedSection === 'razorpay' ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                    <span>{copiedSection === 'razorpay' ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <p className="text-gray-500 leading-relaxed">
                  Razorpay is India's most popular full-stack payment gateway. It handles Cards, UPI, Net Banking, and Wallet payments instantly with a responsive sliding modal dialog box.
                </p>
                <div className="bg-charcoal text-gold font-mono p-3.5 rounded-lg overflow-x-auto text-[10px] max-h-48 whitespace-pre scrollbar-thin">
{`// 1. Load Razorpay Checkout Script inside React
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// 2. Trigger Checkout overlay via active order ID
const initRazorpayPayment = async (orderAmount) => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) return alert('Failed to connect to Razorpay server');

  // Request order_id from your secure Express backend /api/payment/order
  const response = await fetch('/api/payment/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: orderAmount * 100 }) // Razorpay expects amount in paise
  });
  const orderDetails = await response.json();

  const options = {
    key: 'YOUR_RAZORPAY_KEY_ID', // Replace with Razorpay Dashboard key
    amount: orderDetails.amount,
    currency: 'INR',
    name: 'AmreetJewels',
    description: 'Fine Kundan & Polki Bridal Wear',
    order_id: orderDetails.id, // Secure transaction ID from server
    handler: async function (res) {
      // Send receipt parameters back to server for SHA256 HMAC cryptographic check
      const verifyResponse = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_payment_id: res.razorpay_payment_id,
          razorpay_order_id: res.razorpay_order_id,
          razorpay_signature: res.razorpay_signature
        })
      });
      const verification = await verifyResponse.json();
      if (verification.status === 'success') {
        alert('Payment authorized successfully!');
      }
    }
  };

  const paymentObject = new window.Razorpay(options);
  paymentObject.open();
};`}
                </div>
              </div>

              {/* Step 2: Instant UPI Dynamic QR */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h4 className="text-sm font-bold text-charcoal flex items-center gap-1.5">
                    <span className="bg-gold text-white text-[9px] font-bold px-1.5 py-0.5 rounded-xs">METHOD 2</span>
                    <span>Instant UPI Deep Linking (Zero Transaction Fee)</span>
                  </h4>
                  <button
                    onClick={() => handleCopyCode('upiLink', `// Compose standard UPI deep link schema for scanning or app redirect
const getUpiDeepLink = (vpaAddress, customerName, orderId, finalAmount) => {
  const base = 'upi://pay';
  const query = new URLSearchParams({
    pa: vpaAddress,                       // Merchant UPI Address (e.g. amreetjewels@okaxis)
    pn: customerName || 'AmreetJewels',   // Merchant Payee Name
    tr: orderId,                         // Merchant Transaction Ref ID
    tn: 'AmreetJewels Jewellery Order',   // Transaction Note
    am: String(finalAmount),              // Final amount in INR (e.g. 1499.00)
    cu: 'INR'                            // Currency code
  });
  return \`\${base}?\${query.toString()}\`;
};

// This link string can be directly rendered as a QR Code in your UI
// scanning this with GPay / Paytm automatically prompts the correct payee and amount!
`)}
                    className="text-[10px] font-semibold text-gold hover:text-gold-dark flex items-center gap-1 border border-gold/20 px-2 py-1 rounded-md bg-gold/5"
                  >
                    {copiedSection === 'upiLink' ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                    <span>{copiedSection === 'upiLink' ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <p className="text-gray-500 leading-relaxed">
                  UPI Intent deep linking allows mobile users to automatically open GPay, PhonePe, or Paytm with the exact payment credentials already prefilled. Desktop users scan a dynamic QR code containing this exact URI schema.
                </p>
                <div className="bg-charcoal text-gold font-mono p-3.5 rounded-lg overflow-x-auto text-[10px] max-h-48 whitespace-pre scrollbar-thin">
{`// Compose standard UPI deep link schema for scanning or app redirect
const getUpiDeepLink = (vpaAddress, customerName, orderId, finalAmount) => {
  const base = 'upi://pay';
  const query = new URLSearchParams({
    pa: vpaAddress,                       // Merchant UPI Address (e.g. amreetjewels@okaxis)
    pn: customerName || 'AmreetJewels',   // Merchant Payee Name
    tr: orderId,                         // Merchant Transaction Ref ID
    tn: 'AmreetJewels Jewellery Order',   // Transaction Note
    am: String(finalAmount),              // Final amount in INR (e.g. 1499)
    cu: 'INR'                            // Currency code
  });
  return \`\${base}?\${query.toString()}\`;
};

// This link string can be directly rendered as a QR Code in your UI.
// scanning this with GPay / Paytm automatically prompts the correct payee and amount!`}
                </div>
              </div>

              {/* Step 3: Server Side verification Node.js / Express */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h4 className="text-sm font-bold text-charcoal flex items-center gap-1.5">
                    <span className="bg-charcoal text-gold text-[9px] font-bold px-1.5 py-0.5 rounded-xs border border-gold/20">BACKEND</span>
                    <span>Secure Node.js Order & Verification Endpoints</span>
                  </h4>
                  <button
                    onClick={() => handleCopyCode('backend', `// Express Endpoint inside server.ts
import crypto from 'crypto';
import Razorpay from 'razorpay';

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Endpoint to create purchase order
app.post('/api/payment/order', async (req, res) => {
  const { amount } = req.body;
  try {
    const options = {
      amount: amount, // amount in paisa (e.g. INR 1499 => 149900)
      currency: 'INR',
      receipt: 'rcpt_' + Math.floor(Math.random() * 100000)
    };
    const order = await razorpayInstance.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to securely verify cryptographic digital signature
app.post('/api/payment/verify', (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
  const generatedSignature = hmac.digest('hex');

  if (generatedSignature === razorpay_signature) {
    // Payment verified securely! Now update order status in DB (e.g. Firestore) to 'Paid'
    res.json({ status: 'success', message: 'Signature authorized' });
  } else {
    res.status(400).json({ status: 'failed', message: 'Invalid payment signature' });
  }
});`)}
                    className="text-[10px] font-semibold text-gold hover:text-gold-dark flex items-center gap-1 border border-gold/20 px-2 py-1 rounded-md bg-gold/5"
                  >
                    {copiedSection === 'backend' ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                    <span>{copiedSection === 'backend' ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <p className="text-gray-500 leading-relaxed">
                  Never expose your payment credentials or verify signatures client-side in the browser. Always create dedicated endpoints in your backend <code>server.ts</code> using a secure environment variable.
                </p>
                <div className="bg-charcoal text-gold font-mono p-3.5 rounded-lg overflow-x-auto text-[10px] max-h-48 whitespace-pre scrollbar-thin">
{`// Express Endpoint inside server.ts
import crypto from 'crypto';
import Razorpay from 'razorpay';

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Endpoint to create purchase order
app.post('/api/payment/order', async (req, res) => {
  const { amount } = req.body;
  try {
    const options = {
      amount: amount, // amount in paisa (e.g. INR 1499 => 149900)
      currency: 'INR',
      receipt: 'rcpt_' + Math.floor(Math.random() * 100000)
    };
    const order = await razorpayInstance.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to securely verify cryptographic digital signature
app.post('/api/payment/verify', (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
  const generatedSignature = hmac.digest('hex');

  if (generatedSignature === razorpay_signature) {
    // Payment verified securely! Now update order status in DB to 'Paid'
    res.json({ status: 'success', message: 'Signature authorized' });
  } else {
    res.status(400).json({ status: 'failed', message: 'Invalid payment signature' });
  }
});`}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gold/10 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowDevGuide(false)}
                className="bg-charcoal hover:bg-black text-gold px-5 py-2 rounded-lg font-bold uppercase text-[10px] tracking-wider transition-colors"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

