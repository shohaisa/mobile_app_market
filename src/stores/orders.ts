import { defineStore, acceptHMRUpdate } from 'pinia';
import { computed, ref } from 'vue';
import { buyerErrorMessage } from '@/services/http';
import { fetchOrders } from '@/services/orders';
import { useUserStore } from '@/stores/user';
import type { Order } from '@/types/marketplace';

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref<Order[]>([]);
  const error = ref('');
  const hydrated = ref(false);

  const sorted = computed(() => [...orders.value].sort((left, right) => right.id - left.id));

  async function hydrate(): Promise<void> {
    if (hydrated.value) {
      return;
    }

    const token = useUserStore().token;
    if (!token) {
      orders.value = [];
      error.value = '';
      hydrated.value = true;
      return;
    }

    try {
      orders.value = await fetchOrders(token);
      error.value = '';
    } catch (cause) {
      orders.value = [];
      error.value = buyerErrorMessage(cause);
    }
    hydrated.value = true;
  }

  async function refresh(): Promise<void> {
    hydrated.value = false;
    await hydrate();
  }

  function reset(): void {
    orders.value = [];
    error.value = '';
    hydrated.value = true;
  }

  function byId(id: number): Order | undefined {
    return orders.value.find((item) => item.id === id);
  }

  function remember(order: Order): void {
    const rest = orders.value.filter((item) => item.id !== order.id);
    orders.value = [order, ...rest];
  }

  return { orders, error, sorted, hydrate, refresh, reset, byId, remember };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOrdersStore, import.meta.hot));
}
