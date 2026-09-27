import { defineStore, acceptHMRUpdate } from 'pinia';
import { computed, ref } from 'vue';
import { api } from '@/services/api';
import { fetchCategories } from '@/services/categories';
import type { Banner, Category, Product } from '@/types/marketplace';

export const useCatalogStore = defineStore('catalog', () => {
  const products = ref<Product[]>([]);
  const categories = ref<Category[]>([]);
  const banners = ref<Banner[]>([]);
  const loading = ref(false);
  const loaded = ref(false);

  const hits = computed(() =>
    [...products.value].sort((a, b) => b.soldCount - a.soldCount).slice(0, 8),
  );

  const deals = computed(() =>
    products.value.filter((item) => Boolean(item.oldPrice && item.oldPrice > item.price)),
  );

  async function fetchAll(): Promise<void> {
    if (loaded.value || loading.value) {
      return;
    }
    loading.value = true;
    try {
      const [nextProducts, nextBanners, nextCategories] = await Promise.all([
        api.getProducts(),
        api.getBanners(),
        fetchCategories().catch(() => [] as Category[]),
      ]);
      products.value = nextProducts;
      categories.value = nextCategories;
      banners.value = nextBanners;
      loaded.value = true;
    } finally {
      loading.value = false;
    }
  }

  function productById(id: string): Product | undefined {
    return products.value.find((item) => item.id === id);
  }

  function categoryById(id: string): Category | undefined {
    const walk = (nodes: Category[]): Category | undefined => {
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

    return walk(categories.value);
  }

  function categoriesAt(id?: string): Category[] {
    if (!id) {
      return categories.value;
    }

    const current = categoryById(id);
    if (!current) {
      return categories.value;
    }
    if (current.children.length) {
      return current.children;
    }
    if (!current.parentId) {
      return categories.value;
    }

    return categoryById(current.parentId)?.children ?? categories.value;
  }

  function productsByCategory(categoryId?: string): Product[] {
    if (!categoryId) {
      return products.value;
    }
    return products.value.filter((item) => item.categoryId === categoryId);
  }

  function search(query: string): Product[] {
    const q = query.trim().toLowerCase();
    if (!q) {
      return products.value;
    }
    return products.value.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags?.some((tag) => tag.toLowerCase().includes(q)),
    );
  }

  return {
    products,
    categories,
    banners,
    loading,
    loaded,
    hits,
    deals,
    fetchAll,
    productById,
    categoryById,
    categoriesAt,
    productsByCategory,
    search,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCatalogStore, import.meta.hot));
}
