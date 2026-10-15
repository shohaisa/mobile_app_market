<template>
  <q-page>
    <div class="page-header safe-top">
      <div class="text-h6 text-weight-bold">Избранное</div>
    </div>
    <div class="page-pad">
      <div v-if="!user.token" class="empty-state">
        <q-icon name="favorite" size="52px" />
        <div class="text-subtitle1 text-dark q-mt-sm">Войдите, чтобы видеть избранное</div>
        <q-btn unelevated color="primary" no-caps label="Войти" :to="{ name: 'profile' }" />
      </div>
      <div v-else-if="!favorites.hydrated" class="empty-state">
        <q-spinner color="primary" size="32px" />
      </div>
      <div v-else-if="favorites.products.length" class="product-grid">
        <ProductCard v-for="product in favorites.products" :key="product.id" :product="product" />
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
import ProductCard from '@/components/ProductCard.vue';
import { useFavoritesStore } from '@/stores/favorites';
import { useUserStore } from '@/stores/user';

const favorites = useFavoritesStore();
const user = useUserStore();
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
