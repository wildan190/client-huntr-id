// @refresh reset
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { ensureEcho, getEcho } from '../lib/echo';
import { SessionManager } from './session';

export interface NotificationEvent {
  type: 
    | 'pr.created'
    | 'pr.approved'
    | 'bid.new'
    | 'negotiation.started'
    | 'negotiation.responded'
    | 'award.given'
    | 'award.approved'
    | 'po.confirmed'
    | 'do.created'
    | 'goods.received'
    | 'rfq.published'
    | 'payment.received'
    | 'disbursement.completed'
    | 'proposal_submitted'
    | string;
  data: any;
}

interface EventBusContextType {
  lastEvent: NotificationEvent | null;
  emit: (event: NotificationEvent) => void;
}

const EventBusContext = createContext<EventBusContextType | null>(null);

export function EventBusProvider({ children }: { children: React.ReactNode }) {
  const [lastEvent, setLastEvent] = useState<NotificationEvent | null>(null);
  const currentUserIdRef = useRef<string | number | null>(null);
  const currentCompanyIdRef = useRef<string | number | null>(null);
  const listenersInitialized = useRef(false);
  const authStateRef = useRef<{ userId: string | number | null; companyId: string | number | null }>({
    userId: null,
    companyId: null,
  });

  const emit = useCallback((event: NotificationEvent) => {
    setLastEvent(event);
    // Also dispatch the custom event for backward compatibility
    window.dispatchEvent(new CustomEvent('huntr:notification_received', {
      detail: event
    }));
  }, []);

  const ensurePublicListeners = useCallback(() => {
    const echo = ensureEcho();
    if (!echo || listenersInitialized.current) return;
    listenersInitialized.current = true;

    try {
      console.log('EventBusProvider: Setting up Reverb listeners...');

      const testChannel = echo.channel('test-channel');
      testChannel.listen('.communication.websocket.broadcast', (data: any) => {
        console.log('EventBusProvider: Received message on test-channel:', data);
        emit({
          type: data.data?.type || 'unknown',
          data: data
        });
      });
    } catch (err) {
      console.log('EventBusProvider: Error setting up test channel:', err);
    }
  }, [emit]);

  useEffect(() => {
    ensurePublicListeners();

    return () => {
      const activeEcho = getEcho();
      if (activeEcho) {
        try {
          activeEcho.leave('test-channel');
          if (currentUserIdRef.current) {
            activeEcho.leave(`App.Models.User.${currentUserIdRef.current}`);
            activeEcho.leave(`App.Domain.Auth.Models.User.${currentUserIdRef.current}`);
          }
          if (currentCompanyIdRef.current) {
            activeEcho.leave(`App.Domain.Company.Models.Company.${currentCompanyIdRef.current}`);
          }
        } catch (err) {
          console.log('EventBusProvider: Error leaving channels:', err);
        }
      }
    };
  }, [ensurePublicListeners]);

  // Handle user changes (login/logout) using SessionManager
  useEffect(() => {
    const updateUserChannels = () => {
      const echo = ensureEcho();
      const user = SessionManager.getUser();
      const newUserId = user?.id || null;
      const company = SessionManager.getCompany();
      const newCompanyId = company?.id || null;

      authStateRef.current = { userId: newUserId, companyId: newCompanyId };

      const handleNotification = (data: any) => {
        let eventType = 'unknown';
        if (data.data?.type) eventType = data.data.type;
        else if (data.type) eventType = data.type;

        emit({
          type: eventType,
          data: data
        });
      };

      // Handle User Channel
      if (!echo) {
        if (currentUserIdRef.current) {
          currentUserIdRef.current = null;
        }
        if (currentCompanyIdRef.current) {
          currentCompanyIdRef.current = null;
        }
        listenersInitialized.current = false;
        return;
      }

      ensurePublicListeners();

      if (currentUserIdRef.current !== newUserId) {
        if (currentUserIdRef.current) {
          try {
            echo.leave(`App.Models.User.${currentUserIdRef.current}`);
            echo.leave(`App.Domain.Auth.Models.User.${currentUserIdRef.current}`);
            console.log('EventBusProvider: Left channel for previous user:', currentUserIdRef.current);
          } catch (err) {
            console.log('EventBusProvider: Error leaving previous user channel:', err);
          }
        }

        if (newUserId) {
          try {
            const privateChannel1 = echo.private(`App.Models.User.${newUserId}`);
            privateChannel1.listen('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated', handleNotification);

            const privateChannel2 = echo.private(`App.Domain.Auth.Models.User.${newUserId}`);
            privateChannel2.listen('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated', handleNotification);

            console.log('EventBusProvider: Joined private channels for user:', newUserId);
          } catch (err) {
            console.log('EventBusProvider: Error joining private channel:', err);
          }
        }
        currentUserIdRef.current = newUserId;
      }

      // Handle Company Channel
      if (currentCompanyIdRef.current !== newCompanyId) {
        if (currentCompanyIdRef.current) {
          try {
            echo.leave(`App.Domain.Company.Models.Company.${currentCompanyIdRef.current}`);
            console.log('EventBusProvider: Left channel for previous company:', currentCompanyIdRef.current);
          } catch (err) {
            console.log('EventBusProvider: Error leaving previous company channel:', err);
          }
        }

        if (newCompanyId) {
          try {
            const companyChannel = echo.private(`App.Domain.Company.Models.Company.${newCompanyId}`);
            companyChannel.listen('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated', (data: any) => {
              console.log('EventBusProvider: Received database notification on company channel:', data);
              handleNotification(data);
            });
            console.log('EventBusProvider: Joined private channel for company:', newCompanyId);
          } catch (err) {
            console.log('EventBusProvider: Error joining company channel:', err);
          }
        }
        currentCompanyIdRef.current = newCompanyId;
      }
    };

    // Initial setup
    updateUserChannels();

    // Subscribe to session changes
    const unsubscribe = SessionManager.subscribe(updateUserChannels);
    
    return unsubscribe;
  }, [emit]);

  return (
    <EventBusContext.Provider value={{ lastEvent, emit }}>
      {children}
    </EventBusContext.Provider>
  );
}

export function useEventBus() {
  const context = useContext(EventBusContext);
  if (!context) {
    throw new Error('useEventBus must be used within EventBusProvider');
  }
  return context;
}

// Custom hook to listen to specific event types
export function useEventBusListener(
  types: NotificationEvent['type'][],
  handler: (event: NotificationEvent) => void
) {
  const { lastEvent } = useEventBus();
  const lastProcessedId = useRef<string | null>(null);

  useEffect(() => {
    if (
      lastEvent && 
      types.includes(lastEvent.type) && 
      lastEvent.data?.id !== lastProcessedId.current
    ) {
      lastProcessedId.current = lastEvent.data?.id;
      handler(lastEvent);
    }
  }, [lastEvent, types, handler]);
}
