import Header from "@/components/Header";
import Hero from "@/components/Hero";
import DeliveryOptions from "@/components/DeliveryOptions";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        
        {/* Delivery Options Section */}
        <div className="container mx-auto px-4 -mt-16 relative z-10 max-w-2xl">
          <DeliveryOptions />
        </div>

        {/* Products Section */}
        <ProductGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
