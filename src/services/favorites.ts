import { apiRequest } from '@/services/http';
import { productFromSummary, type CatalogProductPayload } from '@/services/products';
import type { Product } from '@/types/marketplace';

interface FavoriteListResponse {
  status_code: number;
  data: CatalogProductPayload[];
}

interface FavoriteToggleResponse {
  status_code: number;
  data: {
    product_id: number;
    favorited: boolean;
  };
}

export async function fetchFavorites(token: string): Promise<Product[]> {
  const response = await apiRequest<FavoriteListResponse>('/v1/favorites', { token });

  return response.data.map(productFromSummary);
}

export async function toggleFavorite(token: string, productId: number): Promise<boolean> {
  const response = await apiRequest<FavoriteToggleResponse>(`/v1/favorites/${productId}`, {
    method: 'POST',
    token,
  });

  return response.data.favorited;
}
