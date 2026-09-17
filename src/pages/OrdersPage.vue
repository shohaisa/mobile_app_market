<template>
  <q-page>
    <div class="page-header safe-top row items-center">
      <q-btn flat round icon="arrow_back" @click="router.push({ name: 'profile' })" />
      <div class="text-h6 text-weight-bold">Заказы</div>
    </div>

    <div class="page-pad">
      <div
        v-for="order in orders.sorted"
        :key="order.id"
        class="card-soft q-pa-md q-mb-sm cursor-pointer"
        @click="router.push({ name: 'order', params: { id: order.id } })"
      >
        <div class="row items-center justify-between">
          <div class="text-weight-bold">№ {{ order.id }}</div>
          <q-badge :color="statusColor(order.status)" outline :label="statusLabel(order.status)" />
        </div>
        <div class="text-caption muted q-my-xs">{{ formatDate(order.createdAt) }}</div>
        <div class="row q-gutter-xs q-mb-sm">
          <q-img
            v-for="item in order.items.slice(0, 4)"
            :key="item.productId + (item.variant ?? '')"
            :src="item.image"
            width="44px"
            height="44px"
            class="rounded-borders"
          />
        </div>
        <div class="row justify-between text-weight-medium">
          <span>{{ order.items.reduce((sum, item) => sum + item.qty, 0) }} тов.</span>
          <span>{{ formatMoney(order.total) }}</span>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { formatMoney } from '@/composables/useMoney';
import { useOrdersStore } from '@/stores/orders';
import type { OrderStatus } from '@/types/marketplace';

const router = useRouter();
const orders = useOrdersStore();

function statusLabel(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    processing: 'Собираем',
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

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
</script>

<style scoped lang="scss">
.page-header {
  padding: 8px 8px 8px 0;
  background: #fff;
  gap: 4px;
}
</style>
