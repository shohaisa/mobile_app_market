<template>
  <div class="category-grid">
    <button
      v-for="collection in collections"
      :key="collection.id"
      type="button"
      class="category-grid__item"
      @click="$emit('select', collection.id)"
    >
      <div class="category-grid__icon" :style="{ background: `${collection.color}18`, color: collection.color }">
        <q-icon :name="collection.icon" size="22px" />
      </div>
      <span>{{ collection.title }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Collection } from '@/types/marketplace';

defineProps<{ collections: Collection[] }>();
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
