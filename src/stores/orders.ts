import { defineStore, acceptHMRUpdate } from 'pinia';
import { computed, ref } from 'vue';
import { api } from '@/services/api';
import { getJson, setJson } from '@/services/storage';
import type { Order } from '@/types/marketplace';

const STORAGE_KEY = 'market.orders';

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref<Order[]>([]);
  const hydrated = ref(false);

  const sorted = computed(() =>
    [...orders.value].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  );

  async function persist(): Promise<void> {
    await setJson(STORAGE_KEY, orders.value);
  }

  async function hydrate(): Promise<void> {
    if (hydrated.value) {
      return;
    }
    const saved = await getJson<Order[] | null>(STORAGE_KEY, null);
    if (saved && saved.length) {
      orders.value = saved;
    } else {
      orders.value = await api.getOrders();
      await persist();
    }
    hydrated.value = true;
  }

  function byId(id: string): Order | undefined {
    return orders.value.find((item) => item.id === id);
  }

  async function add(order: Order): Promise<void> {
    orders.value = [order, ...orders.value];
    await persist();
  }

  return { orders, sorted, hydrate, byId, add };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOrdersStore, import.meta.hot));
}
