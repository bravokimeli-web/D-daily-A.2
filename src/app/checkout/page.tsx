import { CheckoutView } from "@/views/checkout-view";
import { staticPageMetadata } from "@/lib/metadata";

export const metadata = staticPageMetadata(
  "Checkout",
  "Complete your D-Daily Ltd order with secure M-Pesa checkout and choose nationwide courier delivery.",
  "/checkout",
  ["checkout", "M-Pesa", "delivery", "Kenya"],
  true,
);

export default function CheckoutPage() {
  return <CheckoutView />;
}
