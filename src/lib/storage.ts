import { Product, CartItem, Order, Coupon, Review } from '../types';
import { INITIAL_PRODUCTS, INITIAL_COUPONS } from '../data/initialData';

// LocalStorage Keys
const KEYS = {
  PRODUCTS: 'amreetjewels_products',
  CART: 'amreetjewels_cart',
  WISHLIST: 'amreetjewels_wishlist',
  ORDERS: 'amreetjewels_orders',
  COUPONS: 'amreetjewels_coupons',
  REVIEWS: 'amreetjewels_reviews'
};

export function getStoredProducts(): Product[] {
  const data = localStorage.getItem(KEYS.PRODUCTS);
  if (!data) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  return JSON.parse(data);
}

export function saveProducts(products: Product[]) {
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
}

export function getStoredCart(): CartItem[] {
  const data = localStorage.getItem(KEYS.CART);
  return data ? JSON.parse(data) : [];
}

export function saveCart(cart: CartItem[]) {
  localStorage.setItem(KEYS.CART, JSON.stringify(cart));
}

export function clearCart() {
  localStorage.removeItem(KEYS.CART);
}

export function getStoredWishlist(): string[] {
  const data = localStorage.getItem(KEYS.WISHLIST);
  return data ? JSON.parse(data) : [];
}

export function saveWishlist(wishlist: string[]) {
  localStorage.setItem(KEYS.WISHLIST, JSON.stringify(wishlist));
}

export function getStoredOrders(): Order[] {
  const data = localStorage.getItem(KEYS.ORDERS);
  if (!data) {
    const empty: Order[] = [];
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(empty));
    return empty;
  }
  return JSON.parse(data);
}

export function saveOrders(orders: Order[]) {
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
}

export function addOrder(order: Order) {
  const orders = getStoredOrders();
  orders.unshift(order); // Add to the beginning
  saveOrders(orders);
}

export function getStoredCoupons(): Coupon[] {
  const data = localStorage.getItem(KEYS.COUPONS);
  if (!data) {
    localStorage.setItem(KEYS.COUPONS, JSON.stringify(INITIAL_COUPONS));
    return INITIAL_COUPONS;
  }
  return JSON.parse(data);
}

export function saveCoupons(coupons: Coupon[]) {
  localStorage.setItem(KEYS.COUPONS, JSON.stringify(coupons));
}

export function getStoredReviews(): Review[] {
  const data = localStorage.getItem(KEYS.REVIEWS);
  if (!data) {
    // Generate some initial reviews for products
    const initialReviews: Review[] = [
      {
        id: "rev-1",
        productId: "prod-1",
        userName: "Priya Sharma",
        rating: 5,
        comment: "Absolutely gorgeous set! Wore it for my brother's wedding and got endless compliments. It looks like genuine heritage Kundan gold!",
        date: "2026-06-25",
        verified: true
      },
      {
        id: "rev-2",
        productId: "prod-1",
        userName: "Ananya Iyer",
        rating: 4,
        comment: "Excellent quality and weight. Plating matches real gold beautifully. Delivery took 4 days to Bangalore.",
        date: "2026-06-28",
        verified: true
      },
      {
        id: "rev-3",
        productId: "prod-2",
        userName: "Meenakshi Das",
        rating: 5,
        comment: "Beautiful peacock carvings! Perfect size and not heavy on ears at all. Beautiful piece of craftsmanship.",
        date: "2026-07-02",
        verified: true
      },
      {
        id: "rev-4",
        productId: "prod-4",
        userName: "Riddhi Patel",
        rating: 5,
        comment: "So sparkling and delicate! Fits perfectly because of the adjustable size. Loved the cute packing.",
        date: "2026-07-04",
        verified: true
      }
    ];
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(initialReviews));
    return initialReviews;
  }
  return JSON.parse(data);
}

export function saveReviews(reviews: Review[]) {
  localStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));
}

export function addReview(review: Review) {
  const reviews = getStoredReviews();
  reviews.unshift(review);
  saveReviews(reviews);
}
