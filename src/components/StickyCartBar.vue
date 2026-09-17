<template>
  <div class="sticky-cart-bar">
    <div>
      <PriceBlock :price="price" :old-price="oldPrice" size="md" />
      <div v-if="!inStock" class="text-negative text-caption">Нет в наличии</div>
    </div>
    <q-btn
      unelevated
      color="primary"
      no-caps
      :disable="!inStock"
      :label="inCart ? 'В корзине' : 'В корзину'"
      class="sticky-cart-bar__btn"
      @click="$emit('add')"
    />
  </div>
</template>

<script setup lang="ts">
import PriceBlock from '@/components/PriceBlock.vue';

defineProps<{
  price: number;
  oldPrice?: number | undefined;
  inStock: boolean;
  inCart: boolean;
}>();

defineEmits<{ add: [] }>();
</script>

<style scoped lang="scss">
.sticky-cart-bar {
  position: sticky;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px calc(12px + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.96);
  border-top: 1px solid var(--app-line);
  backdrop-filter: blur(16px);
}

.sticky-cart-bar__btn {
  min-width: 148px;
  height: 44px;
  border-radius: 14px;
  font-weight: 700;
}
</style>
