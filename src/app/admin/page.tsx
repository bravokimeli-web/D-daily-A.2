import { AdminView } from "@/views/admin-view";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Admin Dashboard — D-Daily Ltd",
  description: "D-Daily Ltd admin dashboard for products, orders, and reseller applications.",
  path: "/admin",
  noIndex: true,
});

export default function AdminPage() {
  return <AdminView />;
}
