import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
const About = () => {
  return <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <div className="relative h-[400px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10" />
          <div className="container mx-auto px-4 h-full flex items-center justify-center relative z-10">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-playfair font-bold text-primary mb-4">
                About Swiss Rose
              </h1>
              <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
                Creating moments of elegance and joy since our beginning
              </p>
            </div>
          </div>
        </div>

        {/* Story Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-playfair font-bold text-center mb-8">Our Story</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Swiss Rose was born from a passion for beauty and a commitment to quality. We believe that 
              every special moment deserves to be celebrated with the finest flowers, the most exquisite 
              chocolates, and the most thoughtful gifts.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Our carefully curated selection combines traditional elegance with contemporary style, 
              ensuring that every product tells a story and creates lasting memories. From romantic 
              bouquets to luxurious chocolate arrangements, each item is chosen with care and presented 
              with love.
            </p>
          </div>
        </div>

        {/* Mission & Values */}
        <div className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌹</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Quality First</h3>
                <p className="text-muted-foreground">
                  We source only the finest flowers and premium chocolates to ensure excellence in every product.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💝</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Elegance</h3>
                <p className="text-muted-foreground">
                  Every arrangement is crafted with attention to detail and an eye for timeless beauty.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎁</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Memorable</h3>
                <p className="text-muted-foreground">
                  We help you create unforgettable moments that will be cherished for years to come.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Location */}
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-playfair font-bold text-center mb-12">Visit Us</h2>
          
          <div className="max-w-4xl mx-auto bg-card border border-border rounded-xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Our Location</h3>
                    <p className="text-muted-foreground">
                      Awaq Al Qurain<br />
                      Mubarak Al-Kabeer Governorate<br />
                      Kuwait
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Opening Hours</h3>
                    <p className="text-muted-foreground">
                      Monday - Saturday: 11:00 AM - 8:00 PM
Sunday: Closed<br />
                      Friday: 2:00 PM - 8:00 PM
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Phone className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Phone</h3>
                    <p className="text-muted-foreground">
                      +965 22280123
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Mail className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Email</h3>
                    <p className="text-muted-foreground">
                      info@swissrosekw.com
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>;
};
export default About;