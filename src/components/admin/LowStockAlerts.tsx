import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Package } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  stock_quantity: number;
  image_url: string | null;
}

export const LowStockAlerts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const LOW_STOCK_THRESHOLD = 5;

  useEffect(() => {
    fetchLowStockProducts();
  }, []);

  const fetchLowStockProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("id, name, stock_quantity, image_url")
      .lte("stock_quantity", LOW_STOCK_THRESHOLD)
      .eq("is_active", true)
      .order("stock_quantity", { ascending: true });

    if (error) {
      console.error("Error fetching low stock products:", error);
      toast.error("Failed to load low stock alerts");
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const getStockBadgeVariant = (stock: number) => {
    if (stock === 0) return "destructive";
    if (stock <= 2) return "destructive";
    if (stock <= 5) return "secondary";
    return "default";
  };

  const getStockStatusText = (stock: number) => {
    if (stock === 0) return "Out of Stock";
    if (stock <= 2) return "Critical";
    if (stock <= 5) return "Low Stock";
    return "In Stock";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Low Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>All products are well stocked! 🎉</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Low Stock Alerts
            <Badge variant="destructive">{products.length}</Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-12 w-12 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <div className="font-semibold">{product.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getStockBadgeVariant(product.stock_quantity)}>
                      {getStockStatusText(product.stock_quantity)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {product.stock_quantity} {product.stock_quantity === 1 ? "unit" : "units"} left
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  toast.info("Navigate to Products tab to update stock");
                }}
              >
                Update Stock
              </Button>
            </div>
          ))}
        </div>

        {products.filter((p) => p.stock_quantity === 0).length > 0 && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 text-destructive font-semibold">
              <AlertTriangle className="h-5 w-5" />
              Urgent: {products.filter((p) => p.stock_quantity === 0).length} product(s) out of
              stock!
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              These products won't be visible to customers. Please restock immediately.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
