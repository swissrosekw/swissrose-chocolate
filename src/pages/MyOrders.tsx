import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Clock, CheckCircle, Truck, XCircle, RotateCcw } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  order_status: string | null;
  payment_status: string | null;
  payment_method: string;
  items: unknown;
  full_name: string;
  address: string;
  city: string;
  governorate: string;
}

const MyOrders = () => {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4" />;
      case "preparing":
        return <Package className="h-4 w-4" />;
      case "on_delivery":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "accepted":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "preparing":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "on_delivery":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      case "delivered":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleReorder = (order: Order) => {
    const items = Array.isArray(order.items) ? order.items : [];
    items.forEach((item: any) => {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        image_url: item.image_url || "",
      });
    });
    toast.success("Items added to cart!");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-24 md:pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-playfair font-bold text-primary mb-4">
              Please sign in to view your orders
            </h1>
            <Button asChild>
              <a href="/auth">Sign In</a>
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

        <main className="pt-24 pb-24 md:pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-playfair font-bold text-primary mb-8">
              My Orders
            </h1>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
                  <p className="text-muted-foreground mb-4">
                    Start shopping to see your orders here
                  </p>
                  <Button asChild>
                    <a href="/products">Browse Products</a>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader className="pb-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <CardTitle className="text-lg">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </CardTitle>
                        <Badge className={getStatusColor(order.order_status)}>
                          {getStatusIcon(order.order_status)}
                          <span className="ml-1 capitalize">
                            {order.order_status?.replace("_", " ")}
                          </span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(order.items) &&
                            order.items.map((item: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2"
                              >
                                {item.image_url && (
                                  <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-10 h-10 object-cover rounded"
                                  />
                                )}
                                <div>
                                  <p className="text-sm font-medium">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    x{item.quantity} • {item.price} KD
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {order.address}, {order.city}, {order.governorate}
                            </p>
                            <p className="text-sm font-medium">
                              Total: {order.total_amount} KD
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReorder(order)}
                            className="mt-2 sm:mt-0"
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Reorder
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>

        <Footer />
        <BottomNav />
      </div>
  );
};

export default MyOrders;
