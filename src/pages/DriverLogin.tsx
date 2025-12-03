import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Key, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const DriverLogin = () => {
  const [driverCode, setDriverCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedCode = driverCode.trim().toUpperCase();
    const trimmedPassword = password.trim();

    if (!trimmedCode || !trimmedPassword) {
      toast.error('Please enter both driver code and password');
      return;
    }

    setLoading(true);
    console.log('DriverLogin - Attempting login with code:', trimmedCode, 'password length:', trimmedPassword.length);

    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select('id, tracking_code, order_status, driver_name, driver_code, driver_password')
        .eq('driver_code', trimmedCode)
        .eq('driver_password', trimmedPassword)
        .maybeSingle();

      console.log('DriverLogin - Query result:', { order, error });

      if (error) {
        console.error('DriverLogin - Database error:', error);
        throw error;
      }

      if (!order) {
        // Let's also check if the code exists at all to give better feedback
        const { data: codeCheck } = await supabase
          .from('orders')
          .select('id, driver_code')
          .eq('driver_code', trimmedCode)
          .maybeSingle();
        
        console.log('DriverLogin - Code check result:', codeCheck);
        
        if (!codeCheck) {
          toast.error(`Invalid driver code: ${trimmedCode}`);
        } else {
          toast.error('Invalid password');
        }
        return;
      }

      console.log('DriverLogin - Order found:', order);

      if (order.order_status === 'delivered') {
        toast.error('This order has already been delivered');
        return;
      }

      // If driver info not filled yet, redirect to QR entry page
      if (!order.driver_name) {
        console.log('DriverLogin - Redirecting to QR entry for registration');
        navigate(`/driver/qr/${trimmedCode}`);
      } else {
        console.log('DriverLogin - Redirecting to dashboard');
        navigate(`/driver/dashboard/${order.tracking_code}`);
      }
    } catch (error) {
      console.error('DriverLogin - Login error:', error);
      toast.error('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Truck className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Driver Portal</CardTitle>
          <CardDescription>
            Enter your driver code and password to start delivery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="driverCode">Driver Code</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="driverCode"
                  placeholder="DRV-XXXX"
                  value={driverCode}
                  onChange={(e) => setDriverCode(e.target.value.toUpperCase())}
                  className="pl-10"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="4-digit PIN"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  maxLength={4}
                  inputMode="numeric"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverLogin;
