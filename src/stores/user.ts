import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import type { Address, DeliveryOption, PaymentOption, User } from '@/types/marketplace';

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);
  const addresses = ref<Address[]>([]);
  const selectedAddressId = ref<string>('');
  const deliveryOptions = ref<DeliveryOption[]>([]);
  const paymentOptions = ref<PaymentOption[]>([]);
  const loaded = ref(false);

  async function fetchProfile(): Promise<void> {
    if (loaded.value) {
      return;
    }
    const [nextUser, nextAddresses, nextDelivery, nextPayment] = await Promise.all([
      api.getUser(),
      api.getAddresses(),
      api.getDeliveryOptions(),
      api.getPaymentOptions(),
    ]);
    user.value = nextUser;
    addresses.value = nextAddresses;
    selectedAddressId.value = nextAddresses[0]?.id ?? '';
    deliveryOptions.value = nextDelivery;
    paymentOptions.value = nextPayment;
    loaded.value = true;
  }

  function selectedAddress(): Address | undefined {
    return addresses.value.find((item) => item.id === selectedAddressId.value);
  }

  return {
    user,
    addresses,
    selectedAddressId,
    deliveryOptions,
    paymentOptions,
    loaded,
    fetchProfile,
    selectedAddress,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
