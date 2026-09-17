<template>
  <q-page class="product-page">
    <div v-if="product" class="product-page__body">
      <div class="product-page__gallery">
        <q-btn
          class="product-page__back"
          round
          unelevated
          icon="arrow_back"
          color="white"
          text-color="dark"
          @click="router.back()"
        />
        <q-btn
          class="product-page__fav"
          round
          unelevated
          color="white"
          text-color="dark"
        :icon="favorites.has(product.id) ? 'favorite' : 'favorite'"
          :class="{ 'text-accent': favorites.has(product.id) }"
          @click="onFav"
        />
        <q-carousel
          v-model="slide"
          animated
          swipeable
          infinite
          control-type="flat"
          control-color="primary"
          height="360px"
        >
          <q-carousel-slide
            v-for="(image, index) in product.images"
            :key="image"
            :name="index"
            :img-src="image"
          />
        </q-carousel>
        <div v-if="sale" class="badge-sale">-{{ sale }}%</div>
      </div>

      <div class="page-pad">
        <div class="row items-center q-gutter-sm muted text-caption">
          <span>
            <q-icon name="star" color="warning" />
            {{ product.rating.toFixed(1) }} · {{ product.reviewCount }} отзывов
          </span>
          <span>{{ product.soldCount }} купили</span>
        </div>
        <h1 class="product-page__title">{{ product.title }}</h1>
        <PriceBlock :price="product.price" :old-price="product.oldPrice" size="lg" />

        <div v-for="variant in product.variants" :key="variant.name" class="q-mt-md">
          <div class="text-caption text-weight-medium q-mb-xs">{{ variant.name }}</div>
          <div class="row q-gutter-xs">
            <q-chip
              v-for="option in variant.options"
              :key="option"
              clickable
              :outline="selected[variant.name] !== option"
              :color="selected[variant.name] === option ? 'primary' : 'white'"
              :text-color="selected[variant.name] === option ? 'white' : 'dark'"
              @click="selected[variant.name] = option"
            >
              {{ option }}
            </q-chip>
          </div>
        </div>

        <div class="card-soft q-pa-md q-mt-md">
          <div class="text-weight-bold q-mb-xs">{{ product.seller.name }}</div>
          <div class="muted text-caption">Рейтинг продавца {{ product.seller.rating.toFixed(1) }}</div>
        </div>

        <div class="q-mt-lg">
          <div class="text-subtitle1 text-weight-bold q-mb-sm">Описание</div>
          <p class="muted" style="line-height: 1.5">{{ product.description }}</p>
        </div>

        <div class="q-mt-lg">
          <div class="text-subtitle1 text-weight-bold q-mb-sm">Отзывы</div>
          <div v-if="!product.reviews.length" class="muted">Пока нет отзывов — будьте первым.</div>
          <div v-for="review in product.reviews" :key="review.id" class="card-soft q-pa-md q-mb-sm">
            <div class="row items-center justify-between">
              <div class="text-weight-medium">{{ review.author }}</div>
              <q-rating :model-value="review.rating" size="16px" color="warning" readonly />
            </div>
            <div class="text-caption muted q-mb-xs">{{ formatDate(review.date) }}</div>
            <div>{{ review.text }}</div>
          </div>
        </div>
      </div>

      <StickyCartBar
        :price="product.price"
        :old-price="product.oldPrice"
        :in-stock="product.inStock"
        :in-cart="inCart"
        @add="addToCart"
      />
    </div>

    <div v-else class="empty-state">
      <q-spinner color="primary" size="32px" />
      <div class="q-mt-md">Загрузка товара…</div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import PriceBlock from '@/components/PriceBlock.vue';
import StickyCartBar from '@/components/StickyCartBar.vue';
import { hapticLight } from '@/composables/useHaptics';
import { discountPercent } from '@/composables/useMoney';
import { useCartStore } from '@/stores/cart';
import { useCatalogStore } from '@/stores/catalog';
import { useFavoritesStore } from '@/stores/favorites';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const catalog = useCatalogStore();
const cart = useCartStore();
const favorites = useFavoritesStore();
const slide = ref(0);
const selected = reactive<Record<string, string>>({});

const product = computed(() => catalog.productById(String(route.params.id)));
const sale = computed(() =>
  product.value ? discountPercent(product.value.price, product.value.oldPrice) : null,
);

const variantLabel = computed(() =>
  Object.values(selected)
    .filter(Boolean)
    .join(' · '),
);

const inCart = computed(() =>
  cart.items.some(
    (item) =>
      item.productId === product.value?.id &&
      (item.variant ?? '') === (variantLabel.value || ''),
  ),
);

watch(
  product,
  (value) => {
    slide.value = 0;
    Object.keys(selected).forEach((key) => delete selected[key]);
    value?.variants?.forEach((variant) => {
      selected[variant.name] = variant.options[0] ?? '';
    });
  },
  { immediate: true },
);

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(new Date(value));
}

async function onFav() {
  if (!product.value) return;
  await hapticLight();
  await favorites.toggle(product.value.id);
}

async function addToCart() {
  if (!product.value || !product.value.inStock) return;
  await hapticLight();
  await cart.add(product.value, 1, variantLabel.value || undefined);
  $q.notify({ type: 'positive', message: 'Товар добавлен в корзину' });
}
</script>

<style scoped lang="scss">
.product-page__gallery {
  position: relative;
  background: #fff;
}

.product-page__back,
.product-page__fav {
  position: absolute;
  top: 16px;
  z-index: 2;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.product-page__back {
  left: 12px;
}

.product-page__fav {
  right: 12px;
}

.product-page__title {
  font-size: 22px;
  line-height: 1.25;
  font-weight: 800;
  margin: 8px 0 10px;
}
</style>
