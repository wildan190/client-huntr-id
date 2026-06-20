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

  if (!reverbKey || !reverbHost || reverbKey.length === 0 || reverbHost.length === 0) {
    return null;
  }

  return {
    reverbKey,
    reverbHost,
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8443',
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
        } catch {
          // ignore disconnect errors during logout/session clear
        }
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

  if (!config || !authToken) {
    return null;
  }

  if (echo) {
    (echo as any).options.auth.headers.Authorization = `Bearer ${authToken}`;
    return echo;
  }

  try {
    window.Pusher = Pusher;
    Pusher.logToConsole = false;

    echo = new Echo<any>({
      broadcaster: 'reverb',
      key: config.reverbKey,
      wsHost: config.reverbHost,
      wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
      wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
      forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
      enabledTransports: ['ws', 'wss'],
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
