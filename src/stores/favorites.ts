import { defineStore, acceptHMRUpdate } from 'pinia';
import { computed, ref } from 'vue';
import { fetchFavorites, toggleFavorite } from '@/services/favorites';
import { ApiError } from '@/services/http';
import { useUserStore } from '@/stores/user';
import type { Product } from '@/types/marketplace';

export const useFavoritesStore = defineStore('favorites', () => {
  const products = ref<Product[]>([]);
  const hydrated = ref(false);

  const ids = computed(() => products.value.map((product) => product.id));
  const count = computed(() => products.value.length);

  function has(id: string): boolean {
    return ids.value.includes(id);
  }

  async function hydrate(): Promise<void> {
    if (hydrated.value) {
      return;
    }

    const token = useUserStore().token;
    if (!token) {
      products.value = [];
      hydrated.value = true;
      return;
    }

    try {
      products.value = await fetchFavorites(token);
    } catch {
      products.value = [];
    }
    hydrated.value = true;
  }

  async function refresh(): Promise<void> {
    hydrated.value = false;
    await hydrate();
  }

  function reset(): void {
    products.value = [];
    hydrated.value = true;
  }

  async function toggle(id: string): Promise<boolean> {
    const token = useUserStore().token;
    if (!token) {
      throw new ApiError('Нет токена', 401);
    }

    const favorited = await toggleFavorite(token, Number(id));
    products.value = await fetchFavorites(token);

    return favorited;
  }

  return { products, ids, count, hydrated, has, hydrate, refresh, reset, toggle };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFavoritesStore, import.meta.hot));
}
