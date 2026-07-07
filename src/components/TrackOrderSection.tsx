import React, { useState, useEffect } from 'react';
import { Package, Truck, Compass, CheckCircle, Search, AlertCircle, Calendar } from 'lucide-react';
import { getStoredOrders } from '../lib/storage';
import { Order } from '../types';

interface TrackOrderSectionProps {
  initialTrackingId?: string;
}

export default function TrackOrderSection({ initialTrackingId = '' }: TrackOrderSectionProps) {
  const [searchId, setSearchId] = useState(initialTrackingId);
  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialTrackingId) {
      handleSearch(initialTrackingId);
    }
  }, [initialTrackingId]);

  const handleSearch = (idToSearch: string) => {
    if (!idToSearch.trim()) return;

    const orders = getStoredOrders();
    // Match against Order ID or Tracking ID
    const found = orders.find(
      o => o.id.toLowerCase() === idToSearch.trim().toLowerCase() ||
           o.trackingId.toLowerCase() === idToSearch.trim().toLowerCase()
    );

    if (found) {
      setMatchedOrder(found);
    } else {
      // Simulate a mock delivery route if they enter a demo code just for visualization
      if (idToSearch.trim().startsWith('TRK-') || idToSearch.trim().startsWith('KNK-')) {
        const simulatedOrder: Order = {
          id: 'KNK-2026-Demo',
          customerName: 'Guest Customer',
          email: 'demo@example.com',
          phone: '9999999999',
          address: '45, Prestige Residency, Indiranagar',
          city: 'Bangalore',
          state: 'Karnataka',
          zip: '560038',
          paymentMethod: 'UPI',
          items: [],
          totalAmount: 2499,
          status: 'Shipped',
          createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), // 2 days ago
          trackingId: idToSearch.trim()
        };
        setMatchedOrder(simulatedOrder);
      } else {
        setMatchedOrder(null);
      }
    }
    setSearched(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchId);
  };

  // Determine current status step index
  const getStatusStepIndex = (status: string) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Processing': return 1;
      case 'Shipped': return 2;
      case 'Delivered': return 3;
      default: return 1;
    }
  };

  const currentStep = matchedOrder ? getStatusStepIndex(matchedOrder.status) : 0;

  const milestones = [
    { title: 'Order Confirmed', desc: 'Sona Jewellery received and approved', icon: CheckCircle },
    { title: 'Quality Audited & Packed', desc: 'Securely packed in velvet box', icon: Compass },
    { title: 'In Transit', desc: 'Shipped via BlueDart Priority Air', icon: Truck },
    { title: 'Delivered', desc: 'Successfully received at your doorstep', icon: Package }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center space-y-3 mb-10">
        <h1 className="font-serif text-3xl font-bold text-charcoal">Track Your Jewellery Shipment</h1>
        <p className="text-gray-500 text-sm max-w-xl mx-auto font-sans">
          Enter your Order Number (e.g. KNK-2026-xxxxxx) or BlueDart Tracking ID (e.g. TRK-xxxxxxxx) to check live shipping status.
        </p>
      </div>

      {/* Tracker Search Input */}
      <div className="bg-white border border-gold/15 rounded-2xl p-6 shadow-xs max-w-2xl mx-auto mb-10">
        <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="e.g. TRK-43289052"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full bg-white text-charcoal text-sm p-3.5 pl-12 rounded-lg border border-gray-200 focus:outline-hidden focus:border-gold font-sans uppercase font-medium"
            />
          </div>
          <button
            type="submit"
            className="bg-gold hover:bg-gold-dark text-white font-bold px-8 py-3.5 rounded-lg text-xs uppercase tracking-widest transition-all"
          >
            Track Order
          </button>
        </form>
      </div>

      {/* Results Display */}
      {searched && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {matchedOrder ? (
            <div className="bg-white border border-gold/10 rounded-2xl p-6 sm:p-8 shadow-xs space-y-8">
              {/* Top Summary Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gold/10 pb-6 gap-4 font-sans text-xs">
                <div className="space-y-1">
                  <p className="text-gray-400 font-medium">Tracking Number</p>
                  <p className="text-sm font-bold text-charcoal uppercase">{matchedOrder.trackingId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-400 font-medium">Recipient Name</p>
                  <p className="text-sm font-semibold text-charcoal">{matchedOrder.customerName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-400 font-medium">Shipment Destination</p>
                  <p className="text-sm font-semibold text-charcoal">{matchedOrder.city}, {matchedOrder.state}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-400 font-medium">Order Date</p>
                  <p className="text-sm font-semibold text-charcoal flex items-center space-x-1">
                    <Calendar size={13} className="text-gold" />
                    <span>{new Date(matchedOrder.createdAt).toLocaleDateString('en-IN')}</span>
                  </p>
                </div>
              </div>

              {/* Graphical Tracking Milestones Stepper */}
              <div className="relative font-sans pt-4 pb-4">
                {/* Connector line behind */}
                <div className="absolute left-[21px] md:left-0 md:top-[18px] md:w-full md:h-1 h-full w-1 bg-gray-100 top-0 z-0">
                  <div 
                    className="bg-gold h-full md:h-full transition-all duration-500 ease-out"
                    style={{ 
                      width: typeof window !== 'undefined' && window.innerWidth >= 768 ? `${(currentStep / 3) * 100}%` : '4px',
                      height: typeof window !== 'undefined' && window.innerWidth < 768 ? `${(currentStep / 3) * 100}%` : '4px'
                    }}
                  />
                </div>

                {/* Milestones nodes */}
                <div className="relative flex flex-col md:flex-row md:justify-between items-start md:items-center z-10 gap-8 md:gap-4">
                  {milestones.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isCompleted = idx <= currentStep;
                    const isActive = idx === currentStep;

                    return (
                      <div key={idx} className="flex md:flex-col md:items-center text-left md:text-center space-x-4 md:space-x-0 w-full md:w-1/4">
                        <div 
                          className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 shrink-0 ${
                            isCompleted 
                              ? 'bg-gold border-gold text-white shadow-md shadow-gold/20' 
                              : 'bg-white border-gray-200 text-gray-300'
                          } ${isActive ? 'scale-110 ring-4 ring-gold/10' : ''}`}
                        >
                          <StepIcon size={18} />
                        </div>

                        <div className="md:mt-3.5 space-y-1">
                          <p className={`text-xs font-bold tracking-wide ${isCompleted ? 'text-charcoal' : 'text-gray-400'}`}>
                            {step.title}
                          </p>
                          <p className="text-[10px] text-gray-400 max-w-[150px] md:mx-auto">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items in this shipment */}
              <div className="border-t border-gold/10 pt-6 font-sans">
                <p className="text-xs font-bold text-charcoal uppercase tracking-wider mb-3">Package Contents</p>
                {matchedOrder.items && matchedOrder.items.length > 0 ? (
                  <div className="space-y-3">
                    {matchedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-beige-soft/60 rounded-xl border border-gold/5 text-xs">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.title}
                            className="w-10 h-10 object-cover rounded-md border border-gold/10"
                          />
                          <div>
                            <p className="font-semibold text-charcoal">{item.product.title}</p>
                            <p className="text-[10px] text-gray-400">Variant: {item.selectedVariant} • Quantity: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-bold text-charcoal">₹{item.product.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Simulated package of luxury Sona Jewellery accents.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-800 space-y-2 max-w-md mx-auto font-sans">
              <AlertCircle className="mx-auto text-red-500" size={24} />
              <p className="text-xs font-bold">No Shipment Coordinates Found</p>
              <p className="text-[11px] text-red-600">
                We couldn't locate any records matching that order or tracking reference. If you placed a custom demo order, try copying its tracking ID from checkout or use the Admin panel to view order ID histories!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
