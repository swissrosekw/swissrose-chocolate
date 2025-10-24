import heroImage from "@/assets/hero-chocolate.jpg";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4 animate-fade-in">
        <p className="text-sm tracking-[0.3em] text-primary uppercase mb-4 font-medium">
          Haven Chocolate
        </p>
        <h2 className="text-5xl md:text-7xl font-playfair font-bold text-foreground mb-6 tracking-tight">
          Indulge in Elegance
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
          Experience the finest handcrafted chocolates and premium gifts. 
          Where luxury meets artistry.
        </p>
        <Button 
          size="lg" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-6 text-lg rounded-full transition-all hover:scale-105"
        >
          Explore Collection
        </Button>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
