import { Link, useLocation } from "react-router-dom";
import { Home, Grid, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

const BottomNav = () => {
  const location = useLocation();
  const { totalItems } = useCart();
  const { user } = useAuth();

  const navItems = [
    {
      label: "Home",
      icon: Home,
      route: "/",
    },
    {
      label: "Categories",
      icon: Grid,
      route: "/products",
    },
    {
      label: "Cart",
      icon: ShoppingCart,
      route: "/cart",
      showBadge: true,
    },
    {
      label: "Profile",
      icon: User,
      route: user ? "/profile" : "/auth",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-sm border-t border-border shadow-lg animate-in slide-in-from-bottom duration-500">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.route;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.route}
              to={item.route}
              className="flex-1 flex flex-col items-center gap-1 py-2 transition-colors"
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <Icon 
                  className={`h-6 w-6 transition-all duration-300 ${
                    isActive 
                      ? "text-primary animate-in zoom-in-50 duration-300" 
                      : "text-muted-foreground"
                  }`}
                />
                {item.showBadge && totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-in fade-in zoom-in">
                    {totalItems}
                  </span>
                )}
              </div>
              <span 
                className={`text-xs font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
