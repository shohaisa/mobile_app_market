<template>
  <q-page class="catalog-page">
    <div class="catalog-page__top safe-top">
      <q-input
        v-model="query"
        dense
        outlined
        placeholder="Поиск товаров"
        class="search-field bg-white"
        bg-color="white"
        debounce="150"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>

      <div class="catalog-page__cats">
        <button
          type="button"
          class="cat-chip"
          :class="{ 'cat-chip--active': !collectionId }"
          @click="selectCollection(undefined)"
        >
          Все
        </button>
        <button
          v-for="collection in levelCollections"
          :key="collection.id"
          type="button"
          class="cat-chip"
          :class="{ 'cat-chip--active': collectionId === collection.id }"
          @click="selectCollection(collection.id)"
        >
          {{ collection.title }}
        </button>
      </div>

      <div class="row items-center justify-end q-mt-sm">
        <q-btn flat dense no-caps color="dark" icon="tune" label="Фильтры" @click="filtersOpen = true" />
      </div>
    </div>

    <div class="page-pad">
      <div class="text-caption muted q-mb-sm">{{ productCount }}</div>
      <div v-if="catalog.listingLoading && !catalog.products.length" class="empty-state">
        <q-spinner color="primary" size="32px" />
      </div>
      <div v-else-if="catalog.listingFailed" class="empty-state">
        <div>Не удалось загрузить товары</div>
      </div>
      <div v-else-if="catalog.products.length" class="product-grid">
        <ProductCard v-for="product in catalog.products" :key="product.id" :product="product" />
      </div>
      <div v-else class="empty-state">
        <q-icon name="search_off" size="48px" />
        <div>Ничего не нашли. Попробуйте другой запрос.</div>
      </div>
      <q-btn
        v-if="catalog.listingHasMore"
        class="full-width q-mt-md"
        outline
        color="primary"
        no-caps
        label="Показать ещё"
        :loading="catalog.listingLoading"
        @click="catalog.loadMore()"
      />
    </div>

    <FilterSheet
      v-model="filtersOpen"
      :filters="filters"
      @apply="onApplyFilters"
      @reset="onResetFilters"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import FilterSheet from '@/components/FilterSheet.vue';
import ProductCard from '@/components/ProductCard.vue';
import { plural } from '@/composables/useMoney';
import { useCatalogStore } from '@/stores/catalog';
import type { CatalogFilters } from '@/types/marketplace';

const route = useRoute();
const router = useRouter();
const catalog = useCatalogStore();

const query = ref(String(route.query.q ?? ''));
const collectionId = computed(() => (route.params.collectionId as string | undefined) || undefined);
const levelCollections = computed(() => catalog.collectionsAt(collectionId.value));
const filtersOpen = ref(false);
const filters = reactive<CatalogFilters>({
  minPrice: null,
  maxPrice: null,
});

const productCount = computed(() =>
  plural(catalog.listingTotal, 'товар', 'товара', 'товаров'),
);

watch(
  () => route.query.q,
  (value) => {
    query.value = String(value ?? '');
  },
);

watch(
  () => [query.value, collectionId.value, filters.minPrice, filters.maxPrice] as const,
  () => {
    void catalog.loadListing({
      q: query.value,
      collectionId: collectionId.value,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
    });
  },
  { immediate: true },
);

function selectCollection(id?: string) {
  void router.push({
    name: 'catalog',
    params: { collectionId: id ?? '' },
    query: query.value ? { q: query.value } : {},
  });
}

function onApplyFilters(next: CatalogFilters) {
  Object.assign(filters, next);
  filtersOpen.value = false;
}

function onResetFilters() {
  Object.assign(filters, {
    minPrice: null,
    maxPrice: null,
  });
}
</script>

<style scoped lang="scss">
.catalog-page__top {
  padding: 12px 16px 8px;
  padding-top: calc(12px + var(--safe-area-inset-top, env(safe-area-inset-top, 0px)));
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 2;
}

.catalog-page__cats {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  margin: 10px -16px 0;
  padding: 2px 16px 6px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.catalog-page__cats::-webkit-scrollbar {
  display: none;
}

.cat-chip {
  flex: 0 0 auto;
  border: 0;
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--app-text);
  background: #eef0f5;
  cursor: pointer;
  white-space: nowrap;
}

.cat-chip--active {
  color: #fff;
  background: #005bff;
}

.product-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 10px;
}
</style>
