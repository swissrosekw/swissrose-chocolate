import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Admin from "./pages/Admin";
import Checkout from "./pages/Checkout";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import CMSPage from "./pages/CMSPage";
import MyOrders from "./pages/MyOrders";
import Wishlist from "./pages/Wishlist";
import CustomBouquet from "./pages/CustomBouquet";
import NotFound from "./pages/NotFound";
import DriverLogin from "./pages/DriverLogin";
import DriverQREntry from "./pages/DriverQREntry";
import DriverDashboard from "./pages/DriverDashboard";
import TrackOrder from "./pages/TrackOrder";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:productId" element={<ProductDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              <Route path="/page/:slug" element={<CMSPage />} />
              <Route path="/custom-bouquet" element={<CustomBouquet />} />
              <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
              <Route path="/wishlist" element={<Wishlist />} />
              {/* Driver Portal Routes */}
              <Route path="/driver" element={<DriverLogin />} />
              <Route path="/driver/qr/:driverCode" element={<DriverQREntry />} />
              <Route path="/driver/dashboard/:trackingCode" element={<DriverDashboard />} />
              {/* Customer Tracking Route */}
              <Route path="/track/:trackingCode" element={<TrackOrder />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
