import { defineStore, acceptHMRUpdate } from 'pinia';
import { computed, ref } from 'vue';
import { getJson, setJson } from '@/services/storage';

const STORAGE_KEY = 'market.favorites';

export const useFavoritesStore = defineStore('favorites', () => {
  const ids = ref<string[]>([]);
  const hydrated = ref(false);

  const count = computed(() => ids.value.length);

  function has(id: string): boolean {
    return ids.value.includes(id);
  }

  async function persist(): Promise<void> {
    await setJson(STORAGE_KEY, ids.value);
  }

  async function hydrate(): Promise<void> {
    if (hydrated.value) {
      return;
    }
    ids.value = await getJson<string[]>(STORAGE_KEY, []);
    hydrated.value = true;
  }

  async function toggle(id: string): Promise<boolean> {
    if (has(id)) {
      ids.value = ids.value.filter((item) => item !== id);
      await persist();
      return false;
    }
    ids.value = [...ids.value, id];
    await persist();
    return true;
  }

  return { ids, count, has, hydrate, toggle };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFavoritesStore, import.meta.hot));
}
