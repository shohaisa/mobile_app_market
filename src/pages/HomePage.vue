<template>
  <q-page class="home-page">
    <div class="home-page__top safe-top">
      <div class="row items-center justify-between q-mb-sm">
        <div>
          <img class="home-logo" src="@/assets/brand/qazan-logo.svg" alt="QAZAN" />
          <div class="text-caption muted">Доставка в <span class="text-dark text-weight-bold">{{ city }}</span></div>
        </div>
        <q-btn flat round icon="notifications" color="dark" />
      </div>
      <q-input
        v-model="query"
        dense
        outlined
        placeholder="Искать в QAZAN"
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
        <div class="row q-col-gutter-sm">
          <div v-for="n in 8" :key="n" class="col-3">
            <q-skeleton type="circle" size="48px" class="q-mx-auto" />
            <q-skeleton type="text" class="q-mt-xs" />
          </div>
        </div>
      </template>

      <template v-else>
        <CollectionGrid :collections="catalog.collections" @select="openCollection" />

        <template v-if="catalog.deals.length">
          <div class="section-title">
            Скидки дня
            <q-btn flat dense no-caps color="primary" label="Все" @click="openCatalog" />
          </div>
          <div class="product-grid">
            <ProductCard v-for="product in catalog.deals.slice(0, 6)" :key="product.id" :product="product" />
          </div>
        </template>

        <div class="section-title">Товары</div>
        <div class="product-grid">
          <ProductCard v-for="product in catalog.homeProducts" :key="product.id" :product="product" />
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import CollectionGrid from '@/components/CollectionGrid.vue';
import ProductCard from '@/components/ProductCard.vue';
import { useCatalogStore } from '@/stores/catalog';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const catalog = useCatalogStore();
const user = useUserStore();
const query = ref('');

const city = computed(() => user.user?.address || 'укажите адрес');

function openCatalog() {
  void router.push({ name: 'catalog' });
}

function openCollection(id: string) {
  void router.push({ name: 'catalog', params: { collectionId: id } });
}

function goSearch() {
  void router.push({ name: 'catalog', query: { q: query.value } });
}
</script>

<style scoped lang="scss">
.home-page__top {
  padding: 12px 16px 8px;
  padding-top: calc(12px + var(--safe-area-inset-top, env(safe-area-inset-top, 0px)));
  background: #fff;
}

.home-logo {
  display: block;
  height: 28px;
  width: auto;
  margin-bottom: 4px;
}

.product-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 10px;
}
</style>
