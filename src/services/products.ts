import { apiRequest } from '@/services/http';
import type { Product, Seller } from '@/types/marketplace';

const MINOR_UNITS = 100;
const PAGE_SIZE = 20;

interface ProductSeller {
  id: number;
  name: string;
}

interface ProductCollection {
  id: number;
  name: string;
}

interface ProductCardPayload {
  name: string;
  description: string;
  photos: string[];
  price: number;
  stock: number;
  seller: ProductSeller | null;
  collection: ProductCollection | null;
  rating_avg: number;
  reviews_count: number;
}

interface ProductListItem extends ProductCardPayload {
  id: number;
}

interface ProductListResponse {
  status_code: number;
  data: ProductListItem[];
  meta: {
    page: number;
    per_page: number;
    total: number;
  };
}

interface ProductShowResponse {
  status_code: number;
  data: ProductCardPayload;
}

export interface ProductQuery {
  q?: string;
  collectionId?: string | undefined;
  minPrice?: number | null;
  maxPrice?: number | null;
  page?: number;
  perPage?: number;
}

export interface ProductList {
  products: Product[];
  page: number;
  perPage: number;
  total: number;
}

function minorUnits(rubles: number): number {
  return Math.round(rubles * MINOR_UNITS);
}

function mapSeller(seller: ProductSeller | null): Seller | null {
  if (!seller) {
    return null;
  }

  return {
    id: String(seller.id),
    name: seller.name,
  };
}

function mapProduct(id: string, payload: ProductCardPayload): Product {
  return {
    id,
    title: payload.name,
    description: payload.description,
    collectionId: payload.collection ? String(payload.collection.id) : '',
    images: payload.photos,
    price: payload.price / MINOR_UNITS,
    rating: payload.rating_avg,
    reviewCount: payload.reviews_count,
    soldCount: 0,
    seller: mapSeller(payload.seller),
    stock: payload.stock,
    inStock: payload.stock > 0,
    reviews: [],
  };
}

export async function fetchProducts(query: ProductQuery = {}): Promise<ProductList> {
  const params = new URLSearchParams();
  const name = query.q?.trim();
  if (name) {
    params.set('q', name);
  }
  if (query.collectionId) {
    params.set('collection_id', query.collectionId);
  }
  if (query.minPrice != null && Number.isFinite(query.minPrice)) {
    params.set('price_min', String(minorUnits(query.minPrice)));
  }
  if (query.maxPrice != null && Number.isFinite(query.maxPrice)) {
    params.set('price_max', String(minorUnits(query.maxPrice)));
  }
  params.set('page', String(query.page ?? 1));
  params.set('per_page', String(query.perPage ?? PAGE_SIZE));

  const response = await apiRequest<ProductListResponse>(`/v1/products?${params.toString()}`);

  return {
    products: response.data.map((item) => mapProduct(String(item.id), item)),
    page: response.meta.page,
    perPage: response.meta.per_page,
    total: response.meta.total,
  };
}

export async function fetchProduct(id: string): Promise<Product> {
  const response = await apiRequest<ProductShowResponse>(`/v1/products/${id}`);

  return mapProduct(id, response.data);
}
