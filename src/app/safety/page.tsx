import { SafetyView } from "@/views/safety-view";
import { staticPageMetadata } from "@/lib/metadata";

export const metadata = staticPageMetadata(
  "Safety & Education",
  "Read safety and use guidance for D-Daily Ltd pest control and protection products to keep your home and farm secure.",
  "/safety",
  ["safety", "education", "pest control", "home protection"],
);

export default function SafetyPage() {
  return <SafetyView />;
}
