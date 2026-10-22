<template>
  <q-page>
    <div class="page-header safe-top row items-center">
      <q-btn flat round icon="arrow_back" @click="router.push({ name: 'profile' })" />
      <div class="text-h6 text-weight-bold">О приложении</div>
    </div>

    <div class="page-pad">
      <div class="about-hero card-soft">
        <img src="@/assets/brand/qazan-mark.svg" alt="" />
        <div class="text-h6 text-weight-bold">QAZAN</div>
        <div class="muted text-caption">Товарный маркетплейс</div>
      </div>

      <q-list class="card-soft q-mt-md">
        <q-item>
          <q-item-section>
            <q-item-label>Версия</q-item-label>
            <q-item-label caption>{{ versionLine }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          href="https://billium.kg"
          target="_blank"
          rel="noopener noreferrer"
        >
          <q-item-section>
            <q-item-label>Сайт</q-item-label>
            <q-item-label caption>billium.kg</q-item-label>
          </q-item-section>
          <q-item-section side><q-icon name="chevron_right" /></q-item-section>
        </q-item>
        <q-item clickable v-ripple href="mailto:doniyor199696@gmail.com">
          <q-item-section>
            <q-item-label>Почта</q-item-label>
            <q-item-label caption>islamisrailov0@gmail.com</q-item-label>
          </q-item-section>
          <q-item-section side><q-icon name="chevron_right" /></q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="openPrivacy">
          <q-item-section>Политика конфиденциальности</q-item-section>
          <q-item-section side><q-icon name="chevron_right" /></q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const versionLine = ref('—');

onMounted(() => {
  void loadVersion();
});

async function loadVersion(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    const info = await CapApp.getInfo();
    versionLine.value = info.build ? `${info.version} (${info.build})` : info.version;
  } catch {
    versionLine.value = '—';
  }
}

function openPrivacy(): void {
  window.open(`${window.location.origin}/privacy.html`, '_blank');
}
</script>

<style scoped lang="scss">
.page-header {
  padding: 8px 8px 8px 0;
  padding-top: calc(8px + var(--safe-area-inset-top, env(safe-area-inset-top, 0px)));
  background: #fff;
  gap: 4px;
}

.about-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 16px;
  text-align: center;
}

.about-hero img {
  width: 64px;
  height: 64px;
  margin-bottom: 12px;
}
</style>
