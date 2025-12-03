import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Play, CheckCircle, Navigation, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDriverLocation } from '@/hooks/useDriverLocation';
import DeliveryPhotoUpload from '@/components/tracking/DeliveryPhotoUpload';

const DriverDashboard = () => {
  const { trackingCode } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const { 
    latitude, 
    longitude, 
    isTracking, 
    error: locationError,
    startTracking, 
    stopTracking 
  } = useDriverLocation(order?.id || '', trackingCode || '');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!trackingCode) return;

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('tracking_code', trackingCode)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          toast.error('Order not found');
          navigate('/driver');
          return;
        }

        setOrder(data);
        setPhotoUrl(data.delivery_photo_url);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [trackingCode, navigate]);

  const handleStartDelivery = async () => {
    startTracking();
    
    // Update order status to on_delivery if not already
    if (order.order_status !== 'on_delivery') {
      await supabase
        .from('orders')
        .update({ order_status: 'on_delivery' })
        .eq('id', order.id);
      
      setOrder((prev: any) => ({ ...prev, order_status: 'on_delivery' }));
    }
    
    toast.success('Delivery started! GPS tracking is active.');
  };

  const handleMarkDelivered = async () => {
    try {
      await stopTracking();
      
      const deliveredAt = new Date().toISOString();
      
      await supabase
        .from('orders')
        .update({ 
          order_status: 'delivered',
          delivered_at: deliveredAt
        })
        .eq('id', order.id);

      setOrder((prev: any) => ({ 
        ...prev, 
        order_status: 'delivered',
        delivered_at: deliveredAt
      }));

      toast.success('Order marked as delivered!');
    } catch (error) {
      console.error('Error marking as delivered:', error);
      toast.error('Failed to update order');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const isDelivered = order.order_status === 'delivered';

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-primary">SWISS ROSE</h1>
          <p className="text-sm text-muted-foreground">Driver Dashboard</p>
        </div>

        {/* Order Info Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Details
              </CardTitle>
              <Badge variant={isDelivered ? 'default' : 'secondary'}>
                {order.order_status?.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Tracking Code</p>
              <p className="font-mono font-medium">{order.tracking_code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="font-medium">{order.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Delivery Address</p>
              <p className="font-medium">{order.address}</p>
              <p className="text-sm text-muted-foreground">{order.city}, {order.governorate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <a href={`tel:${order.phone}`} className="font-medium text-primary">
                {order.phone}
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Tracking Status Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              GPS Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {locationError && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                {locationError}
              </div>
            )}

            {isTracking && latitude && longitude && (
              <div className="bg-primary/10 text-primary text-sm p-3 rounded-lg flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                GPS Active: {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </div>
            )}

            {!isDelivered && !isTracking && (
              <Button 
                onClick={handleStartDelivery} 
                className="w-full"
                size="lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Delivery
              </Button>
            )}

            {isTracking && !isDelivered && (
              <div className="space-y-3">
                <div className="bg-muted/50 p-3 rounded-lg text-sm text-center">
                  Your location is being shared with the customer
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Photo Upload Card */}
        {!isDelivered && (
          <Card>
            <CardContent className="pt-6">
              <DeliveryPhotoUpload
                orderId={order.id}
                onPhotoUploaded={setPhotoUrl}
                existingPhotoUrl={photoUrl}
              />
            </CardContent>
          </Card>
        )}

        {/* Complete Delivery Button */}
        {isTracking && !isDelivered && (
          <Button 
            onClick={handleMarkDelivered} 
            className="w-full"
            size="lg"
            variant="default"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Mark as Delivered
          </Button>
        )}

        {/* Delivered Confirmation */}
        {isDelivered && (
          <Card className="bg-primary/10 border-primary">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-12 w-12 text-primary mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-primary">Delivery Complete!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Delivered at {new Date(order.delivered_at).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
