import React, { useEffect, useRef } from 'react';
import { useEventBus } from '../lib/EventBus';

export default function NotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { lastEvent } = useEventBus();
  const lastPlayedId = useRef<string | null>(null);

  useEffect(() => {
    if (lastEvent && lastEvent.data?.id !== lastPlayedId.current) {
      console.log('NotificationSound: Playing sound for notification:', lastEvent);
      lastPlayedId.current = lastEvent.data?.id;
      
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => {
          console.warn('Audio playback failed (interaction required?):', err);
        });
      }
    }
  }, [lastEvent]);

  return (
    <audio 
      ref={audioRef} 
      src="/assets/notification-sound/notif-tone.mp3" 
      preload="auto" 
    />
  );
}
