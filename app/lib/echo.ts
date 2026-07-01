import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { SessionManager } from './session';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<any>;
  }
}

let echo: Echo<any> | null = null;
let sessionSubscriptionInstalled = false;

function getReverbConfig() {
  const reverbKey = import.meta.env.VITE_REVERB_APP_KEY;
  const reverbHost = import.meta.env.VITE_REVERB_HOST;

  if (!reverbKey || !reverbHost) {
    return null;
  }

  return {
    reverbKey,
    reverbHost,
    apiUrl: import.meta.env.VITE_API_URL || 'https://api.huntr.id',
  };
}

function installSessionWatcher() {
  if (sessionSubscriptionInstalled) return;
  sessionSubscriptionInstalled = true;

  SessionManager.subscribe(() => {
    const token = SessionManager.getToken();

    if (!token) {
      if (echo) {
        try {
          echo.disconnect();
        } catch {}
        echo = null;
      }
      return;
    }

    if (echo) {
      (echo as any).options.auth.headers.Authorization = `Bearer ${token}`;
      return;
    }

    ensureEcho();
  });
}

export function ensureEcho() {
  if (typeof window === 'undefined') return null;

  const config = getReverbConfig();
  const authToken = SessionManager.getToken();

  if (!config || !authToken) return null;

  if (echo) {
    (echo as any).options.auth.headers.Authorization = `Bearer ${authToken}`;
    return echo;
  }

  try {
    window.Pusher = Pusher;
    Pusher.logToConsole = false;

    const isSecure = true; // karena kamu pakai HTTPS

    echo = new Echo<any>({
      broadcaster: 'reverb',
      key: config.reverbKey,

      // 🔥 PENTING: jangan pakai port sama sekali
      wsHost: config.reverbHost,
      forceTLS: isSecure,

      // ❌ HAPUS total port (ini biang masalah :8080)
      wsPort: undefined,
      wssPort: undefined,

      enabledTransports: ['ws', 'wss'],

      // lewat Nginx proxy /app
      authEndpoint: `${config.apiUrl}/api/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: 'application/json',
        },
      },
    });

    installSessionWatcher();

    console.log('Echo: Successfully initialized');
    return echo;
  } catch (err) {
    console.log('Echo: Initialization failed - skipping', err);
    echo = null;
    return null;
  }
}

if (typeof window !== 'undefined') {
  installSessionWatcher();
}

export function getEcho() {
  return echo;
}

export default echo;