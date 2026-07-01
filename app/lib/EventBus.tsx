// @refresh reset
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';

import { ensureEcho, getEcho } from '../lib/echo';
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
  const isPublicBound = useRef(false);

  const emit = useCallback((event: NotificationEvent) => {
    setLastEvent(event);

    window.dispatchEvent(
      new CustomEvent('huntr:notification_received', {
        detail: event,
      })
    );
  }, []);

  /**
   * PUBLIC CHANNEL (global event test / broadcast umum)
   */
  const bindPublicChannel = useCallback((echo: any) => {
    if (!echo || isPublicBound.current) return;

    try {
      isPublicBound.current = true;

      const channel = echo.channel('test-channel');

      channel.listen('.communication.websocket.broadcast', (payload: any) => {
        emit({
          type: payload?.data?.type || 'unknown',
          data: payload,
        });
      });
    } catch (err) {
      console.log('Public channel bind failed:', err);
      isPublicBound.current = false;
    }
  }, [emit]);

  /**
   * USER + COMPANY CHANNELS
   */
  const bindPrivateChannels = useCallback(() => {
    const echo = ensureEcho();
    const user = SessionManager.getUser();
    const company = SessionManager.getCompany();

    if (!echo) return;

    const userId = user?.id ?? null;
    const companyId = company?.id ?? null;

    // init public channel sekali
    bindPublicChannel(echo);

    /**
     * USER CHANNEL
     */
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
          console.log('User channel bind error:', err);
        }
      }

      currentUserId.current = userId;
    }

    /**
     * COMPANY CHANNEL
     */
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
            .private(
              `App.Domain.Company.Models.Company.${companyId}`
            )
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
          console.log('Company channel bind error:', err);
        }
      }

      currentCompanyId.current = companyId;
    }
  }, [bindPublicChannel, emit]);

  /**
   * INIT + SESSION WATCHER
   */
  useEffect(() => {
    bindPrivateChannels();

    const unsubscribe = SessionManager.subscribe(() => {
      const token = SessionManager.getToken();

      if (!token) {
        const echo = getEcho();

        if (echo) {
          try {
            echo.disconnect();
          } catch {}
        }

        currentUserId.current = null;
        currentCompanyId.current = null;
        isPublicBound.current = false;

        return;
      }

      ensureEcho();
      bindPrivateChannels();
    });

    return unsubscribe;
  }, [bindPrivateChannels]);

  return (
    <EventBusContext.Provider value={{ lastEvent, emit }}>
      {children}
    </EventBusContext.Provider>
  );
}

export function useEventBus() {
  const ctx = useContext(EventBusContext);
  if (!ctx) throw new Error('useEventBus must be used inside provider');
  return ctx;
}

export function useEventBusListener(
  types: string[],
  handler: (event: NotificationEvent) => void
) {
  const { lastEvent } = useEventBus();
  const lastId = useRef<string | null>(null);

  useEffect(() => {
    if (!lastEvent) return;

    const eventId = lastEvent?.data?.id;

    if (
      types.includes(lastEvent.type) &&
      eventId !== lastId.current
    ) {
      lastId.current = eventId;
      handler(lastEvent);
    }
  }, [lastEvent, types, handler]);
}