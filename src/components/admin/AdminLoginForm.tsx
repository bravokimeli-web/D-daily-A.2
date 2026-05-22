"use client";

import { useState } from "react";
import { getApiBaseUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${getApiBaseUrl()}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store JWT token and admin info
      localStorage.setItem("admin_token", data.data.token);
      localStorage.setItem("admin_email", data.data.admin.email);
      localStorage.setItem("admin_name", data.data.admin.name);

      setMessage({
        type: "success",
        text: "Login successful. Redirecting...",
      });

      setTimeout(() => {
        window.location.href = "/admin";
      }, 1000);
    } catch (err) {
      setMessage({
        type: "error",
        text: (err as Error).message || "Login failed. Please check your credentials.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="admin-email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@ddaily.co.ke"
            className="mt-2 w-full h-11 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label htmlFor="admin-password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="mt-2 w-full h-11 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
            required
          />
        </div>

        {message && (
          <div
            className={`flex items-start gap-2 rounded-lg p-3 text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
