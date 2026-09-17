import { defineStore, acceptHMRUpdate } from 'pinia';
import { computed, ref } from 'vue';
import { getJson, setJson } from '@/services/storage';
import type { CartItem, Product } from '@/types/marketplace';

const STORAGE_KEY = 'market.cart';

function lineKey(productId: string, variant?: string): string {
  return `${productId}::${variant ?? ''}`;
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);
  const promoCode = ref('');
  const promoError = ref('');
  const hydrated = ref(false);

  const count = computed(() => items.value.reduce((sum, item) => sum + item.qty, 0));

  const subtotal = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.qty, 0),
  );

  const discount = computed(() => {
    const code = promoCode.value.trim().toUpperCase();
    if (code === 'MARKET10') {
      return Math.round(subtotal.value * 0.1);
    }
    if (code === 'MARKET500') {
      return Math.min(500, subtotal.value);
    }
    return 0;
  });

  const total = computed(() => Math.max(0, subtotal.value - discount.value));

  async function persist(): Promise<void> {
    await setJson(STORAGE_KEY, {
      items: items.value,
      promoCode: promoCode.value,
    });
  }

  async function hydrate(): Promise<void> {
    if (hydrated.value) {
      return;
    }
    const saved = await getJson(STORAGE_KEY, {
      items: [] as CartItem[],
      promoCode: '',
    });
    items.value = saved.items;
    promoCode.value = saved.promoCode;
    hydrated.value = true;
  }

  async function add(
    product: Product,
    qty = 1,
    variant?: string,
  ): Promise<void> {
    const key = lineKey(product.id, variant);
    const existing = items.value.find(
      (item) => lineKey(item.productId, item.variant) === key,
    );
    if (existing) {
      existing.qty += qty;
    } else {
      items.value.push({
        productId: product.id,
        title: product.title,
        image: product.images[0] ?? '',
        price: product.price,
        oldPrice: product.oldPrice,
        qty,
        variant,
      });
    }
    await persist();
  }

  async function setQty(productId: string, qty: number, variant?: string): Promise<void> {
    const existing = items.value.find(
      (item) => lineKey(item.productId, item.variant) === lineKey(productId, variant),
    );
    if (!existing) {
      return;
    }
    existing.qty = Math.max(1, Math.min(99, qty));
    await persist();
  }

  async function remove(productId: string, variant?: string): Promise<void> {
    items.value = items.value.filter(
      (item) => lineKey(item.productId, item.variant) !== lineKey(productId, variant),
    );
    await persist();
  }

  async function applyPromo(code: string): Promise<boolean> {
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      promoCode.value = '';
      promoError.value = '';
      await persist();
      return true;
    }
    if (normalized === 'MARKET10' || normalized === 'MARKET500') {
      promoCode.value = normalized;
      promoError.value = '';
      await persist();
      return true;
    }
    promoError.value = 'Промокод не найден';
    return false;
  }

  async function clear(): Promise<void> {
    items.value = [];
    promoCode.value = '';
    promoError.value = '';
    await persist();
  }

  return {
    items,
    promoCode,
    promoError,
    count,
    subtotal,
    discount,
    total,
    hydrate,
    add,
    setQty,
    remove,
    applyPromo,
    clear,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCartStore, import.meta.hot));
}
