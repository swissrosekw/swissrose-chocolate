import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  isTracking: boolean;
}

export const useDriverLocation = (orderId: string, trackingCode: string) => {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null,
    isTracking: false,
  });
  
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateLocationInDb = useCallback(async (lat: number, lng: number) => {
    try {
      // Check if a location record exists for this order
      const { data: existing } = await supabase
        .from('driver_locations')
        .select('id')
        .eq('order_id', orderId)
        .maybeSingle();

      if (existing) {
        // Update existing record
        await supabase
          .from('driver_locations')
          .update({
            latitude: lat,
            longitude: lng,
            status: 'out_for_delivery',
          })
          .eq('order_id', orderId);
      } else {
        // Insert new record
        await supabase
          .from('driver_locations')
          .insert({
            order_id: orderId,
            tracking_code: trackingCode,
            latitude: lat,
            longitude: lng,
            status: 'out_for_delivery',
          });
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  }, [orderId, trackingCode]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({ ...prev, error: 'Geolocation is not supported by your browser' }));
      return;
    }

    setLocation(prev => ({ ...prev, isTracking: true, error: null }));

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(prev => ({ ...prev, latitude, longitude }));
        updateLocationInDb(latitude, longitude);
      },
      (error) => {
        setLocation(prev => ({ ...prev, error: error.message }));
      },
      { enableHighAccuracy: true }
    );

    // Watch position changes
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(prev => ({ ...prev, latitude, longitude }));
      },
      (error) => {
        setLocation(prev => ({ ...prev, error: error.message }));
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    // Send updates to database every 10 seconds
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateLocationInDb(latitude, longitude);
        },
        () => {}, // Ignore errors in interval
        { enableHighAccuracy: true }
      );
    }, 10000);
  }, [updateLocationInDb]);

  const stopTracking = useCallback(async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Update status to delivered
    await supabase
      .from('driver_locations')
      .update({ status: 'delivered' })
      .eq('order_id', orderId);

    setLocation(prev => ({ ...prev, isTracking: false }));
  }, [orderId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...location,
    startTracking,
    stopTracking,
  };
};
