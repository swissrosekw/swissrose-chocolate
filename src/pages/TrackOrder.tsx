import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Package, MapPin, Clock, Image } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import DriverTrackingMap from '@/components/tracking/DriverTrackingMap';
import TrackingTimeline from '@/components/tracking/TrackingTimeline';

const TrackOrder = () => {
  const { trackingCode } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [driverLocation, setDriverLocation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch order and driver location
  useEffect(() => {
    const fetchData = async () => {
      if (!trackingCode) return;

      try {
        // Fetch order
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('tracking_code', trackingCode)
          .maybeSingle();

        if (orderError) throw orderError;

        if (!orderData) {
          setError('Order not found. Please check your tracking code.');
          setLoading(false);
          return;
        }

        setOrder(orderData);

        // Fetch driver location
        const { data: locationData } = await supabase
          .from('driver_locations')
          .select('*')
          .eq('tracking_code', trackingCode)
          .maybeSingle();

        if (locationData) {
          setDriverLocation(locationData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load tracking information');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [trackingCode]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!trackingCode) return;

    const channel = supabase
      .channel(`tracking-${trackingCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_locations',
          filter: `tracking_code=eq.${trackingCode}`,
        },
        (payload) => {
          if (payload.new) {
            setDriverLocation(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `tracking_code=eq.${trackingCode}`,
        },
        (payload) => {
          if (payload.new) {
            setOrder(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [trackingCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Tracking Not Found</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isDelivered = order?.order_status === 'delivered';
  const isOutForDelivery = order?.order_status === 'on_delivery';
  const hasDriverLocation = driverLocation?.latitude && driverLocation?.longitude;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6 px-4 text-center">
        <h1 className="text-2xl font-bold">SWISS ROSE</h1>
        <p className="text-sm opacity-90">Order Tracking</p>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Tracking Code */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tracking Code</p>
                <p className="text-xl font-mono font-bold">{trackingCode}</p>
              </div>
              <Package className="h-10 w-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <TrackingTimeline 
              status={order?.order_status || 'pending'} 
              deliveredAt={order?.delivered_at}
            />
          </CardContent>
        </Card>

        {/* Live Map */}
        {(isOutForDelivery || isDelivered) && hasDriverLocation && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {isDelivered ? 'Delivery Location' : 'Live Driver Location'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DriverTrackingMap
                latitude={driverLocation.latitude}
                longitude={driverLocation.longitude}
                status={driverLocation.status}
              />
              {!isDelivered && (
                <p className="text-sm text-muted-foreground text-center mt-3">
                  <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse mr-2" />
                  Location updates every 10 seconds
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Waiting for driver */}
        {isOutForDelivery && !hasDriverLocation && (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Waiting for driver location...</p>
            </CardContent>
          </Card>
        )}

        {/* Delivery Complete Info */}
        {isDelivered && (
          <Card className="bg-primary/5 border-primary">
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-primary">Delivered!</h3>
                {order?.delivered_at && (
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                    <Clock className="h-4 w-4" />
                    {new Date(order.delivered_at).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Delivery Photo */}
              {order?.delivery_photo_url && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Image className="h-4 w-4" />
                    Delivery Photo
                  </p>
                  <img 
                    src={order.delivery_photo_url} 
                    alt="Delivery confirmation" 
                    className="w-full rounded-lg border border-border"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium">{order?.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Area</span>
              <span className="font-medium">{order?.city}, {order?.governorate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">{order?.total_amount} KWD</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrackOrder;
