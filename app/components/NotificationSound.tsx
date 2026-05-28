import React, { useEffect, useRef } from 'react';
import echo from '../lib/echo';

export default function NotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!echo) return;

    // Listen to global test channel for now
    const channel = echo.channel('test-channel');
    
    channel.listen('.communication.websocket.broadcast', (e: any) => {
      console.log('Notification received:', e);
      
      // Trigger unread count refresh in Layout
      window.dispatchEvent(new CustomEvent('huntr:notification_received'));

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => {
          console.warn('Audio playback failed (interaction required?):', err);
        });
      }
    });

    return () => {
      if (echo) {
        echo.leaveChannel('test-channel');
      }
    };
  }, []);

  return (
    <audio 
      ref={audioRef} 
      src="/assets/notification-sound/notif-tone.mp3" 
      preload="auto" 
    />
  );
}
