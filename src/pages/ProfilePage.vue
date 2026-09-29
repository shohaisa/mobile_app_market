<template>
  <q-page>
    <div class="page-header safe-top">
      <div class="text-h6 text-weight-bold">Профиль</div>
    </div>

    <div class="page-pad">
      <div v-if="user.user" class="card-soft q-pa-md row items-center q-gutter-md">
        <q-avatar size="64px" color="primary" text-color="white">
          {{ initials }}
        </q-avatar>
        <div class="col">
          <div class="text-subtitle1 text-weight-bold">{{ user.user.name }}</div>
          <div v-if="user.user.phone" class="muted text-caption">{{ user.user.phone }}</div>
          <div v-if="user.user.email" class="muted text-caption">{{ user.user.email }}</div>
        </div>
        <q-btn flat dense color="primary" label="Выйти" :loading="signingOut" @click="submitSignOut" />
      </div>

      <div v-if="user.user" class="card-soft q-pa-md q-mt-md">
        <div class="text-subtitle1 text-weight-bold">Телефон и адрес</div>
        <div class="muted text-caption q-mb-md">
          Без них заказ оформить нельзя. Адрес — одна строка, например «Ош Курманжан-датка 235 рядом сити маркет».
        </div>
        <q-input v-model="phone" outlined label="Телефон" maxlength="32" />
        <q-input
          v-model="address"
          class="q-mt-sm"
          outlined
          autogrow
          type="textarea"
          label="Адрес"
          maxlength="255"
        />
        <q-btn
          class="full-width q-mt-md"
          color="primary"
          unelevated
          no-caps
          label="Сохранить"
          :loading="saving"
          @click="saveContact"
        />
        <div v-if="saveError" class="text-negative text-caption q-mt-sm">{{ saveError }}</div>
        <div v-else-if="!user.profileComplete" class="text-caption q-mt-sm text-warning">
          Заполните оба поля, чтобы открыть оформление заказа.
        </div>
      </div>

      <div v-else class="card-soft q-pa-md">
        <div class="text-subtitle1 text-weight-bold">Войдите, чтобы оформить заказ</div>
        <div class="muted text-caption q-mb-md">
          Войдите через Google или Apple, затем укажите телефон и адрес.
        </div>
        <q-btn
          class="full-width q-mb-sm"
          color="primary"
          unelevated
          label="Войти через Google"
          :loading="authBusy"
          @click="submitGoogle"
        />
        <q-btn
          v-if="showApple"
          class="full-width"
          outline
          color="primary"
          label="Войти через Apple"
          @click="openApple"
        />
        <div v-if="authError" class="text-negative text-caption q-mt-sm">{{ authError }}</div>
      </div>

      <q-list class="card-soft q-mt-md">
        <q-item clickable v-ripple :to="{ name: 'orders' }">
          <q-item-section avatar><q-icon name="receipt_long" color="primary" /></q-item-section>
          <q-item-section>
            <q-item-label>Мои заказы</q-item-label>
            <q-item-label caption>{{ orderCaption }}</q-item-label>
          </q-item-section>
          <q-item-section side><q-icon name="chevron_right" /></q-item-section>
        </q-item>
        <q-item clickable v-ripple :to="{ name: 'favorites' }">
          <q-item-section avatar><q-icon name="favorite" color="accent" /></q-item-section>
          <q-item-section>Избранное</q-item-section>
          <q-item-section side><q-icon name="chevron_right" /></q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar><q-icon name="location_on" color="positive" /></q-item-section>
          <q-item-section>
            <q-item-label>Адрес</q-item-label>
            <q-item-label caption>{{ addressLine }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar><q-icon name="notifications" /></q-item-section>
          <q-item-section>Уведомления</q-item-section>
          <q-item-section side>
            <q-toggle v-model="notify" color="primary" />
          </q-item-section>
        </q-item>
      </q-list>

      <div class="profile-brand">
        <img src="@/assets/brand/qazan-mark.svg" alt="" />
        QAZAN
      </div>
    </div>

    <q-dialog v-if="showApple" v-model="appleOpen">
      <q-card class="q-pa-md" style="width: 360px; max-width: 92vw">
        <div class="text-subtitle1 text-weight-bold q-mb-sm">Apple id_token</div>
        <q-input v-model="appleToken" type="textarea" autogrow outlined label="id_token" />
        <q-input v-model="appleName" class="q-mt-sm" outlined label="Имя, только при первом входе" />
        <q-input v-model="appleNonce" class="q-mt-sm" outlined label="nonce, если есть" />
        <q-btn
          class="full-width q-mt-md"
          color="primary"
          unelevated
          label="Продолжить"
          :loading="authBusy"
          @click="submitApple"
        />
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { Capacitor } from '@capacitor/core';
import { computed, ref, watch } from 'vue';
import { plural } from '@/composables/useMoney';
import { ErrorCode } from '@capawesome/capacitor-google-sign-in';
import { ApiError } from '@/services/http';
import { requestGoogleIdToken } from '@/services/google';
import { useOrdersStore } from '@/stores/orders';
import { useUserStore } from '@/stores/user';

const showApple = Capacitor.getPlatform() !== 'android';
const user = useUserStore();
const orders = useOrdersStore();
const notify = ref(true);
const authError = ref('');
const authBusy = ref(false);
const saving = ref(false);
const signingOut = ref(false);
const saveError = ref('');
const phone = ref('');
const address = ref('');
const appleOpen = ref(false);
const appleToken = ref('');
const appleName = ref('');
const appleNonce = ref('');

watch(
  () => user.user,
  (profile) => {
    phone.value = profile?.phone ?? '';
    address.value = profile?.address ?? '';
  },
  { immediate: true },
);

async function saveContact(): Promise<void> {
  const nextPhone = phone.value.trim();
  const nextAddress = address.value.trim();
  if (nextPhone === '' || nextAddress === '') {
    saveError.value = 'Укажите телефон и адрес';
    return;
  }

  saving.value = true;
  saveError.value = '';
  try {
    await user.saveProfile({ phone: nextPhone, address: nextAddress });
  } catch (error) {
    saveError.value = error instanceof ApiError ? error.message : 'Не удалось сохранить профиль';
  } finally {
    saving.value = false;
  }
}

async function submitSignOut(): Promise<void> {
  signingOut.value = true;
  try {
    await user.signOut();
  } finally {
    signingOut.value = false;
  }
}

function openApple(): void {
  authError.value = '';
  appleOpen.value = true;
}

async function submitGoogle(): Promise<void> {
  authBusy.value = true;
  authError.value = '';
  try {
    const idToken = await requestGoogleIdToken();
    await user.signInWithGoogle(idToken);
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
    if (code === String(ErrorCode.SignInCanceled)) {
      return;
    }
    authError.value =
      error instanceof ApiError || error instanceof Error
        ? error.message
        : 'Не удалось войти через Google';
  } finally {
    authBusy.value = false;
  }
}

async function submitApple(): Promise<void> {
  authBusy.value = true;
  authError.value = '';
  try {
    await user.signInWithApple(
      appleToken.value.trim(),
      appleName.value.trim() || undefined,
      appleNonce.value.trim() || undefined,
    );
    appleOpen.value = false;
    appleToken.value = '';
    appleName.value = '';
    appleNonce.value = '';
  } catch (error) {
    authError.value = error instanceof ApiError ? error.message : 'Не удалось войти через Apple';
    appleOpen.value = false;
  } finally {
    authBusy.value = false;
  }
}

const initials = computed(() => {
  const name = user.user?.name ?? 'А';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
});

const addressLine = computed(() => user.user?.address || 'Не указан');

const orderCaption = computed(() =>
  plural(orders.orders.length, 'заказ', 'заказа', 'заказов'),
);
</script>

<style scoped lang="scss">
.page-header {
  padding: 16px 16px 8px;
  padding-top: calc(16px + var(--safe-area-inset-top, env(safe-area-inset-top, 0px)));
  background: #fff;
}

.profile-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 28px;
  color: var(--app-muted);
  font-size: 12px;
}

.profile-brand img {
  width: 22px;
  height: 22px;
}
</style>
