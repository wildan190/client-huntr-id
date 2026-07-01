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
let echoInstanceId = 0;

const INTERNAL_REVERB_HOSTS = new Set(['reverb', 'reverb.staging', 'reverb.local']);

type EchoLifecycleListener = (instanceId: number) => void;
const connectListeners = new Set<EchoLifecycleListener>();
const disconnectListeners = new Set<EchoLifecycleListener>();

function notifyConnect(instanceId: number) {
  connectListeners.forEach((listener) => listener(instanceId));
}

function notifyDisconnect(instanceId: number) {
  disconnectListeners.forEach((listener) => listener(instanceId));
}

export function onEchoConnect(listener: EchoLifecycleListener) {
  connectListeners.add(listener);
  return () => connectListeners.delete(listener);
}

export function onEchoDisconnect(listener: EchoLifecycleListener) {
  disconnectListeners.add(listener);
  return () => disconnectListeners.delete(listener);
}

export function getEchoInstanceId() {
  return echoInstanceId;
}

function resolveApiUrl() {
  return import.meta.env.VITE_API_URL || 'http://localhost:8443';
}

function resolveReverbHost(configuredHost: string | undefined, apiUrl: string) {
  if (
    configuredHost &&
    !INTERNAL_REVERB_HOSTS.has(configuredHost) &&
    !configuredHost.endsWith('.internal')
  ) {
    return configuredHost;
  }

  try {
    return new URL(apiUrl).hostname;
  } catch {
    return configuredHost || 'localhost';
  }
}

function resolveReverbScheme() {
  const configuredScheme = import.meta.env.VITE_REVERB_SCHEME;

  if (configuredScheme === 'http' || configuredScheme === 'https') {
    return configuredScheme;
  }

  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return 'https';
  }

  return import.meta.env.DEV ? 'http' : 'https';
}

function resolveReverbPorts(scheme: 'http' | 'https') {
  const configuredPort = Number(import.meta.env.VITE_REVERB_PORT);

  if (scheme === 'https') {
    // Port 8080 is the internal Reverb server port; browsers must use 443 via nginx TLS.
    const wssPort =
      Number.isFinite(configuredPort) && configuredPort > 0 && configuredPort !== 8080
        ? configuredPort
        : 443;

    return {
      wsPort: 80,
      wssPort,
      forceTLS: true,
    };
  }

  const wsPort = Number.isFinite(configuredPort) && configuredPort > 0 ? configuredPort : 8080;

  return {
    wsPort,
    wssPort: wsPort,
    forceTLS: false,
  };
}

function getReverbConfig() {
  const reverbKey = import.meta.env.VITE_REVERB_APP_KEY;
  const configuredHost = import.meta.env.VITE_REVERB_HOST;
  const apiUrl = resolveApiUrl();

  if (!reverbKey || reverbKey.length === 0) {
    return null;
  }

  const scheme = resolveReverbScheme();
  const reverbHost = resolveReverbHost(configuredHost, apiUrl);
  const ports = resolveReverbPorts(scheme);

  return {
    reverbKey,
    reverbHost,
    apiUrl,
    scheme,
    ...ports,
  };
}

function bindConnectionLifecycle(instance: Echo<any>, instanceId: number) {
  const connector = (instance as any).connector;
  const connection = connector?.pusher?.connection;

  if (!connection || connection.__huntrLifecycleBound) {
    return;
  }

  connection.__huntrLifecycleBound = true;

  connection.bind('connected', () => {
    notifyConnect(instanceId);
  });

  connection.bind('disconnected', () => {
    notifyDisconnect(instanceId);
  });

  connection.bind('failed', () => {
    notifyDisconnect(instanceId);
  });

  if (connection.state === 'connected') {
    notifyConnect(instanceId);
  }
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
        notifyDisconnect(echoInstanceId);
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

    const instanceId = ++echoInstanceId;

    echo = new Echo<any>({
      broadcaster: 'reverb',
      key: config.reverbKey,
      wsHost: config.reverbHost,
      wsPort: config.wsPort,
      wssPort: config.wssPort,
      forceTLS: config.forceTLS,
      enabledTransports: ['ws', 'wss'],
      disableStats: true,
      authEndpoint: `${config.apiUrl}/api/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: 'application/json',
        },
      },
    });

    bindConnectionLifecycle(echo, instanceId);
    installSessionWatcher();

    console.log('Echo: initialized', {
      wsHost: config.reverbHost,
      wsPort: config.wsPort,
      wssPort: config.wssPort,
      forceTLS: config.forceTLS,
    });

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
