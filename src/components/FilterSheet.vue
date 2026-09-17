<template>
  <q-dialog :model-value="modelValue" position="bottom" @update:model-value="$emit('update:modelValue', $event)">
    <q-card class="filter-sheet">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-subtitle1 text-weight-bold">Фильтры</div>
        <q-btn flat dense no-caps color="primary" label="Сбросить" @click="$emit('reset')" />
      </div>

      <div class="text-caption text-weight-medium q-mb-xs">Цена, ₽</div>
      <div class="row q-col-gutter-sm q-mb-md">
        <div class="col-6">
          <q-input v-model.number="draft.minPrice" outlined dense type="number" label="от" />
        </div>
        <div class="col-6">
          <q-input v-model.number="draft.maxPrice" outlined dense type="number" label="до" />
        </div>
      </div>

      <div class="text-caption text-weight-medium q-mb-xs">Рейтинг от</div>
      <q-rating v-model="draft.minRating" size="28px" color="warning" class="q-mb-md" />

      <q-toggle v-model="draft.onlyDiscount" label="Только со скидкой" color="accent" />
      <q-toggle v-model="draft.inStockOnly" label="В наличии" color="primary" class="q-mb-md" />

      <q-btn
        unelevated
        color="primary"
        class="full-width"
        no-caps
        label="Показать товары"
        @click="$emit('apply', { ...draft })"
      />
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { CatalogFilters } from '@/types/marketplace';

const props = defineProps<{
  modelValue: boolean;
  filters: CatalogFilters;
}>();

defineEmits<{
  'update:modelValue': [value: boolean];
  apply: [filters: CatalogFilters];
  reset: [];
}>();

const draft = reactive<CatalogFilters>({ ...props.filters });

watch(
  () => props.filters,
  (value) => {
    Object.assign(draft, value);
  },
  { deep: true },
);
</script>

<style scoped lang="scss">
.filter-sheet {
  width: 100%;
  max-width: 480px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 16px 16px 24px;
}
</style>
