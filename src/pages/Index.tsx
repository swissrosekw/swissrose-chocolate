import Header from "@/components/Header";
import Hero from "@/components/Hero";
import DeliveryOptions from "@/components/DeliveryOptions";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import SocialMediaButtons from "@/components/SocialMediaButtons";
import BottomNav from "@/components/BottomNav";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-24">
        <Hero />
        
        {/* Delivery Options Section */}
        <div className="container mx-auto px-4 -mt-16 relative z-10 max-w-2xl">
          <DeliveryOptions />
        </div>

        {/* Products Section */}
        <ProductGrid />
      </main>
      <Footer />
      <SocialMediaButtons />
      <BottomNav />
    </div>
  );
};

export default Index;
