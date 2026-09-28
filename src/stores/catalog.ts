import { defineStore, acceptHMRUpdate } from 'pinia';
import { computed, ref } from 'vue';
import { ApiError } from '@/services/http';
import { api } from '@/services/api';
import { fetchCollections } from '@/services/collections';
import { fetchProduct, fetchProducts, type ProductQuery } from '@/services/products';
import type { Banner, Collection, Product } from '@/types/marketplace';

export const useCatalogStore = defineStore('catalog', () => {
  const products = ref<Product[]>([]);
  const homeProducts = ref<Product[]>([]);
  const productCache = ref<Record<string, Product>>({});
  const collections = ref<Collection[]>([]);
  const banners = ref<Banner[]>([]);
  const loading = ref(false);
  const loaded = ref(false);
  const listingLoading = ref(false);
  const listingFailed = ref(false);
  const listingTotal = ref(0);
  const listingPage = ref(1);
  const listingQuery = ref<ProductQuery | null>(null);
  let listingRequest = 0;

  const deals = computed(() =>
    homeProducts.value.filter((item) => Boolean(item.oldPrice && item.oldPrice > item.price)),
  );

  const listingHasMore = computed(() => products.value.length < listingTotal.value);

  function remember(items: Product[]): void {
    if (!items.length) {
      return;
    }
    productCache.value = {
      ...productCache.value,
      ...Object.fromEntries(items.map((item) => [item.id, item])),
    };
  }

  function forget(id: string): void {
    if (!(id in productCache.value)) {
      return;
    }
    const next = { ...productCache.value };
    delete next[id];
    productCache.value = next;
  }

  async function fetchAll(): Promise<void> {
    if (loaded.value || loading.value) {
      return;
    }
    loading.value = true;
    try {
      const [nextBanners, nextCollections, home] = await Promise.all([
        api.getBanners(),
        fetchCollections().catch(() => [] as Collection[]),
        fetchProducts({ page: 1 }).catch(() => null),
      ]);
      banners.value = nextBanners;
      collections.value = nextCollections;
      if (home) {
        remember(home.products);
        homeProducts.value = home.products;
      }
      loaded.value = true;
    } finally {
      loading.value = false;
    }
  }

  async function loadListing(query: ProductQuery, append = false): Promise<void> {
    const requestId = ++listingRequest;
    const page = append ? listingPage.value + 1 : 1;
    listingLoading.value = true;
    listingQuery.value = query;
    try {
      const result = await fetchProducts({ ...query, page });
      if (requestId !== listingRequest) {
        return;
      }
      remember(result.products);
      listingFailed.value = false;
      listingTotal.value = result.total;
      listingPage.value = result.page;
      products.value = append ? [...products.value, ...result.products] : result.products;
    } catch {
      if (requestId !== listingRequest) {
        return;
      }
      if (!append) {
        listingFailed.value = true;
        products.value = [];
        listingTotal.value = 0;
      }
    } finally {
      if (requestId === listingRequest) {
        listingLoading.value = false;
      }
    }
  }

  async function loadMore(): Promise<void> {
    if (!listingQuery.value || listingLoading.value || !listingHasMore.value) {
      return;
    }
    await loadListing(listingQuery.value, true);
  }

  async function loadProduct(id: string): Promise<Product | null> {
    try {
      const product = await fetchProduct(id);
      remember([product]);
      return product;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        forget(id);
        return null;
      }
      throw error;
    }
  }

  function productById(id: string): Product | undefined {
    return productCache.value[id];
  }

  function collectionById(id: string): Collection | undefined {
    const walk = (nodes: Collection[]): Collection | undefined => {
      for (const node of nodes) {
        if (node.id === id) {
          return node;
        }
        const child = walk(node.children);
        if (child) {
          return child;
        }
      }
      return undefined;
    };

    return walk(collections.value);
  }

  function collectionsAt(id?: string): Collection[] {
    if (!id) {
      return collections.value;
    }

    const current = collectionById(id);
    if (!current) {
      return collections.value;
    }
    if (current.children.length) {
      return current.children;
    }
    if (!current.parentId) {
      return collections.value;
    }

    return collectionById(current.parentId)?.children ?? collections.value;
  }

  return {
    products,
    homeProducts,
    collections,
    banners,
    loading,
    loaded,
    listingLoading,
    listingFailed,
    listingTotal,
    listingHasMore,
    deals,
    fetchAll,
    loadListing,
    loadMore,
    loadProduct,
    productById,
    collectionById,
    collectionsAt,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCatalogStore, import.meta.hot));
}
