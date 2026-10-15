import { apiRequest } from '@/services/http';
import { photoUrl, primaryPhoto, productFromSummary, type CatalogProductPayload } from '@/services/products';
import type { CartItem } from '@/types/marketplace';

interface CartLinePayload {
  id: number;
  quantity: number;
  product: CatalogProductPayload;
}

interface CartResponse {
  status_code: number;
  data: CartLinePayload[];
}

function mapLine(line: CartLinePayload): CartItem {
  const product = productFromSummary(line.product);

  return {
    lineId: line.id,
    productId: product.id,
    title: product.title,
    image: photoUrl(primaryPhoto(product.photos), 'small') ?? '',
    price: product.price,
    qty: line.quantity,
    stock: product.stock ?? 0,
  };
}

export async function fetchCart(token: string): Promise<CartItem[]> {
  const response = await apiRequest<CartResponse>('/v1/cart', { token });

  return response.data.map(mapLine);
}

export async function addCartLine(token: string, productId: number, quantity: number): Promise<CartItem[]> {
  const response = await apiRequest<CartResponse>('/v1/cart/lines', {
    method: 'POST',
    token,
    body: { product_id: productId, quantity },
  });

  return response.data.map(mapLine);
}

export async function updateCartLine(token: string, lineId: number, quantity: number): Promise<CartItem[]> {
  const response = await apiRequest<CartResponse>(`/v1/cart/lines/${lineId}`, {
    method: 'PATCH',
    token,
    body: { quantity },
  });

  return response.data.map(mapLine);
}

export async function removeCartLine(token: string, lineId: number): Promise<CartItem[]> {
  const response = await apiRequest<CartResponse>(`/v1/cart/lines/${lineId}`, {
    method: 'DELETE',
    token,
  });

  return response.data.map(mapLine);
}
