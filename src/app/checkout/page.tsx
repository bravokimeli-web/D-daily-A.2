import { CheckoutView } from "@/views/checkout-view";
import { staticPageMetadata } from "@/lib/metadata";

export const metadata = staticPageMetadata(
  "Checkout",
  "Complete your D-Daily Ltd order with M-PESA STK push and choose nationwide courier delivery.",
  "/checkout",
  ["checkout", "M-PESA", "delivery", "Kenya"],
);

export default function CheckoutPage() {
  return <CheckoutView />;
}
