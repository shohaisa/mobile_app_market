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

      <div class="row no-wrap q-mt-sm q-gutter-xs scroll-x">
        <q-chip
          :outline="Boolean(categoryId)"
          :color="categoryId ? 'white' : 'primary'"
          :text-color="categoryId ? 'dark' : 'white'"
          clickable
          @click="selectCategory(undefined)"
        >
          Все
        </q-chip>
        <q-chip
          v-for="category in catalog.categories"
          :key="category.id"
          :outline="categoryId !== category.id"
          :color="categoryId === category.id ? 'primary' : 'white'"
          :text-color="categoryId === category.id ? 'white' : 'dark'"
          clickable
          @click="selectCategory(category.id)"
        >
          {{ category.title }}
        </q-chip>
      </div>

      <div class="row items-center justify-between q-mt-sm">
        <q-btn-dropdown
          flat
          dense
          no-caps
          color="dark"
          :label="sortLabel"
          icon="swap_vert"
        >
          <q-list>
            <q-item
              v-for="option in sortOptions"
              :key="option.value"
              v-close-popup
              clickable
              @click="sort = option.value"
            >
              <q-item-section>{{ option.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn flat dense no-caps color="dark" icon="tune" label="Фильтры" @click="filtersOpen = true" />
      </div>
    </div>

    <div class="page-pad">
      <div class="text-caption muted q-mb-sm">{{ visible.length }} товаров</div>
      <div v-if="visible.length" class="product-grid">
        <ProductCard v-for="product in visible" :key="product.id" :product="product" />
      </div>
      <div v-else class="empty-state">
        <q-icon name="search_off" size="48px" />
        <div>Ничего не нашли. Попробуйте другой запрос.</div>
      </div>
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
import { useCatalogStore } from '@/stores/catalog';
import type { CatalogFilters, CatalogSort } from '@/types/marketplace';

const route = useRoute();
const router = useRouter();
const catalog = useCatalogStore();

const query = ref(String(route.query.q ?? ''));
const categoryId = computed(() => (route.params.categoryId as string | undefined) || undefined);
const filtersOpen = ref(false);
const sort = ref<CatalogSort>('popular');
const filters = reactive<CatalogFilters>({
  minPrice: null,
  maxPrice: null,
  minRating: 0,
  onlyDiscount: false,
  inStockOnly: false,
});

const sortOptions: { value: CatalogSort; label: string }[] = [
  { value: 'popular', label: 'Популярные' },
  { value: 'priceAsc', label: 'Дешевле' },
  { value: 'priceDesc', label: 'Дороже' },
  { value: 'rating', label: 'С высоким рейтингом' },
];

const sortLabel = computed(
  () => sortOptions.find((item) => item.value === sort.value)?.label ?? 'Сортировка',
);

watch(
  () => route.query.q,
  (value) => {
    query.value = String(value ?? '');
  },
);

const visible = computed(() => {
  let list = catalog.search(query.value);
  if (categoryId.value) {
    list = list.filter((item) => item.categoryId === categoryId.value);
  }
  if (filters.minPrice != null && filters.minPrice !== 0) {
    list = list.filter((item) => item.price >= Number(filters.minPrice));
  }
  if (filters.maxPrice != null && filters.maxPrice !== 0) {
    list = list.filter((item) => item.price <= Number(filters.maxPrice));
  }
  if (filters.minRating) {
    list = list.filter((item) => item.rating >= filters.minRating);
  }
  if (filters.onlyDiscount) {
    list = list.filter((item) => Boolean(item.oldPrice && item.oldPrice > item.price));
  }
  if (filters.inStockOnly) {
    list = list.filter((item) => item.inStock);
  }
  const copy = [...list];
  copy.sort((a, b) => {
    if (sort.value === 'priceAsc') return a.price - b.price;
    if (sort.value === 'priceDesc') return b.price - a.price;
    if (sort.value === 'rating') return b.rating - a.rating;
    return b.soldCount - a.soldCount;
  });
  return copy;
});

function selectCategory(id?: string) {
  void router.push({
    name: 'catalog',
    params: { categoryId: id ?? '' },
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
    minRating: 0,
    onlyDiscount: false,
    inStockOnly: false,
  });
}
</script>

<style scoped lang="scss">
.catalog-page__top {
  padding: 12px 16px 8px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 2;
}

.scroll-x {
  overflow-x: auto;
  padding-bottom: 2px;
}

.product-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 10px;
}
</style>
