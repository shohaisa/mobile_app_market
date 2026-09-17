<template>
  <article
    class="product-card"
    role="link"
    tabindex="0"
    :aria-label="product.title"
    @click="open"
    @keyup.enter="open"
  >
    <div class="product-card__media">
      <q-img :src="product.images[0] ?? ''" ratio="1" spinner-color="primary" class="rounded-borders">
        <template #error>
          <div class="absolute-full flex flex-center bg-grey-3 text-grey-6">Нет фото</div>
        </template>
      </q-img>
      <div v-if="sale" class="badge-sale">-{{ sale }}%</div>
      <q-btn
        class="product-card__fav"
        round
        dense
        unelevated
        color="white"
        text-color="dark"
        size="sm"
        :icon="fav.has(product.id) ? 'favorite' : 'favorite'"
        :class="{ 'text-accent': fav.has(product.id) }"
        @click.stop="onFav"
      />
    </div>
    <PriceBlock class="q-mt-sm" :price="product.price" :old-price="product.oldPrice" size="sm" />
    <div class="product-card__title line-clamp-2">{{ product.title }}</div>
    <div class="product-card__meta muted">
      <q-icon name="star" size="14px" color="warning" />
      {{ product.rating.toFixed(1) }} · {{ product.reviewCount }}
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import PriceBlock from '@/components/PriceBlock.vue';
import { hapticLight } from '@/composables/useHaptics';
import { discountPercent } from '@/composables/useMoney';
import { useFavoritesStore } from '@/stores/favorites';
import type { Product } from '@/types/marketplace';

const props = defineProps<{ product: Product }>();
const router = useRouter();
const fav = useFavoritesStore();
const sale = computed(() => discountPercent(props.product.price, props.product.oldPrice));

function open() {
  void router.push({ name: 'product', params: { id: props.product.id } });
}

async function onFav() {
  await hapticLight();
  await fav.toggle(props.product.id);
}
</script>

<style scoped lang="scss">
.product-card {
  cursor: pointer;
}

.product-card__media {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  background: #fff;
}

.product-card__fav {
  position: absolute;
  top: 6px;
  right: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.product-card__title {
  margin-top: 4px;
  font-size: 13px;
  line-height: 1.3;
  min-height: 34px;
}

.product-card__meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  margin-top: 2px;
}
</style>
