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
  const [lastEvent, setLastEvent] = useState<NotificationEvent | null>(null);

  const currentUserId = useRef<string | number | null>(null);
  const currentCompanyId = useRef<string | number | null>(null);
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
  const bindPublic = useCallback((echo: any) => {
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
      console.log('Public bind failed:', err);
      publicBound.current = false;
    }
  }, [emit]);

  /**
   * PRIVATE CHANNELS
   */
  const bindPrivate = useCallback(() => {
    const echo = ensureEcho();
    if (!echo) return;

    const user = SessionManager.getUser();
    const company = SessionManager.getCompany();

    const userId = user?.id ?? null;
    const companyId = company?.id ?? null;

    bindPublic(echo);

    // USER
    if (userId !== currentUserId.current) {
      if (currentUserId.current) {
        try {
          echo.leave(`App.Models.User.${currentUserId.current}`);
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

      currentUserId.current = userId;
    }

    // COMPANY
    if (companyId !== currentCompanyId.current) {
      if (currentCompanyId.current) {
        try {
          echo.leave(
            `App.Domain.Company.Models.Company.${currentCompanyId.current}`
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

      currentCompanyId.current = companyId;
    }
  }, [bindPublic, emit]);

  /**
   * INIT
   */
  useEffect(() => {
    bindPrivate();

    const unsubscribe = SessionManager.subscribe(() => {
      const token = SessionManager.getToken();

      if (!token) {
        const e = getEcho();
        if (e) {
          try {
            e.disconnect();
          } catch {}
        }

        currentUserId.current = null;
        currentCompanyId.current = null;
        publicBound.current = false;

        return;
      }

      ensureEcho();
      bindPrivate();
    });

    return unsubscribe;
  }, [bindPrivate]);

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
 * 🔥 FIX ERROR BUILD: INI WAJIB ADA
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