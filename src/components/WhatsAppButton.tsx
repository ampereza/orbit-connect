import { MessageCircle } from "lucide-react";

export const WhatsAppButton = () => {
  const phoneNumber = "256700123456"; // Replace with actual WhatsApp number
  const message = encodeURIComponent("Hello! I'm interested in learning more about job opportunities with Orbit Employ.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Chat on WhatsApp"
    >
      {/* Pulse animation ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
      
      {/* Button */}
      <div className="relative flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5C] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
        <MessageCircle className="w-6 h-6 fill-current" />
        <span className="font-medium text-sm hidden sm:inline">Chat with us</span>
      </div>

      {/* Tooltip on mobile */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-foreground text-background text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap sm:hidden">
        Chat on WhatsApp
      </div>
    </a>
  );
};
