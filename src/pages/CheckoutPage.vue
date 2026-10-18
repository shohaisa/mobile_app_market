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
      <div v-if="!canOrder" class="card-soft q-pa-md">
        <div class="text-body2">{{ profileHint }}</div>
        <q-btn
          class="q-mt-md"
          unelevated
          color="primary"
          no-caps
          label="Заполнить профиль"
          :to="{ name: 'profile' }"
        />
      </div>
      <div v-else class="card-soft q-pa-md">
        <div>{{ user.user?.address }}</div>
        <div v-if="user.user?.phone" class="muted text-caption q-mt-xs">{{ user.user.phone }}</div>
      </div>

      <div class="text-subtitle1 text-weight-bold q-mt-lg q-mb-sm">Оплата</div>
      <div class="card-soft q-pa-md">{{ COD_PAYMENT_LABEL }}</div>

      <div class="card-soft q-pa-md q-mt-lg">
        <div class="row justify-between q-mb-xs">
          <span class="muted">Товары</span>
          <span>{{ formatMoney(cart.total) }}</span>
        </div>
        <div class="row justify-between q-mb-xs">
          <span class="muted">Доставка</span>
          <span>{{ formatMoney(0) }}</span>
        </div>
        <div class="row justify-between text-weight-bold text-subtitle1 q-mt-sm">
          <span>К оплате</span>
          <span>{{ formatMoney(cart.total) }}</span>
        </div>
      </div>

      <q-btn
        unelevated
        color="primary"
        class="full-width q-my-md"
        no-caps
        size="lg"
        :loading="submitting"
        :disable="!canOrder"
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
import { buyerErrorMessage } from '@/services/http';
import { COD_PAYMENT_LABEL, placeOrder } from '@/services/orders';
import { useCartStore } from '@/stores/cart';
import { useOrdersStore } from '@/stores/orders';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const $q = useQuasar();
const cart = useCartStore();
const user = useUserStore();
const orders = useOrdersStore();
const submitting = ref(false);

onMounted(() => {
  if (!cart.items.length) {
    void router.replace({ name: 'cart' });
  }
});

const canOrder = computed(() => Boolean(user.token) && user.profileComplete);
const profileHint = computed(() =>
  user.token
    ? 'Укажите телефон и адрес в профиле, чтобы оформить заказ.'
    : 'Войдите и укажите телефон и адрес, чтобы оформить заказ.',
);

async function submit() {
  const token = user.token;
  if (!canOrder.value || !token) {
    $q.notify({
      type: 'negative',
      message: 'Укажите телефон и адрес в профиле, чтобы оформить заказ.',
    });
    return;
  }

  submitting.value = true;
  try {
    const order = await placeOrder(token);
    orders.remember(order);
    await hapticLight();
    $q.notify({ type: 'positive', message: 'Заказ оформлен' });
    await cart.refresh();
    await router.replace({ name: 'order', params: { id: order.id } });
  } catch (cause) {
    $q.notify({ type: 'negative', message: buyerErrorMessage(cause) });
  } finally {
    submitting.value = false;
  }
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
