<template>
  <q-page class="home-page">
    <div class="home-page__top safe-top">
      <div class="row items-center justify-between q-mb-sm">
        <div>
          <div class="text-caption muted">Доставка в</div>
          <div class="text-weight-bold">{{ city }}</div>
        </div>
        <q-btn flat round icon="notifications" color="dark" />
      </div>
      <q-input
        v-model="query"
        dense
        outlined
        placeholder="Искать в Маркете"
        class="search-field bg-white"
        bg-color="white"
        @keyup.enter="goSearch"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
        <template #append>
          <q-icon v-if="query" name="close" class="cursor-pointer" @click="query = ''" />
        </template>
      </q-input>
    </div>

    <div class="page-pad">
      <template v-if="catalog.loading && !catalog.loaded">
        <q-skeleton height="148px" class="rounded-borders q-mb-md" />
        <div class="row q-col-gutter-sm">
          <div v-for="n in 8" :key="n" class="col-3">
            <q-skeleton type="circle" size="48px" class="q-mx-auto" />
            <q-skeleton type="text" class="q-mt-xs" />
          </div>
        </div>
      </template>

      <template v-else>
        <BannerCarousel :banners="catalog.banners" class="q-mb-md" />
        <CategoryGrid :categories="catalog.categories" @select="openCategory" />

        <div class="section-title">
          Скидки дня
          <q-btn flat dense no-caps color="primary" label="Все" @click="openCatalog" />
        </div>
        <div class="product-grid">
          <ProductCard v-for="product in catalog.deals.slice(0, 6)" :key="product.id" :product="product" />
        </div>

        <div class="section-title">Хиты продаж</div>
        <div class="product-grid">
          <ProductCard v-for="product in catalog.hits" :key="product.id" :product="product" />
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import BannerCarousel from '@/components/BannerCarousel.vue';
import CategoryGrid from '@/components/CategoryGrid.vue';
import ProductCard from '@/components/ProductCard.vue';
import { useCatalogStore } from '@/stores/catalog';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const catalog = useCatalogStore();
const user = useUserStore();
const query = ref('');

const city = computed(() => user.addresses[0]?.city ?? 'Москва');

function openCatalog() {
  void router.push({ name: 'catalog' });
}

function openCategory(id: string) {
  void router.push({ name: 'catalog', params: { categoryId: id } });
}

function goSearch() {
  void router.push({ name: 'catalog', query: { q: query.value } });
}
</script>

<style scoped lang="scss">
.home-page__top {
  padding: 12px 16px 8px;
  background: #fff;
}

.product-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 10px;
}
</style>
