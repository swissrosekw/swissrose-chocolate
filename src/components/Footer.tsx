import { Instagram, Facebook, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-playfair font-bold text-primary mb-4">SWISS ROSE</h3>
            <p className="text-sm text-muted-foreground">
              Beautiful flowers paired with handcrafted chocolates. The perfect gift for every occasion.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/about" 
                  className="text-muted-foreground hover:text-primary transition-all duration-200 inline-block hover:translate-x-1 active:scale-95"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/products" 
                  className="text-muted-foreground hover:text-primary transition-all duration-200 inline-block hover:translate-x-1 active:scale-95"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link 
                  to="/page/gallery" 
                  className="text-muted-foreground hover:text-primary transition-all duration-200 inline-block hover:translate-x-1 active:scale-95"
                >
                  Gallery
                </Link>
              </li>
              <li>
                <Link 
                  to="/page/contact-us" 
                  className="text-muted-foreground hover:text-primary transition-all duration-200 inline-block hover:translate-x-1 active:scale-95"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/page/delivery-information" 
                  className="text-muted-foreground hover:text-primary transition-all duration-200 inline-block hover:translate-x-1 active:scale-95"
                >
                  Delivery Info
                </Link>
              </li>
              <li>
                <Link 
                  to="/page/faq" 
                  className="text-muted-foreground hover:text-primary transition-all duration-200 inline-block hover:translate-x-1 active:scale-95"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link 
                  to="/page/refund-return-policy" 
                  className="text-muted-foreground hover:text-primary transition-all duration-200 inline-block hover:translate-x-1 active:scale-95"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/page/payment-information" 
                  className="text-muted-foreground hover:text-primary transition-all duration-200 inline-block hover:translate-x-1 active:scale-95"
                >
                  Payment Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Get in Touch</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a 
                  href="tel:+96522280123" 
                  className="flex items-center gap-2 hover:text-primary transition-all duration-200 hover:translate-x-1 active:scale-95 inline-flex"
                >
                  <Phone className="h-4 w-4" />
                  <span>+965 22280123</span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:info@swissrosekw.com" 
                  className="flex items-center gap-2 hover:text-primary transition-all duration-200 hover:translate-x-1 active:scale-95 inline-flex"
                >
                  <Mail className="h-4 w-4" />
                  <span>info@swissrosekw.com</span>
                </a>
              </li>
            </ul>
            <div className="flex gap-4 mt-4">
              <a
                href="https://instagram.com/swissrosekw"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative h-10 w-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-300 active:scale-95 overflow-hidden"
              >
                <Instagram className="h-5 w-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
              </a>
              <a
                href="https://facebook.com/swissrosekw"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative h-10 w-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-300 active:scale-95 overflow-hidden"
              >
                <Facebook className="h-5 w-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
              </a>
            </div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground mb-4">
            <Link to="/page/terms-conditions" className="hover:text-primary transition-colors">
              Terms & Conditions
            </Link>
            <span>•</span>
            <Link to="/page/privacy-policy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/page/refund-return-policy" className="hover:text-primary transition-colors">
              Refund Policy
            </Link>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            &copy; 2025 Swiss Rose. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
