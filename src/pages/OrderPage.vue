<template>
  <q-page>
    <div class="page-header safe-top row items-center">
      <q-btn flat round icon="arrow_back" @click="router.back()" />
      <div class="text-h6 text-weight-bold">Заказ № {{ order?.reference ?? '' }}</div>
    </div>

    <div v-if="loading" class="empty-state">Загрузка</div>
    <div v-else-if="orders.error" class="page-pad text-negative">{{ orders.error }}</div>
    <div v-else-if="!order" class="empty-state">Заказ не найден</div>

    <div v-else class="page-pad">
      <q-badge :color="orderStatusColor(order.status)" :label="orderStatusLabel(order.status)" class="q-mb-md" />

      <div v-for="line in order.lines" :key="line.id" class="card-soft q-pa-md q-mb-sm">
        <div class="text-weight-medium">{{ line.name }}</div>
        <div class="q-mt-xs">{{ line.quantity }} × {{ formatMoney(line.unitPrice) }}</div>
      </div>

      <div class="card-soft q-pa-md q-mb-sm">
        <div class="text-weight-bold q-mb-xs">Адрес</div>
        <div v-if="order.address">{{ order.address }}</div>
        <div v-if="order.phone" class="muted q-mt-xs">{{ order.phone }}</div>
        <div class="muted q-mt-sm">Доставка · {{ formatMoney(0) }}</div>
      </div>

      <div class="card-soft q-pa-md">
        <div class="row justify-between q-mb-xs">
          <span class="muted">Оплата</span>
          <span>{{ COD_PAYMENT_LABEL }}</span>
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
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { formatMoney } from '@/composables/useMoney';
import { COD_PAYMENT_LABEL, orderStatusColor, orderStatusLabel } from '@/services/orders';
import { useOrdersStore } from '@/stores/orders';
import type { Order } from '@/types/marketplace';

const route = useRoute();
const router = useRouter();
const orders = useOrdersStore();
const order = ref<Order | null>(null);
const loading = ref(true);

onMounted(async () => {
  const id = Number(route.params.id);
  if (!Number.isInteger(id) || id < 1) {
    loading.value = false;
    return;
  }

  await orders.refresh();
  order.value = orders.byId(id) ?? null;
  loading.value = false;
});
</script>

<style scoped lang="scss">
.page-header {
  padding: 8px 8px 8px 0;
  padding-top: calc(8px + var(--safe-area-inset-top, env(safe-area-inset-top, 0px)));
  background: #fff;
  gap: 4px;
}
</style>
