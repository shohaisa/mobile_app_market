import { apiRequest } from '@/services/http';
import { getJson, setJson } from '@/services/storage';

const TOKEN_KEY = 'auth.token';

export interface AuthSession {
  token: string;
  user_id: number;
  name: string;
  email: string;
}

interface AuthResponse {
  status_code: number;
  data: AuthSession;
}

export interface Profile {
  user_id: number;
  name: string;
  email: string;
}

interface ProfileResponse {
  status_code: number;
  data: Profile;
}

export async function readToken(): Promise<string | null> {
  return getJson<string | null>(TOKEN_KEY, null);
}

export async function saveToken(token: string | null): Promise<void> {
  await setJson(TOKEN_KEY, token);
}

export async function loginWithGoogle(idToken: string): Promise<AuthSession> {
  const response = await apiRequest<AuthResponse>('/v1/users/login/google', {
    method: 'POST',
    body: { id_token: idToken },
  });
  await saveToken(response.data.token);
  return response.data;
}

export async function loginWithApple(
  idToken: string,
  name?: string,
  nonce?: string,
): Promise<AuthSession> {
  const response = await apiRequest<AuthResponse>('/v1/users/login/apple', {
    method: 'POST',
    body: {
      id_token: idToken,
      name: name || null,
      nonce: nonce || null,
    },
  });
  await saveToken(response.data.token);
  return response.data;
}

export async function fetchCurrentUser(token: string): Promise<Profile> {
  const response = await apiRequest<ProfileResponse>('/v1/user', { token });
  return response.data;
}
