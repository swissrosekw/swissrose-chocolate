import { MessageCircle } from "lucide-react";
import { Instagram } from "lucide-react";

const SocialMediaButtons = () => {
  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
      {/* WhatsApp Button */}
      <a
        href="https://wa.me/96522280123"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-center w-16 h-16 bg-[#25D366] hover:bg-[#20BA5A] shadow-lg transition-all duration-300 hover:w-20"
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </a>

      {/* Instagram Button */}
      <a
        href="https://instagram.com/swissrosekw"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 shadow-lg transition-all duration-300 hover:w-20"
        aria-label="Follow us on Instagram"
      >
        <Instagram className="w-7 h-7 text-white" />
      </a>
    </div>
  );
};

export default SocialMediaButtons;
