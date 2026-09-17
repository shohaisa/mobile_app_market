import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

export async function getJson<T>(key: string, fallback: T): Promise<T> {
  try {
    if (Capacitor.isNativePlatform()) {
      const { value } = await Preferences.get({ key });
      return value ? (JSON.parse(value) as T) : fallback;
    }
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function setJson(key: string, value: unknown): Promise<void> {
  const raw = JSON.stringify(value);
  if (Capacitor.isNativePlatform()) {
    await Preferences.set({ key, value: raw });
    return;
  }
  localStorage.setItem(key, raw);
}
