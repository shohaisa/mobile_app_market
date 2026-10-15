import { defineStore, acceptHMRUpdate } from 'pinia';
import { computed, ref } from 'vue';
import { addCartLine, fetchCart, removeCartLine, updateCartLine } from '@/services/cart';
import { ApiError, buyerErrorMessage } from '@/services/http';
import { useUserStore } from '@/stores/user';
import type { CartItem, Product } from '@/types/marketplace';

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);
  const error = ref('');
  const qtyEpoch = ref(0);
  const hydrated = ref(false);

  const count = computed(() => items.value.reduce((sum, item) => sum + item.qty, 0));

  const subtotal = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.qty, 0),
  );

  const total = computed(() => subtotal.value);

  async function hydrate(): Promise<void> {
    if (hydrated.value) {
      return;
    }

    const token = useUserStore().token;
    if (!token) {
      items.value = [];
      hydrated.value = true;
      return;
    }

    try {
      items.value = await fetchCart(token);
      error.value = '';
    } catch (cause) {
      items.value = [];
      error.value = buyerErrorMessage(cause);
    }
    hydrated.value = true;
  }

  async function refresh(): Promise<void> {
    hydrated.value = false;
    await hydrate();
  }

  function reset(): void {
    items.value = [];
    error.value = '';
    hydrated.value = true;
  }

  async function add(product: Product, qty = 1): Promise<void> {
    const token = useUserStore().token;
    if (!token) {
      throw new ApiError('Нет токена', 401);
    }

    try {
      items.value = await addCartLine(token, Number(product.id), qty);
      error.value = '';
    } catch (cause) {
      const message = buyerErrorMessage(cause);
      error.value = message;
      throw new ApiError(message, cause instanceof ApiError ? cause.status : 0, cause instanceof ApiError ? cause.errors : {});
    }
  }

  async function setQty(lineId: number, qty: number): Promise<void> {
    const token = useUserStore().token;
    const existing = items.value.find((item) => item.lineId === lineId);
    if (!existing || !token) {
      return;
    }

    const next = Math.max(1, qty);
    if (next === existing.qty) {
      return;
    }

    const previous = items.value.map((item) => ({ ...item }));
    try {
      items.value = await updateCartLine(token, lineId, next);
      error.value = '';
    } catch (cause) {
      items.value = previous;
      error.value = buyerErrorMessage(cause);
      qtyEpoch.value += 1;
    }
  }

  async function remove(lineId: number): Promise<void> {
    const token = useUserStore().token;
    if (!token) {
      return;
    }

    try {
      items.value = await removeCartLine(token, lineId);
      error.value = '';
    } catch (cause) {
      error.value = buyerErrorMessage(cause);
    }
  }

  async function clear(): Promise<void> {
    const token = useUserStore().token;
    if (token) {
      for (const item of [...items.value]) {
        try {
          items.value = await removeCartLine(token, item.lineId);
        } catch {
          break;
        }
      }
    }
    items.value = [];
  }

  return {
    items,
    error,
    qtyEpoch,
    count,
    subtotal,
    total,
    hydrate,
    refresh,
    reset,
    add,
    setQty,
    remove,
    clear,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCartStore, import.meta.hot));
}
