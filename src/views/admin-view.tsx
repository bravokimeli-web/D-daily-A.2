"use client";

import Image from "next/image";
import Link from "next/link";
import { getApiBaseUrl, resolveMediaUrl } from "@/lib/api";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { Button } from "@/components/ui/button";
import { products as staticCatalogProducts } from "@/data/products";
import { useState, useEffect, useCallback } from "react";
import { BarChart3, LogOut, Package, ShoppingCart, Users, Settings, Trash2, Eye, FileText, CheckCircle, XCircle, ExternalLink, Upload, Pencil } from "lucide-react";
import { toast } from "sonner";

function formatAppliedAt(value: string | Date | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "medium" });
}

const RESELLER_DOC_LABELS: Record<string, string> = {
  id_front: "ID front",
  id_back: "ID back",
  kra_pin: "KRA PIN",
  additional: "Additional",
};

function linesToArray(raw: FormDataEntryValue | null | undefined): string[] {
  if (raw == null || typeof raw !== "string") return [];
  return raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

function parseSpecLines(raw: FormDataEntryValue | null | undefined): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  for (const line of linesToArray(raw)) {
    const pipe = line.indexOf("|");
    if (pipe === -1) continue;
    const label = line.slice(0, pipe).trim();
    const value = line.slice(pipe + 1).trim();
    if (label && value) out.push({ label, value });
  }
  return out;
}

function parseVariantLines(
  raw: FormDataEntryValue | null | undefined
): { id: string; label: string; price: number; originalPrice?: number; stock?: number }[] {
  const out: { id: string; label: string; price: number; originalPrice?: number; stock?: number }[] = [];
  for (const line of linesToArray(raw)) {
    const [labelRaw, priceRaw, originalRaw, stockRaw] = line.split("|").map((part) => part.trim());
    if (!labelRaw || !priceRaw) continue;
    const price = Number(priceRaw);
    if (!Number.isFinite(price) || price < 0) continue;
    const originalPrice = originalRaw ? Number(originalRaw) : undefined;
    const stock = stockRaw ? Number(stockRaw) : undefined;
    const stockValue = typeof stock === "number" && Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : undefined;
    const id = labelRaw.toLowerCase().replace(/\s+/g, "-");
    out.push({
      id,
      label: labelRaw,
      price,
      originalPrice: Number.isFinite(originalPrice) ? originalPrice : undefined,
      stock: stockValue,
    });
  }
  return out;
}

export function AdminView() {
    const [token, setToken] = useState<string | null>(null);
    const [adminEmail, setAdminEmail] = useState<string | null>(null);

    useEffect(() => {
      const read = () => {
        setToken(localStorage.getItem("admin_token"));
        setAdminEmail(localStorage.getItem("admin_email"));
      };
      read();
      window.addEventListener("storage", read);
      return () => window.removeEventListener("storage", read);
    }, []);

    const isAdmin = !!token;
    const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders" | "resellers" | "settings">("dashboard");
    const [products, setProducts] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [orderFilter, setOrderFilter] = useState<"all" | "pending_payment" | "paid">("pending_payment");
    const [dashboardStats, setDashboardStats] = useState<any | null>(null);
    const [resellers, setResellers] = useState<any[]>([]);
    const [loadingResellers, setLoadingResellers] = useState(false);
    const [resellerFilter, setResellerFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [mediaPreviews, setMediaPreviews] = useState<Array<{ type: "image" | "video"; url: string }>>([]);
    const [dropActive, setDropActive] = useState(false);
    const [editingSlug, setEditingSlug] = useState<string | null>(null);
    const [dbProductSlugs, setDbProductSlugs] = useState<Set<string>>(new Set());

    const loadWebsiteProducts = useCallback(async () => {
      setLoadingProducts(true);
      try {
        const response = await fetch(`${getApiBaseUrl()}/products?active=true`);
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        const apiProducts = Array.isArray(data.data) ? data.data : [];
        const apiMap = new Map<string, any>(apiProducts.map((p: any) => [p.slug, { ...p, _fromDb: true }]));
        const merged = staticCatalogProducts.map((p) => apiMap.get(p.slug) ?? { ...p, _fromDb: false });
        for (const p of apiProducts) {
          if (!merged.some((item) => item.slug === p.slug)) merged.push({ ...p, _fromDb: true });
        }
        setDbProductSlugs(new Set(apiProducts.map((p: any) => p.slug)));
        setProducts(merged);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load products from the server");
        setDbProductSlugs(new Set());
        setProducts(staticCatalogProducts.map((p) => ({ ...p, _fromDb: false })));
      } finally {
        setLoadingProducts(false);
      }
    }, []);

    const loadOrders = useCallback(async () => {
      if (!token) return;
      try {
        const url = new URL(`${getApiBaseUrl()}/admin/orders`);
        if (orderFilter !== "all") {
          url.searchParams.append("status", orderFilter);
        }

        const response = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setOrders(data.data || []);
        } else {
          setOrders([]);
        }
      } catch {
        setOrders([]);
      }
    }, [token, orderFilter]);

    const sendOrderEmailAction = async (orderNumber: string, action: "payment-reminder" | "shipped" | "delivered") => {
      if (!token) {
        toast.error("Admin authentication required.");
        return;
      }
      try {
        const response = await fetch(`${getApiBaseUrl()}/admin/orders/${encodeURIComponent(orderNumber)}/email/${action}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to send email");
        toast.success(data.message || "Email sent successfully");
      } catch (err) {
        toast.error((err as Error).message || "Failed to send email");
      }
    };

    const deleteOrder = async (orderNumber: string) => {
      if (!token) {
        toast.error("Admin authentication required.");
        return;
      }

      const confirmed = window.confirm("Delete this pending order? This cannot be undone.");
      if (!confirmed) return;

      try {
        const response = await fetch(`${getApiBaseUrl()}/admin/orders/${encodeURIComponent(orderNumber)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to delete order");
        toast.success(data.message || "Order deleted successfully");
        await loadOrders();
      } catch (err) {
        toast.error((err as Error).message || "Failed to delete order");
      }
    };

    const loadDashboardStats = useCallback(async () => {
      if (!token) return;
      try {
        const response = await fetch(`${getApiBaseUrl()}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setDashboardStats(data.data || null);
        } else {
          setDashboardStats(null);
        }
      } catch {
        setDashboardStats(null);
      }
    }, [token]);

    useEffect(() => {
      if (!isAdmin) return;
      void loadWebsiteProducts();
      void loadOrders();
      void loadDashboardStats();
    }, [isAdmin, loadWebsiteProducts, loadOrders, loadDashboardStats]);

    // Fetch resellers on mount and when filter changes
    useEffect(() => {
      if (!isAdmin) return;

      const fetchResellers = async () => {
        setLoadingResellers(true);
        try {
          const url = new URL(`${getApiBaseUrl()}/admin/resellers`);
          if (resellerFilter !== "all") {
            url.searchParams.append("status", resellerFilter);
          }

          const response = await fetch(url.toString(), {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) throw new Error("Failed to fetch resellers");
          const data = await response.json();
          setResellers(data.data || []);
        } catch (err) {
          console.error("Error fetching resellers:", err);
          toast.error("Failed to load reseller applications");
        } finally {
          setLoadingResellers(false);
        }
      };

      fetchResellers();
    }, [isAdmin, resellerFilter, token]);

    const handleResellerStatus = async (resellerId: string, status: "approved" | "rejected", notes?: string) => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/admin/resellers/${resellerId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ status, notes }),
        });

        if (!response.ok) throw new Error("Failed to update reseller");
        const data = await response.json();
        setResellers(resellers.map((r) => (r._id === resellerId ? data.data : r)));
        toast.success(`Reseller ${status}`);
      } catch (err) {
        toast.error((err as Error).message);
      }
    };

    const handleDeleteReseller = async (resellerId: string) => {
      if (!window.confirm("Permanently delete this application and its uploaded files? This cannot be undone.")) return;
      try {
        const response = await fetch(`${getApiBaseUrl()}/admin/resellers/${resellerId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || "Failed to delete");
        setResellers((prev) => prev.filter((r) => r._id !== resellerId));
        toast.success("Application deleted");
      } catch (err) {
        toast.error((err as Error).message);
      }
    };

    if (!isAdmin) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="max-w-md text-center">
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Sign in with your admin credentials.
            </p>
            <div className="mt-8">
              <AdminLoginForm />
            </div>
            <div className="mt-8">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Go home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    const handleLogout = () => {
      localStorage.removeItem("admin_token");
      window.location.href = "/";
    };

    const resetLocalMedia = () => {
      for (const preview of mediaPreviews) {
        if (preview.url.startsWith("blob:")) URL.revokeObjectURL(preview.url);
      }
      setMediaFiles([]);
      setMediaPreviews([]);
    };

    const removeMediaAt = (index: number) => {
      setMediaPreviews((prev) => {
        const item = prev[index];
        if (item?.url?.startsWith("blob:")) URL.revokeObjectURL(item.url);
        return prev.filter((_, i) => i !== index);
      });
      setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const removeLastMedia = () => {
      if (mediaPreviews.length === 0) return;
      removeMediaAt(mediaPreviews.length - 1);
    };

    const handleMediaSelected = (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const accepted = Array.from(files).filter((file) => {
        const mime = (file.type || "").toLowerCase();
        if (mime.startsWith("image/") || mime.startsWith("video/")) return true;
        return /\.(jpe?g|png|webp|gif|bmp|avif|heic|heif|mp4|webm|mov|m4v|avi)$/i.test(file.name || "");
      });
      if (accepted.length === 0) {
        toast.error("Please choose image or video files.");
        return;
      }
      const nextFiles = [...mediaFiles, ...accepted];
      setMediaFiles(nextFiles);
      setMediaPreviews([
        ...mediaPreviews,
        ...accepted.map((file) => ({
          type: file.type.startsWith("video/") || /\.(mp4|webm|mov|m4v|avi)$/i.test(file.name || "")
            ? ("video" as const)
            : ("image" as const),
          url: URL.createObjectURL(file),
        })),
      ]);
    };

    const handleProductImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDropActive(false);
      handleMediaSelected(e.dataTransfer.files);
    };

    const handleProductImageDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDropActive(true);
    };

    const handleProductImageDragLeave = () => {
      setDropActive(false);
    };

    const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const name = (formData.get("name") as string)?.trim();
      const imageUrlField = (formData.get("imageUrl") as string)?.trim();
      const imageUrlsField = linesToArray(formData.get("imageUrls"));
      const videoUrlField = (formData.get("videoUrl") as string)?.trim();
      const description = (formData.get("description") as string)?.trim() || name;
      const taglineField = (formData.get("tagline") as string)?.trim();
      const usage = linesToArray(formData.get("usage"));
      const safety = linesToArray(formData.get("safety"));
      const specs = parseSpecLines(formData.get("specs"));
      const variants = parseVariantLines(formData.get("variants"));
      const priceRaw = formData.get("price") as string;
      const originalPriceRaw = (formData.get("originalPrice") as string) || "";
      const category = formData.get("category") as string;
      const stockRaw = (formData.get("stock") as string) || "0";
      const tagline = taglineField || description.slice(0, 120);

      if (!name || !category) {
        toast.error("Name and category are required");
        return;
      }

      let imageForProduct = imageUrlField;
      const galleryImages = [...imageUrlsField];
      let videoForProduct = videoUrlField;
      let uploadedImageVariants: any = undefined;

      if (mediaFiles.length > 0) {
        try {
          for (const mediaFile of mediaFiles) {
            const fd = new FormData();
            fd.append("media", mediaFile);
            const up = await fetch(`${getApiBaseUrl()}/admin/products/upload`, {
              method: "POST",
              headers: { "Authorization": `Bearer ${token}` },
              body: fd,
            });
            const uj = await up.json().catch(() => ({}));
            if (!up.ok) {
              const fallback = `Media upload failed (${up.status} ${up.statusText || "error"})`;
              toast.error(typeof uj.message === "string" ? uj.message : fallback);
              console.error("Product media upload failed", {
                status: up.status,
                statusText: up.statusText,
                response: uj,
                file: { name: mediaFile.name, type: mediaFile.type, size: mediaFile.size },
              });
              return;
            }
            const uploadedUrl = uj.data?.url as string | undefined;
            const mediaType = uj.data?.mediaType as "image" | "video" | undefined;
            if (!uploadedUrl) continue;
            if (mediaType === "video") {
              if (!videoForProduct) videoForProduct = uploadedUrl;
            } else {
              if (!imageForProduct) {
                imageForProduct = uploadedUrl;
                uploadedImageVariants = uj.data?.variants;
              } else {
                galleryImages.push(uploadedUrl);
              }
            }
          }
        } catch (err) {
          toast.error((err as Error).message);
          return;
        }
      }

      if (!imageForProduct) {
        toast.error("Add at least one product image by upload or URL.");
        return;
      }

      const generatedSlug =
        name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "") || `product-${Date.now()}`;
      // Keep the original slug when editing so we update the same product record.
      const slug = editingSlug || generatedSlug;

      const payload = {
        slug,
        name,
        price: parseFloat(priceRaw),
        originalPrice: originalPriceRaw ? parseFloat(originalPriceRaw) : undefined,
        category,
        image: imageForProduct,
        images: galleryImages,
        video: videoForProduct || undefined,
        imageVariants: uploadedImageVariants,
        tagline,
        description,
        usage,
        safety,
        specs,
        variants,
        stock: Math.max(0, parseInt(stockRaw, 10) || 0),
      };

      try {
        const isEditing = Boolean(editingSlug);
        const isExistingDbProduct = editingSlug ? dbProductSlugs.has(editingSlug) : false;
        const shouldUpdate = isEditing && isExistingDbProduct;
        const response = await fetch(
          shouldUpdate
            ? `${getApiBaseUrl()}/admin/products/${encodeURIComponent(editingSlug as string)}`
            : `${getApiBaseUrl()}/admin/products`,
          {
          method: shouldUpdate ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          toast.error(typeof data.message === "string" ? data.message : `Failed to ${shouldUpdate ? "update" : "create"} product`);
          return;
        }
        toast.success(shouldUpdate ? "Product updated" : "Product published");
        (e.target as HTMLFormElement).reset();
        resetLocalMedia();
        setEditingSlug(null);
        await loadWebsiteProducts();
      } catch (err) {
        toast.error((err as Error).message);
      }
    };

    const handleEditProduct = (product: any) => {
      const form = document.getElementById("admin-product-form") as HTMLFormElement | null;
      if (!form) return;
      setEditingSlug(product.slug);
      resetLocalMedia();
      const specs = Array.isArray(product.specs) ? product.specs.map((s: any) => `${s.label} | ${s.value}`).join("\n") : "";
      const variants = Array.isArray(product.variants)
        ? product.variants
            .map((v: any) => `${v.label} | ${v.price}${v.originalPrice ? ` | ${v.originalPrice}` : ""}${v.stock !== undefined ? ` | ${v.stock}` : ""}`)
            .join("\n")
        : "";
      const imageUrls = Array.isArray(product.images) ? product.images.join("\n") : "";
      const fields: Array<[string, string]> = [
        ["name", product.name ?? ""],
        ["price", String(product.price ?? "")],
        ["originalPrice", String(product.originalPrice ?? "")],
        ["category", product.category ?? ""],
        ["stock", String(product.stock ?? "0")],
        ["imageUrl", product.image ?? ""],
        ["imageUrls", imageUrls],
        ["videoUrl", product.video ?? ""],
        ["description", product.description ?? ""],
        ["tagline", product.tagline ?? ""],
        ["usage", Array.isArray(product.usage) ? product.usage.join("\n") : ""],
        ["safety", Array.isArray(product.safety) ? product.safety.join("\n") : ""],
        ["specs", specs],
        ["variants", variants],
      ];
      for (const [name, value] of fields) {
        const node = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
        if (node) node.value = value;
      }
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const getProductImageList = (product: any): string[] => {
      const urls = [product?.image, ...(Array.isArray(product?.images) ? product.images : [])]
        .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
        .map((value) => value.trim());
      return [...new Set(urls)];
    };

    const handleDeleteProductImage = async (product: any, imageUrl: string) => {
      if (!dbProductSlugs.has(product.slug)) {
        toast.error("Publish this product first, then manage its images.");
        return;
      }
      const currentImages = getProductImageList(product);
      if (currentImages.length <= 1) {
        toast.error("A product must keep at least one image.");
        return;
      }

      if (!window.confirm("Delete this image from the product?")) return;

      const nextImages = currentImages.filter((url) => url !== imageUrl);
      if (nextImages.length === 0) {
        toast.error("A product must keep at least one image.");
        return;
      }

      try {
        const response = await fetch(`${getApiBaseUrl()}/admin/products/${encodeURIComponent(product.slug)}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            image: nextImages[0],
            images: nextImages.slice(1),
          }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || "Failed to delete image");
        toast.success("Image deleted");
        await loadWebsiteProducts();
      } catch (err) {
        toast.error((err as Error).message);
      }
    };

    const handleDeleteProduct = async (slug: string) => {
      if (!window.confirm("Remove this product from the website? It will be hidden from shoppers.")) return;
      try {
        const response = await fetch(`${getApiBaseUrl()}/admin/products/${encodeURIComponent(slug)}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token ?? localStorage.getItem("admin_token")}` },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || "Failed to remove product");
        toast.success("Product removed from the site");
        await loadWebsiteProducts();
      } catch (err) {
        toast.error((err as Error).message);
      }
    };

    const handleSetProductStock = async (product: any, stock: number) => {
      const authToken = token ?? localStorage.getItem("admin_token");
      if (!authToken) {
        toast.error("Admin authentication required.");
        return;
      }

      try {
        const clamped = Math.max(0, Math.floor(stock));
        const payload: any = {};

        // If the product is not yet in the database, create it first (publish)
        if (!dbProductSlugs.has(product.slug)) {
          const createPayload: any = {
            slug: product.slug,
            name: product.name,
            price: product.price ?? null,
            originalPrice: product.originalPrice,
            category: product.category,
            image: product.image ?? "",
            images: Array.isArray(product.images) ? product.images : [],
            video: product.video,
            imageVariants: product.imageVariants,
            tagline: product.tagline ?? product.description?.slice(0, 120) ?? "",
            description: product.description ?? product.name,
            usage: Array.isArray(product.usage) ? product.usage : [],
            safety: Array.isArray(product.safety) ? product.safety : [],
            specs: Array.isArray(product.specs) ? product.specs : [],
            variants: Array.isArray(product.variants)
              ? product.variants.map((v: any) => ({ id: v.id ?? (v.label || "").toLowerCase().replace(/\s+/g, "-"), label: v.label, price: v.price, originalPrice: v.originalPrice, stock: Number.isFinite(v.stock) ? v.stock : undefined }))
              : [],
            stock: Array.isArray(product.variants) && product.variants.length > 0 ? undefined : clamped,
          };

          const createResp = await fetch(`${getApiBaseUrl()}/admin/products`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${authToken}`,
            },
            body: JSON.stringify(createPayload),
          });
          const createData = await createResp.json().catch(() => ({}));
          if (!createResp.ok) {
            console.error("Failed to publish product", { status: createResp.status, body: createData });
            throw new Error(createData.message || "Failed to publish product");
          }

          toast.success("Product published");
          // Refresh product list and allow code below to update variants if needed
          await loadWebsiteProducts();
        }

        // If the product has variants, update their stock as well so storefront variant checks reflect the change.
        if (Array.isArray(product.variants) && product.variants.length > 0) {
          payload.variants = product.variants.map((v: any) => ({ ...v, stock: clamped }));
        } else {
          payload.stock = clamped;
        }

        const response = await fetch(`${getApiBaseUrl()}/admin/products/${encodeURIComponent(product.slug)}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          console.error("Failed to update stock", { status: response.status, body: data });
          throw new Error(data.message || "Failed to update stock");
        }

        toast.success("Stock updated");
        await loadWebsiteProducts();
      } catch (err) {
        toast.error((err as Error).message || "Failed to update stock");
      }
    };

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border">
          <div className="container-px mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                  <p className="text-sm text-muted-foreground">{adminEmail}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-border">
          <div className="container-px mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1">
              {[
                { id: "dashboard", label: "Dashboard", icon: BarChart3 },
                { id: "products", label: "Products", icon: Package },
                { id: "orders", label: "Orders", icon: ShoppingCart },
                { id: "resellers", label: "Resellers", icon: Users },
                { id: "settings", label: "Settings", icon: Settings },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
                    activeTab === id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container-px mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                    <p className="mt-2 text-3xl font-bold text-foreground">{products.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-primary" />
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                    <p className="mt-2 text-3xl font-bold text-foreground">{dashboardStats?.orders?.total ?? orders.length}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>Paid: {dashboardStats?.orders?.paid ?? "—"}</span>
                      <span>Pending: {dashboardStats?.orders?.pending ?? "—"}</span>
                    </div>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-primary" />
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Reseller Applications</p>
                    <p className="mt-2 text-3xl font-bold text-foreground">{resellers.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Admin Account</p>
                    <p className="mt-2 text-sm font-mono text-primary">{adminEmail}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">{editingSlug ? "Edit Product" : "Add New Product"}</h2>
                <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
                  Upload multiple product media files (images and optional video) or paste direct URLs. For Fashion & Design,
                  add size variants in the variants field.
                </p>
                <form id="admin-product-form" onSubmit={handleAddProduct} className="rounded-lg border border-border bg-card p-6 space-y-4 max-w-2xl">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Product Name</label>
                      <input
                        name="name"
                        placeholder="e.g., Insecticide Spray"
                        className="mt-2 w-full h-10 px-3 rounded-lg border border-input bg-background"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Price (KES)</label>
                      <input
                        name="price"
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        className="mt-2 w-full h-10 px-3 rounded-lg border border-input bg-background"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Original price (optional)</label>
                      <input
                        name="originalPrice"
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        className="mt-2 w-full h-10 px-3 rounded-lg border border-input bg-background"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <select
                        name="category"
                        className="mt-2 w-full h-10 px-3 rounded-lg border border-input bg-background"
                        required
                      >
                        <option value="">Select category</option>
                        <option value="lighting">Lighting</option>
                        <option value="home-protection">Home Protection</option>
                        <option value="farm-protection">Farm Protection</option>
                        <option value="fashion-design">Fashion & Design</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Stock</label>
                      <input
                        name="stock"
                        type="number"
                        min={0}
                        placeholder="0"
                        className="mt-2 w-full h-10 px-3 rounded-lg border border-input bg-background"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Product media (images and video)</label>
                    <div
                      className={`mt-2 rounded-2xl border-2 border-dashed p-5 text-center transition-colors ${
                        dropActive ? "border-primary bg-primary/5" : "border-input bg-background"
                      }`}
                      onDragOver={handleProductImageDragOver}
                      onDragLeave={handleProductImageDragLeave}
                      onDrop={handleProductImageDrop}
                    >
                      <input
                        id="admin-product-image"
                        type="file"
                        accept="image/*,video/*,.heic,.heif,.avif,.m4v,.avi"
                        multiple
                        className="hidden"
                        onChange={(ev) => handleMediaSelected(ev.target.files)}
                      />
                      <label htmlFor="admin-product-image" className="cursor-pointer block">
                        {mediaPreviews.length > 0 ? (
                          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                            {mediaPreviews.map((preview, index) => (
                              <div key={`${preview.url}-${index}`} className="relative">
                                {preview.type === "video" ? (
                                  <video
                                    src={preview.url}
                                    controls
                                    className="h-28 w-full rounded-xl border border-border object-cover"
                                  />
                                ) : (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={preview.url}
                                    alt={`Preview ${index + 1}`}
                                    className="h-28 w-full rounded-xl object-cover border border-border"
                                  />
                                )}
                                <button
                                  type="button"
                                  onClick={(ev) => {
                                    ev.preventDefault();
                                    ev.stopPropagation();
                                    removeMediaAt(index);
                                  }}
                                  className="absolute -top-2 -right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background border border-border text-destructive shadow hover:bg-destructive/10"
                                  aria-label={`Remove selected media ${index + 1}`}
                                  title="Remove this selection"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <Upload className="h-8 w-8 mx-auto text-primary" />
                            <p className="font-semibold text-foreground">Drag and drop images/videos here</p>
                            <p>or click to choose multiple files</p>
                          </div>
                        )}
                      </label>
                      {mediaPreviews.length > 0 && (
                        <div className="mt-3 flex items-center gap-3">
                          <button
                            type="button"
                            className="text-xs font-medium text-destructive hover:underline"
                            onClick={removeLastMedia}
                          >
                            Undo last
                          </button>
                          <span className="text-muted-foreground">|</span>
                          <button type="button" className="text-xs font-medium text-destructive hover:underline" onClick={resetLocalMedia}>
                            Clear all
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Primary image URL (optional if uploaded)</label>
                    <input
                      name="imageUrl"
                      type="text"
                      inputMode="url"
                      placeholder="https://… or /uploads/…"
                      className="mt-2 w-full h-10 px-3 rounded-lg border border-input bg-background"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Additional image URLs (optional)</label>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-1">One URL per line.</p>
                    <textarea
                      name="imageUrls"
                      rows={3}
                      placeholder={"https://.../image-2.jpg\nhttps://.../image-3.jpg"}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Video URL (optional)</label>
                    <input
                      name="videoUrl"
                      type="text"
                      inputMode="url"
                      placeholder="https://.../product-video.mp4"
                      className="mt-2 w-full h-10 px-3 rounded-lg border border-input bg-background"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                      name="description"
                      placeholder="Full product description for the detail page"
                      rows={4}
                      className="mt-2 w-full px-3 py-2 rounded-lg border border-input bg-background"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Tagline (short line for shop cards)</label>
                    <input
                      name="tagline"
                      type="text"
                      placeholder="Optional — defaults to the first part of the description"
                      className="mt-2 w-full h-10 px-3 rounded-lg border border-input bg-background"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">How to use</label>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-1">One step per line (bullet list on the site).</p>
                    <textarea
                      name="usage"
                      placeholder={"e.g.\nShake well before use.\nSpray 20–30cm from surfaces."}
                      rows={4}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Safety precautions</label>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-1">One precaution per line.</p>
                    <textarea
                      name="safety"
                      placeholder={"e.g.\nKeep out of reach of children.\nVentilate after use."}
                      rows={4}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Specifications</label>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-1">
                      One per line: <span className="font-mono">Label | Value</span> (use the vertical bar).
                    </p>
                    <textarea
                      name="specs"
                      placeholder={"e.g.\nVolume | 500 ml\nFormat | Trigger spray"}
                      rows={4}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Variants (sizes/options)</label>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-1">
                      One per line: <span className="font-mono">Size/Label | Price | Original Price(optional) | Stock(optional)</span>
                    </p>
                    <textarea
                      name="variants"
                      placeholder={"e.g.\nSize 40 | 2500 | 3000 | 5\nSize 41 | 2500 | 3000 | 0"}
                      rows={4}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background font-mono text-sm"
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    {editingSlug ? "Update product" : "Upload media and add product"}
                  </Button>
                  {editingSlug && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const form = document.getElementById("admin-product-form") as HTMLFormElement | null;
                        form?.reset();
                        setEditingSlug(null);
                        resetLocalMedia();
                      }}
                    >
                      Cancel editing
                    </Button>
                  )}
                </form>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Catalog products</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Built-in and database products. Edit any item and click save to publish/update it in the database.
                </p>
                {loadingProducts ? (
                  <p className="text-muted-foreground">Loading products…</p>
                ) : products.length === 0 ? (
                  <p className="text-muted-foreground">No active products in the database.</p>
                ) : (
                  <div className="space-y-3">
                    {products.map((p) => {
                      const imageList = getProductImageList(p);
                      const isFromDb = dbProductSlugs.has(p.slug);
                      return (
                      <div
                        key={p._id || p.slug}
                        className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
                      >
                        <div className="flex flex-1 gap-4 min-w-0 sm:items-center sm:justify-between sm:flex-row flex-col">
                          <div className="flex gap-4 min-w-0">
                          <Image
                            src={resolveMediaUrl(p.image)}
                            alt={p.name}
                            width={64}
                            height={64}
                            className="h-16 w-16 shrink-0 rounded-lg object-cover border border-border bg-muted"
                          />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{p.name}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {p.category} · KES {p.price ?? "—"}{p.originalPrice ? ` · was KES ${p.originalPrice}` : ""} · stock {p.stock ?? 0}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono truncate">{p.slug}</p>
                            <p className="text-xs text-muted-foreground">
                              {isFromDb ? "Source: Database" : "Source: Built-in (not yet published to DB)"}
                            </p>
                          </div>
                        </div>
                          <div className="inline-flex shrink-0 items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditProduct(p)}
                              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                            >
                              <Pencil className="h-4 w-4" />
                              {isFromDb ? "Edit" : "Edit & publish"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(p.slug)}
                              disabled={!isFromDb}
                              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-destructive/30 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                              {isFromDb ? "Remove from site" : "Publish first"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetProductStock(p, 0)}
                              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-amber-300 px-3 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50"
                            >
                              {isFromDb ? "Mark sold out" : "Publish & mark sold out"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetProductStock(p, Math.max(1, Number(p.stock) || 1))}
                              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-emerald-300 px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
                            >
                              {isFromDb ? "Mark in stock" : "Publish & mark in stock"}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            Product images ({imageList.length}) — click trash to delete one image
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {imageList.map((img, index) => (
                              <div key={`${p.slug}-${img}-${index}`} className="relative">
                                <Image
                                  src={resolveMediaUrl(img)}
                                  alt={`${p.name} ${index + 1}`}
                                  width={72}
                                  height={72}
                                  className="h-18 w-18 rounded-md object-cover border border-border bg-muted"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProductImage(p, img)}
                                  disabled={!isFromDb}
                                  className="absolute -top-2 -right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow hover:opacity-90"
                                  aria-label={`Delete image ${index + 1} for ${p.name}`}
                                  title="Delete this image"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Orders</h2>
              <div className="flex flex-wrap gap-2 mb-6">
                {([
                  { key: "all", label: "All orders" },
                  { key: "pending_payment", label: "Pending payments" },
                  { key: "paid", label: "Paid orders" },
                ] as const).map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setOrderFilter(filter.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      orderFilter === filter.key
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card text-foreground hover:bg-accent"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              {orders.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-12 text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {orders.map((order) => (
                    <div key={order._id ?? order.id} className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-card sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="font-medium">Order #{order.orderNumber ?? order.id}</p>
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            order.status === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : order.status === "pending_payment"
                              ? "bg-yellow-100 text-yellow-900"
                              : "bg-slate-100 text-slate-800"
                          }`}>
                            {order.status?.replace("_", " ") ?? "Unknown"}
                          </span>
                        </div>
                        <div className="grid gap-1 sm:grid-cols-3">
                          <p className="text-sm text-muted-foreground">Created: {order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}</p>
                          <p className="text-sm text-muted-foreground">Total: KES {order.total?.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Location: {order.customer?.city ?? "—"}</p>
                        </div>
                        <div className="grid gap-1 sm:grid-cols-2">
                          <p className="text-sm text-muted-foreground">Customer: {order.customer?.name ?? "—"}</p>
                          {order.customer?.email ? (
                            <p className="text-sm text-muted-foreground">Email: {order.customer.email}</p>
                          ) : null}
                        </div>
                        {order.items?.length ? (
                          <p className="text-sm text-muted-foreground truncate">
                            Ordering: {order.items.map((item: any) => `${item.name}×${item.qty}`).join(", ")}
                          </p>
                        ) : null}
                        <div className="flex flex-wrap gap-2 pt-2">
                          {order.status === "pending_payment" && order.customer?.email && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => sendOrderEmailAction(order.orderNumber, "payment-reminder")}
                              >
                                Send payment reminder
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteOrder(order.orderNumber)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete order
                              </Button>
                            </>
                          )}
                          {(order.status === "paid" || order.status === "processing" || order.status === "shipped") && order.customer?.email && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => sendOrderEmailAction(order.orderNumber, "shipped")}
                            >
                              Send shipped notice
                            </Button>
                          )}
                          {(order.status === "paid" || order.status === "processing" || order.status === "shipped" || order.status === "delivered") && order.customer?.email && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => sendOrderEmailAction(order.orderNumber, "delivered")}
                            >
                              Send delivered reminder
                            </Button>
                          )}
                          {!order.customer?.email && (
                            <span className="text-xs text-muted-foreground">No customer email available for email actions.</span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Resellers Tab */}
          {activeTab === "resellers" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Reseller Applications</h2>
                <div className="flex gap-2 mb-4">
                  {(["all", "pending", "approved", "rejected"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setResellerFilter(filter)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        resellerFilter === filter
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-card text-foreground hover:bg-accent"
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {loadingResellers ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : resellers.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No {resellerFilter !== "all" ? resellerFilter : ""} reseller applications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {resellers.map((reseller: any) => (
                    <div key={reseller._id} className="rounded-lg border border-border bg-card p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-foreground">{reseller.full_name}</h3>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              reseller.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : reseller.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                              {reseller.status.charAt(0).toUpperCase() + reseller.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{reseller.email}</p>
                          <p className="text-sm text-muted-foreground">{reseller.phone}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Applied: <span className="font-medium text-foreground">{formatAppliedAt(reseller.appliedAt)}</span>
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border">
                        <p className="text-sm font-semibold text-foreground mb-3">Uploaded documents</p>
                        {Object.entries(reseller.documents || {}).some(([, v]) => v) ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {Object.entries(reseller.documents || {}).map(([key, raw]) => {
                              if (!raw || typeof raw !== "string") return null;
                              const href = resolveMediaUrl(raw);
                              const label = RESELLER_DOC_LABELS[key] || key;
                              const pathOnly = raw.split("?")[0];
                              const isImage = /\.(jpe?g|png|gif|webp)$/i.test(pathOnly);
                              return (
                                <div key={key} className="rounded-lg border border-border bg-background overflow-hidden">
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-accent transition-colors"
                                  >
                                    <FileText className="h-4 w-4 shrink-0 text-primary" />
                                    <span className="text-sm font-medium truncate">{label}</span>
                                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground ml-auto" />
                                  </a>
                                  {isImage && (
                                    <a href={href} target="_blank" rel="noopener noreferrer" className="block border-t border-border bg-muted/30">
                                      <div className="relative h-40 w-full">
                                        <Image src={href} alt={label} fill className="object-contain" />
                                      </div>
                                    </a>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No documents uploaded with this application.</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 pt-4 border-t border-border sm:flex-row sm:flex-wrap">
                        {reseller.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleResellerStatus(reseller._id, "approved")}
                              className="flex-1 bg-green-600 hover:bg-green-700 sm:flex-initial"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleResellerStatus(reseller._id, "rejected")}
                              className="flex-1 sm:flex-initial"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-destructive/40 text-destructive hover:bg-destructive/10 sm:ml-auto"
                          onClick={() => handleDeleteReseller(reseller._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete application
                        </Button>
                      </div>

                      {reseller.notes && (
                        <div className="pt-4 border-t border-border">
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Admin Notes</p>
                          <p className="text-sm text-muted-foreground">{reseller.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold text-foreground mb-4">Admin Settings</h2>
              <div className="rounded-lg border border-border bg-card p-6 space-y-6">
                <div>
                  <label className="text-sm font-medium text-foreground">Admin Email</label>
                  <p className="mt-2 h-10 px-3 rounded-lg border border-input bg-background flex items-center text-sm">
                    {adminEmail}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Site Settings</label>
                  <p className="mt-2 text-sm text-muted-foreground">More settings coming soon</p>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button variant="destructive" onClick={handleLogout} className="w-full">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout from Admin
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
}
