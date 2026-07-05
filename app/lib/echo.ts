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
let connectionState: 'disconnected' | 'connecting' | 'connected' | 'failed' | 'disabled' = 'disconnected';
let connectionRetryCount = 0;
const maxConnectionRetries = 2; // Reduced from 5 to 2
let gracefulFailure = false; // New: track if we should stop trying

function getConfig() {
  const key = import.meta.env.VITE_REVERB_APP_KEY;
  const host = import.meta.env.VITE_REVERB_HOST;
  const port = import.meta.env.VITE_REVERB_PORT;
  const scheme = import.meta.env.VITE_REVERB_SCHEME || 'http';

  if (!key || !host) return null;

  return {
    key,
    host,
    port: port ? parseInt(port) : 8080,
    scheme,
    apiUrl: import.meta.env.VITE_API_URL || 'https://api.huntr.id',
  };
}

function destroyEcho() {
  if (echo) {
    try {
      echo.disconnect();
    } catch (e) {
      // Silent cleanup
    }
    echo = null;
  }
  connectionState = 'disconnected';
}

function installSessionWatcher() {
  if (sessionInstalled) return;
  sessionInstalled = true;

  SessionManager.subscribe(() => {
    const token = SessionManager.getToken();

    if (!token) {
      destroyEcho();
      return;
    }

    // Only reconnect if we haven't failed gracefully
    if (!gracefulFailure && echo && connectionState === 'connected') {
      try {
        (echo as any).options.auth.headers.Authorization = `Bearer ${token}`;
        return;
      } catch (e) {
        destroyEcho();
      }
    }

    // Don't retry if we're in graceful failure mode
    if (!gracefulFailure) {
      ensureEcho();
    }
  });
}

export function ensureEcho(): Echo<any> | null {
  if (typeof window === 'undefined') return null;

  const config = getConfig();
  const token = SessionManager.getToken();

  if (!config || !token) {
    return null;
  }

  // Return existing connection if valid
  if (echo && connectionState === 'connected') {
    return echo;
  }

  // Prevent multiple simultaneous connection attempts
  if (connectionState === 'connecting') {
    return null;
  }

  // If we've failed gracefully, don't try again
  if (gracefulFailure || connectionRetryCount >= maxConnectionRetries) {
    if (!gracefulFailure) {
      console.log('💡 WebSocket unavailable - running in polling mode');
      gracefulFailure = true;
    }
    connectionState = 'disabled';
    return null;
  }

  connectionState = 'connecting';
  connectionRetryCount++;

  try {
    // Ensure Pusher is available globally
    window.Pusher = Pusher;
    
    // Disable Pusher logging completely in production
    Pusher.logToConsole = false;

    // Always use Reverb configuration if host is provided
    const isReverb = !!config.host;
    
    if (import.meta.env.DEV) {
      console.log(`🔌 Attempting WebSocket connection (${connectionRetryCount}/${maxConnectionRetries})`);
    }

    let echoConfig: any;

    if (isReverb) {
      // Reverb configuration - more conservative timeouts
      echoConfig = {
        broadcaster: 'reverb',
        key: config.key,
        wsHost: config.host,
        wsPort: config.port,
        wssPort: config.port,
        forceTLS: config.scheme === 'https',
        enabledTransports: ['ws', 'wss'],
        enableStats: false,
        enableLogging: false, // Disable all logging
        authEndpoint: `${config.apiUrl}/api/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        },
        // More conservative timeouts
        wsTimeout: 5000, // Reduced from 10s to 5s
        activityTimeout: 60000, // Increased to 60s
        pongTimeout: 10000, // Reduced from 15s to 10s
      };
    } else {
      // Production Pusher configuration fallback
      echoConfig = {
        broadcaster: 'pusher',
        key: config.key,
        cluster: 'ap1',
        forceTLS: true,
        enableStats: false,
        enableLogging: false, // Disable all logging
        authEndpoint: `${config.apiUrl}/api/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        },
        activityTimeout: 60000,
        pongTimeout: 10000,
      };
    }

    echo = new Echo(echoConfig);

    // Set up connection event handlers - all silent
    if (echo.connector && echo.connector.pusher) {
      const pusher = echo.connector.pusher;

      pusher.connection.bind('connected', () => {
        if (import.meta.env.DEV) {
          console.log('✅ WebSocket connected');
        }
        connectionState = 'connected';
        connectionRetryCount = 0; // Reset retry count on successful connection
        gracefulFailure = false; // Reset graceful failure flag
      });

      pusher.connection.bind('disconnected', () => {
        connectionState = 'disconnected';
      });

      pusher.connection.bind('error', (error: any) => {
        connectionState = 'failed';
        // No console logging - fail silently
      });

      pusher.connection.bind('unavailable', () => {
        connectionState = 'failed';
        // No console logging - fail silently
      });

      pusher.connection.bind('failed', () => {
        connectionState = 'failed';
        // No console logging - fail silently
      });
    }

    installSessionWatcher();
    
    // Don't set connected state optimistically
    
    return echo;
  } catch (e) {
    connectionState = 'failed';
    echo = null;
    
    // Schedule ONLY ONE retry with a reasonable delay
    if (connectionRetryCount < maxConnectionRetries) {
      setTimeout(() => {
        connectionState = 'disconnected';
        ensureEcho();
      }, 3000); // Fixed 3 second retry
    } else {
      // After max retries, enter graceful failure mode
      gracefulFailure = true;
      if (import.meta.env.DEV) {
        console.log('💡 WebSocket connection failed - app will work without real-time updates');
      }
    }
    
    return null;
  }
}

// Initialize on client-side only
if (typeof window !== 'undefined') {
  installSessionWatcher();
}

export function getEcho(): Echo<any> | null {
  return echo;
}

export function getConnectionState(): string {
  return connectionState;
}

export function resetConnection(): void {
  connectionRetryCount = 0;
  connectionState = 'disconnected';
  gracefulFailure = false; // Reset graceful failure
  destroyEcho();
  ensureEcho();
}

export default echo;