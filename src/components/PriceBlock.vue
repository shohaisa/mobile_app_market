<template>
  <div class="price-block">
    <div class="row items-baseline no-wrap q-gutter-x-sm">
      <span class="price" :class="sizeClass">{{ formatMoney(price) }}</span>
      <span v-if="oldPrice && oldPrice > price" class="price--old">{{ formatMoney(oldPrice) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatMoney } from '@/composables/useMoney';

const props = withDefaults(
  defineProps<{
    price: number;
  oldPrice?: number | undefined;
    size?: 'sm' | 'md' | 'lg';
  }>(),
  { size: 'md' },
);

const sizeClass = computed(() => {
  if (props.size === 'lg') return 'text-h5';
  if (props.size === 'sm') return 'text-body2';
  return 'text-subtitle1';
});
</script>
