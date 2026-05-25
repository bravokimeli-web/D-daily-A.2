import { ResellerTrackView } from "@/views/reseller-track-view";
import { staticPageMetadata } from "@/lib/metadata";

export const metadata = staticPageMetadata(
  "Track Reseller Application",
  "Track your D-Daily reseller application status securely using the email you used when applying.",
  "/reseller/track",
  ["reseller", "track", "application", "status", "D-Daily Ltd"],
  true,
);

export default function ResellerTrackPage() {
  return <ResellerTrackView />;
}
