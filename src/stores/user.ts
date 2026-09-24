import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import {
  fetchCurrentUser,
  loginWithApple,
  loginWithGoogle,
  readToken,
  saveToken,
} from '@/services/auth';
import { signOutGoogle } from '@/services/google';
import type { Address, DeliveryOption, PaymentOption, User } from '@/types/marketplace';

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const addresses = ref<Address[]>([]);
  const selectedAddressId = ref<string>('');
  const deliveryOptions = ref<DeliveryOption[]>([]);
  const paymentOptions = ref<PaymentOption[]>([]);
  const loaded = ref(false);

  async function fetchProfile(): Promise<void> {
    if (loaded.value) {
      return;
    }

    const [nextAddresses, nextDelivery, nextPayment, storedToken] = await Promise.all([
      api.getAddresses(),
      api.getDeliveryOptions(),
      api.getPaymentOptions(),
      readToken(),
    ]);

    addresses.value = nextAddresses;
    selectedAddressId.value = nextAddresses[0]?.id ?? '';
    deliveryOptions.value = nextDelivery;
    paymentOptions.value = nextPayment;
    token.value = storedToken;

    if (storedToken) {
      try {
        const profile = await fetchCurrentUser(storedToken);
        user.value = { name: profile.name, email: profile.email, phone: '' };
      } catch {
        token.value = null;
        user.value = null;
        await saveToken(null);
      }
    }

    loaded.value = true;
  }

  async function signInWithGoogle(idToken: string): Promise<void> {
    const session = await loginWithGoogle(idToken);
    token.value = session.token;
    user.value = { name: session.name, email: session.email, phone: '' };
  }

  async function signInWithApple(idToken: string, name?: string, nonce?: string): Promise<void> {
    const session = await loginWithApple(idToken, name, nonce);
    token.value = session.token;
    user.value = { name: session.name, email: session.email, phone: '' };
  }

  async function signOut(): Promise<void> {
    token.value = null;
    user.value = null;
    await saveToken(null);
    await signOutGoogle();
  }

  function selectedAddress(): Address | undefined {
    return addresses.value.find((item) => item.id === selectedAddressId.value);
  }

  return {
    user,
    token,
    addresses,
    selectedAddressId,
    deliveryOptions,
    paymentOptions,
    loaded,
    fetchProfile,
    signInWithGoogle,
    signInWithApple,
    signOut,
    selectedAddress,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
