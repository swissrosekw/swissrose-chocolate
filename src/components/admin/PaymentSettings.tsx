import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePaymentSettings } from '@/hooks/usePaymentSettings';
import { Loader2 } from 'lucide-react';

const PaymentSettings = () => {
  const { settings, isLoading, updateSettings } = usePaymentSettings();
  const [apiKey, setApiKey] = useState('');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const handleToggle = (field: string, value: boolean) => {
    updateSettings({ [field]: value });
  };

  const handleApiKeyUpdate = () => {
    if (!apiKey.trim()) return;
    updateSettings({ tap_payments_api_key: apiKey });
    setApiKey('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Enable or disable payment methods for your store
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="cod">Cash on Delivery</Label>
              <p className="text-sm text-muted-foreground">
                Allow customers to pay when they receive their order
              </p>
            </div>
            <Switch
              id="cod"
              checked={settings?.cash_on_delivery_enabled ?? true}
              onCheckedChange={(checked) =>
                handleToggle('cash_on_delivery_enabled', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="online">Online Payment (KNET/Credit Card)</Label>
              <p className="text-sm text-muted-foreground">
                Enable online payment gateway
              </p>
            </div>
            <Switch
              id="online"
              checked={settings?.online_payment_enabled ?? false}
              onCheckedChange={(checked) =>
                handleToggle('online_payment_enabled', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="tap">Tap Payments</Label>
              <p className="text-sm text-muted-foreground">
                Enable Tap payment gateway for KNET and credit cards
              </p>
            </div>
            <Switch
              id="tap"
              checked={settings?.tap_payments_enabled ?? false}
              onCheckedChange={(checked) =>
                handleToggle('tap_payments_enabled', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {settings?.tap_payments_enabled && (
        <Card>
          <CardHeader>
            <CardTitle>Tap Payments Configuration</CardTitle>
            <CardDescription>
              Configure your Tap Payments API credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tap-api-key">Tap Payments API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="tap-api-key"
                  type="password"
                  placeholder={
                    settings?.tap_payments_api_key
                      ? '••••••••••••••••'
                      : 'sk_test_...'
                  }
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <Button onClick={handleApiKeyUpdate}>
                  {settings?.tap_payments_api_key ? 'Update' : 'Save'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Get your API key from{' '}
                <a
                  href="https://dashboard.tap.company"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Tap Dashboard
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentSettings;