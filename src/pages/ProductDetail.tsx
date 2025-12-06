import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { ProductReviews } from "@/components/ProductReviews";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Share2, 
  Mail, 
  Copy, 
  Check,
  MessageCircle
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock_quantity: number;
  is_active: boolean;
  categories: { name: string } | null;
}

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(name)")
      .eq("id", productId)
      .eq("is_active", true)
      .single();
    
    if (error || !data) {
      toast.error("Product not found");
      navigate("/products");
    } else {
      setProduct(data);
    }
    setLoading(false);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        category: product.categories?.name,
      });
    }
    toast.success(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart`);
  };

  const shareViaWhatsApp = () => {
    if (!product) return;
    const message = encodeURIComponent(
      `Check out this amazing product: ${product.name}\n\nPrice: ${product.price} KD\n\n${window.location.href}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const shareViaEmail = () => {
    if (!product) return;
    const subject = encodeURIComponent(`Check out: ${product.name}`);
    const body = encodeURIComponent(
      `I found this product and thought you might like it:\n\n${product.name}\n\n${product.description}\n\nPrice: ${product.price} KD\n\n${window.location.href}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const shareNative = async () => {
    if (!product) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `${product.description}\n\nPrice: ${product.price} KD`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      copyLink();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-24">
          <div className="container mx-auto px-4">
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-24">
        <div className="container mx-auto px-4">
          {/* Back Button & Category */}
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {product.categories?.name && (
              <Badge variant="secondary" className="text-sm">
                {product.categories.name}
              </Badge>
            )}
          </div>

          {/* Product Details */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Image */}
            <div className="relative overflow-hidden rounded-2xl bg-card">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-auto aspect-square object-cover transition-transform hover:scale-105"
              />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-playfair font-bold text-foreground mb-2">
                  {product.name}
                </h1>
                <p className="text-3xl font-bold text-primary">
                  {product.price.toFixed(3)} KD
                </p>
              </div>

              <Separator />

              <div>
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description || "No description available."}
                </p>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${product.stock_quantity > 0 ? 'bg-green-500' : 'bg-destructive'}`} />
                <span className="text-sm text-muted-foreground">
                  {product.stock_quantity > 0 
                    ? `In Stock (${product.stock_quantity} available)` 
                    : 'Out of Stock'}
                </span>
              </div>

              <Separator />

              {/* Quantity Selector */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Quantity</h3>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center text-lg font-semibold">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={product.stock_quantity > 0 && quantity >= product.stock_quantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart */}
              <Button
                size="lg"
                className="w-full gap-2 text-lg"
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
              >
                <ShoppingBag className="h-5 w-5" />
                Add to Cart
              </Button>

              <Separator />

              {/* Share Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Share with Friends</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareViaWhatsApp}
                    className="gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareViaEmail}
                    className="gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyLink}
                    className="gap-2"
                  >
                    {linkCopied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {linkCopied ? 'Copied!' : 'Copy Link'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareNative}
                    className="gap-2 md:hidden"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-16">
            <Separator className="mb-8" />
            <h2 className="text-2xl font-playfair font-bold mb-6">Customer Reviews</h2>
            <ProductReviews productId={product.id} />
          </div>
        </div>
      </main>
      
      <Footer />
      <BottomNav />
    </div>
  );
};

export default ProductDetail;
