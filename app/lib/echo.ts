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

function getConfig() {
  const key = import.meta.env.VITE_REVERB_APP_KEY;
  const host = import.meta.env.VITE_REVERB_HOST;

  if (!key || !host) return null;

  return {
    key,
    host,
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

  const config = getConfig();
  const token = SessionManager.getToken();

  if (!config || !token) return null;

  if (echo) {
    (echo as any).options.auth.headers.Authorization = `Bearer ${token}`;
    return echo;
  }

  try {
    window.Pusher = Pusher;
    Pusher.logToConsole = false;

    echo = new Echo<any>({
      broadcaster: 'reverb',
      key: config.key,

      // =========================
      // 🔥 CORE FIX (IMPORTANT)
      // =========================
      wsHost: config.host,
      forceTLS: true,

      // ❌ HARD STOP: no port ever (fix :8080 issue)
      wsPort: undefined,
      wssPort: undefined,

      // ❌ HARD STOP: no /app behavior drift
      wsPath: '',
      wssPath: '',

      enabledTransports: ['ws', 'wss'],

      authEndpoint: `${config.apiUrl}/api/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    });

    installSessionWatcher();

    console.log('Echo initialized OK');

    return echo;
  } catch (e) {
    console.error('Echo init failed', e);
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