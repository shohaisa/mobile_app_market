<template>
  <q-page>
    <div class="page-header safe-top">
      <div class="text-h6 text-weight-bold">Избранное</div>
    </div>
    <div class="page-pad">
      <div v-if="products.length" class="product-grid">
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
import { computed } from 'vue';
import ProductCard from '@/components/ProductCard.vue';
import { useCatalogStore } from '@/stores/catalog';
import { useFavoritesStore } from '@/stores/favorites';

const catalog = useCatalogStore();
const favorites = useFavoritesStore();

const products = computed(() =>
  catalog.products.filter((item) => favorites.ids.includes(item.id)),
);
</script>

<style scoped lang="scss">
.page-header {
  padding: 16px 16px 8px;
  background: #fff;
}

.product-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 10px;
}
</style>
