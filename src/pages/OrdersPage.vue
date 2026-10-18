<template>
  <q-page>
    <div class="page-header safe-top row items-center">
      <q-btn flat round icon="arrow_back" @click="router.push({ name: 'profile' })" />
      <div class="text-h6 text-weight-bold">Заказы</div>
    </div>

    <div v-if="orders.error" class="page-pad text-negative">{{ orders.error }}</div>

    <div v-else-if="!orders.sorted.length" class="empty-state">Заказов пока нет</div>

    <div v-else class="page-pad">
      <div
        v-for="order in orders.sorted"
        :key="order.id"
        class="card-soft q-pa-md q-mb-sm cursor-pointer"
        @click="router.push({ name: 'order', params: { id: order.id } })"
      >
        <div class="row items-center justify-between">
          <div class="text-weight-bold">№ {{ order.reference }}</div>
          <q-badge :color="orderStatusColor(order.status)" outline :label="orderStatusLabel(order.status)" />
        </div>
        <div class="text-caption muted q-my-xs line-clamp-2">
          {{ order.lines.map((line) => line.name).join(', ') }}
        </div>
        <div class="row justify-between text-weight-medium">
          <span>{{ itemCount(order) }} тов.</span>
          <span>{{ formatMoney(order.total) }}</span>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { formatMoney } from '@/composables/useMoney';
import { orderStatusColor, orderStatusLabel } from '@/services/orders';
import { useOrdersStore } from '@/stores/orders';
import type { Order } from '@/types/marketplace';

const router = useRouter();
const orders = useOrdersStore();

onMounted(() => {
  void orders.refresh();
});

function itemCount(order: Order): number {
  return order.lines.reduce((sum, line) => sum + line.quantity, 0);
}
</script>

<style scoped lang="scss">
.page-header {
  padding: 8px 8px 8px 0;
  padding-top: calc(8px + var(--safe-area-inset-top, env(safe-area-inset-top, 0px)));
  background: #fff;
  gap: 4px;
}
</style>
