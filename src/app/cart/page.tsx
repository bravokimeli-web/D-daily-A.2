import { CartView } from "@/views/cart-view";
import { staticPageMetadata } from "@/lib/metadata";

export const metadata = staticPageMetadata(
  "Cart",
  "Review items in your D-Daily Ltd cart and proceed to secure M-PESA checkout with nationwide delivery.",
  "/cart",
  ["cart", "checkout", "Kenya", "M-PESA"],
  true,
);

export default function CartPage() {
  return <CartView />;
}
