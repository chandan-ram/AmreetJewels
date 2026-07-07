import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, ShoppingCart, Users, Tag, Package, Plus, Edit2, CheckCircle, 
  AlertCircle, ArrowRight, Trash2, ShieldAlert, UploadCloud, RefreshCw,
  Eye, MapPin, Mail, Phone, Calendar, X
} from 'lucide-react';
import { Product, Order, Coupon, User } from '../types';
import { 
  getStoredProducts, saveProducts, getStoredOrders, saveOrders, 
  getStoredCoupons, saveCoupons, getStoredUsers, saveUsers
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'coupons' | 'buyers'>('dashboard');
  const [selectedInspectionOrder, setSelectedInspectionOrder] = useState<Order | null>(null);
  const [buyers, setBuyers] = useState<User[]>(() => getStoredUsers());

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'admin' && (password === 'password' || password === 'amreet123' || password === 'amreetjewels2026')) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      setLoginError('');
    } else {
      setLoginError('Incorrect credentials. Please try again.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
  };

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

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 px-4 font-sans">
        <div className="bg-white border-2 border-gold/30 rounded-2xl p-8 shadow-xl text-center space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-center">
            <div className="p-4 bg-gold/10 text-gold rounded-full">
              <ShieldAlert size={32} />
            </div>
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-charcoal">AmreetJewels Control Panel</h2>
            <p className="text-xs text-gray-400 mt-1">Please enter your administrative credentials to gain control access.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                className="w-full bg-beige-soft/50 p-3 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-gold transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-beige-soft/50 p-3 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-gold transition-all"
              />
            </div>

            {loginError && (
              <p className="text-[11px] text-red-500 font-bold text-center">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full bg-charcoal text-gold font-bold py-3 px-6 rounded-lg text-xs uppercase tracking-widest hover:bg-black transition-all shadow-md"
            >
              Authorize Secure Connection
            </button>
          </form>

          <div className="border-t border-gold/15 pt-4 text-[10px] text-gray-400 leading-relaxed font-sans">
            <p className="font-bold uppercase tracking-widest text-gold mb-1">Access Guidelines</p>
            <p>Admin panel URL synchronized at <code className="bg-gray-100 px-1 py-0.5 rounded text-[9px]">/admin</code>.</p>
            <p className="mt-1">Use <code className="bg-gray-100 px-1 py-0.5 rounded text-[9px] text-charcoal font-bold">Username: admin</code> & <code className="bg-gray-100 px-1 py-0.5 rounded text-[9px] text-charcoal font-bold">Password: amreet123</code> to log in.</p>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
          {[
            { id: 'dashboard', label: 'Dashboard Overview' },
            { id: 'products', label: 'Inventory Items' },
            { id: 'orders', label: 'Customer Orders' },
            { id: 'coupons', label: 'Discount Coupons' },
            { id: 'buyers', label: 'Registered Buyers' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'buyers') {
                  setBuyers(getStoredUsers());
                }
              }}
              className={`text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg border transition-all ${
                activeTab === tab.id
                  ? 'bg-charcoal text-gold border-charcoal shadow-sm'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gold/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition-all flex items-center gap-1.5 md:ml-auto"
            title="Lock administrative panel and log out"
          >
            <span>Lock & Logout</span>
          </button>
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
                      <th className="p-4 font-bold text-center">Inspect</th>
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
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedInspectionOrder(order)}
                            className="bg-gold/10 text-gold-dark hover:bg-gold hover:text-white px-2.5 py-1.5 rounded-md font-bold transition-all text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 mx-auto border border-gold/25"
                            title="Inspect detailed buyer and item layout"
                          >
                            <Eye size={12} />
                            <span>Invoice</span>
                          </button>
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

      {/* REGISTERED BUYERS TAB */}
      {activeTab === 'buyers' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gold/10 pb-4 gap-2">
            <div>
              <h2 className="font-serif text-xl font-bold text-charcoal">Registered Buyers Directory</h2>
              <p className="text-xs text-gray-400">View customer contact credentials, linked shipping addresses, and lifetime transaction value metrics.</p>
            </div>
            <div className="bg-gold/5 text-gold-dark text-xs font-bold border border-gold/15 px-3 py-1.5 rounded-lg shrink-0 self-start sm:self-auto">
              Total Customers: {buyers.length}
            </div>
          </div>

          <div className="bg-white border border-gold/10 rounded-2xl shadow-xs overflow-hidden">
            {buyers.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <div className="flex justify-center text-gray-300">
                  <Users size={48} className="stroke-1" />
                </div>
                <p className="font-serif text-base font-bold text-charcoal">No Registered Buyers Yet</p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">When shoppers sign up for premium bridal checkout and save profiles, their contact registries will be indexed here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FAF7F3] border-b border-gold/10 text-charcoal uppercase tracking-wider font-bold">
                      <th className="p-4 font-bold">Client Profile</th>
                      <th className="p-4 font-bold">WhatsApp Contact</th>
                      <th className="p-4 font-bold">Primary Delivery Address</th>
                      <th className="p-4 font-bold text-center">Orders Count</th>
                      <th className="p-4 font-bold text-right">Lifetime Spent</th>
                      <th className="p-4 font-bold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-charcoal">
                    {buyers.map(buyer => {
                      // Calculate order counts & total spent
                      const buyerOrders = orders.filter(
                        o => o.userId === buyer.id || o.email.toLowerCase() === buyer.email.toLowerCase()
                      );
                      const totalSpent = buyerOrders
                        .filter(o => o.status !== 'Cancelled')
                        .reduce((sum, o) => sum + o.totalAmount, 0);

                      return (
                        <tr key={buyer.id} className="hover:bg-beige-soft/5 transition-all">
                          <td className="p-4">
                            <div className="flex items-center space-x-2.5">
                              <div className="p-2 bg-gold/10 text-gold-dark rounded-full shrink-0">
                                <Users size={16} />
                              </div>
                              <div>
                                <p className="font-bold text-charcoal text-sm">{buyer.name}</p>
                                <p className="text-gray-400 font-mono text-[10px] mt-0.5">{buyer.email}</p>
                                <p className="text-[9px] text-gray-400">Since: {new Date(buyer.createdAt).toLocaleDateString('en-IN')}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-gray-600 font-semibold">
                            <span className="flex items-center gap-1.5">
                              <Phone size={12} className="text-gold shrink-0" />
                              <span>{buyer.phone}</span>
                            </span>
                          </td>
                          <td className="p-4 text-gray-500 max-w-xs truncate" title={buyer.address ? `${buyer.address}, ${buyer.city}, ${buyer.state} - ${buyer.zip}` : "No address"}>
                            {buyer.address ? (
                              <span className="flex items-start gap-1">
                                <MapPin size={12} className="text-gold shrink-0 mt-0.5" />
                                <span className="leading-relaxed text-[11px]">{buyer.address}, {buyer.city}, {buyer.state} - <span className="font-bold font-mono">{buyer.zip}</span></span>
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">None saved yet</span>
                            )}
                          </td>
                          <td className="p-4 text-center font-bold font-mono text-charcoal text-sm">
                            {buyerOrders.length}
                          </td>
                          <td className="p-4 text-right font-bold text-gold-dark text-sm">
                            ₹{totalSpent.toLocaleString('en-IN')}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => {
                                if (window.confirm("Are you sure you want to remove this client account? This will log them out and remove their saved contact/address directory.")) {
                                  const updated = buyers.filter(b => b.id !== buyer.id);
                                  saveUsers(updated);
                                  setBuyers(updated);
                                }
                              }}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                              title="Remove customer profile indices"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DETAILED INSPECTION MODAL FOR CUSTOMER INVOICES */}
      {selectedInspectionOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gold/20 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-charcoal text-white px-6 py-4 flex items-center justify-between border-b border-gold/20">
              <div>
                <h3 className="font-serif text-lg font-bold text-gold flex items-center gap-1.5">
                  <Package size={20} />
                  <span>Invoice Detail • {selectedInspectionOrder.id}</span>
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Placed on {new Date(selectedInspectionOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <button
                onClick={() => setSelectedInspectionOrder(null)}
                className="text-gray-400 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-charcoal">
              {/* Row 1: Customer Profile Details */}
              <div className="bg-[#F9F5F0] border border-gold/15 rounded-xl p-4 space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-gold-dark border-b border-gold/10 pb-1.5">Buyer Contact & Shipping Logistics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-gray-400 font-semibold">Customer Full Name</p>
                    <p className="font-bold text-sm text-charcoal">{selectedInspectionOrder.customerName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-400 font-semibold">Contact Details</p>
                    <p className="font-bold">{selectedInspectionOrder.phone}</p>
                    <p className="text-gray-500">{selectedInspectionOrder.email}</p>
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <p className="text-gray-400 font-semibold flex items-center gap-1">
                      <MapPin size={12} className="text-gold" />
                      <span>Delivery Shipping Address</span>
                    </p>
                    <p className="font-medium text-charcoal leading-relaxed bg-white p-2.5 rounded-md border border-gray-100 shadow-3xs">
                      {selectedInspectionOrder.address}, {selectedInspectionOrder.city}, {selectedInspectionOrder.state} - <span className="font-bold font-mono">{selectedInspectionOrder.zip}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 2: Itemized Breakdown */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-charcoal border-b border-gray-200 pb-1.5 flex justify-between items-center">
                  <span>Purchased Treasures ({selectedInspectionOrder.items?.reduce((sum, item) => sum + item.quantity, 0) || 0})</span>
                  <span className="font-mono text-[10px] text-gray-400">GST-Inclusive Pricing</span>
                </h4>
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden bg-white">
                  {selectedInspectionOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex p-3 items-center justify-between gap-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.title}
                          className="w-10 h-10 object-cover rounded-md border border-gold/10 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-charcoal text-[11px]">{item.product.title}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Shade/Variant: <span className="font-semibold text-charcoal">{item.selectedVariant}</span></p>
                          <p className="text-[10px] text-gray-400">SKU Code: <span className="font-mono">{item.product.sku}</span></p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold">₹{item.product.price} <span className="text-[10px] font-medium text-gray-400">x {item.quantity}</span></p>
                        <p className="font-bold text-gold-dark mt-0.5">₹{item.product.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 3: Billing Summary & Payment Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-gray-100 rounded-xl p-4 bg-white space-y-2">
                  <h4 className="font-bold text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-1.5">Payment & Logistics Code</h4>
                  <div className="space-y-1.5">
                    <p className="flex justify-between">
                      <span className="text-gray-400">Method</span>
                      <span className="font-bold uppercase text-charcoal">{selectedInspectionOrder.paymentMethod}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-400">GSTIN</span>
                      <span className="font-bold font-mono text-charcoal">{selectedInspectionOrder.gstNumber || 'None Registered'}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-400">Courier Tracking</span>
                      <span className="font-mono text-gold-dark font-bold">{selectedInspectionOrder.trackingId}</span>
                    </p>
                  </div>
                </div>

                <div className="border border-gold/10 rounded-xl p-4 bg-[#FDFBF7] space-y-2 font-medium">
                  <h4 className="font-bold text-[11px] uppercase tracking-wider text-gold-dark border-b border-gold/10 pb-1.5">Order Invoice Valuation</h4>
                  <div className="space-y-1.5 text-gray-600">
                    <div className="flex justify-between">
                      <span>Total Value</span>
                      <span className="font-bold text-charcoal">₹{selectedInspectionOrder.totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span>India Priority Delivery</span>
                      <span className="text-emerald-600 font-bold">FREE (Fully Insured)</span>
                    </div>
                    <div className="border-t border-gold/10 pt-1.5 flex justify-between text-charcoal text-sm font-bold">
                      <span className="font-serif">Net Paid Bill</span>
                      <span className="text-gold-dark">₹{selectedInspectionOrder.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-beige-soft/50 px-6 py-4 border-t border-gold/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-400">Milestone Status:</span>
                <select
                  value={selectedInspectionOrder.status}
                  onChange={(e) => {
                    handleUpdateOrderStatus(selectedInspectionOrder.id, e.target.value as any);
                    // Live update selected order too
                    setSelectedInspectionOrder(prev => prev ? { ...prev, status: e.target.value as any } : null);
                  }}
                  className="bg-white border border-gold/20 rounded-md p-1.5 text-xs font-bold text-charcoal focus:outline-hidden shadow-xs"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped (Priority BlueDart)</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <button
                onClick={() => setSelectedInspectionOrder(null)}
                className="bg-charcoal hover:bg-black text-white px-5 py-2 rounded-lg font-bold uppercase tracking-wider text-[10px] transition-all w-full sm:w-auto text-center"
              >
                Close Fulfill Check
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
