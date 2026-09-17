export interface Category {
  id: string;
  title: string;
  icon: string;
  color: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  categoryId?: string | undefined;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

export interface Seller {
  id: string;
  name: string;
  rating: number;
}

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface Product {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  images: string[];
  price: number;
  oldPrice?: number | undefined;
  rating: number;
  reviewCount: number;
  soldCount: number;
  seller: Seller;
  variants?: ProductVariant[] | undefined;
  inStock: boolean;
  tags?: string[] | undefined;
  reviews: Review[];
}

export interface CartItem {
  productId: string;
  title: string;
  image: string;
  price: number;
  oldPrice?: number | undefined;
  qty: number;
  variant?: string | undefined;
}

export interface Address {
  id: string;
  city: string;
  street: string;
  apartment?: string | undefined;
  comment?: string | undefined;
}

export interface User {
  name: string;
  email: string;
  phone: string;
}

export type OrderStatus = 'processing' | 'shipping' | 'delivered' | 'cancelled';

export interface DeliveryOption {
  id: string;
  title: string;
  hint: string;
  price: number;
}

export interface PaymentOption {
  id: string;
  title: string;
  hint: string;
  icon: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  items: CartItem[];
  address: Address;
  delivery: DeliveryOption;
  payment: PaymentOption;
  promoCode?: string | undefined;
  discount: number;
  deliveryPrice: number;
  total: number;
}

export type CatalogSort = 'popular' | 'priceAsc' | 'priceDesc' | 'rating';

export interface CatalogFilters {
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number;
  onlyDiscount: boolean;
  inStockOnly: boolean;
}
