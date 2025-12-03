import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { QRCodeSVG } from "qrcode.react";
import { Copy, QrCode, Link, Truck, User, Phone } from "lucide-react";
import { generateAllTrackingCodes } from "@/lib/trackingUtils";

type Order = Tables<"orders">;

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedOrderForQR, setSelectedOrderForQR] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (statusFilter !== "all") {
      query = query.eq("order_status", statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Failed to load orders");
      console.error("Error fetching orders:", error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const generateTrackingCodesForOrder = async (orderId: string) => {
    const codes = generateAllTrackingCodes();
    
    const { error } = await supabase
      .from("orders")
      .update(codes)
      .eq("id", orderId);

    if (error) {
      console.error("Error generating tracking codes:", error);
      throw error;
    }

    return codes;
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    let updateData: any = { order_status: newStatus };

    // Generate tracking codes when status changes to on_delivery
    if (newStatus === "on_delivery" && !order.tracking_code) {
      const codes = generateAllTrackingCodes();
      updateData = { ...updateData, ...codes };
    }

    const { error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update order status");
      console.error("Error updating order:", error);
    } else {
      toast.success("Order status updated");
      
      // Send email notification to customer
      try {
        await supabase.functions.invoke("send-order-email", {
          body: {
            orderId: order.id,
            customerEmail: order.email || "",
            customerName: order.full_name,
            customerPhone: order.phone,
            items: order.items as any[],
            subtotal: order.total_amount,
            deliveryFee: 0,
            total: order.total_amount,
            address: order.address,
            city: order.city,
            governorate: order.governorate,
            notes: order.notes || "",
            paymentMethod: order.payment_method,
            orderStatus: newStatus,
          },
        });
      } catch (emailError) {
        console.error("Error sending email:", emailError);
      }
      
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, order_status: newStatus, ...updateData });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "accepted":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "preparing":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "on_delivery":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "pending":
        return "accepted";
      case "accepted":
        return "preparing";
      case "preparing":
        return "on_delivery";
      case "on_delivery":
        return "delivered";
      default:
        return null;
    }
  };

  const getStatusButtonText = (currentStatus: string) => {
    switch (currentStatus) {
      case "pending":
        return "✅ Accept Order";
      case "accepted":
        return "🍳 Start Preparing";
      case "preparing":
        return "🚚 Out for Delivery";
      case "on_delivery":
        return "✔️ Mark Delivered";
      default:
        return null;
    }
  };

  const getBaseUrl = () => {
    return window.location.origin;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getDriverQRUrl = (driverCode: string) => {
    return `${getBaseUrl()}/driver/qr/${driverCode}`;
  };

  const getCustomerTrackingUrl = (trackingCode: string) => {
    return `${getBaseUrl()}/track/${trackingCode}`;
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">Manage customer orders</p>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="on_delivery">On Delivery</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Orders ({orders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : orders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No orders found</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tracking</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">
                          {order.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="font-medium">{order.full_name}</TableCell>
                        <TableCell>{order.phone}</TableCell>
                        <TableCell className="font-bold text-primary">
                          {order.total_amount.toFixed(3)} KD
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.order_status || "pending")}>
                            {order.order_status || "pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {order.tracking_code ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedOrderForQR(order);
                                setQrDialogOpen(true);
                              }}
                            >
                              <QrCode className="h-4 w-4 mr-1" />
                              {order.tracking_code}
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(order.created_at || "").toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedOrder(order);
                                setDialogOpen(true);
                              }}
                            >
                              View
                            </Button>
                            {order.order_status !== "cancelled" && order.order_status !== "delivered" && (
                              <>
                                {getNextStatus(order.order_status || "pending") && (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => updateOrderStatus(order.id, getNextStatus(order.order_status || "pending")!)}
                                  >
                                    {getStatusButtonText(order.order_status || "pending")}
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateOrderStatus(order.id, "cancelled")}
                                >
                                  ❌ Cancel
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-mono text-xs">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedOrder.order_status || "pending")}>
                    {selectedOrder.order_status}
                  </Badge>
                </div>
              </div>

              {/* Tracking Section */}
              {selectedOrder.tracking_code && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Tracking Information
                  </h4>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Customer Tracking Link</p>
                        <p className="font-mono text-xs">{selectedOrder.tracking_code}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(getCustomerTrackingUrl(selectedOrder.tracking_code!), "Tracking link")}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy Link
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Driver Code</p>
                        <p className="font-mono">{selectedOrder.driver_code}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(`Code: ${selectedOrder.driver_code} | PIN: ${selectedOrder.driver_password}`, "Driver credentials")}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    {selectedOrder.driver_name && (
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Driver Assigned</p>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {selectedOrder.driver_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {selectedOrder.driver_phone}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Customer Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Name:</span> {selectedOrder.full_name}</p>
                  <p><span className="text-muted-foreground">Phone:</span> {selectedOrder.phone}</p>
                  {selectedOrder.email && <p><span className="text-muted-foreground">Email:</span> {selectedOrder.email}</p>}
                  <p><span className="text-muted-foreground">Address:</span> {selectedOrder.address}</p>
                  <p><span className="text-muted-foreground">City:</span> {selectedOrder.city}</p>
                  <p><span className="text-muted-foreground">Governorate:</span> {selectedOrder.governorate}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Order Items</h4>
                <div className="space-y-2">
                  {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-bold">{(item.price * item.quantity).toFixed(3)} KD</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <p className="font-semibold">Total Amount:</p>
                  <p className="text-2xl font-bold text-primary">{selectedOrder.total_amount.toFixed(3)} KD</p>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Payment Method: {selectedOrder.payment_method}
                </p>
                {selectedOrder.notes && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">Notes:</p>
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Driver QR Code & Links
            </DialogTitle>
          </DialogHeader>
          {selectedOrderForQR && selectedOrderForQR.driver_code && (
            <div className="space-y-4">
              {/* QR Code */}
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <QRCodeSVG
                  value={getDriverQRUrl(selectedOrderForQR.driver_code)}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>
              
              <p className="text-sm text-center text-muted-foreground">
                Driver scans this QR code to start delivery
              </p>

              {/* Driver Credentials */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Driver Code</p>
                    <p className="font-mono font-bold">{selectedOrderForQR.driver_code}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(selectedOrderForQR.driver_code!, "Driver code")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Driver PIN</p>
                    <p className="font-mono font-bold">{selectedOrderForQR.driver_password}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(selectedOrderForQR.driver_password!, "Driver PIN")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Links */}
              <div className="space-y-2 border-t pt-4">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => copyToClipboard(getCustomerTrackingUrl(selectedOrderForQR.tracking_code!), "Customer tracking link")}
                >
                  <Link className="h-4 w-4 mr-2" />
                  Copy Customer Tracking Link
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => copyToClipboard(getDriverQRUrl(selectedOrderForQR.driver_code!), "Driver QR link")}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Copy Driver QR Link
                </Button>
              </div>

              {/* Driver Info if assigned */}
              {selectedOrderForQR.driver_name && (
                <div className="p-3 bg-primary/10 rounded-lg border-t">
                  <p className="text-sm font-medium mb-1">Driver Assigned:</p>
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {selectedOrderForQR.driver_name}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {selectedOrderForQR.driver_phone}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrderManagement;
