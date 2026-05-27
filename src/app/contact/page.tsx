import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { staticPageMetadata } from "@/lib/metadata";

export const metadata = staticPageMetadata(
  "Contact",
  "Contact D-Daily Ltd for product enquiries, delivery information, reseller support and customer service across Kenya.",
  "/contact",
  ["contact", "customer support", "D-Daily Ltd", "Kenya"],
);

export default function ContactPage() {
  return (
    <div className="container-px mx-auto max-w-5xl py-20 grid md:grid-cols-2 gap-12">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Contact</p>
        <h1 className="mt-2 font-display text-4xl font-bold">We're here to help.</h1>
        <p className="mt-4 text-muted-foreground">Reach our team — we respond within hours, every day.</p>
        <ul className="mt-8 space-y-4 text-sm">
          <li className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-primary" />
            +254 106555333
          </li>
          <li className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            ddailykenya01@gmail.com
          </li>
          <li className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-primary" />
            Physical store — Garden City, Nairobi, Kenya
          </li>
          <li className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-primary" />
            WhatsApp via the floating button
          </li>
        </ul>
      </div>
      <form className="rounded-2xl border bg-card p-6 space-y-4">
        <div>
          <label htmlFor="contact-name" className="text-sm font-medium">
            Your name
          </label>
          <input id="contact-name" name="name" placeholder="John Doe" className="mt-1 w-full h-11 px-3 rounded-lg border bg-background" />
        </div>
        <div>
          <label htmlFor="contact-email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            placeholder="name@example.com"
            className="mt-1 w-full h-11 px-3 rounded-lg border bg-background"
          />
        </div>
        <div>
          <label htmlFor="contact-message" className="text-sm font-medium">
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            placeholder="How can we help you?"
            className="mt-1 w-full px-3 py-2 rounded-lg border bg-background"
          />
        </div>
        <button type="button" className="w-full h-11 rounded-full bg-primary text-primary-foreground font-semibold">
          Send message
        </button>
      </form>
    </div>
  );
}
