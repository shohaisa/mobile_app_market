<template>
  <q-page>
    <div class="page-header safe-top row items-center">
      <q-btn flat round icon="arrow_back" @click="router.back()" />
      <div class="text-h6 text-weight-bold">Заказ № {{ order?.id ?? '' }}</div>
    </div>

    <div v-if="!order" class="empty-state">Заказ не найден</div>

    <div v-else class="page-pad">
      <q-badge :color="statusColor(order.status)" :label="statusLabel(order.status)" class="q-mb-md" />

      <div class="card-soft q-pa-md q-mb-sm" v-for="item in order.items" :key="item.productId + (item.variant ?? '')">
        <div class="row no-wrap q-gutter-sm">
          <q-img :src="item.image" width="72px" height="72px" class="rounded-borders" />
          <div class="col">
            <div class="text-weight-medium">{{ item.title }}</div>
            <div v-if="item.variant" class="text-caption muted">{{ item.variant }}</div>
            <div class="q-mt-xs">{{ item.qty }} × {{ formatMoney(item.price) }}</div>
          </div>
        </div>
      </div>

      <div class="card-soft q-pa-md q-mb-sm">
        <div class="text-weight-bold q-mb-xs">Доставка</div>
        <div>{{ order.delivery.title }} · {{ formatMoney(order.deliveryPrice) }}</div>
        <div class="muted q-mt-sm">
          {{ order.address.city }}, {{ order.address.street
          }}<span v-if="order.address.apartment">, {{ order.address.apartment }}</span>
        </div>
      </div>

      <div class="card-soft q-pa-md">
        <div class="row justify-between q-mb-xs">
          <span class="muted">Оплата</span>
          <span>{{ order.payment.title }}</span>
        </div>
        <div v-if="order.promoCode" class="row justify-between q-mb-xs">
          <span class="muted">Промокод</span>
          <span>{{ order.promoCode }}</span>
        </div>
        <div class="row justify-between text-weight-bold text-subtitle1 q-mt-sm">
          <span>Итого</span>
          <span>{{ formatMoney(order.total) }}</span>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { formatMoney } from '@/composables/useMoney';
import { useOrdersStore } from '@/stores/orders';
import type { OrderStatus } from '@/types/marketplace';

const route = useRoute();
const router = useRouter();
const orders = useOrdersStore();
const order = computed(() => orders.byId(String(route.params.id)));

function statusLabel(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    processing: 'Собираем заказ',
    shipping: 'В пути',
    delivered: 'Доставлен',
    cancelled: 'Отменён',
  };
  return map[status];
}

function statusColor(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    processing: 'info',
    shipping: 'primary',
    delivered: 'positive',
    cancelled: 'grey',
  };
  return map[status];
}
</script>

<style scoped lang="scss">
.page-header {
  padding: 8px 8px 8px 0;
  background: #fff;
  gap: 4px;
}
</style>
