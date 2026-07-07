import { Product, Coupon } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    title: "Vandana Royal Kundan Choker Set",
    description: "An exquisite 22k gold plated royal Kundan choker necklace set embellished with hand-cut glass stones, natural pearls, and dangling emerald green beads. Perfect for grand festive occasions, weddings, and bridal trousseaus.",
    price: 3499,
    originalPrice: 4999,
    rating: 4.8,
    reviewsCount: 142,
    category: "Jewellery Sets",
    images: [
      "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600"
    ],
    tags: ["Bridal", "Kundan", "Festive", "Choker", "Best Seller"],
    variants: [
      { id: "v1", name: "Emerald Green", stock: 15 },
      { id: "v2", name: "Ruby Red", stock: 8 },
      { id: "v3", name: "Midnight Blue", stock: 4 }
    ],
    sku: "KNK-SET-001",
    materials: "Brass alloy, hand-cut glass Kundan, natural pearls, high-grade beads, 22k gold plating",
    stock: 27,
    occasion: "Wedding",
    color: "Kundan",
    isBestSeller: true,
    isFestiveWedding: true,
    crossSells: ["prod-3", "prod-5"]
  },
  {
    id: "prod-2",
    title: "Meera Peacock Kundan Jhumka",
    description: "Timeless traditional Indian peacock motif drop jhumkas styled with intricate filigree work, tiny white pearls, and red kemp stones. Light on the ears but heavy on the elegance.",
    price: 899,
    originalPrice: 1499,
    rating: 4.9,
    reviewsCount: 95,
    category: "Earrings",
    images: [
      "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600"
    ],
    tags: ["Jhumka", "Peacock", "Kundan", "Traditional", "Festive"],
    variants: [
      { id: "v4", name: "Classic Gold & Red", stock: 30 },
      { id: "v5", name: "Gold & Mint Green", stock: 22 }
    ],
    sku: "KNK-EAR-Peacock",
    materials: "Gold plated brass, Kundan stones, synthetic rubies, pearl beads",
    stock: 52,
    occasion: "Festive",
    color: "Kundan",
    isBestSeller: true,
    isTrending: true,
    isFestiveWedding: true,
    crossSells: ["prod-1", "prod-4"]
  },
  {
    id: "prod-3",
    title: "Ahilya Antique Temple Bangles (Set of 2)",
    description: "Classic South Indian temple style bangles featuring embossed carvings of Goddess Lakshmi, framed by ruby red kemp stones and finished with an antique matte gold plating.",
    price: 1299,
    originalPrice: 1999,
    rating: 4.7,
    reviewsCount: 68,
    category: "Bangles",
    images: [
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600"
    ],
    tags: ["Temple Jewellery", "Antique Gold", "Bangles", "Lakshmi", "Festive"],
    variants: [
      { id: "v6", name: "Size 2.4", stock: 12 },
      { id: "v7", name: "Size 2.6", stock: 18 },
      { id: "v8", name: "Size 2.8", stock: 10 }
    ],
    sku: "KNK-BAN-Antique",
    materials: "Copper alloy, Kemp stones, 18k antique gold matte plating",
    stock: 40,
    occasion: "Festive",
    color: "Antique Gold",
    isTrending: true,
    isFestiveWedding: true,
    crossSells: ["prod-1", "prod-6"]
  },
  {
    id: "prod-4",
    title: "Nitya Solitaire Rose Gold Adjustable Ring",
    description: "A sparkling contemporary classic ring centering a brilliant round-cut cubic zirconia solitaire with pave setting along a sleek, adjustable band of premium rose gold finish.",
    price: 499,
    originalPrice: 999,
    rating: 4.6,
    reviewsCount: 210,
    category: "Rings",
    images: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=600"
    ],
    tags: ["Solitaire", "Cubic Zirconia", "Rose Gold", "Adjustable", "Minimalist"],
    variants: [
      { id: "v9", name: "Rose Gold", stock: 45 },
      { id: "v10", name: "Platinum Silver", stock: 35 }
    ],
    sku: "KNK-RNG-Solitaire",
    materials: "Brass, AAA+ grade Cubic Zirconia, Rose gold plating",
    stock: 80,
    occasion: "Daily Wear",
    color: "Rose Gold",
    isNewArrival: true,
    crossSells: ["prod-5", "prod-8"]
  },
  {
    id: "prod-5",
    title: "Ishwari Polki Pearl Drop Choker",
    description: "An elegant, lightweight choker combining raw cut Polki diamonds in gold-foil settings with delicate rows of freshwater seed pearls, ending in a beautiful adjustable dori.",
    price: 1899,
    originalPrice: 2799,
    rating: 4.8,
    reviewsCount: 76,
    category: "Necklaces",
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&q=80&w=600"
    ],
    tags: ["Polki", "Pearl Choker", "Traditional", "Lightweight"],
    variants: [
      { id: "v11", name: "Pearl White", stock: 15 },
      { id: "v12", name: "Peach Tint", stock: 8 }
    ],
    sku: "KNK-NEC-Polki",
    materials: "Copper base, Polki crystals, premium imitation seed pearls, 22k gold gold-foil backing",
    stock: 23,
    occasion: "Wedding",
    color: "Polki",
    isNewArrival: true,
    isFestiveWedding: true,
    crossSells: ["prod-2", "prod-7"]
  },
  {
    id: "prod-6",
    title: "Gauri Floral Kundan Kada Bracelet",
    description: "Openable Kada bracelet detailed with a floral Kundan center, surrounding rubies, and beautiful green meenakari work on the inner band. Adds royal luxury to any outfit.",
    price: 1199,
    originalPrice: 1799,
    rating: 4.5,
    reviewsCount: 54,
    category: "Bracelets",
    images: [
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600"
    ],
    tags: ["Kada", "Bracelet", "Meenakari", "Floral", "Gold Plated"],
    variants: [
      { id: "v13", name: "Floral Gold-Red", stock: 20 },
      { id: "v14", name: "Floral Gold-Green", stock: 15 }
    ],
    sku: "KNK-BRC-Kada",
    materials: "Eco-brass, Kundan stones, meenakari enamel, 18k micro gold plating",
    stock: 35,
    occasion: "Party Wear",
    color: "Gold Plated",
    isTrending: true,
    crossSells: ["prod-1", "prod-3"]
  },
  {
    id: "prod-7",
    title: "Payal Royal Kundan Ghungroo Anklets",
    description: "A pair of highly elegant classic Indian anklets decorated with Kundan stones and dangling musical ghungroos that emit a very soft, pleasant chime as you walk.",
    price: 1499,
    originalPrice: 2299,
    rating: 4.9,
    reviewsCount: 39,
    category: "Anklets",
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=600"
    ],
    tags: ["Anklets", "Payal", "Ghungroo", "Bridal", "Wedding"],
    variants: [
      { id: "v15", name: "Antique Silver Plated", stock: 10 },
      { id: "v16", name: "Traditional Gold Plated", stock: 12 }
    ],
    sku: "KNK-ANK-Payal",
    materials: "High purity German silver / Brass, Kundan stones, high quality musical bells",
    stock: 22,
    occasion: "Wedding",
    color: "Silver",
    isBestSeller: true,
    isFestiveWedding: true,
    crossSells: ["prod-1", "prod-2"]
  },
  {
    id: "prod-8",
    title: "Chhavi Minimalist Gold Plated Link Chain",
    description: "A gorgeous, minimal paperclip-style link chain necklace holding a highly polished coin pendant representing prosperity. Excellent for stacking or daily office wear.",
    price: 699,
    originalPrice: 1199,
    rating: 4.4,
    reviewsCount: 112,
    category: "Necklaces",
    images: [
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600"
    ],
    tags: ["Chain", "Coin Pendant", "Paperclip", "Minimalist", "Daily Wear"],
    variants: [
      { id: "v17", name: "Gold Finish", stock: 50 },
      { id: "v18", name: "Silver Finish", stock: 40 }
    ],
    sku: "KNK-NEC-Link",
    materials: "Premium stainless steel (hypoallergenic), 18k real gold PVD vacuum plating",
    stock: 90,
    occasion: "Daily Wear",
    color: "Gold Plated",
    isTrending: true,
    crossSells: ["prod-4"]
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  { code: "FESTIVE20", discountType: "percentage", value: 20, active: true, minSpend: 1500 },
  { code: "AmreetJewelsNEW", discountType: "fixed", value: 150, active: true },
  { code: "FREECOD", discountType: "percentage", value: 0, active: true }, // representation for free shipping/COD promotions
  { code: "ROYAL30", discountType: "percentage", value: 30, active: true, minSpend: 3000 }
];

export const CATEGORIES_LIST = [
  "Earrings",
  "Necklaces",
  "Rings",
  "Bangles",
  "Bracelets",
  "Anklets",
  "Jewellery Sets"
];

export const OCCASIONS_LIST = [
  "Festive",
  "Wedding",
  "Daily Wear",
  "Party Wear"
];

export const COLORS_LIST = [
  "Kundan",
  "Gold Plated",
  "Antique Gold",
  "Rose Gold",
  "Silver",
  "Polki"
];
