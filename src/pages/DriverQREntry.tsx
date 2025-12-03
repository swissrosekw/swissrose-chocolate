import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, Camera, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const DriverQREntry = () => {
  const { driverCode } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<any>(null);
  
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agreeLocation, setAgreeLocation] = useState(false);
  const [agreePhoto, setAgreePhoto] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!driverCode) return;

      try {
        const normalizedCode = driverCode?.toUpperCase();
        const { data, error } = await supabase
          .from('orders')
          .select('id, tracking_code, order_status, governorate, city, driver_name')
          .eq('driver_code', normalizedCode)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          toast.error('Invalid driver code');
          navigate('/driver');
          return;
        }

        if (data.order_status === 'delivered') {
          toast.error('This order has already been delivered');
          navigate('/driver');
          return;
        }

        // If driver already registered, go to dashboard
        if (data.driver_name) {
          navigate(`/driver/dashboard/${data.tracking_code}`);
          return;
        }

        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [driverCode, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phoneNumber.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!agreeLocation) {
      toast.error('Please agree to location tracking');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          driver_name: fullName,
          driver_phone: phoneNumber,
        })
        .eq('id', order.id);

      if (error) throw error;

      toast.success('Registration complete!');
      navigate(`/driver/dashboard/${order.tracking_code}`);
    } catch (error) {
      console.error('Error saving driver info:', error);
      toast.error('Failed to save information');
    } finally {
      setSubmitting(false);
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

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Driver Registration</CardTitle>
            <CardDescription>
              Complete your registration to start the delivery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-3 mb-4">
              <p className="text-sm text-muted-foreground">Delivery to:</p>
              <p className="font-medium">{order.city}, {order.governorate}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="+965 XXXX XXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10"
                    inputMode="tel"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <p className="text-sm font-medium">Consent & Agreements</p>
                
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="agreeLocation"
                    checked={agreeLocation}
                    onCheckedChange={(checked) => setAgreeLocation(checked as boolean)}
                  />
                  <label htmlFor="agreeLocation" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    I agree to temporary GPS location tracking until delivery is completed
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="agreePhoto"
                    checked={agreePhoto}
                    onCheckedChange={(checked) => setAgreePhoto(checked as boolean)}
                  />
                  <label htmlFor="agreePhoto" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                    <Camera className="inline h-4 w-4 mr-1" />
                    I agree to capture a photo of the delivered item (optional)
                  </label>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={submitting || !agreeLocation}
              >
                {submitting ? 'Saving...' : 'Continue to Dashboard'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriverQREntry;
