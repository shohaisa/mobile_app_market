import { banners } from '@/mock/data';
import type { Banner } from '@/types/marketplace';

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
};
