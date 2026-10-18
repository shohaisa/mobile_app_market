export interface Collection {
  id: string;
  title: string;
  parentId: string | null;
  children: Collection[];
  icon: string;
  color: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  collectionId?: string | undefined;
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
  rating?: number;
}

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface ProductPhotoUrls {
  master: string;
  large?: string | undefined;
  small?: string | undefined;
}

export interface ProductPhoto {
  isPrimary: boolean;
  sortOrder: number;
  urls: ProductPhotoUrls;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  collectionId: string;
  photos: ProductPhoto[];
  price: number;
  oldPrice?: number | undefined;
  rating: number;
  reviewCount: number;
  soldCount: number;
  seller: Seller | null;
  stock?: number | undefined;
  variants?: ProductVariant[] | undefined;
  inStock: boolean;
  tags?: string[] | undefined;
  reviews: Review[];
}

export interface CartItem {
  lineId: number;
  productId: string;
  title: string;
  image: string;
  price: number;
  oldPrice?: number | undefined;
  qty: number;
  stock: number;
  variant?: string | undefined;
}

export interface User {
  name: string;
  email: string | null;
  phone: string;
  address: string;
}

export type OrderStatus = 'new' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderLine {
  id: number;
  productId: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: number;
  reference: string;
  status: OrderStatus;
  payment: string;
  phone: string | null;
  address: string | null;
  total: number;
  lines: OrderLine[];
}

export interface CatalogFilters {
  minPrice: number | null;
  maxPrice: number | null;
}
