import { apiRequest } from '@/services/http';

export interface AppUpdate {
  needs_update: boolean;
  latest_version: string;
  is_critical: boolean;
  url: string;
  changelog: string | null;
}

interface AppVersionResponse {
  status_code: number;
  data: AppUpdate;
}

export async function fetchAppVersion(
  versionCode: number,
  platform: 'android' | 'ios',
): Promise<AppUpdate> {
  const params = new URLSearchParams({
    version_code: String(versionCode),
    platform,
  });
  const response = await apiRequest<AppVersionResponse>(`/v1/app-version?${params.toString()}`);

  return response.data;
}
