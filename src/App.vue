<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useAppUpdate } from '@/composables/useAppUpdate';

const $q = useQuasar();
const { checkUpdate } = useAppUpdate();

onMounted(async () => {
  if ($q.platform.is.nativeMobile) {
    await checkUpdate();
  }
});
</script>
