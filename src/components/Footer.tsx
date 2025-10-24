import { Instagram, Facebook, Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-playfair font-bold text-primary mb-4">HAVEN</h3>
            <p className="text-sm text-muted-foreground">
              Indulge in elegance with our handcrafted luxury chocolates and premium gifts.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-primary transition-colors cursor-pointer">About Us</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Products</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Catering</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Contact</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Get in Touch</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                <Phone className="h-4 w-4" />
                <span>+965 1234 5678</span>
              </li>
              <li className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                <Mail className="h-4 w-4" />
                <span>hello@havenchocolate.com</span>
              </li>
            </ul>
            <div className="flex gap-4 mt-4">
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                <Instagram className="h-5 w-5" />
              </div>
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                <Facebook className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Haven Chocolate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
