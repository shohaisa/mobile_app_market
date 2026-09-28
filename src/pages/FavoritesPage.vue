<template>
  <q-page>
    <div class="page-header safe-top">
      <div class="text-h6 text-weight-bold">Избранное</div>
    </div>
    <div class="page-pad">
      <div v-if="loading" class="empty-state">
        <q-spinner color="primary" size="32px" />
      </div>
      <div v-else-if="products.length" class="product-grid">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>
      <div v-else class="empty-state">
        <q-icon name="favorite" size="52px" />
        <div class="text-subtitle1 text-dark q-mt-sm">Список пуст</div>
        <div>Нажимайте на сердечко на карточке товара</div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import ProductCard from '@/components/ProductCard.vue';
import { useCatalogStore } from '@/stores/catalog';
import { useFavoritesStore } from '@/stores/favorites';
import type { Product } from '@/types/marketplace';

const catalog = useCatalogStore();
const favorites = useFavoritesStore();
const products = ref<Product[]>([]);
const loading = ref(false);
let request = 0;

watch(
  () => favorites.ids,
  async (ids) => {
    const current = ++request;
    loading.value = true;
    try {
      const loaded = await Promise.all(
        ids.map(async (id) => {
          try {
            return await catalog.loadProduct(id);
          } catch {
            return catalog.productById(id) ?? null;
          }
        }),
      );
      if (current !== request) {
        return;
      }
      products.value = loaded.filter((item): item is Product => item !== null);
    } finally {
      if (current === request) {
        loading.value = false;
      }
    }
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.page-header {
  padding: 16px 16px 8px;
  padding-top: calc(16px + var(--safe-area-inset-top, env(safe-area-inset-top, 0px)));
  background: #fff;
}

.product-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 10px;
}
</style>
