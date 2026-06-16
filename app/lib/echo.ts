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

if (typeof window !== 'undefined') {
  const reverbKey = import.meta.env.VITE_REVERB_APP_KEY;
  const reverbHost = import.meta.env.VITE_REVERB_HOST;

  // Only initialize Echo if ALL required Reverb config is present
  if (reverbKey && reverbHost && reverbKey.length > 0 && reverbHost.length > 0) {
    try {
      window.Pusher = Pusher;

      const authToken = SessionManager.getToken() || '';

      echo = new Echo<any>({
        broadcaster: 'reverb',
        key: reverbKey,
        wsHost: reverbHost,
        wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
        wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${import.meta.env.VITE_API_URL || 'http://localhost:8443'}/api/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/json'
          },
        },
      });

      // Disable ALL Pusher logging to prevent WebSocket error spam
      Pusher.logToConsole = false;

      // Subscribe to session changes to update auth token dynamically
      SessionManager.subscribe(() => {
        if (echo) {
          const newToken = SessionManager.getToken() || '';
          (echo as any).options.auth.headers.Authorization = `Bearer ${newToken}`;
        }
      });

      console.log('Echo: Successfully initialized');
    } catch (err) {
      console.log('Echo: Initialization failed - skipping', err);
      echo = null;
    }
  } else {
    console.log('Echo: Skipping initialization - no Reverb config found');
  }
}

export default echo;
