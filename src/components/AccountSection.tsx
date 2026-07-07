import React, { useState, useEffect } from 'react';
import { 
  UserCircle, Mail, Phone, MapPin, Package, LogOut, CheckCircle, 
  Clock, AlertTriangle, ArrowRight, Eye, ShieldCheck, User, Lock, Edit2, Key, ShoppingBag, EyeOff, Sparkles, X, ChevronRight, Check, Truck
} from 'lucide-react';
import { User as UserType, Order } from '../types';
import { 
  getStoredOrders, getStoredUsers, saveUsers, 
  getCurrentUser, setCurrentUser, logoutCurrentUser 
} from '../lib/storage';

interface AccountSectionProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onLogin: (user: UserType) => void;
  currentUser: UserType | null;
  initialTab?: 'profile' | 'orders';
}

export default function AccountSection({ 
  onNavigate, 
  onLogout, 
  onLogin, 
  currentUser,
  initialTab = 'profile'
}: AccountSectionProps) {
  // Active Tab state for Logged In Customer Portal
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Login / Register selection state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Login Fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Registration Fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regState, setRegState] = useState('');
  const [regZip, setRegZip] = useState('');
  const [regError, setRegError] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Profile Edit Fields
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editZip, setEditZip] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  // Selected order inspection modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filter orders related to current logged in user (by email or userId)
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (currentUser) {
      const allOrders = getStoredOrders();
      // Match orders by email (case insensitive) or userId
      const filtered = allOrders.filter(
        o => o.userId === currentUser.id || o.email.toLowerCase() === currentUser.email.toLowerCase()
      );
      setUserOrders(filtered);

      // Populate edit states
      setEditName(currentUser.name);
      setEditPhone(currentUser.phone);
      setEditAddress(currentUser.address || '');
      setEditCity(currentUser.city || '');
      setEditState(currentUser.state || '');
      setEditZip(currentUser.zip || '');
    } else {
      setUserOrders([]);
    }
  }, [currentUser]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const users = getStoredUsers();
    const searchKey = loginEmail.toLowerCase().trim();
    const foundUser = users.find(u => 
      u.email.toLowerCase() === searchKey || 
      u.phone.trim() === searchKey ||
      u.phone.replace(/[^0-9]/g, '') === searchKey.replace(/[^0-9]/g, '')
    );

    if (!foundUser) {
      setLoginError('No user account found with this email or phone number. Please sign up!');
      return;
    }

    if (foundUser.password !== loginPassword) {
      setLoginError('Incorrect password. Please verify and try again.');
      return;
    }

    // Success login
    setCurrentUser(foundUser);
    onLogin(foundUser);
    setLoginEmail('');
    setLoginPassword('');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (regName.trim().length < 3) {
      setRegError('Please enter your full name (minimum 3 characters).');
      return;
    }

    if (!/^\d{10}$/.test(regPhone.trim())) {
      setRegError('Please enter a valid 10-digit Indian phone number.');
      return;
    }

    if (regPassword.length < 5) {
      setRegError('Password must be at least 5 characters long.');
      return;
    }

    const users = getStoredUsers();
    const emailExists = users.some(u => u.email.toLowerCase() === regEmail.toLowerCase().trim());
    const phoneExists = users.some(u => u.phone.trim() === regPhone.trim());

    if (emailExists) {
      setRegError('An account with this email address already exists.');
      return;
    }

    if (phoneExists) {
      setRegError('An account with this phone number already exists.');
      return;
    }

    // Create new user object
    const newUser: UserType = {
      id: 'usr-' + Date.now().toString(36),
      name: regName.trim(),
      email: regEmail.toLowerCase().trim(),
      phone: regPhone.trim(),
      address: regAddress.trim(),
      city: regCity.trim(),
      state: regState.trim(),
      zip: regZip.trim(),
      password: regPassword,
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);

    // Auto log in after registering
    setCurrentUser(newUser);
    onLogin(newUser);

    // Clear registration fields
    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegPassword('');
    setRegAddress('');
    setRegCity('');
    setRegState('');
    setRegZip('');
  };

  const handleUpdateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditSuccess('');

    if (!currentUser) return;

    if (editName.trim().length < 3) {
      alert('Name must be at least 3 characters.');
      return;
    }

    if (!/^\d{10}$/.test(editPhone.trim())) {
      alert('Phone must be 10 digits.');
      return;
    }

    const users = getStoredUsers();
    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          name: editName.trim(),
          phone: editPhone.trim(),
          address: editAddress.trim(),
          city: editCity.trim(),
          state: editState.trim(),
          zip: editZip.trim()
        };
      }
      return u;
    });

    saveUsers(updatedUsers);

    // Update session state
    const updatedUser = {
      ...currentUser,
      name: editName.trim(),
      phone: editPhone.trim(),
      address: editAddress.trim(),
      city: editCity.trim(),
      state: editState.trim(),
      zip: editZip.trim()
    };

    setCurrentUser(updatedUser);
    onLogin(updatedUser); // sync App state
    setIsEditingProfile(false);
    setEditSuccess('Your shipping credentials and address details updated successfully.');
    
    // Auto clear success message after 4s
    setTimeout(() => setEditSuccess(''), 4000);
  };

  const handleLogOutAction = () => {
    logoutCurrentUser();
    onLogout();
  };

  // Helper status badge styling
  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Pending Approval</span>;
      case 'Processing':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">In Crafting</span>;
      case 'Shipped':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Dispatched (BlueDart)</span>;
      case 'Delivered':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Delivered</span>;
      case 'Cancelled':
        return <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans" id="account-section">
      {!currentUser ? (
        // NOT LOGGED IN VIEW - AUTH SCREENS
        <div className="max-w-md mx-auto bg-white border-2 border-gold/15 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-300">
          {/* Header */}
          <div className="bg-charcoal text-center py-8 px-6 space-y-2 border-b border-gold/25">
            <span className="font-serif text-2xl font-semibold text-gold tracking-widest block uppercase">
              Amreet Jewels
            </span>
            <p className="text-gray-400 text-xs tracking-wider font-sans">
              {authMode === 'login' ? 'Namaste! Access your private bridal account profile.' : 'Join Amreet Jewels family for premium privileges.'}
            </p>
          </div>

          {/* Toggle Tab */}
          <div className="grid grid-cols-2 border-b border-gray-100 bg-[#FBF9F6]">
            <button
              onClick={() => { setAuthMode('login'); setLoginError(''); setRegError(''); }}
              className={`py-3.5 text-xs uppercase tracking-widest font-bold transition-all ${authMode === 'login' ? 'text-gold-dark border-b-2 border-gold bg-white' : 'text-gray-400 hover:text-charcoal'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode('register'); setLoginError(''); setRegError(''); }}
              className={`py-3.5 text-xs uppercase tracking-widest font-bold transition-all ${authMode === 'register' ? 'text-gold-dark border-b-2 border-gold bg-white' : 'text-gray-400 hover:text-charcoal'}`}
            >
              Create Account
            </button>
          </div>

          <div className="p-8">
            {/* LOGIN MODE */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal flex items-center gap-1.5">
                    <Mail size={12} className="text-gold" />
                    <span>Email Address or Phone Number</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. aditi.sharma@gmail.com or 9555050001"
                    className="w-full bg-beige-soft/40 p-3 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-gold transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal flex items-center gap-1.5">
                      <Lock size={12} className="text-gold" />
                      <span>Security Password</span>
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-beige-soft/40 p-3 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-gold transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-charcoal"
                    >
                      {showLoginPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="bg-red-50 text-red-600 border border-red-100 p-2.5 rounded-lg text-[11px] font-bold text-center">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-charcoal text-gold font-bold py-3 px-6 rounded-lg text-xs uppercase tracking-widest hover:bg-black transition-all shadow-md mt-6 flex items-center justify-center gap-2 border border-gold/15"
                >
                  <ShieldCheck size={14} />
                  <span>Verify and Log In</span>
                </button>
              </form>
            )}

            {/* REGISTER MODE */}
            {authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal flex items-center gap-1">
                      <User size={12} className="text-gold" />
                      <span>Full Name</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Aditi Sharma"
                      className="w-full bg-beige-soft/40 p-3 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-gold transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal flex items-center gap-1">
                      <Phone size={12} className="text-gold" />
                      <span>WhatsApp Phone</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="e.g. 9555050001"
                      className="w-full bg-beige-soft/40 p-3 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-gold transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal flex items-center gap-1.5">
                    <Mail size={12} className="text-gold" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. aditi.sharma@gmail.com"
                    className="w-full bg-beige-soft/40 p-3 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-gold transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal flex items-center gap-1.5">
                    <Lock size={12} className="text-gold" />
                    <span>Create Security Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? "text" : "password"}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimum 5 characters"
                      className="w-full bg-beige-soft/40 p-3 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-gold transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-charcoal"
                    >
                      {showRegPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Optional Shipping Address */}
                <div className="border-t border-gold/10 pt-4 mt-4 space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold-dark flex items-center gap-1">
                    <MapPin size={12} />
                    <span>Default Indian Delivery Address (Optional)</span>
                  </h4>
                  
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      placeholder="Flat/House No., Street name, Area"
                      className="w-full bg-beige-soft/40 p-3 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-gold transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      placeholder="City (e.g. New Delhi)"
                      className="bg-beige-soft/40 p-3 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-gold transition-all"
                    />
                    <input
                      type="text"
                      value={regState}
                      onChange={(e) => setRegState(e.target.value)}
                      placeholder="State (e.g. Delhi)"
                      className="bg-beige-soft/40 p-3 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-gold transition-all"
                    />
                  </div>
                  
                  <input
                    type="text"
                    value={regZip}
                    onChange={(e) => setRegZip(e.target.value)}
                    placeholder="ZIP Code (6 digits)"
                    maxLength={6}
                    className="w-full bg-beige-soft/40 p-3 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-gold transition-all"
                  />
                </div>

                {regError && (
                  <div className="bg-red-50 text-red-600 border border-red-100 p-2.5 rounded-lg text-[11px] font-bold text-center">
                    {regError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gold hover:bg-gold-dark text-white font-bold py-3 px-6 rounded-lg text-xs uppercase tracking-widest transition-all shadow-md mt-6 flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} />
                  <span>Register & Open Profile</span>
                </button>
              </form>
            )}

            {/* Quick Helper Account for Demo */}
            <div className="mt-6 border-t border-gray-100 pt-4 text-center">
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Want to test? Sign up in 10 seconds or log in using any registered details. Account sessions are securely preserved in client cookies and localStorage.
              </p>
            </div>
          </div>
        </div>
      ) : (
        // LOGGED IN: USER PROFILE & HISTORY
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Dashboard Welcome Header */}
          <div className="bg-charcoal text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between border border-gold/25 gap-6 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-5 pointer-events-none">
              <Sparkles size={180} className="text-gold" />
            </div>
            
            <div className="space-y-2 relative z-10">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gold flex items-center gap-1.5">
                <Sparkles size={12} className="animate-pulse" />
                <span>Premium Amreet Jewels Client Club</span>
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold">
                Namaste, <span className="text-gold">{currentUser.name}</span>!
              </h2>
              <p className="text-xs text-gray-400">
                Registered on {new Date(currentUser.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 relative z-10">
              <button
                onClick={() => onNavigate('shop')}
                className="bg-gold hover:bg-gold-dark text-white text-xs uppercase tracking-widest font-bold px-5 py-3 rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <ShoppingBag size={14} />
                <span>Browse Jewels</span>
              </button>
              <button
                onClick={handleLogOutAction}
                className="bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs uppercase tracking-widest font-bold px-4 py-3 rounded-xl transition-all flex items-center gap-1.5"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {editSuccess && (
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-150 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle size={16} className="text-emerald-500" />
              <span>{editSuccess}</span>
            </div>
          )}

          {/* Elegant Custom Tab Switcher Bar */}
          <div className="flex border-b border-gray-200 gap-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-4 text-xs uppercase tracking-widest font-bold transition-all relative ${
                activeTab === 'profile' ? 'text-gold' : 'text-charcoal/60 hover:text-charcoal'
              }`}
            >
              <span>My Profile & Address</span>
              {activeTab === 'profile' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-4 text-xs uppercase tracking-widest font-bold transition-all relative flex items-center gap-1.5 ${
                activeTab === 'orders' ? 'text-gold' : 'text-charcoal/60 hover:text-charcoal'
              }`}
            >
              <Package size={13} className={activeTab === 'orders' ? 'text-gold' : 'text-charcoal/60'} />
              <span>My Orders & Tracking ({userOrders.length})</span>
              {activeTab === 'orders' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full" />
              )}
            </button>
          </div>

          {/* Tab Specific Content Panels */}
          {activeTab === 'profile' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
              {/* PROFILE SECTION CARD */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white rounded-2xl border border-gold/10 p-6 shadow-md">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                    <h3 className="font-serif text-lg font-bold text-charcoal flex items-center gap-2">
                      <UserCircle size={20} className="text-gold" />
                      <span>My Profile Details</span>
                    </h3>
                    {!isEditingProfile && (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="text-[10px] uppercase font-bold text-gold-dark hover:text-charcoal flex items-center gap-1 transition-all border border-gold/20 px-2.5 py-1 rounded-md bg-[#FAF8F5]"
                      >
                        <Edit2 size={10} />
                        <span>Edit Info</span>
                      </button>
                    )}
                  </div>

                  {!isEditingProfile ? (
                    /* Read Only Profile info */
                    <div className="space-y-4 text-xs text-charcoal">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 bg-[#FDFBF7] p-4 rounded-xl border border-gold/5">
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Full Name</p>
                          <p className="font-bold text-charcoal text-sm">{currentUser.name}</p>
                        </div>

                        <div className="space-y-1 bg-[#FDFBF7] p-4 rounded-xl border border-gold/5">
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Email Address</p>
                          <p className="font-bold font-mono">{currentUser.email}</p>
                        </div>
                      </div>

                      <div className="space-y-1 bg-[#FDFBF7] p-4 rounded-xl border border-gold/5">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">WhatsApp Phone</p>
                        <p className="font-bold">{currentUser.phone}</p>
                      </div>

                      <div className="space-y-2 bg-[#FDFBF7] p-4 rounded-xl border border-gold/5">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1">
                          <MapPin size={11} className="text-gold" />
                          <span>Registered Shipping Address</span>
                        </p>
                        {currentUser.address ? (
                          <p className="font-medium leading-relaxed">
                            {currentUser.address}, {currentUser.city}, {currentUser.state} - <span className="font-bold font-mono">{currentUser.zip}</span>
                          </p>
                        ) : (
                          <p className="text-gray-400 italic">No delivery address saved yet. Update details to speed up your future checkout operations.</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Edit Profile Form */
                    <form onSubmit={handleUpdateProfileSubmit} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Full Name</label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-[#FDFBF8] p-2.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-gold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">WhatsApp Contact</label>
                        <input
                          type="tel"
                          required
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full bg-[#FDFBF8] p-2.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-gold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Delivery Street Address</label>
                        <input
                          type="text"
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          className="w-full bg-[#FDFBF8] p-2.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-gold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">City</label>
                          <input
                            type="text"
                            value={editCity}
                            onChange={(e) => setEditCity(e.target.value)}
                            className="w-full bg-[#FDFBF8] p-2.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-hidden"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">State</label>
                          <input
                            type="text"
                            value={editState}
                            onChange={(e) => setEditState(e.target.value)}
                            className="w-full bg-[#FDFBF8] p-2.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">ZIP Code</label>
                        <input
                          type="text"
                          value={editZip}
                          maxLength={6}
                          onChange={(e) => setEditZip(e.target.value)}
                          className="w-full bg-[#FDFBF8] p-2.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-hidden"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          className="flex-1 bg-gold hover:bg-gold-dark text-white font-bold py-2 px-3 rounded-lg text-[10px] uppercase tracking-wider transition-all shadow-xs"
                        >
                          Save Settings
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-charcoal font-bold py-2 px-3 rounded-lg text-[10px] uppercase tracking-wider transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* SIDEBAR */}
              <div className="lg:col-span-4 space-y-6">
                {/* Secure Info banner */}
                <div className="bg-[#FAF8F5] border border-gold/10 rounded-xl p-5 flex gap-3 text-xs text-charcoal shadow-sm">
                  <ShieldCheck size={28} className="text-gold shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Encrypted Identity Vault</p>
                    <p className="text-gray-500 leading-relaxed text-[10px]">
                      All transactions are protected by Razorpay and Cashfree protocols. Your private keys and contact indices are safeguarded from secondary trackers.
                    </p>
                  </div>
                </div>

                {/* Club Benefits Banner */}
                <div className="bg-charcoal text-white rounded-xl p-5 border border-gold/15 space-y-4 shadow-sm relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 pointer-events-none">
                    <Sparkles size={100} className="text-gold" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-gold font-bold">Exclusive Privilege</span>
                    <h4 className="font-serif font-bold text-sm">Amreet Royal Club Member</h4>
                  </div>
                  <ul className="text-[10px] text-gray-300 space-y-2 font-sans">
                    <li className="flex items-center gap-1.5">
                      <span className="text-gold font-bold">✓</span> Free insured shipping across India
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-gold font-bold">✓</span> Priority customization requests
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-gold font-bold">✓</span> Early access to bridal launches
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* MY ORDERS TAB - FULL WIDE FOR ELEGANT LAYOUT */
            <div className="bg-white rounded-2xl border border-gold/10 p-6 shadow-md animate-in fade-in duration-200 space-y-6">
              <h3 className="font-serif text-lg font-bold text-charcoal border-b border-gray-100 pb-4 mb-6 flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <Package size={20} className="text-gold" />
                  <span>Your Handcrafted Orders ({userOrders.length})</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gold bg-gold/5 border border-gold/15 px-2.5 py-1 rounded-md hidden sm:inline">
                  India Express Insured Courier
                </span>
              </h3>

              {userOrders.length === 0 ? (
                /* EMPTY STATE ORDER HISTORY */
                <div className="text-center py-12 space-y-4">
                  <div className="flex justify-center text-gray-300">
                    <ShoppingBag size={54} className="stroke-1" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-serif text-lg font-bold text-charcoal">No Orders Placed Yet</h4>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                      It looks like you haven't booked any handcrafted artificial jewelry set yet. Take our AI stylist's custom suggestions and find your next bridal look!
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('shop')}
                    className="inline-flex items-center gap-1 bg-charcoal hover:bg-black text-gold font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md border border-gold/10"
                  >
                    <span>Explore Boutique Shop</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                /* ORDER HISTORY LIST */
                <div className="space-y-4">
                  {userOrders.map((order) => (
                    <div 
                      key={order.id}
                      className="bg-[#FCFAF7]/30 hover:bg-beige-soft/10 border border-gray-150 rounded-xl p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono font-bold text-charcoal text-xs">{order.id}</span>
                          {getStatusBadge(order.status)}
                        </div>
                        
                        {/* Items description snippet */}
                        <p className="text-[11px] text-gray-500 font-medium">
                          {order.items.map(item => `${item.product.title} (${item.selectedVariant}) x${item.quantity}`).join(', ')}
                        </p>

                        <div className="flex items-center gap-4 text-[10px] text-gray-400 font-medium">
                          <span>Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin size={10} className="text-gold" />
                            <span>{order.city}</span>
                          </span>
                          {order.trackingId && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-gold-dark font-bold">Tracking: {order.trackingId}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0 gap-3 shrink-0">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Total amount paid</span>
                          <span className="text-base font-bold text-gold-dark">₹{order.totalAmount}</span>
                        </div>
                        <div className="flex gap-2 font-sans">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="bg-[#FAF7F2] hover:bg-[#F5EFE6] text-charcoal border border-gold/10 text-[10px] uppercase tracking-widest font-bold py-2 px-3.5 rounded-lg transition-all flex items-center gap-1"
                          >
                            <Eye size={12} />
                            <span>Details</span>
                          </button>
                          <button
                            onClick={() => {
                              onNavigate(order.trackingId ? `track?id=${order.trackingId}` : `track?id=${order.id}`);
                            }}
                            className="bg-gold hover:bg-gold-dark text-white text-[10px] uppercase tracking-widest font-bold py-2 px-3.5 rounded-lg transition-all flex items-center gap-1 shadow-3xs"
                          >
                            <Truck size={12} />
                            <span>Track Live</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DETAILED SINGLE ORDER VIEW MODAL */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans animate-in fade-in duration-300">
              <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gold/20 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="bg-charcoal text-white px-6 py-4 flex items-center justify-between border-b border-gold/20">
                  <div>
                    <h3 className="font-serif text-base font-bold text-gold flex items-center gap-1.5">
                      <Package size={18} />
                      <span>Order Invoice • {selectedOrder.id}</span>
                    </h3>
                    <p className="text-[9px] text-gray-400 mt-0.5">Booking Ref: {selectedOrder.id}</p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Content (Scrollable) */}
                <div className="p-6 overflow-y-auto space-y-5 text-xs text-charcoal">
                  
                  {/* Shipping Box */}
                  <div className="bg-[#FAF7F3] border border-gold/15 rounded-xl p-4.5 space-y-3">
                    <div className="flex justify-between items-start border-b border-gold/10 pb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark">Fulfillment Address</span>
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                    <div className="space-y-1 leading-relaxed">
                      <p className="font-bold text-sm">{selectedOrder.customerName}</p>
                      <p className="text-gray-600">Contact: {selectedOrder.phone} | {selectedOrder.email}</p>
                      <p className="text-gray-700 bg-white p-2.5 rounded-lg border border-gray-100 mt-2 font-medium">
                        {selectedOrder.address}, {selectedOrder.city}, {selectedOrder.state} - <span className="font-bold font-mono">{selectedOrder.zip}</span>
                      </p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2.5">
                    <h4 className="font-bold uppercase tracking-wider text-[10px] text-gray-500 border-b border-gray-100 pb-1.5">Handcrafted Item Breakdowns</h4>
                    <div className="divide-y divide-gray-100">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex py-2.5 items-center justify-between gap-3">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={item.product.images[0]} 
                              alt={item.product.title} 
                              className="w-9 h-9 object-cover rounded border border-gold/10 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-[11px]">{item.product.title}</p>
                              <p className="text-[9px] text-gray-400">Variant: <span className="font-semibold text-charcoal">{item.selectedVariant}</span> | SKU: {item.product.sku}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-charcoal">₹{item.product.price} <span className="text-[10px] font-medium text-gray-400">x{item.quantity}</span></p>
                            <p className="text-[11px] font-bold text-gold-dark font-sans mt-0.5">₹{item.product.price * item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Logistics Status & Milestone Detail */}
                  <div className="bg-[#FAF8F5] border border-gray-100 rounded-xl p-4 flex gap-3 text-xs leading-relaxed text-charcoal">
                    <Clock size={16} className="text-gold mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold uppercase tracking-wide text-[10px] text-gold-dark">Courier Logistics Updates</p>
                      {selectedOrder.status === 'Pending' && (
                        <p className="text-gray-500 mt-1">Order queued and waiting for administrative review. Once authorized, a premium courier tracking link is shared.</p>
                      )}
                      {selectedOrder.status === 'Processing' && (
                        <p className="text-gray-500 mt-1">Amreet Jewels Master artisans are currently hand-carving and polishing your chosen meenakari/kundan settings. Dispatch soon.</p>
                      )}
                      {selectedOrder.status === 'Shipped' && (
                        <p className="text-gray-500 mt-1">Package dispatched via BlueDart Express courier service. Active tracking code is <code className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gold-dark font-bold font-mono text-[10px]">{selectedOrder.trackingId}</code>.</p>
                      )}
                      {selectedOrder.status === 'Delivered' && (
                        <p className="text-emerald-700 font-bold mt-1">Package delivered successfully in pristine condition at your doorstep on Indian logistics timeline.</p>
                      )}
                      {selectedOrder.status === 'Cancelled' && (
                        <p className="text-red-600 font-bold mt-1">The order has been cancelled and any paid payment has been refunded to your banking source.</p>
                      )}
                    </div>
                  </div>

                  {/* Summary Totals */}
                  <div className="border-t border-gray-100 pt-3 flex flex-col items-end text-xs space-y-1.5 font-medium text-gray-500">
                    <p className="flex justify-between w-48">
                      <span>Total Value:</span>
                      <span className="font-bold text-charcoal">₹{selectedOrder.totalAmount}</span>
                    </p>
                    <p className="flex justify-between w-48">
                      <span>Delivery Shipping:</span>
                      <span className="text-emerald-600 font-bold">FREE (Fully Insured)</span>
                    </p>
                    <p className="flex justify-between w-48 border-t border-gold/15 pt-1.5 text-sm font-bold text-charcoal">
                      <span className="font-serif text-gold-dark">Paid Amount:</span>
                      <span className="text-gold-dark font-sans">₹{selectedOrder.totalAmount}</span>
                    </p>
                  </div>

                </div>

                {/* Modal Footer */}
                <div className="bg-beige-soft/50 px-6 py-4 border-t border-gold/10 flex justify-end gap-2 font-sans">
                  <button
                    onClick={() => {
                      onNavigate(selectedOrder.trackingId ? `track?id=${selectedOrder.trackingId}` : `track?id=${selectedOrder.id}`);
                      setSelectedOrder(null);
                    }}
                    className="bg-gold hover:bg-gold-dark text-white px-5 py-2 rounded-lg font-bold uppercase tracking-wider text-[10px] transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Truck size={12} />
                    <span>Track Order Live</span>
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="bg-charcoal hover:bg-black text-white px-5 py-2 rounded-lg font-bold uppercase tracking-wider text-[10px] transition-all"
                  >
                    Close Invoice View
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
