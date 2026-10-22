import { ref } from 'vue';
import type { PluginListenerHandle } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { useQuasar } from 'quasar';
import { fetchAppVersion, type AppUpdate } from '@/services/appVersion';

export function useAppUpdate() {
  const $q = useQuasar();
  const criticalUpdate = ref(false);
  const updateData = ref<AppUpdate | null>(null);
  let resumeListener: PluginListenerHandle | null = null;

  const showCriticalDialog = () => {
    $q.dialog({
      title: 'Доступна новая версия приложения.',
      message: 'Для продолжения работы необходимо обновить приложение.',
      persistent: true,
      noEscDismiss: true,
      noBackdropDismiss: true,
      ok: {
        label: 'Обновить сейчас',
        color: 'negative',
      },
    }).onOk(() => {
      if (updateData.value?.url) {
        window.open(updateData.value.url, '_blank');
      }
    });
  };

  const checkUpdate = async () => {
    try {
      const info = await CapApp.getInfo();
      const versionCode = Number(info.build);
      if (!Number.isInteger(versionCode) || versionCode < 1) {
        return;
      }

      const result = await fetchAppVersion(versionCode, $q.platform.is.ios ? 'ios' : 'android');

      if (result.needs_update) {
        updateData.value = result;

        if (result.is_critical) {
          criticalUpdate.value = true;
          showCriticalDialog();
        } else {
          $q.notify({
            position: 'top',
            type: 'info',
            message: `Доступна новая версия приложения. <br> Текущая версия: ${info.version} Доступно версия: ${result.latest_version}`,
            html: true,
            multiLine: true,
            timeout: 10000,
            actions: [
              {
                label: 'Обновить',
                color: 'white',
                handler: () => {
                  if (updateData.value?.url) {
                    window.open(updateData.value.url, '_blank');
                  }
                },
              },
            ],
          });
        }
      }

      if (resumeListener) {
        await resumeListener.remove();
      }

      resumeListener = await CapApp.addListener('resume', () => {
        if (criticalUpdate.value) {
          showCriticalDialog();
        }
      });
    } catch (error) {
      console.error('Ошибка при проверке обновлений:', error);
    }
  };

  return { checkUpdate };
}
