import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, ShoppingCart, Users, Tag, Package, Plus, Edit2, CheckCircle, 
  AlertCircle, ArrowRight, Trash2, ShieldAlert, UploadCloud, RefreshCw
} from 'lucide-react';
import { Product, Order, Coupon } from '../types';
import { 
  getStoredProducts, saveProducts, getStoredOrders, saveOrders, 
  getStoredCoupons, saveCoupons 
} from '../lib/storage';
import { CATEGORIES_LIST, OCCASIONS_LIST, COLORS_LIST } from '../data/initialData';

interface AdminSectionProps {
  products: Product[];
  onProductsUpdate: (newProducts: Product[]) => void;
  orders: Order[];
  onOrdersUpdate: (newOrders: Order[]) => void;
}

export default function AdminSection({
  products,
  onProductsUpdate,
  orders,
  onOrdersUpdate
}: AdminSectionProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'coupons'>('dashboard');

  // Stored state handlers
  const [coupons, setCoupons] = useState<Coupon[]>(() => getStoredCoupons());

  // Form State for Adding Products
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    originalPrice: '',
    category: CATEGORIES_LIST[0],
    description: '',
    materials: '',
    color: COLORS_LIST[0] as any,
    occasion: OCCASIONS_LIST[0] as any,
    imageUrl: '',
    stock: '50',
    sku: '',
    variantsInput: 'Standard'
  });

  // Form State for Adding Coupons
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    value: '',
    minSpend: ''
  });

  // Math Metrics
  const totalSales = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const lowStockCount = products.filter(p => p.stock <= 10).length;

  // Recharts Simulated Data
  const salesTrendData = [
    { name: 'Jan', Sales: 42000, Orders: 22 },
    { name: 'Feb', Sales: 58000, Orders: 31 },
    { name: 'Mar', Sales: 72000, Orders: 45 },
    { name: 'Apr', Sales: 91000, Orders: 52 },
    { name: 'May', Sales: 112000, Orders: 68 },
    { name: 'Jun', Sales: 145000, Orders: 94 },
    { name: 'Jul', Sales: totalSales || 156000, Orders: orders.length + 105 }
  ];

  const categoryShareData = CATEGORIES_LIST.map(cat => {
    const value = products
      .filter(p => p.category === cat)
      .reduce((sum, p) => sum + p.price, 0) * 10; // represent sale volume simulation
    return { name: cat, value: value || 15000 };
  });

  const COLORS = ['#C9A14A', '#1C1C1C', '#E2C279', '#D97706', '#059669', '#3B82F6', '#8B5CF6'];

  // Product actions
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price) return;

    const priceNum = Number(newProduct.price);
    const originalNum = newProduct.originalPrice ? Number(newProduct.originalPrice) : priceNum;
    const stockNum = Number(newProduct.stock) || 10;
    const prodId = 'prod-' + (products.length + 1) + '-' + Math.floor(Math.random() * 100);

    const variantsArray = newProduct.variantsInput
      .split(',')
      .map((name, i) => ({ id: `v-${prodId}-${i}`, name: name.trim(), stock: Math.floor(stockNum / 2) || stockNum }));

    const newlyCreated: Product = {
      id: prodId,
      title: newProduct.title,
      description: newProduct.description || 'Premium artificial Indian jewellery accent.',
      price: priceNum,
      originalPrice: originalNum,
      rating: 5.0,
      reviewsCount: 0,
      category: newProduct.category,
      images: [
        newProduct.imageUrl || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600'
      ],
      tags: [newProduct.category, newProduct.color, newProduct.occasion],
      variants: variantsArray,
      sku: newProduct.sku || `KNK-${newProduct.category.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      materials: newProduct.materials || 'Jewellery grade copper and hand-set crystals',
      stock: stockNum,
      occasion: newProduct.occasion,
      color: newProduct.color,
      isNewArrival: true
    };

    const updated = [newlyCreated, ...products];
    saveProducts(updated);
    onProductsUpdate(updated);

    // Reset Form
    setNewProduct({
      title: '',
      price: '',
      originalPrice: '',
      category: CATEGORIES_LIST[0],
      description: '',
      materials: '',
      color: COLORS_LIST[0] as any,
      occasion: OCCASIONS_LIST[0] as any,
      imageUrl: '',
      stock: '50',
      sku: '',
      variantsInput: 'Standard'
    });
    setShowAddForm(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this exquisite piece from inventory?')) {
      const filtered = products.filter(p => p.id !== id);
      saveProducts(filtered);
      onProductsUpdate(filtered);
    }
  };

  // Bulk Import Simulation
  const handleBulkImport = () => {
    const bulkMockItems: Product[] = [
      {
        id: "bulk-1",
        title: "Mayura Kundan Bridal Choker Set",
        description: "Grand bridal masterpiece with detailed gold meenakari plating and matching earrings.",
        price: 4599,
        originalPrice: 6999,
        rating: 5.0,
        reviewsCount: 1,
        category: "Jewellery Sets",
        images: ["https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=600"],
        tags: ["Bridal", "Kundan", "Festive"],
        variants: [{ id: "bv1", name: "Classic Gold-Red", stock: 10 }],
        sku: "KNK-BRD-Mayura",
        materials: "High purity brass alloy, Kundan glass crystals, meenakari, fresh pearls",
        stock: 10,
        occasion: "Wedding",
        color: "Kundan"
      },
      {
        id: "bulk-2",
        title: "Noor Jhumki Drop Hoop Earrings",
        description: "Elegant lightweight daily wear gold-plated drop hoops centered with synthetic ruby drops.",
        price: 599,
        originalPrice: 999,
        rating: 4.8,
        reviewsCount: 4,
        category: "Earrings",
        images: ["https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=600"],
        tags: ["Daily Wear", "Hoop", "Ruby"],
        variants: [{ id: "bv2", name: "Ruby Red", stock: 35 }],
        sku: "KNK-EAR-Noor",
        materials: "Stainless steel base, 18k gold vacuum micro plating",
        stock: 35,
        occasion: "Daily Wear",
        color: "Gold Plated"
      }
    ];

    const updated = [...bulkMockItems, ...products];
    saveProducts(updated);
    onProductsUpdate(updated);
    alert('Bulk Import Successful! Imported 2 premium product catalog files into local inventory database.');
  };

  // Order actions
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    });
    saveOrders(updated);
    onOrdersUpdate(updated);
  };

  // Coupon actions
  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.value) return;

    const couponObj: Coupon = {
      code: newCoupon.code.toUpperCase().trim(),
      discountType: newCoupon.discountType,
      value: Number(newCoupon.value),
      minSpend: newCoupon.minSpend ? Number(newCoupon.minSpend) : undefined,
      active: true
    };

    const updated = [couponObj, ...coupons];
    saveCoupons(updated);
    setCoupons(updated);

    // Reset Form
    setNewCoupon({
      code: '',
      discountType: 'percentage',
      value: '',
      minSpend: ''
    });
    setShowAddCoupon(false);
  };

  const handleToggleCoupon = (code: string) => {
    const updated = coupons.map(c => {
      if (c.code === code) {
        return { ...c, active: !c.active };
      }
      return c;
    });
    saveCoupons(updated);
    setCoupons(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Admin Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gold/20 pb-6 mb-8 gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal flex items-center gap-2">
            AmreetJewels Control Panel
            <span className="text-xs bg-gold/10 text-gold-dark px-2.5 py-1 rounded-sm uppercase tracking-widest font-semibold border border-gold/20">
              WooCommerce Admin
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Analyze sales performance, restock inventory items, manage active discount vouchers, and fulfill custom Indian customer orders.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'dashboard', label: 'Dashboard Overview' },
            { id: 'products', label: 'Inventory Items' },
            { id: 'orders', label: 'Customer Orders' },
            { id: 'coupons', label: 'Discount Coupons' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg border transition-all ${
                activeTab === tab.id
                  ? 'bg-charcoal text-gold border-charcoal shadow-sm'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gold/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Top Performance Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-gold/10 shadow-xs flex items-center space-x-4">
              <div className="p-3.5 bg-gold/10 text-gold rounded-xl">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Gross Sales</p>
                <p className="text-xl font-bold text-charcoal">₹{totalSales ? totalSales.toLocaleString('en-IN') : '1,56,000'}</p>
                <p className="text-[10px] text-green-600 font-semibold mt-0.5">↑ 22% vs last month</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gold/10 shadow-xs flex items-center space-x-4">
              <div className="p-3.5 bg-charcoal/5 text-charcoal rounded-xl">
                <ShoppingCart size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Orders</p>
                <p className="text-xl font-bold text-charcoal">{orders.length + 105}</p>
                <p className="text-[10px] text-green-600 font-semibold mt-0.5">94% Success Delivery</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gold/10 shadow-xs flex items-center space-x-4">
              <div className="p-3.5 bg-red-50 text-red-600 rounded-xl">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Low Stock Warnings</p>
                <p className="text-xl font-bold text-charcoal">{lowStockCount}</p>
                <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Needs restock soon</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gold/10 shadow-xs flex items-center space-x-4">
              <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Pending Orders</p>
                <p className="text-xl font-bold text-charcoal">{pendingCount}</p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Fulfill via BlueDart</p>
              </div>
            </div>
          </div>

          {/* Visual Business Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white border border-gold/10 p-6 rounded-2xl shadow-xs">
              <h3 className="font-serif text-lg font-bold text-charcoal mb-4 flex items-center justify-between">
                <span>Revenue Performance & Orders Trend</span>
                <span className="text-xs text-gold font-sans font-medium">Fiscal Year 2026</span>
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrendData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C9A14A" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#C9A14A" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '10px', fontFamily: 'sans-serif', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="Sales" stroke="#C9A14A" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white border border-gold/10 p-6 rounded-2xl shadow-xs">
              <h3 className="font-serif text-lg font-bold text-charcoal mb-4">
                Share by Categories
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryShareData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryShareData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '11px', fontFamily: 'sans-serif' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Pie Legends */}
              <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-500 font-medium">
                {categoryShareData.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded-sm block" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    <span className="truncate">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-serif text-xl font-bold text-charcoal">Inventory Catalogue</h3>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleBulkImport}
                className="bg-charcoal hover:bg-black text-gold border border-gold/30 font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-colors"
              >
                <UploadCloud size={15} />
                <span>Simulate CSV Bulk Upload</span>
              </button>

              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-gold hover:bg-gold-dark text-white font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-colors"
              >
                <Plus size={15} />
                <span>Upload New Piece</span>
              </button>
            </div>
          </div>

          {/* New Product Form popup */}
          {showAddForm && (
            <div className="bg-beige-soft border border-gold/25 p-6 rounded-2xl animate-in slide-in-from-top-4 duration-300">
              <h4 className="font-serif text-lg font-bold text-charcoal mb-4">Add Premium Jewellery Asset</h4>
              <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
                <div>
                  <label className="block text-gray-600 mb-1">Product Title*</label>
                  <input
                    type="text"
                    value={newProduct.title}
                    onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                    required
                    placeholder="e.g. Swara Diamond Choker"
                    className="w-full bg-white p-3 border border-gray-200 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Selling Price (₹)*</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    required
                    placeholder="2499"
                    className="w-full bg-white p-3 border border-gray-200 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Original Price (Strikeout - ₹)</label>
                  <input
                    type="number"
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                    placeholder="3499"
                    className="w-full bg-white p-3 border border-gray-200 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Category*</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-white p-3 border border-gray-200 rounded-lg focus:outline-hidden"
                  >
                    {CATEGORIES_LIST.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Color Theme*</label>
                  <select
                    value={newProduct.color}
                    onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value as any })}
                    className="w-full bg-white p-3 border border-gray-200 rounded-lg focus:outline-hidden"
                  >
                    {COLORS_LIST.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Occasion Style*</label>
                  <select
                    value={newProduct.occasion}
                    onChange={(e) => setNewProduct({ ...newProduct, occasion: e.target.value as any })}
                    className="w-full bg-white p-3 border border-gray-200 rounded-lg focus:outline-hidden"
                  >
                    {OCCASIONS_LIST.map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Main Image URL</label>
                  <input
                    type="text"
                    value={newProduct.imageUrl}
                    onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-white p-3 border border-gray-200 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Total Stock</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    placeholder="50"
                    className="w-full bg-white p-3 border border-gray-200 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Variants (Comma-separated)</label>
                  <input
                    type="text"
                    value={newProduct.variantsInput}
                    onChange={(e) => setNewProduct({ ...newProduct, variantsInput: e.target.value })}
                    placeholder="Standard, Emerald Green, Royal Ruby"
                    className="w-full bg-white p-3 border border-gray-200 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-gray-600 mb-1">Description</label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    rows={2}
                    placeholder="Enter elegant copywriting describing the craftsmanship and metals..."
                    className="w-full bg-white p-3 border border-gray-200 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div className="md:col-span-3 flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gold text-white px-6 py-2 rounded-lg hover:bg-gold-dark transition-colors font-bold"
                  >
                    Fulfill to Catalog
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Catalogue Table */}
          <div className="bg-white border border-gold/10 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium font-sans">
                <thead className="bg-beige-soft/60 border-b border-gold/10 text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Piece Detail</th>
                    <th className="p-4">SKU Code</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Occasion</th>
                    <th className="p-4">Plating</th>
                    <th className="p-4">Price (₹)</th>
                    <th className="p-4">Stock Level</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-charcoal">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-beige-soft/20 transition-colors">
                      <td className="p-4 flex items-center space-x-3">
                        <img
                          src={product.images[0]}
                          alt=""
                          className="w-9 h-9 object-cover rounded-md border border-gold/10"
                        />
                        <span className="font-bold block truncate max-w-[140px]">{product.title}</span>
                      </td>
                      <td className="p-4 font-mono text-gray-400">{product.sku}</td>
                      <td className="p-4 text-gray-500">{product.category}</td>
                      <td className="p-4 text-gray-500">{product.occasion}</td>
                      <td className="p-4 text-gray-500">{product.color}</td>
                      <td className="p-4 font-semibold">₹{product.price}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          product.stock <= 10 
                            ? 'bg-red-100 text-red-600' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {product.stock} units
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <h3 className="font-serif text-xl font-bold text-charcoal">Fulfill Customer Invoices</h3>

          <div className="bg-white border border-gold/10 rounded-2xl overflow-hidden shadow-xs">
            {orders.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <ShieldAlert className="mx-auto text-gold/30 mb-2" size={40} />
                <p className="text-xs font-semibold">No recent customer orders have been logged in checkout.</p>
                <p className="text-[10px] text-gray-400 mt-1">Simulate purchases using the customer storefront view.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-beige-soft/60 border-b border-gold/10 text-gray-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-4 font-bold">Order ID</th>
                      <th className="p-4 font-bold">Customer Detail</th>
                      <th className="p-4 font-bold">Items Fulfill</th>
                      <th className="p-4 font-bold">Total Bill</th>
                      <th className="p-4 font-bold">GSTIN</th>
                      <th className="p-4 font-bold">Payment Method</th>
                      <th className="p-4 font-bold">Courier Tracking ID</th>
                      <th className="p-4 font-bold">Milestone Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-charcoal font-medium">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-beige-soft/20 transition-colors">
                        <td className="p-4 font-bold font-mono text-gray-500">{order.id}</td>
                        <td className="p-4">
                          <p className="font-bold text-charcoal">{order.customerName}</p>
                          <p className="text-[10px] text-gray-400">{order.phone} • {order.city}</p>
                        </td>
                        <td className="p-4 max-w-[150px]">
                          <p className="truncate text-gray-500">
                            {order.items?.map(i => `${i.product.title} (${i.quantity})`).join(', ') || 'No items'}
                          </p>
                        </td>
                        <td className="p-4 font-bold text-charcoal">₹{order.totalAmount}</td>
                        <td className="p-4 font-mono text-[10px] text-gray-400">{order.gstNumber || 'None'}</td>
                        <td className="p-4 uppercase text-gray-500">{order.paymentMethod}</td>
                        <td className="p-4 font-mono text-gold-dark font-semibold">{order.trackingId}</td>
                        <td className="p-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                            className="bg-beige-soft border border-gold/20 rounded-md p-1.5 text-[11px] font-bold text-charcoal focus:outline-hidden"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped (Priority BlueDart)</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* COUPONS TAB */}
      {activeTab === 'coupons' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-charcoal">Store Promotion Vouchers</h3>
            <button
              onClick={() => setShowAddCoupon(!showAddCoupon)}
              className="bg-gold hover:bg-gold-dark text-white font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all"
            >
              <Plus size={15} />
              <span>Generate Coupon Code</span>
            </button>
          </div>

          {/* New Coupon form pop-up */}
          {showAddCoupon && (
            <div className="bg-beige-soft border border-gold/25 p-6 rounded-2xl animate-in slide-in-from-top-4 duration-300 max-w-xl">
              <h4 className="font-serif text-base font-bold text-charcoal mb-4">Generate Active Voucher</h4>
              <form onSubmit={handleAddCoupon} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <label className="block text-gray-600 mb-1">Coupon Code (Uppercase)</label>
                  <input
                    type="text"
                    required
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. AMREETDIWALI"
                    className="w-full bg-white p-3 border border-gray-200 rounded-lg focus:outline-hidden uppercase"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Discount Type</label>
                  <select
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value as any })}
                    className="w-full bg-white p-3 border border-gray-200 rounded-lg focus:outline-hidden"
                  >
                    <option value="percentage">Percentage (e.g. 20% off)</option>
                    <option value="fixed">Fixed Flat Reduction (e.g. ₹150 off)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Discount Value (Percentage / Flat ₹)</label>
                  <input
                    type="number"
                    required
                    value={newCoupon.value}
                    onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
                    placeholder="20"
                    className="w-full bg-white p-3 border border-gray-200 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Minimum Cart Spend limit (₹ - optional)</label>
                  <input
                    type="number"
                    value={newCoupon.minSpend}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minSpend: e.target.value })}
                    placeholder="1500"
                    className="w-full bg-white p-3 border border-gray-200 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCoupon(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gold text-white px-6 py-2 rounded-lg hover:bg-gold-dark transition-colors font-bold"
                  >
                    Activate Voucher Code
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Coupons Table */}
          <div className="bg-white border border-gold/10 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-beige-soft/60 border-b border-gold/10 text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Promo Code</th>
                    <th className="p-4">Discount Mechanics</th>
                    <th className="p-4">Discount Value</th>
                    <th className="p-4">Minimum Spend Trigger</th>
                    <th className="p-4">Voucher Status</th>
                    <th className="p-4 text-center">Fulfillment Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-charcoal font-medium">
                  {coupons.map((coupon, idx) => (
                    <tr key={idx} className="hover:bg-beige-soft/20 transition-colors">
                      <td className="p-4 font-bold font-mono text-gray-600 text-sm">"{coupon.code}"</td>
                      <td className="p-4 text-gray-500 uppercase">{coupon.discountType}</td>
                      <td className="p-4 font-semibold">
                        {coupon.discountType === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`} OFF
                      </td>
                      <td className="p-4 text-gray-500">{coupon.minSpend ? `₹${coupon.minSpend}` : 'No minimum limit'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          coupon.active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {coupon.active ? 'ACTIVE' : 'EXPIRED'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleCoupon(coupon.code)}
                          className="text-xs text-gold font-bold hover:text-gold-dark border border-gold/30 px-3 py-1 rounded-md bg-gold/5 hover:bg-gold/10 transition-colors"
                        >
                          {coupon.active ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
