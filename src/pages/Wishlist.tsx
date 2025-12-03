import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

const Wishlist = () => {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    // Load wishlist from localStorage
    const stored = localStorage.getItem(`wishlist_${user?.id || "guest"}`);
    if (stored) {
      setWishlist(JSON.parse(stored));
    }
  }, [user]);

  const removeFromWishlist = (id: string) => {
    const updated = wishlist.filter((item) => item.id !== id);
    setWishlist(updated);
    localStorage.setItem(`wishlist_${user?.id || "guest"}`, JSON.stringify(updated));
    toast.success("Removed from wishlist");
  };

  const moveToCart = (item: WishlistItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
    });
    removeFromWishlist(item.id);
    toast.success("Moved to cart!");
  };

  return (
    <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-24 pb-24 md:pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-playfair font-bold text-primary mb-8">
              My Wishlist
            </h1>

            {wishlist.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
                  <p className="text-muted-foreground mb-4">
                    Save your favorite products and access them anytime for quick ordering
                  </p>
                  <Button asChild>
                    <a href="/products">Browse Products</a>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishlist.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="aspect-square relative">
                      <img
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => removeFromWishlist(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1 line-clamp-1">{item.name}</h3>
                      <p className="text-primary font-bold mb-3">{item.price} KD</p>
                      <Button
                        className="w-full"
                        onClick={() => moveToCart(item)}
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
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

export default Wishlist;
