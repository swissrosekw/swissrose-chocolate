import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { useCart } from "@/hooks/useCart";
import { usePaymentSettings } from "@/hooks/usePaymentSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { KUWAIT_LOCATIONS, Governorate } from "@/constants/kuwaitLocations";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { settings: paymentSettings, isLoading: loadingSettings } = usePaymentSettings();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: user?.email || "",
    governorate: "",
    city: "",
    address: "",
    notes: "",
    paymentMethod: "cod",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (paymentSettings?.cash_on_delivery_enabled) {
      setFormData(prev => ({ ...prev, paymentMethod: 'cod' }));
    } else if (paymentSettings?.tap_payments_enabled) {
      setFormData(prev => ({ ...prev, paymentMethod: 'tap' }));
    }
  }, [paymentSettings]);

  const cities = formData.governorate 
    ? KUWAIT_LOCATIONS[formData.governorate as Governorate] 
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phone || !formData.governorate || !formData.city || !formData.address) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsProcessing(true);

    try {
      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user?.id,
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          governorate: formData.governorate,
          city: formData.city,
          address: formData.address,
          notes: formData.notes,
          payment_method: formData.paymentMethod,
          total_amount: totalPrice,
          items: items as any,
          payment_status: formData.paymentMethod === 'cod' ? 'pending' : 'processing',
          order_status: 'pending',
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Send order confirmation emails
      try {
        await supabase.functions.invoke("send-order-email", {
          body: {
            orderId: order.id,
            customerEmail: formData.email,
            customerName: formData.fullName,
            customerPhone: formData.phone,
            items: items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
            subtotal: totalPrice,
            deliveryFee: 0,
            total: totalPrice,
            address: formData.address,
            city: formData.city,
            governorate: formData.governorate,
            notes: formData.notes,
            paymentMethod: formData.paymentMethod,
            orderStatus: "pending",
          },
        });
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        // Don't fail the order if email fails
      }

      // Handle payment based on method
      if (formData.paymentMethod === 'tap' && paymentSettings?.tap_payments_enabled) {
        const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
          'process-tap-payment',
          {
            body: {
              orderId: order.id,
              amount: totalPrice,
              customerName: formData.fullName,
              customerEmail: formData.email,
              customerPhone: formData.phone,
            },
          }
        );

        if (paymentError) throw paymentError;

        if (paymentData.paymentUrl) {
          // Redirect to payment page
          window.location.href = paymentData.paymentUrl;
          return;
        }
      }

      // For COD or after successful payment setup
      toast.success("Order placed successfully!");
      clearCart();
      navigate("/");
    } catch (error) {
      console.error('Order error:', error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-playfair font-bold mb-4">Your cart is empty</h1>
            <Button asChild>
              <a href="/products">Continue Shopping</a>
            </Button>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-playfair font-bold text-primary mb-8">
            Checkout
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData({ ...formData, fullName: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="governorate">Governorate *</Label>
                        <Select
                          value={formData.governorate}
                          onValueChange={(value) =>
                            setFormData({ ...formData, governorate: value, city: "" })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select governorate" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(KUWAIT_LOCATIONS).map((gov) => (
                              <SelectItem key={gov} value={gov}>
                                {gov}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city">City/Area *</Label>
                        <Select
                          value={formData.city}
                          onValueChange={(value) =>
                            setFormData({ ...formData, city: value })
                          }
                          disabled={!formData.governorate}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        placeholder="Block, Street, House/Building No."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Order Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        placeholder="Special delivery instructions, card message, etc."
                        rows={4}
                      />
                    </div>

                    {loadingSettings ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3">
                          <Label>Payment Method *</Label>
                          <RadioGroup
                            value={formData.paymentMethod}
                            onValueChange={(value) =>
                              setFormData({ ...formData, paymentMethod: value })
                            }
                          >
                            {paymentSettings?.cash_on_delivery_enabled && (
                              <div className="flex items-center space-x-2 border rounded-lg p-4">
                                <RadioGroupItem value="cod" id="cod" />
                                <Label htmlFor="cod" className="flex-1 cursor-pointer">
                                  <div className="font-medium">Cash on Delivery</div>
                                  <div className="text-sm text-muted-foreground">
                                    Pay when you receive your order
                                  </div>
                                </Label>
                              </div>
                            )}
                            
                            {paymentSettings?.tap_payments_enabled && (
                              <div className="flex items-center space-x-2 border rounded-lg p-4">
                                <RadioGroupItem value="tap" id="tap" />
                                <Label htmlFor="tap" className="flex-1 cursor-pointer">
                                  <div className="font-medium">Online Payment</div>
                                  <div className="text-sm text-muted-foreground">
                                    Pay with KNET or Credit Card via Tap
                                  </div>
                                </Label>
                              </div>
                            )}
                          </RadioGroup>
                        </div>

                        <Button 
                          type="submit" 
                          size="lg" 
                          className="w-full"
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : formData.paymentMethod === 'tap' ? (
                            'Proceed to Payment'
                          ) : (
                            'Place Order'
                          )}
                        </Button>
                      </>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="font-medium">
                          {(item.price * item.quantity).toFixed(3)} KD
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{totalPrice.toFixed(3)} KD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span className="text-green-600">Free</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">{totalPrice.toFixed(3)} KD</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Checkout;
