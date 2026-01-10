"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import type { NewsletterFormData } from "@/types/footer/footer";
import axiosClient from "../../../../utils/axios";

type NewsletterProps = {
  source: string;
};

const Newsletter: React.FC<NewsletterProps> = ({ source }) => {
  const [formData, setFormData] = useState<NewsletterFormData>({
    email: "",
    preferences: ["offers", "new_products"],
    source,
  });

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.email) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosClient.post("/newsletter/subscribe", {
        email: formData.email,
        preferences: formData.preferences,
        source: formData.source,
      });

      if (response.status === 201) {
        setIsSubscribed(true);
        setFormData({
          email: "",
          preferences: ["offers", "new_products"],
          source, // ✅ FIXED: keep original source
        });
        setError("");
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 400) {
        setError("Invalid email or already subscribed");
      } else if (err.code === "ECONNABORTED") {
        setError("Request timeout. Please try again");
      } else {
        setError("Subscription failed. Please try again later");
      }
      console.error("Newsletter subscription error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="py-8 mt-2"
      style={{ backgroundColor: "var(--color-secondary)" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* LEFT CONTENT */}
          <div>
            <h3 className="text-2xl font-bold mb-2">Get Exclusive Offers!</h3>
            <p className="text-sm">
              Subscribe to receive special offers, product updates, and deals.
            </p>
          </div>

          {/* RIGHT FORM */}
          <div className="w-full lg:w-auto lg:min-w-[400px]">
            {!isSubscribed ? (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                    required
                    disabled={loading}
                    className="flex-grow px-4 py-3 rounded-lg outline-none text-[--text-dark]"
                    style={{ backgroundColor: "var(--color-card)" }}
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 rounded-lg font-medium transition disabled:opacity-50"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    {loading ? "Subscribing..." : "Subscribe"}
                  </button>
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <p className="text-xs opacity-75">
                  🔒 We respect your privacy. No spam. Unsubscribe anytime.
                </p>
              </form>
            ) : (
              <div className="text-center py-3">
                <p className="text-lg">✅ Successfully subscribed!</p>
                <p className="text-xs opacity-75 mt-1">
                  Please check your email to verify your subscription.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
