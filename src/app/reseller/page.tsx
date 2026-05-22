import { ResellerView } from "@/views/reseller-view";
import { staticPageMetadata } from "@/lib/metadata";

export const metadata = staticPageMetadata(
  "Reseller Program",
  "Become a D-Daily reseller and earn commission by selling trusted home, farm and protection products across Kenya.",
  "/reseller",
  ["reseller", "wholesale", "commission", "D-Daily Ltd", "Kenya"],
);

export default function ResellerPage() {
  return <ResellerView />;
}
