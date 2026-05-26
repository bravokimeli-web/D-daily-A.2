import { CheckoutView } from "@/views/checkout-view";
import { staticPageMetadata } from "@/lib/metadata";

export const metadata = staticPageMetadata(
  "Checkout",
  "Complete your D-Daily Ltd order with secure Paystack checkout and choose nationwide courier delivery.",
  "/checkout",
  ["checkout", "Paystack", "delivery", "Kenya"],
  true,
);

export default function CheckoutPage() {
  return <CheckoutView />;
}
