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
let installed = false;

function config() {
  const key = import.meta.env.VITE_REVERB_APP_KEY;
  const host = import.meta.env.VITE_REVERB_HOST;
  const apiUrl = import.meta.env.VITE_API_URL || 'https://api.huntr.id';

  if (!key || !host) return null;

  return { key, host, apiUrl };
}

function installSessionWatcher() {
  if (installed) return;
  installed = true;

  SessionManager.subscribe(() => {
    const token = SessionManager.getToken();

    if (!token) {
      echo?.disconnect();
      echo = null;
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

  const cfg = config();
  const token = SessionManager.getToken();

  if (!cfg || !token) return null;

  if (echo) return echo;

  window.Pusher = Pusher;
  Pusher.logToConsole = false;

  echo = new Echo({
    broadcaster: 'pusher',

    key: cfg.key,

    // 🔥 PENTING: direct Nginx WebSocket endpoint
    wsHost: cfg.host,
    wsPort: 443,
    wssPort: 443,
    forceTLS: true,

    enabledTransports: ['ws', 'wss'],

    authEndpoint: `${cfg.apiUrl}/api/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  });

  installSessionWatcher();

  console.log('Echo initialized (production stable mode)');

  return echo;
}

export function getEcho() {
  return echo;
}

export default echo;