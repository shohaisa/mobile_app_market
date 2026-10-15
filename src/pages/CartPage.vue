<template>
  <q-page class="cart-page">
    <div class="page-header safe-top">
      <div class="text-h6 text-weight-bold">Корзина</div>
      <div class="text-caption muted">{{ plural(cart.count, 'товар', 'товара', 'товаров') }}</div>
    </div>

    <div v-if="!user.token" class="empty-state">
      <q-icon name="shopping_bag" size="52px" />
      <div class="text-subtitle1 text-dark q-mt-sm">Войдите, чтобы собрать корзину</div>
      <q-btn unelevated color="primary" no-caps label="Войти" :to="{ name: 'profile' }" />
    </div>

    <div v-else-if="!cart.items.length" class="empty-state">
      <q-icon name="shopping_bag" size="52px" />
      <div class="text-subtitle1 text-dark q-mt-sm">Пока пусто</div>
      <div class="q-mb-md">Добавьте товары из каталога</div>
      <q-btn unelevated color="primary" no-caps label="Перейти в каталог" to="/catalog" />
    </div>

    <div v-else class="page-pad">
      <div v-if="cart.error" class="text-negative text-caption q-mb-sm">{{ cart.error }}</div>
      <div v-for="item in cart.items" :key="item.lineId" class="cart-item card-soft q-pa-sm q-mb-sm">
        <q-img v-if="item.image" :src="item.image" width="84px" height="84px" class="rounded-borders" />
        <div v-else class="cart-item__placeholder rounded-borders">Нет фото</div>
        <div class="cart-item__body">
          <div class="line-clamp-2 text-weight-medium">{{ item.title }}</div>
          <div v-if="item.variant" class="text-caption muted">{{ item.variant }}</div>
          <PriceBlock :price="item.price" :old-price="item.oldPrice" size="sm" />
          <div class="row items-center justify-between q-mt-xs">
            <QtyStepper
              :key="`${item.lineId}-${item.qty}-${cart.qtyEpoch}`"
              :model-value="item.qty"
              :max="Math.max(1, item.stock)"
              @update:model-value="(qty) => onQty(item, qty)"
            />
            <q-btn flat dense round icon="delete" color="grey-7" @click="cart.remove(item.lineId)" />
          </div>
        </div>
      </div>

      <div class="card-soft q-pa-md q-mt-md">
        <div class="row justify-between q-mb-xs">
          <span class="muted">Товары</span>
          <span>{{ formatMoney(cart.subtotal) }}</span>
        </div>
        <div class="row justify-between text-weight-bold text-subtitle1 q-mt-sm">
          <span>Итого</span>
          <span>{{ formatMoney(cart.total) }}</span>
        </div>
      </div>

      <div v-if="!canOrder" class="text-caption q-mt-md">
        {{ profileHint }}
      </div>
      <q-btn
        unelevated
        color="primary"
        class="full-width q-mt-sm"
        no-caps
        size="lg"
        :label="canOrder ? 'Оформить заказ' : 'Заполнить профиль'"
        @click="goCheckout"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import PriceBlock from '@/components/PriceBlock.vue';
import QtyStepper from '@/components/QtyStepper.vue';
import { formatMoney, plural } from '@/composables/useMoney';
import { useCartStore } from '@/stores/cart';
import { useUserStore } from '@/stores/user';
import type { CartItem } from '@/types/marketplace';

const router = useRouter();
const cart = useCartStore();
const user = useUserStore();
const canOrder = computed(() => Boolean(user.token) && user.profileComplete);
const profileHint = computed(() =>
  user.token
    ? 'Чтобы оформить заказ, укажите телефон и адрес в профиле.'
    : 'Чтобы оформить заказ, войдите и укажите телефон и адрес.',
);

function goCheckout(): void {
  void router.push({ name: canOrder.value ? 'checkout' : 'profile' });
}

async function onQty(item: CartItem, qty: number) {
  await cart.setQty(item.lineId, qty);
}
</script>

<style scoped lang="scss">
.page-header {
  padding: 16px 16px 8px;
  padding-top: calc(16px + var(--safe-area-inset-top, env(safe-area-inset-top, 0px)));
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

.cart-item__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 84px;
  height: 84px;
  background: #eef0f5;
  color: #8b90a0;
  font-size: 11px;
  text-align: center;
}
</style>
