import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref } from 'vue';
import {
  fetchCurrentUser,
  loginWithApple,
  loginWithGoogle,
  logout,
  readToken,
  saveToken,
  updateCurrentUser,
  type Profile,
  type ProfileUpdate,
} from '@/services/auth';
import { signOutGoogle } from '@/services/google';
import type { User } from '@/types/marketplace';

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const profileComplete = ref(false);
  const loaded = ref(false);

  function applyProfile(profile: Profile): void {
    user.value = {
      name: profile.name,
      email: profile.email,
      phone: profile.phone ?? '',
      address: profile.address ?? '',
    };
    profileComplete.value = profile.profile_complete;
  }

  async function fetchProfile(): Promise<void> {
    if (loaded.value) {
      return;
    }

    token.value = await readToken();

    if (token.value) {
      try {
        applyProfile(await fetchCurrentUser(token.value));
      } catch {
        token.value = null;
        user.value = null;
        profileComplete.value = false;
        await saveToken(null);
      }
    }

    loaded.value = true;
  }

  async function reloadBuyerLists(): Promise<void> {
    const [{ useCartStore }, { useFavoritesStore }, { useOrdersStore }] = await Promise.all([
      import('@/stores/cart'),
      import('@/stores/favorites'),
      import('@/stores/orders'),
    ]);
    await Promise.all([
      useCartStore().refresh(),
      useFavoritesStore().refresh(),
      useOrdersStore().refresh(),
    ]);
  }

  async function clearBuyerLists(): Promise<void> {
    const [{ useCartStore }, { useFavoritesStore }, { useOrdersStore }] = await Promise.all([
      import('@/stores/cart'),
      import('@/stores/favorites'),
      import('@/stores/orders'),
    ]);
    useCartStore().reset();
    useFavoritesStore().reset();
    useOrdersStore().reset();
  }

  async function signInWithGoogle(idToken: string): Promise<void> {
    const session = await loginWithGoogle(idToken);
    token.value = session.token;
    applyProfile(await fetchCurrentUser(session.token));
    await reloadBuyerLists();
  }

  async function signInWithApple(idToken: string, name?: string, nonce?: string): Promise<void> {
    const session = await loginWithApple(idToken, name, nonce);
    token.value = session.token;
    applyProfile(await fetchCurrentUser(session.token));
    await reloadBuyerLists();
  }

  async function saveProfile(attributes: ProfileUpdate): Promise<void> {
    if (!token.value) {
      return;
    }

    applyProfile(await updateCurrentUser(token.value, attributes));
  }

  async function signOut(): Promise<void> {
    const current = token.value;
    token.value = null;
    user.value = null;
    profileComplete.value = false;
    await clearBuyerLists();
    await saveToken(null);
    if (current) {
      try {
        await logout(current);
      } catch {
        // Local session is already cleared.
      }
    }
    await signOutGoogle();
  }

  return {
    user,
    token,
    profileComplete,
    loaded,
    fetchProfile,
    signInWithGoogle,
    signInWithApple,
    saveProfile,
    signOut,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
