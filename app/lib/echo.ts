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
let connectionState: 'disconnected' | 'connecting' | 'connected' | 'failed' = 'disconnected';
let connectionRetryCount = 0;
const maxConnectionRetries = 5;

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
      console.warn('Error disconnecting echo:', e);
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

    if (echo && connectionState === 'connected') {
      try {
        (echo as any).options.auth.headers.Authorization = `Bearer ${token}`;
        return;
      } catch (e) {
        console.warn('Failed to update echo auth headers, reinitializing:', e);
        destroyEcho();
      }
    }

    ensureEcho();
  });
}

export function ensureEcho(): Echo<any> | null {
  if (typeof window === 'undefined') return null;

  const config = getConfig();
  const token = SessionManager.getToken();

  if (!config || !token) {
    console.warn('Missing config or token for Echo initialization');
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

  // Check retry limits
  if (connectionRetryCount >= maxConnectionRetries) {
    console.error(`Echo connection failed after ${maxConnectionRetries} attempts`);
    connectionState = 'failed';
    return null;
  }

  connectionState = 'connecting';
  connectionRetryCount++;

  try {
    // Ensure Pusher is available globally
    window.Pusher = Pusher;
    
    // Disable Pusher logging in production
    Pusher.logToConsole = import.meta.env.DEV;

    // Determine configuration based on environment
    const isLocalReverb = config.host === 'localhost' && config.port;
    
    console.log(`Initializing Echo with ${isLocalReverb ? 'Reverb' : 'Pusher'} broadcaster...`);

    let echoConfig: any;

    if (isLocalReverb) {
      // Local Reverb configuration
      echoConfig = {
        broadcaster: 'reverb',
        key: config.key,
        wsHost: config.host,
        wsPort: config.port,
        wssPort: config.port,
        forceTLS: config.scheme === 'https',
        enabledTransports: ['ws', 'wss'],
        enableStats: false,
        enableLogging: import.meta.env.DEV,
        authEndpoint: `${config.apiUrl}/api/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        },
        // Connection timeout and retry settings for Reverb
        wsTimeout: 10000,
        activityTimeout: 30000,
        pongTimeout: 15000,
        enabledTransports: ['websocket'],
      };
    } else {
      // Production Pusher configuration  
      echoConfig = {
        broadcaster: 'pusher',
        key: config.key,
        cluster: 'ap1',
        forceTLS: true,
        enableStats: false,
        enableLogging: import.meta.env.DEV,
        authEndpoint: `${config.apiUrl}/api/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        },
        // Pusher specific options
        activityTimeout: 30000,
        pongTimeout: 15000,
      };
    }

    echo = new Echo(echoConfig);

    // Set up connection event handlers
    if (echo.connector && echo.connector.pusher) {
      const pusher = echo.connector.pusher;

      pusher.connection.bind('connected', () => {
        console.log('Echo WebSocket connected successfully');
        connectionState = 'connected';
        connectionRetryCount = 0; // Reset retry count on successful connection
      });

      pusher.connection.bind('disconnected', () => {
        console.log('Echo WebSocket disconnected');
        connectionState = 'disconnected';
      });

      pusher.connection.bind('error', (error: any) => {
        console.error('Echo WebSocket error:', error);
        connectionState = 'failed';
        
        // Check if it's a connection error (server not available)
        if (error.error && error.error.data && error.error.data.code === 4001) {
          console.error('WebSocket server connection failed - is the Reverb server running on localhost:8080?');
        }
      });

      pusher.connection.bind('unavailable', () => {
        console.warn('Echo WebSocket unavailable - server may not be running');
        connectionState = 'failed';
      });

      pusher.connection.bind('failed', () => {
        console.error('Echo WebSocket connection failed');
        connectionState = 'failed';
      });
    }

    installSessionWatcher();

    console.log(`Echo initialized successfully with ${isLocalReverb ? 'Reverb' : 'Pusher'}`);
    
    // Set connected state optimistically
    connectionState = 'connected';
    
    return echo;
  } catch (e) {
    console.error('Echo initialization failed:', e);
    connectionState = 'failed';
    echo = null;
    
    // Schedule retry with exponential backoff
    if (connectionRetryCount < maxConnectionRetries) {
      const retryDelay = Math.min(1000 * Math.pow(2, connectionRetryCount - 1), 30000);
      console.log(`Retrying Echo connection in ${retryDelay}ms (attempt ${connectionRetryCount}/${maxConnectionRetries})`);
      
      setTimeout(() => {
        connectionState = 'disconnected';
        ensureEcho();
      }, retryDelay);
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
  destroyEcho();
  ensureEcho();
}

export default echo;