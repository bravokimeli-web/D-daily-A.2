import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const phone = "254106555333";
  const msg = encodeURIComponent("Hello D-Daily Ltd, I'm interested in your products.");
  return (
    <a
      href={`https://wa.me/${phone}?text=${msg}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 group"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping" />
      <span className="relative flex items-center gap-2 bg-[#25D366] text-white pl-3.5 pr-4 py-3 rounded-full shadow-elevated hover:scale-105 transition-transform">
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm font-semibold hidden sm:inline">Chat with us</span>
      </span>
    </a>
  );
}
