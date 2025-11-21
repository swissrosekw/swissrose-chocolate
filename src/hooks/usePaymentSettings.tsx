import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PaymentSettings {
  id: string;
  cash_on_delivery_enabled: boolean;
  online_payment_enabled: boolean;
  tap_payments_enabled: boolean;
  tap_payments_api_key: string | null;
}

export const usePaymentSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['payment-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .single();

      if (error) throw error;
      return data as PaymentSettings;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<PaymentSettings>) => {
      const { data, error } = await supabase
        .from('payment_settings')
        .update(updates)
        .eq('id', settings?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
      toast.success('Payment settings updated');
    },
    onError: (error) => {
      toast.error('Failed to update settings');
      console.error('Update error:', error);
    },
  });

  return {
    settings,
    isLoading,
    updateSettings: updateSettings.mutate,
  };
};