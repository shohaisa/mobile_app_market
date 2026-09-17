<template>
  <q-carousel
    v-if="banners.length"
    v-model="slide"
    animated
    infinite
    autoplay
    swipeable
    height="148px"
    class="banner-carousel rounded-borders"
    control-color="white"
  >
    <q-carousel-slide
      v-for="banner in banners"
      :key="banner.id"
      :name="banner.id"
      :img-src="banner.image"
      class="banner-slide cursor-pointer"
      @click="open(banner)"
    >
      <div class="banner-slide__overlay">
        <div class="text-subtitle1 text-weight-bold">{{ banner.title }}</div>
        <div class="text-caption">{{ banner.subtitle }}</div>
      </div>
    </q-carousel-slide>
  </q-carousel>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { Banner } from '@/types/marketplace';

const props = defineProps<{ banners: Banner[] }>();
const router = useRouter();
const slide = ref(props.banners[0]?.id ?? '');

function open(banner: Banner) {
  if (banner.categoryId) {
    void router.push({ name: 'catalog', params: { categoryId: banner.categoryId } });
  } else {
    void router.push({ name: 'catalog' });
  }
}
</script>

<style scoped lang="scss">
.banner-carousel {
  overflow: hidden;
  border-radius: 18px;
}

.banner-slide__overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16px;
  color: #fff;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.62));
}
</style>
