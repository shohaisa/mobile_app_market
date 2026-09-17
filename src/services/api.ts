import {
  addresses,
  banners,
  categories,
  currentUser,
  deliveryOptions,
  initialOrders,
  paymentOptions,
  products,
} from '@/mock/data';
import type {
  Address,
  Banner,
  Category,
  DeliveryOption,
  Order,
  PaymentOption,
  Product,
  User,
} from '@/types/marketplace';

function wait(ms = 220): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const api = {
  async getCategories(): Promise<Category[]> {
    await wait();
    return categories;
  },

  async getBanners(): Promise<Banner[]> {
    await wait();
    return banners;
  },

  async getProducts(): Promise<Product[]> {
    await wait();
    return products;
  },

  async getProduct(id: string): Promise<Product | undefined> {
    await wait();
    return products.find((item) => item.id === id);
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
