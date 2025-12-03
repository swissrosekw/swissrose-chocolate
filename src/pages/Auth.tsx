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
import BottomNav from "@/components/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Mail } from "lucide-react";

const phoneSchema = z.object({
  phone: z
    .string()
    .regex(/^\+965[0-9]{8}$/, "Phone must start with +965 and have 8 digits after"),
  fullName: z.string().min(2, "Name must be at least 2 characters").optional(),
});

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().min(2, "Name must be at least 2 characters").optional(),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type AuthMethod = "whatsapp" | "email";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email");
  const [identifier, setIdentifier] = useState(""); // phone or email
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

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
      fullName: "",
    },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const [otpInputId] = useState(() => `otp-input-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (otpSent) {
      otpForm.setValue("otp", "");
    }
  }, [otpSent, otpForm]);

  const handleSendPhoneOTP = async (values: z.infer<typeof phoneSchema>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-whatsapp-otp", {
        body: { phone: values.phone },
      });

      if (error) throw error;

      setIdentifier(values.phone);
      setAuthMethod("whatsapp");
      otpForm.reset({ otp: "" });
      setOtpSent(true);
      toast.success("OTP sent to your WhatsApp!");
    } catch (error: any) {
      console.error("OTP send error:", error);
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmailOTP = async (values: z.infer<typeof emailSchema>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-email-otp", {
        body: { email: values.email, fullName: values.fullName },
      });

      if (error) throw error;

      setIdentifier(values.email);
      setAuthMethod("email");
      otpForm.reset({ otp: "" });
      setOtpSent(true);
      toast.success("OTP sent to your email!");
    } catch (error: any) {
      console.error("OTP send error:", error);
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (values: z.infer<typeof otpSchema>) => {
    setIsLoading(true);
    try {
      const fullName = authMethod === "whatsapp" 
        ? phoneForm.getValues("fullName") 
        : emailForm.getValues("fullName");

      const functionName = authMethod === "whatsapp" ? "verify-whatsapp-otp" : "verify-email-otp";
      const body = authMethod === "whatsapp" 
        ? { phone: identifier, otp: values.otp, fullName: fullName || undefined }
        : { email: identifier, otp: values.otp, fullName: fullName || undefined };

      const { data, error } = await supabase.functions.invoke(functionName, { body });

      if (error) throw error;

      // Handle WhatsApp action link
      if (authMethod === "whatsapp" && data?.session?.properties?.action_link) {
        const actionLink = data.session.properties.action_link;
        const url = new URL(actionLink);
        const token = url.searchParams.get("token");
        const type = url.searchParams.get("type");

        if (token && type) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type as any,
          });

          if (verifyError) throw verifyError;
        }
      }

      // Handle email session
      if (authMethod === "email" && data?.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      toast.success(data?.isNewUser ? "Account created successfully!" : "Signed in successfully!");
      navigate("/");
    } catch (error: any) {
      console.error("OTP verify error:", error);
      toast.error(error.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (authMethod === "whatsapp") {
      await handleSendPhoneOTP(phoneForm.getValues());
    } else {
      await handleSendEmailOTP(emailForm.getValues());
    }
  };

  const resetToMethodSelection = () => {
    setOtpSent(false);
    otpForm.reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 pb-20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-playfair text-primary">SWISS ROSE</CardTitle>
          <CardDescription>
            {otpSent 
              ? `Enter the code sent to your ${authMethod === "whatsapp" ? "WhatsApp" : "email"}` 
              : "Sign in to continue"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!otpSent ? (
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="whatsapp" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  WhatsApp
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email">
                <Form {...emailForm} key="email-form">
                  <form onSubmit={emailForm.handleSubmit(handleSendEmailOTP)} className="space-y-4">
                    <FormField
                      control={emailForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailForm.control}
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
              </TabsContent>

              <TabsContent value="whatsapp">
                <Form {...phoneForm} key="phone-form">
                  <form onSubmit={phoneForm.handleSubmit(handleSendPhoneOTP)} className="space-y-4">
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
                                if (!value.startsWith("+965")) {
                                  value = "+965" + value.replace(/^\+?965?/, "");
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
              </TabsContent>
            </Tabs>
          ) : (
            <Form {...otpForm} key="otp-form">
              <form
                onSubmit={otpForm.handleSubmit(handleVerifyOTP)}
                className="space-y-4"
                autoComplete="off"
              >
                <FormField
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <Input
                          id={otpInputId}
                          placeholder="Enter your 6-digit code"
                          maxLength={6}
                          value={field.value}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            field.onChange(value);
                          }}
                          autoComplete="off"
                          data-form-type="other"
                          name="otp-verification-code"
                          inputMode="numeric"
                          className="text-center text-lg tracking-widest"
                          autoFocus
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
                    onClick={resetToMethodSelection}
                  >
                    Change {authMethod === "whatsapp" ? "Phone Number" : "Email"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
      <BottomNav />
    </div>
  );
};

export default Auth;
