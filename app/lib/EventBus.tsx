// @refresh reset
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';

import { ensureEcho, getEcho } from './echo';
import { SessionManager } from './session';

export interface NotificationEvent {
  type: string;
  data: any;
}

interface EventBusContextType {
  lastEvent: NotificationEvent | null;
  emit: (event: NotificationEvent) => void;
}

const EventBusContext = createContext<EventBusContextType | null>(null);

export function EventBusProvider({ children }: { children: React.ReactNode }) {
  // 🔥 FIX TS ERROR: HARUS DI-TYPE JELAS
  const [lastEvent, setLastEvent] = useState<NotificationEvent | null>(null);

  const userIdRef = useRef<string | number | null>(null);
  const companyIdRef = useRef<string | number | null>(null);
  const publicBound = useRef(false);

  const emit = useCallback((event: NotificationEvent) => {
    setLastEvent(event);

    window.dispatchEvent(
      new CustomEvent('huntr:notification_received', {
        detail: event,
      })
    );
  }, []);

  /**
   * PUBLIC CHANNEL
   */
  const bindPublicChannel = useCallback((echo: any) => {
    if (!echo || publicBound.current) return;

    try {
      publicBound.current = true;

      const channel = echo.channel('test-channel');

      channel.listen('.communication.websocket.broadcast', (payload: any) => {
        emit({
          type: payload?.data?.type || 'unknown',
          data: payload,
        });
      });
    } catch (err) {
      console.log('Public channel error:', err);
      publicBound.current = false;
    }
  }, [emit]);

  /**
   * PRIVATE CHANNELS
   */
  const bindChannels = useCallback(() => {
    const echo = ensureEcho();
    if (!echo) return;

    const user = SessionManager.getUser();
    const company = SessionManager.getCompany();

    const userId = user?.id ?? null;
    const companyId = company?.id ?? null;

    bindPublicChannel(echo);

    // ================= USER =================
    if (userId !== userIdRef.current) {
      if (userIdRef.current) {
        try {
          echo.leave(`App.Models.User.${userIdRef.current}`);
        } catch {}
      }

      if (userId) {
        try {
          echo
            .private(`App.Models.User.${userId}`)
            .listen(
              '.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated',
              (data: any) => {
                emit({
                  type: data?.data?.type || data?.type || 'unknown',
                  data,
                });
              }
            );
        } catch (err) {
          console.log('User channel error:', err);
        }
      }

      userIdRef.current = userId;
    }

    // ================= COMPANY =================
    if (companyId !== companyIdRef.current) {
      if (companyIdRef.current) {
        try {
          echo.leave(
            `App.Domain.Company.Models.Company.${companyIdRef.current}`
          );
        } catch {}
      }

      if (companyId) {
        try {
          echo
            .private(`App.Domain.Company.Models.Company.${companyId}`)
            .listen(
              '.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated',
              (data: any) => {
                emit({
                  type: data?.data?.type || data?.type || 'unknown',
                  data,
                });
              }
            );
        } catch (err) {
          console.log('Company channel error:', err);
        }
      }

      companyIdRef.current = companyId;
    }
  }, [bindPublicChannel, emit]);

  /**
   * INIT + SESSION WATCHER
   */
  useEffect(() => {
    bindChannels();

    const unsubscribe = SessionManager.subscribe(() => {
      const token = SessionManager.getToken();

      if (!token) {
        const echo = getEcho();

        if (echo) {
          try {
            echo.disconnect();
          } catch {}
        }

        userIdRef.current = null;
        companyIdRef.current = null;
        publicBound.current = false;

        return;
      }

      ensureEcho();
      bindChannels();
    });

    return unsubscribe;
  }, [bindChannels]);

  return (
    <EventBusContext.Provider value={{ lastEvent, emit }}>
      {children}
    </EventBusContext.Provider>
  );
}

export function useEventBus() {
  const ctx = useContext(EventBusContext);
  if (!ctx) throw new Error('useEventBus must be inside provider');
  return ctx;
}

/**
 * 🔥 FIX: EXPORTED PROPERLY (BIAR BUILD TIDAK ERROR)
 */
export function useEventBusListener(
  types: string[],
  handler: (event: NotificationEvent) => void
) {
  const { lastEvent } = useEventBus();
  const lastId = useRef<string | null>(null);

  useEffect(() => {
    if (!lastEvent) return;

    const id = lastEvent.data?.id;

    if (types.includes(lastEvent.type) && id !== lastId.current) {
      lastId.current = id;
      handler(lastEvent);
    }
  }, [lastEvent, types, handler]);
}