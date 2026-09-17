<template>
  <q-page>
    <div class="page-header safe-top">
      <div class="text-h6 text-weight-bold">Профиль</div>
    </div>

    <div class="page-pad">
      <div class="card-soft q-pa-md row items-center q-gutter-md">
        <q-avatar size="64px" color="primary" text-color="white">
          {{ initials }}
        </q-avatar>
        <div>
          <div class="text-subtitle1 text-weight-bold">{{ user.user?.name }}</div>
          <div class="muted text-caption">{{ user.user?.phone }}</div>
          <div class="muted text-caption">{{ user.user?.email }}</div>
        </div>
      </div>

      <q-list class="card-soft q-mt-md">
        <q-item clickable v-ripple :to="{ name: 'orders' }">
          <q-item-section avatar><q-icon name="receipt_long" color="primary" /></q-item-section>
          <q-item-section>
            <q-item-label>Мои заказы</q-item-label>
            <q-item-label caption>{{ orderCaption }}</q-item-label>
          </q-item-section>
          <q-item-section side><q-icon name="chevron_right" /></q-item-section>
        </q-item>
        <q-item clickable v-ripple :to="{ name: 'favorites' }">
          <q-item-section avatar><q-icon name="favorite" color="accent" /></q-item-section>
          <q-item-section>Избранное</q-item-section>
          <q-item-section side><q-icon name="chevron_right" /></q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar><q-icon name="location_on" color="positive" /></q-item-section>
          <q-item-section>
            <q-item-label>Адреса</q-item-label>
            <q-item-label caption>{{ addressLine }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar><q-icon name="notifications" /></q-item-section>
          <q-item-section>Уведомления</q-item-section>
          <q-item-section side>
            <q-toggle v-model="notify" color="primary" />
          </q-item-section>
        </q-item>
      </q-list>

      <div class="text-center text-caption muted q-mt-lg">Маркет · UI-оболочка · mock-данные</div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { plural } from '@/composables/useMoney';
import { useOrdersStore } from '@/stores/orders';
import { useUserStore } from '@/stores/user';

const user = useUserStore();
const orders = useOrdersStore();
const notify = ref(true);

const initials = computed(() => {
  const name = user.user?.name ?? 'А';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
});

const addressLine = computed(() => {
  const address = user.addresses[0];
  if (!address) return 'Не указан';
  return `${address.city}, ${address.street}`;
});

const orderCaption = computed(() =>
  plural(orders.orders.length, 'заказ', 'заказа', 'заказов'),
);
</script>

<style scoped lang="scss">
.page-header {
  padding: 16px 16px 8px;
  background: #fff;
}
</style>
