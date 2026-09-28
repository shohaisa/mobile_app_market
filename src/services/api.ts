import {
  addresses,
  banners,
  currentUser,
  deliveryOptions,
  initialOrders,
  paymentOptions,
} from '@/mock/data';
import type {
  Address,
  Banner,
  DeliveryOption,
  Order,
  PaymentOption,
  User,
} from '@/types/marketplace';

function wait(ms = 220): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const api = {
  async getBanners(): Promise<Banner[]> {
    await wait();
    return banners;
  },

  async getUser(): Promise<User> {
    await wait(120);
    return currentUser;
  },

  async getAddresses(): Promise<Address[]> {
    await wait(120);
    return addresses;
  },

  async getDeliveryOptions(): Promise<DeliveryOption[]> {
    await wait(80);
    return deliveryOptions;
  },

  async getPaymentOptions(): Promise<PaymentOption[]> {
    await wait(80);
    return paymentOptions;
  },

  async getOrders(): Promise<Order[]> {
    await wait();
    return initialOrders;
  },
};
