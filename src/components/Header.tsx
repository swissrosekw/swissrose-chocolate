import { ShoppingBag, MapPin, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-playfair font-bold text-primary">HAVEN</h1>
          </div>

          {/* Navigation Icons */}
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
              <MapPin className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
              <ShoppingBag className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-foreground hover:text-primary md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
