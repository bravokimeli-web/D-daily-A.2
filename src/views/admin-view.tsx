"use client";

import Link from "next/link";
import { getApiBaseUrl, resolveMediaUrl } from "@/lib/api";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { BarChart3, LogOut, Package, ShoppingCart, Users, Settings, Trash2, Eye, FileText, CheckCircle, XCircle, ExternalLink, Upload } from "lucide-react";
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
    const [resellers, setResellers] = useState<any[]>([]);
    const [loadingResellers, setLoadingResellers] = useState(false);
    const [resellerFilter, setResellerFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [dropActive, setDropActive] = useState(false);

    const loadWebsiteProducts = useCallback(async () => {
      setLoadingProducts(true);
      try {
        const response = await fetch(`${getApiBaseUrl()}/products?active=true`);
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(data.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load products from the server");
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    }, []);

    useEffect(() => {
      if (!isAdmin) return;
      void loadWebsiteProducts();
    }, [isAdmin, loadWebsiteProducts]);

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
              "Authorization": `Bearer ${token}`,
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
    }, [isAdmin, resellerFilter]);

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

    const handleImageSelected = (file: File | null) => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
      if (!file) {
        setImageFile(null);
        setImagePreview(null);
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    };

    const handleProductImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDropActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) handleImageSelected(file);
      else if (file) toast.error("Please drop an image file (JPEG, PNG, WebP, or GIF).");
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
      const description = (formData.get("description") as string)?.trim() || name;
      const taglineField = (formData.get("tagline") as string)?.trim();
      const usage = linesToArray(formData.get("usage"));
      const safety = linesToArray(formData.get("safety"));
      const specs = parseSpecLines(formData.get("specs"));
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
      if (imageFile) {
        try {
          const fd = new FormData();
          fd.append("image", imageFile);
          const up = await fetch(`${getApiBaseUrl()}/admin/products/upload`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: fd,
          });
          const uj = await up.json().catch(() => ({}));
          if (!up.ok) {
            toast.error(typeof uj.message === "string" ? uj.message : "Image upload failed");
            return;
          }
          imageForProduct = uj.data?.url as string;
        } catch (err) {
          toast.error((err as Error).message);
          return;
        }
      }

      if (!imageForProduct) {
        toast.error("Add an image by dragging a file into the box, choosing a file, or paste an image URL below.");
        return;
      }

      const slug =
        name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "") || `product-${Date.now()}`;

      try {
        const response = await fetch(`${getApiBaseUrl()}/admin/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            slug,
            name,
            price: parseFloat(priceRaw),
            originalPrice: originalPriceRaw ? parseFloat(originalPriceRaw) : undefined,
            category,
            image: imageForProduct,
            tagline,
            description,
            usage,
            safety,
            specs,
            stock: Math.max(0, parseInt(stockRaw, 10) || 0),
          }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          toast.error(typeof data.message === "string" ? data.message : "Failed to create product");
          return;
        }
        toast.success("Product created");
        (e.target as HTMLFormElement).reset();
        if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
        setImageFile(null);
        setImagePreview(null);
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
          headers: { "Authorization": `Bearer ${token}` },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || "Failed to remove product");
        toast.success("Product removed from the site");
        await loadWebsiteProducts();
      } catch (err) {
        toast.error((err as Error).message);
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
                    <p className="mt-2 text-3xl font-bold text-foreground">{orders.length}</p>
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
                <h2 className="text-xl font-bold text-foreground mb-4">Add New Product</h2>
                <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
                  Drag and drop a product image or choose a file (JPEG, PNG, WebP, or GIF, up to 8MB). The image is uploaded
                  to the server first, then the product is created. Optionally you can paste an image URL instead of uploading.
                </p>
                <form onSubmit={handleAddProduct} className="rounded-lg border border-border bg-card p-6 space-y-4 max-w-2xl">
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
                    <label className="text-sm font-medium">Product image</label>
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
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(ev) => handleImageSelected(ev.target.files?.[0] ?? null)}
                      />
                      <label htmlFor="admin-product-image" className="cursor-pointer block">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="mx-auto max-h-48 w-auto rounded-xl object-contain border border-border"
                          />
                        ) : (
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <Upload className="h-8 w-8 mx-auto text-primary" />
                            <p className="font-semibold text-foreground">Drag and drop an image here</p>
                            <p>or click to choose a file</p>
                          </div>
                        )}
                      </label>
                      {imagePreview && (
                        <button
                          type="button"
                          className="mt-3 text-xs font-medium text-destructive hover:underline"
                          onClick={() => handleImageSelected(null)}
                        >
                          Remove image
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Or image URL (optional if you uploaded above)</label>
                    <input
                      name="imageUrl"
                      type="text"
                      inputMode="url"
                      placeholder="https://… or /uploads/…"
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

                  <Button type="submit" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload image and add product
                  </Button>
                </form>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Live on website</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Active products returned by the API (same source the storefront can use).
                </p>
                {loadingProducts ? (
                  <p className="text-muted-foreground">Loading products…</p>
                ) : products.length === 0 ? (
                  <p className="text-muted-foreground">No active products in the database.</p>
                ) : (
                  <div className="space-y-3">
                    {products.map((p) => (
                      <div
                        key={p._id || p.slug}
                        className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex flex-1 gap-4 min-w-0">
                          <img
                            src={resolveMediaUrl(p.image)}
                            alt=""
                            className="h-16 w-16 shrink-0 rounded-lg object-cover border border-border bg-muted"
                          />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{p.name}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {p.category} · KES {p.price ?? "—"}{p.originalPrice ? ` · was KES ${p.originalPrice}` : ""} · stock {p.stock ?? 0}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono truncate">{p.slug}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.slug)}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-destructive/30 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove from site
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Orders</h2>
              {orders.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-12 text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                      <div className="flex-1">
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-sm text-muted-foreground">{order.date}</p>
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
                                      <img src={href} alt={label} className="max-h-40 w-full object-contain" />
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
