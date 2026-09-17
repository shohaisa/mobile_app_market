<template>
  <q-page class="checkout-page">
    <div class="page-header safe-top row items-center">
      <q-btn flat round icon="arrow_back" @click="router.back()" />
      <div class="text-h6 text-weight-bold">Оформление</div>
    </div>

    <div v-if="!cart.items.length && !submitting" class="empty-state">
      Корзина пуста
      <div class="q-mt-md">
        <q-btn unelevated color="primary" no-caps label="В каталог" to="/catalog" />
      </div>
    </div>

    <div v-else class="page-pad">
      <div class="text-subtitle1 text-weight-bold q-mb-sm">Адрес</div>
      <q-list class="card-soft">
        <q-item
          v-for="address in user.addresses"
          :key="address.id"
          tag="label"
          clickable
        >
          <q-item-section avatar>
            <q-radio v-model="user.selectedAddressId" :val="address.id" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ address.city }}, {{ address.street }}</q-item-label>
            <q-item-label caption>{{ address.apartment }} {{ address.comment }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <div class="text-subtitle1 text-weight-bold q-mt-lg q-mb-sm">Доставка</div>
      <q-list class="card-soft">
        <q-item v-for="option in user.deliveryOptions" :key="option.id" tag="label" clickable>
          <q-item-section avatar>
            <q-radio v-model="deliveryId" :val="option.id" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ option.title }}</q-item-label>
            <q-item-label caption>{{ option.hint }}</q-item-label>
          </q-item-section>
          <q-item-section side>{{ formatMoney(option.price) }}</q-item-section>
        </q-item>
      </q-list>

      <div class="text-subtitle1 text-weight-bold q-mt-lg q-mb-sm">Оплата</div>
      <q-list class="card-soft">
        <q-item v-for="option in user.paymentOptions" :key="option.id" tag="label" clickable>
          <q-item-section avatar>
            <q-radio v-model="paymentId" :val="option.id" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ option.title }}</q-item-label>
            <q-item-label caption>{{ option.hint }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon :name="option.icon" />
          </q-item-section>
        </q-item>
      </q-list>

      <div class="card-soft q-pa-md q-mt-lg">
        <div class="row justify-between q-mb-xs">
          <span class="muted">Товары</span>
          <span>{{ formatMoney(cart.total) }}</span>
        </div>
        <div class="row justify-between q-mb-xs">
          <span class="muted">Доставка</span>
          <span>{{ formatMoney(deliveryPrice) }}</span>
        </div>
        <div class="row justify-between text-weight-bold text-subtitle1 q-mt-sm">
          <span>К оплате</span>
          <span>{{ formatMoney(payTotal) }}</span>
        </div>
      </div>

      <q-btn
        unelevated
        color="primary"
        class="full-width q-mt-md"
        no-caps
        size="lg"
        :loading="submitting"
        label="Подтвердить заказ"
        @click="submit"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { formatMoney } from '@/composables/useMoney';
import { hapticLight } from '@/composables/useHaptics';
import { useCartStore } from '@/stores/cart';
import { useOrdersStore } from '@/stores/orders';
import { useUserStore } from '@/stores/user';
import type { Order } from '@/types/marketplace';

const router = useRouter();
const $q = useQuasar();
const cart = useCartStore();
const user = useUserStore();
const orders = useOrdersStore();
const submitting = ref(false);
const deliveryId = ref(user.deliveryOptions[0]?.id ?? 'pickup');
const paymentId = ref(user.paymentOptions[0]?.id ?? 'card');

onMounted(() => {
  if (!cart.items.length) {
    void router.replace({ name: 'cart' });
  }
  deliveryId.value = user.deliveryOptions[0]?.id ?? 'pickup';
  paymentId.value = user.paymentOptions[0]?.id ?? 'card';
});

const delivery = computed(
  () => user.deliveryOptions.find((item) => item.id === deliveryId.value) ?? user.deliveryOptions[0],
);
const payment = computed(
  () => user.paymentOptions.find((item) => item.id === paymentId.value) ?? user.paymentOptions[0],
);
const deliveryPrice = computed(() => delivery.value?.price ?? 0);
const payTotal = computed(() => cart.total + deliveryPrice.value);

async function submit() {
  const address = user.selectedAddress();
  if (!address || !delivery.value || !payment.value) {
    $q.notify({ type: 'negative', message: 'Выберите адрес, доставку и оплату' });
    return;
  }
  submitting.value = true;
  try {
    const order: Order = {
      id: String(100000 + Math.floor(Math.random() * 90000)),
      createdAt: new Date().toISOString(),
      status: 'processing',
      items: cart.items.map((item) => ({ ...item })),
      address,
      delivery: delivery.value,
      payment: payment.value,
      promoCode: cart.promoCode || undefined,
      discount: cart.discount,
      deliveryPrice: deliveryPrice.value,
      total: payTotal.value,
    };
    await orders.add(order);
    const orderId = order.id;
    await hapticLight();
    $q.notify({ type: 'positive', message: 'Заказ оформлен' });
    await router.replace({ name: 'order', params: { id: orderId } });
    await cart.clear();
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped lang="scss">
.page-header {
  padding: 8px 8px 8px 0;
  background: #fff;
  gap: 4px;
}
</style>
