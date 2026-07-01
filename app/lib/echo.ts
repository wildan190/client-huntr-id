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

/**
 * 🔥 HARD RESET - penting biar gak kena "subscribe is not a function"
 */
function destroyEcho() {
  if (echo) {
    try {
      echo.disconnect();
    } catch {}

    echo = null;
  }
}

export function ensureEcho() {
  if (typeof window === 'undefined') return null;

  const config = getConfig();
  const token = SessionManager.getToken();

  if (!config || !token) return null;

  // 🔥 always reset before recreate (FIX CORRUPT INSTANCE)
  destroyEcho();

  // IMPORTANT: jangan override Pusher instance global berkali-kali
  if (!window.Pusher) {
    window.Pusher = Pusher;
  }

  Pusher.logToConsole = false;

  echo = new Echo({
    broadcaster: 'reverb',

    key: config.key,
    wsHost: config.host,

    forceTLS: true,

    // 🔥 IMPORTANT: jangan pakai port manual
    wsPort: undefined,
    wssPort: undefined,

    enabledTransports: ['ws', 'wss'],

    authEndpoint: `${config.apiUrl}/api/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  });

  return echo;
}

export function getEcho() {
  return echo;
}

export default echo;