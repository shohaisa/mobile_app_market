import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
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
import type { Address, DeliveryOption, PaymentOption, User } from '@/types/marketplace';

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const profileComplete = ref(false);
  const deliveryOptions = ref<DeliveryOption[]>([]);
  const paymentOptions = ref<PaymentOption[]>([]);
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

    const [nextDelivery, nextPayment, storedToken] = await Promise.all([
      api.getDeliveryOptions(),
      api.getPaymentOptions(),
      readToken(),
    ]);

    deliveryOptions.value = nextDelivery;
    paymentOptions.value = nextPayment;
    token.value = storedToken;

    if (storedToken) {
      try {
        applyProfile(await fetchCurrentUser(storedToken));
      } catch {
        token.value = null;
        user.value = null;
        profileComplete.value = false;
        await saveToken(null);
      }
    }

    loaded.value = true;
  }

  async function signInWithGoogle(idToken: string): Promise<void> {
    const session = await loginWithGoogle(idToken);
    token.value = session.token;
    applyProfile(await fetchCurrentUser(session.token));
  }

  async function signInWithApple(idToken: string, name?: string, nonce?: string): Promise<void> {
    const session = await loginWithApple(idToken, name, nonce);
    token.value = session.token;
    applyProfile(await fetchCurrentUser(session.token));
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

  function selectedAddress(): Address | undefined {
    const line = user.value?.address.trim() ?? '';
    if (line === '') {
      return undefined;
    }

    return { id: 'profile', city: '', street: line };
  }

  return {
    user,
    token,
    profileComplete,
    deliveryOptions,
    paymentOptions,
    loaded,
    fetchProfile,
    signInWithGoogle,
    signInWithApple,
    saveProfile,
    signOut,
    selectedAddress,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
