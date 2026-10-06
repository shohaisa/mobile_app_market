const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const API_URL = configuredApiUrl ? configuredApiUrl.replace(/\/$/, '') : '';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    token?: string | null;
  } = {},
): Promise<T> {
  const form = options.body instanceof FormData ? options.body : null;
  const headers = new Headers({ Accept: 'application/json' });
  if (options.body !== undefined && !form) {
    headers.set('Content-Type', 'application/json');
  }
  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const init: RequestInit = {
    method: options.method ?? 'GET',
    headers,
  };
  if (form) {
    init.body = form;
  } else if (options.body !== undefined) {
    init.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_URL}/api${path}`, init);

  const payload = (await response.json().catch(() => null)) as
    | { message?: string; errors?: Record<string, string[]> }
    | null;

  if (!response.ok) {
    const validation = payload?.errors ? Object.values(payload.errors).flat()[0] : undefined;
    throw new ApiError(validation ?? payload?.message ?? 'Запрос не выполнен', response.status, payload?.errors ?? {});
  }

  return payload as T;
}
