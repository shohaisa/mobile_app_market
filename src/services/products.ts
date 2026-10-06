import { ApiError, apiRequest } from '@/services/http';
import type { Product, ProductPhoto, ProductPhotoUrls, Seller } from '@/types/marketplace';

export const PRODUCT_IMAGE_TYPES = ['jpeg', 'png', 'webp', 'heic', 'heif', 'avif'] as const;
export const PRODUCT_IMAGE_MAX_KB = 8192;

export type PhotoSlot = 'small' | 'large' | 'master';

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

interface PhotoUrlsPayload {
  master?: string;
  large?: string;
  small?: string;
}

interface PhotoPayload {
  is_primary: boolean;
  sort_order: number;
  urls?: PhotoUrlsPayload;
}

interface ProductCardPayload {
  name: string;
  description: string;
  photos: PhotoPayload[];
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

interface ProductPhotosResponse {
  status_code: number;
  data: PhotoPayload[];
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

function filled(value: string | undefined): string | null {
  if (value == null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export function primaryPhoto(photos: ProductPhoto[]): ProductPhoto | undefined {
  return photos.find((photo) => photo.isPrimary) ?? photos[0];
}

export function photoUrl(photo: ProductPhoto | undefined, slot: PhotoSlot): string | null {
  if (!photo) {
    return null;
  }

  const { master, large, small } = photo.urls;
  if (slot === 'small') {
    return filled(small) ?? filled(master);
  }
  if (slot === 'large') {
    return filled(large) ?? filled(master);
  }
  return filled(master);
}

function mapPhoto(photo: PhotoPayload): ProductPhoto {
  const urls: ProductPhotoUrls = {
    master: photo.urls?.master ?? '',
  };
  const large = filled(photo.urls?.large);
  const small = filled(photo.urls?.small);
  if (large) {
    urls.large = large;
  }
  if (small) {
    urls.small = small;
  }

  return {
    isPrimary: photo.is_primary,
    sortOrder: photo.sort_order,
    urls,
  };
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
    photos: (payload.photos ?? []).map(mapPhoto),
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

export class ProductImageUploadError extends ApiError {
  readonly fileErrors: Readonly<Record<number, string>>;

  constructor(
    status: number,
    message: string,
    errors: Record<string, string[]>,
    fileErrors: Record<number, string>,
  ) {
    super(message, status, errors);
    this.name = 'ProductImageUploadError';
    this.fileErrors = fileErrors;
  }
}

function fileErrorsFrom(errors: Record<string, string[]>): Record<number, string> {
  const result: Record<number, string> = {};
  for (const [key, messages] of Object.entries(errors)) {
    const match = /^images\.(\d+)(?:\.|$)/.exec(key);
    const message = messages[0];
    if (!match || !message) {
      continue;
    }
    const index = Number(match[1]);
    if (result[index] === undefined) {
      result[index] = message;
    }
  }
  return result;
}

function uploadMessage(error: ApiError): string {
  if (error.status === 401) {
    return error.message === 'Запрос не выполнен' ? 'Нет токена' : error.message;
  }
  if (error.status === 403) {
    if (error.message === 'Запрос не выполнен' || /не найден/i.test(error.message)) {
      return 'Недостаточно прав';
    }
    return error.message;
  }
  if (error.status === 404) {
    return error.message === 'Запрос не выполнен' ? 'Товар не найден' : error.message;
  }
  if (error.status === 422) {
    return error.errors.primary?.[0] ?? error.errors.images?.[0] ?? error.message;
  }
  return error.message;
}

export async function uploadProductImages(
  productId: string,
  token: string,
  files: File[],
  primaryIndex: number,
): Promise<ProductPhoto[]> {
  const form = new FormData();
  for (const file of files) {
    form.append('images[]', file, file.name);
  }
  form.append('primary', String(primaryIndex));

  try {
    const response = await apiRequest<ProductPhotosResponse>(`/seller/products/${productId}/images`, {
      method: 'POST',
      body: form,
      token,
    });
    return (response.data ?? []).map(mapPhoto);
  } catch (error) {
    if (!(error instanceof ApiError)) {
      throw error;
    }
    const fileErrors = fileErrorsFrom(error.errors);
    throw new ProductImageUploadError(
      error.status,
      uploadMessage(error),
      error.errors,
      fileErrors,
    );
  }
}
