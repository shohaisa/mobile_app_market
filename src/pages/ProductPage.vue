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
          v-if="gallery.length"
          v-model="slide"
          animated
          swipeable
          infinite
          control-type="flat"
          control-color="primary"
          height="360px"
        >
          <q-carousel-slide
            v-for="(image, index) in gallery"
            :key="`${index}-${image}`"
            :name="index"
            :img-src="image"
          />
        </q-carousel>
        <div v-else class="product-page__placeholder">Нет фото</div>
        <div v-if="sale" class="badge-sale">-{{ sale }}%</div>
      </div>

      <div class="page-pad">
        <div class="muted text-caption">
          <q-icon name="star" color="warning" />
          {{ product.rating.toFixed(1) }} · {{ product.reviewCount }} отзывов
        </div>
        <h1 class="product-page__title">{{ product.title }}</h1>
        <PriceBlock :price="product.price" :old-price="product.oldPrice" size="lg" />
        <div v-if="product.priceBreaks.length" class="price-tiers">
          <div class="price-tiers__title">Цена за штуку зависит от количества</div>
          <div class="price-tiers__note">
            Сейчас показана цена за 1 шт. В корзине она пересчитается, когда укажете, сколько берёте.
          </div>
          <div class="price-tiers__row">
            <span>1 шт</span>
            <span>{{ formatMoney(product.price) }}</span>
          </div>
          <div v-for="tier in product.priceBreaks" :key="tier.minQuantity" class="price-tiers__row">
            <span>от {{ tier.minQuantity }} шт</span>
            <span>{{ formatMoney(tier.price) }} за шт</span>
          </div>
        </div>
        <div v-if="product.stock != null" class="muted text-caption q-mt-xs">
          В наличии: {{ product.stock }}
        </div>

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

        <div v-if="product.seller" class="card-soft q-pa-md q-mt-md">
          <div class="text-weight-bold">{{ product.seller.name }}</div>
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
      <q-btn flat round icon="arrow_back" color="dark" class="q-mb-md" @click="router.back()" />
      <template v-if="missing">
        <q-icon name="search_off" size="48px" />
        <div class="q-mt-md">Товар не найден</div>
      </template>
      <template v-else-if="failed">
        <div>Не удалось загрузить товар</div>
      </template>
      <template v-else>
        <q-spinner color="primary" size="32px" />
        <div class="q-mt-md">Загрузка товара…</div>
      </template>
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
import { discountPercent, formatMoney } from '@/composables/useMoney';
import { buyerErrorMessage } from '@/services/http';
import { photoUrl } from '@/services/products';
import { useCartStore } from '@/stores/cart';
import { useCatalogStore } from '@/stores/catalog';
import { useFavoritesStore } from '@/stores/favorites';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const catalog = useCatalogStore();
const cart = useCartStore();
const favorites = useFavoritesStore();
const user = useUserStore();
const slide = ref(0);
const selected = reactive<Record<string, string>>({});
const missing = ref(false);
const failed = ref(false);

const product = computed(() => catalog.productById(String(route.params.id)));
const gallery = computed(() =>
  (product.value?.photos ?? [])
    .map((photo) => photoUrl(photo, 'master'))
    .filter((src): src is string => src !== null),
);
const sale = computed(() =>
  product.value ? discountPercent(product.value.price, product.value.oldPrice) : null,
);

const inCart = computed(() => cart.items.some((item) => item.productId === product.value?.id));

watch(
  () => String(route.params.id),
  (id) => {
    missing.value = false;
    failed.value = false;
    void catalog.loadProduct(id).then(
      (value) => {
        if (String(route.params.id) !== id) {
          return;
        }
        missing.value = value === null;
      },
      () => {
        if (String(route.params.id) === id) {
          failed.value = true;
        }
      },
    );
  },
  { immediate: true },
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
  if (!user.token) {
    void router.push({ name: 'profile' });
    return;
  }
  try {
    await favorites.toggle(product.value.id);
  } catch (error) {
    $q.notify({ type: 'negative', message: buyerErrorMessage(error) });
  }
}

async function addToCart() {
  if (!product.value || !product.value.inStock) return;
  await hapticLight();
  if (!user.token) {
    void router.push({ name: 'profile' });
    return;
  }
  try {
    await cart.add(product.value, 1);
    $q.notify({ type: 'positive', message: 'Товар добавлен в корзину' });
  } catch (error) {
    $q.notify({ type: 'negative', message: buyerErrorMessage(error) });
  }
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
  top: calc(16px + var(--safe-area-inset-top, env(safe-area-inset-top, 0px)));
  z-index: 2;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.product-page__back {
  left: 12px;
}

.product-page__fav {
  right: 12px;
}

.price-tiers {
  margin-top: 12px;
  padding: 12px;
  border-radius: 14px;
  background: #eef4ff;
}

.price-tiers__title {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.3;
}

.price-tiers__note {
  margin-top: 4px;
  color: #5c6370;
  font-size: 12px;
  line-height: 1.4;
}

.price-tiers__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-top: 8px;
  font-size: 14px;
  font-weight: 700;
}

.product-page__title {
  font-size: 22px;
  line-height: 1.25;
  font-weight: 800;
  margin: 8px 0 10px;
}

.product-page__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 360px;
  background: #eef0f5;
  color: #8b90a0;
}
</style>
