<template>
  <q-page class="cart-page">
    <div class="page-header safe-top">
      <div class="text-h6 text-weight-bold">Корзина</div>
      <div class="text-caption muted">{{ plural(cart.count, 'товар', 'товара', 'товаров') }}</div>
    </div>

    <div v-if="!cart.items.length" class="empty-state">
      <q-icon name="shopping_bag" size="52px" />
      <div class="text-subtitle1 text-dark q-mt-sm">Пока пусто</div>
      <div class="q-mb-md">Добавьте товары из каталога</div>
      <q-btn unelevated color="primary" no-caps label="Перейти в каталог" to="/catalog" />
    </div>

    <div v-else class="page-pad">
      <div v-for="item in cart.items" :key="item.productId + (item.variant ?? '')" class="cart-item card-soft q-pa-sm q-mb-sm">
        <q-img :src="item.image" width="84px" height="84px" class="rounded-borders" />
        <div class="cart-item__body">
          <div class="line-clamp-2 text-weight-medium">{{ item.title }}</div>
          <div v-if="item.variant" class="text-caption muted">{{ item.variant }}</div>
          <PriceBlock :price="item.price" :old-price="item.oldPrice" size="sm" />
          <div class="row items-center justify-between q-mt-xs">
            <QtyStepper :model-value="item.qty" @update:model-value="(qty) => onQty(item, qty)" />
            <q-btn flat dense round icon="delete" color="grey-7" @click="cart.remove(item.productId, item.variant)" />
          </div>
        </div>
      </div>

      <div class="card-soft q-pa-md q-mt-md">
        <div class="text-weight-bold q-mb-sm">Промокод</div>
        <div class="row no-wrap q-gutter-sm">
          <q-input v-model="promo" dense outlined placeholder="MARKET10" class="col" />
          <q-btn unelevated color="primary" no-caps label="Применить" @click="applyPromo" />
        </div>
        <div v-if="cart.promoError" class="text-negative text-caption q-mt-xs">{{ cart.promoError }}</div>
        <div v-else-if="cart.discount" class="text-positive text-caption q-mt-xs">
          Скидка {{ formatMoney(cart.discount) }}
        </div>
        <div class="text-caption muted q-mt-xs">Попробуйте MARKET10 или MARKET500</div>
      </div>

      <div class="card-soft q-pa-md q-mt-md">
        <div class="row justify-between q-mb-xs">
          <span class="muted">Товары</span>
          <span>{{ formatMoney(cart.subtotal) }}</span>
        </div>
        <div class="row justify-between q-mb-xs">
          <span class="muted">Скидка</span>
          <span class="text-accent">−{{ formatMoney(cart.discount) }}</span>
        </div>
        <div class="row justify-between text-weight-bold text-subtitle1 q-mt-sm">
          <span>Итого</span>
          <span>{{ formatMoney(cart.total) }}</span>
        </div>
      </div>

      <q-btn
        unelevated
        color="primary"
        class="full-width q-mt-md"
        no-caps
        size="lg"
        label="Оформить заказ"
        :to="{ name: 'checkout' }"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PriceBlock from '@/components/PriceBlock.vue';
import QtyStepper from '@/components/QtyStepper.vue';
import { formatMoney, plural } from '@/composables/useMoney';
import { useCartStore } from '@/stores/cart';
import type { CartItem } from '@/types/marketplace';

const cart = useCartStore();
const promo = ref(cart.promoCode);

async function onQty(item: CartItem, qty: number) {
  await cart.setQty(item.productId, qty, item.variant);
}

async function applyPromo() {
  await cart.applyPromo(promo.value);
}
</script>

<style scoped lang="scss">
.page-header {
  padding: 16px 16px 8px;
  background: #fff;
}

.cart-item {
  display: grid;
  grid-template-columns: 84px 1fr;
  gap: 10px;
}

.cart-item__body {
  min-width: 0;
}
</style>
