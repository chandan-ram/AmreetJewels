export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  category: string;
  images: string[];
  tags: string[];
  variants: ProductVariant[];
  sku: string;
  materials: string;
  stock: number;
  occasion: 'Festive' | 'Wedding' | 'Daily Wear' | 'Party Wear';
  color: 'Kundan' | 'Gold Plated' | 'Antique Gold' | 'Rose Gold' | 'Silver' | 'Polki';
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  isFestiveWedding?: boolean;
  crossSells?: string[]; // list of product IDs
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Emerald Green", "Ruby Red", "Classic Gold"
  stock: number;
}

export interface CartItem {
  product: Product;
  selectedVariant: string;
  quantity: number;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface Order {
  id: string;
  userId?: string; // Optional user identifier
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  gstNumber?: string;
  paymentMethod: 'UPI' | 'Razorpay' | 'Cashfree' | 'Cards' | 'NetBanking' | 'COD';
  items: CartItem[];
  totalAmount: number;
  status: 'Pending' | 'Paid' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
  trackingId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  password?: string; // Store password (for local simulation/convenience)
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minSpend?: number;
  active: boolean;
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedProducts?: string[]; // IDs of products
}
