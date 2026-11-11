<template>
  <div class="qty-stepper">
    <q-btn round dense unelevated icon="remove" size="sm" :disable="current <= min" @click="change(-1)" />
    <input
      class="qty-stepper__input"
      type="text"
      inputmode="numeric"
      enterkeyhint="done"
      autocomplete="off"
      :value="draft"
      :aria-label="`Количество, от ${min} до ${max}`"
      @focus="onFocus"
      @input="onInput"
      @blur="commit"
      @keydown.enter="onEnter"
    />
    <q-btn round dense unelevated icon="add" size="sm" :disable="current >= max" @click="change(1)" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    min?: number;
    max?: number;
  }>(),
  { min: 1, max: 99 },
);

const model = defineModel<number>({ required: true });
const draft = ref(String(model.value));

watch(model, (value) => {
  draft.value = String(value);
});

const current = computed(() => {
  const parsed = Number.parseInt(draft.value, 10);
  return Number.isFinite(parsed) ? parsed : model.value;
});

function clamp(value: number): number {
  return Math.max(props.min, Math.min(props.max, value));
}

function onFocus(event: FocusEvent) {
  (event.target as HTMLInputElement).select();
}

function onInput(event: Event) {
  draft.value = (event.target as HTMLInputElement).value.replace(/\D/g, '');
}

function commit() {
  const parsed = Number.parseInt(draft.value, 10);
  if (!Number.isFinite(parsed)) {
    draft.value = String(model.value);
    return;
  }

  const next = clamp(parsed);
  draft.value = String(next);
  if (next !== model.value) {
    model.value = next;
  }
}

function onEnter(event: KeyboardEvent) {
  (event.target as HTMLInputElement).blur();
}

function change(delta: number) {
  const next = clamp(current.value + delta);
  draft.value = String(next);
  if (next !== model.value) {
    model.value = next;
  }
}
</script>

<style scoped lang="scss">
.qty-stepper {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: #f3f4f8;
  border-radius: 999px;
  padding: 2px;
}

.qty-stepper__input {
  width: 46px;
  height: 28px;
  margin: 0 2px;
  padding: 0 4px;
  border: none;
  border-radius: 8px;
  background: #fff;
  box-shadow: inset 0 0 0 1px #e3e6ee;
  color: inherit;
  text-align: center;
  font-weight: 700;
  font-size: 13px;
  line-height: 28px;
  outline: none;

  &:focus {
    box-shadow: inset 0 0 0 1.5px #2f6fed;
  }
}
</style>
