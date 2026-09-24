import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';

let ready = false;

function webClientId(): string {
  const clientId = import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID?.trim();
  if (!clientId) {
    throw new Error('Не задан VITE_GOOGLE_WEB_CLIENT_ID');
  }
  return clientId;
}

async function ensureGoogle(): Promise<void> {
  if (ready) {
    return;
  }
  await GoogleSignIn.initialize({ clientId: webClientId() });
  ready = true;
}

export async function requestGoogleIdToken(): Promise<string> {
  await ensureGoogle();
  const result = await GoogleSignIn.signIn();
  if (!result.idToken) {
    throw new Error('Google не вернул id_token');
  }
  return result.idToken;
}

export async function signOutGoogle(): Promise<void> {
  if (!ready) {
    return;
  }
  await GoogleSignIn.signOut();
}
