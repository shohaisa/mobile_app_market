<template>
  <div class="qty-stepper">
    <q-btn round dense unelevated icon="remove" size="sm" :disable="model <= min" @click="change(-1)" />
    <span class="qty-stepper__value">{{ model }}</span>
    <q-btn round dense unelevated icon="add" size="sm" :disable="model >= max" @click="change(1)" />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    min?: number;
    max?: number;
  }>(),
  { min: 1, max: 99 },
);

const model = defineModel<number>({ required: true });

function change(delta: number) {
  model.value = Math.max(props.min, Math.min(props.max, model.value + delta));
}
</script>

<style scoped lang="scss">
.qty-stepper {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f3f4f8;
  border-radius: 999px;
  padding: 2px;
}

.qty-stepper__value {
  min-width: 22px;
  text-align: center;
  font-weight: 700;
  font-size: 13px;
}
</style>
