import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAdminNotifications = (isAdmin: boolean) => {
  const orderChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const profileChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playNotificationSound = () => {
    try {
      // Create audio context if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configure the beep sound
      oscillator.frequency.value = 800; // Frequency in Hz
      oscillator.type = 'sine';

      // Envelope for the sound
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;

    // Subscribe to new orders
    orderChannelRef.current = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          const newOrder = payload.new as any;
          playNotificationSound();
          toast.success(
            `New Order Received!`,
            {
              description: `Order from ${newOrder.full_name} - ${newOrder.total_amount.toFixed(3)} KD`,
              duration: 5000,
            }
          );
        }
      )
      .subscribe();

    // Subscribe to new customer profiles
    profileChannelRef.current = supabase
      .channel("admin-profiles")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "profiles",
        },
        (payload) => {
          const newProfile = payload.new as any;
          playNotificationSound();
          toast.info(
            `New Customer Registered!`,
            {
              description: `${newProfile.full_name || 'New user'} has signed up`,
              duration: 5000,
            }
          );
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      if (orderChannelRef.current) {
        supabase.removeChannel(orderChannelRef.current);
      }
      if (profileChannelRef.current) {
        supabase.removeChannel(profileChannelRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isAdmin]);
};
