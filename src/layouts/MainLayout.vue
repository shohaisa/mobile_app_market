<template>
  <q-layout view="hHh lpr fFf">
    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer v-if="showTabs" bordered class="tabbar text-dark" unelevated>
      <q-tabs
        :model-value="activeTab"
        active-color="primary"
        indicator-color="transparent"
        dense
        no-caps
        class="text-grey-7"
        @update:model-value="onTab"
      >
        <q-tab name="home" icon="home" label="Главная" />
        <q-tab name="catalog" icon="grid_view" label="Каталог" />
        <q-tab name="cart" icon="shopping_bag" label="Корзина">
          <q-badge
            v-if="cart.count"
            floating
            color="accent"
            rounded
            :label="cart.count > 99 ? '99+' : cart.count"
          />
        </q-tab>
        <q-tab name="favorites" icon="favorite" label="Избранное">
          <q-badge
            v-if="favorites.count"
            floating
            color="accent"
            rounded
            :label="favorites.count > 99 ? '99+' : favorites.count"
          />
        </q-tab>
        <q-tab name="profile" icon="person" label="Профиль" />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { useFavoritesStore } from '@/stores/favorites';

const route = useRoute();
const router = useRouter();
const cart = useCartStore();
const favorites = useFavoritesStore();

const hideTabsOn = ['product', 'checkout', 'order'];

const showTabs = computed(() => !hideTabsOn.includes(String(route.name)));

const activeTab = computed(() => {
  const name = String(route.name);
  if (name === 'home') return 'home';
  if (name === 'catalog' || name === 'product') return 'catalog';
  if (name === 'cart' || name === 'checkout') return 'cart';
  if (name === 'favorites') return 'favorites';
  if (name === 'profile' || name === 'orders' || name === 'order') return 'profile';
  return 'home';
});

function onTab(name: string | number | null) {
  const target = String(name);
  if (target === 'catalog') {
    void router.push({ name: 'catalog' });
    return;
  }
  void router.push({ name: target });
}
</script>
