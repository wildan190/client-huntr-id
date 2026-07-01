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
let sessionInstalled = false;

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
  if (sessionInstalled) return;
  sessionInstalled = true;

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
      // 🔥 IMPORTANT FIX (NO /app MODE)
      // =========================
      wsHost: config.host,
      forceTLS: true,

      wsPort: undefined,
      wssPort: undefined,

      // ❌ disable pusher-style path completely
      enabledTransports: ['ws', 'wss'],

      // 🔥 CRITICAL: paksa tanpa pusher endpoint path
      cluster: undefined,

      authEndpoint: `${config.apiUrl}/api/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },

      // 🧨 INI KUNCI UTAMA (hilangkan /app)
      client: Pusher,
    });

    installSessionWatcher();

    console.log('Echo Reverb native initialized');

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