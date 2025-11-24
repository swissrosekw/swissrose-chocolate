import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";

const phoneSchema = z.object({
  phone: z.string()
    .regex(/^\+965[0-9]{8}$/, "Phone must start with +965 and have 8 digits after"),
  fullName: z.string().min(2, "Name must be at least 2 characters").optional(),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: "+965",
      fullName: "",
    },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const handleSendOTP = async (values: z.infer<typeof phoneSchema>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp-otp', {
        body: { phone: values.phone },
      });

      if (error) throw error;

      setPhoneNumber(values.phone);
      setOtpSent(true);
      toast.success("OTP sent to your WhatsApp!");
    } catch (error: any) {
      console.error('OTP send error:', error);
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (values: z.infer<typeof otpSchema>) => {
    setIsLoading(true);
    try {
      const fullName = phoneForm.getValues("fullName");
      
      const { data, error } = await supabase.functions.invoke('verify-whatsapp-otp', {
        body: { 
          phone: phoneNumber, 
          otp: values.otp,
          fullName: fullName || undefined
        },
      });

      if (error) throw error;

      if (data?.session?.properties?.action_link) {
        // Use the magic link to sign in
        const actionLink = data.session.properties.action_link;
        const url = new URL(actionLink);
        const token = url.searchParams.get('token');
        const type = url.searchParams.get('type');
        
        if (token && type) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type as any,
          });

          if (verifyError) throw verifyError;
        }
      }

      toast.success(data?.isNewUser ? "Account created successfully!" : "Signed in successfully!");
      navigate("/");
    } catch (error: any) {
      console.error('OTP verify error:', error);
      toast.error(error.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    await handleSendOTP(phoneForm.getValues());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-playfair text-primary">SWISS ROSE</CardTitle>
          <CardDescription>
            {otpSent ? "Enter the code sent to your WhatsApp" : "Sign in with WhatsApp"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!otpSent ? (
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(handleSendOTP)} className="space-y-4">
                <FormField
                  control={phoneForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+96512345678" 
                          {...field}
                          onChange={(e) => {
                            let value = e.target.value;
                            if (!value.startsWith('+965')) {
                              value = '+965' + value.replace(/^\+?965?/, '');
                            }
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={phoneForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(handleVerifyOTP)} className="space-y-4">
                <FormField
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="000000" 
                          maxLength={6}
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </Button>
                
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                  >
                    Resend OTP
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setOtpSent(false);
                      otpForm.reset();
                    }}
                  >
                    Change Phone Number
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
