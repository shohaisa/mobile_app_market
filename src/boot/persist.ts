import { defineBoot } from '#q-app';
import { useCartStore } from '@/stores/cart';
import { useCatalogStore } from '@/stores/catalog';
import { useFavoritesStore } from '@/stores/favorites';
import { useOrdersStore } from '@/stores/orders';
import { useUserStore } from '@/stores/user';

export default defineBoot(async () => {
  const cart = useCartStore();
  const favorites = useFavoritesStore();
  const orders = useOrdersStore();
  const catalog = useCatalogStore();
  const user = useUserStore();

  await Promise.all([
    cart.hydrate(),
    favorites.hydrate(),
    orders.hydrate(),
    catalog.fetchAll(),
    user.fetchProfile(),
  ]);
});
