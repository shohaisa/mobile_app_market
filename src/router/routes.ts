import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('@/pages/HomePage.vue') },
      {
        path: 'catalog/:categoryId?',
        name: 'catalog',
        component: () => import('@/pages/CatalogPage.vue'),
      },
      {
        path: 'product/:id',
        name: 'product',
        component: () => import('@/pages/ProductPage.vue'),
      },
      { path: 'cart', name: 'cart', component: () => import('@/pages/CartPage.vue') },
      {
        path: 'checkout',
        name: 'checkout',
        component: () => import('@/pages/CheckoutPage.vue'),
      },
      {
        path: 'favorites',
        name: 'favorites',
        component: () => import('@/pages/FavoritesPage.vue'),
      },
      {
        path: 'orders',
        name: 'orders',
        component: () => import('@/pages/OrdersPage.vue'),
      },
      {
        path: 'orders/:id',
        name: 'order',
        component: () => import('@/pages/OrderPage.vue'),
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/pages/ProfilePage.vue'),
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
];

export default routes;
