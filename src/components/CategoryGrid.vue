<template>
  <div class="category-grid">
    <button
      v-for="category in categories"
      :key="category.id"
      type="button"
      class="category-grid__item"
      @click="$emit('select', category.id)"
    >
      <div class="category-grid__icon" :style="{ background: `${category.color}18`, color: category.color }">
        <q-icon :name="category.icon" size="22px" />
      </div>
      <span>{{ category.title }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '@/types/marketplace';

defineProps<{ categories: Category[] }>();
defineEmits<{ select: [id: string] }>();
</script>

<style scoped lang="scss">
.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px 6px;
}

.category-grid__item {
  border: 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--app-text);
  cursor: pointer;
}

.category-grid__icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
