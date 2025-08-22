"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";

import type { NewsletterFormData } from "@/types/footer";
import axiosClient from "../../../../utils/axios";
type NewsletterProps = {
  source: string; // ✅ Added prop type
};

const Newsletter: React.FC<NewsletterProps> = ({ source }) => {
  const [formData, setFormData] = useState<NewsletterFormData>({
    email: "",
    preferences: ["offers", "new_products"],
    source: source,
  });
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error on input change
  };

  const handleSubscribe = async (
    e: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (!formData.email) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    try {
      // ✅ API call using AxiosClient
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
          source: "homepage",
        });
        setError("");
      }
    } catch (err: any) {
      // Handle different error types
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
    <div className="bg-[--color-accent] text-[--text-light] py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h3 className="text-2xl font-bold mb-2">Get Exclusive Offers!</h3>
            <p className="text-[--color-primary] text-sm">
              Subscribe to get special offers, free giveaways, and deals
              delivered to your inbox.
            </p>
          </div>

          <div className="w-full lg:w-auto lg:min-w-[400px]">
            {!isSubscribed ? (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-3 rounded-lg border-none outline-none text-[--text-dark] bg-[--color-primary]"
                    required
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[--color-secondary] text-[--text-dark] px-6 py-3 rounded-lg font-medium hover:bg-[--color-hover-card] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Subscribing..." : "Subscribe"}
                  </button>
                </div>
                {error && <p className="text-red-300 text-sm">{error}</p>}
                <p className="text-xs text-[--color-primary] opacity-75">
                  By subscribing, you agree to receive marketing emails. Check
                  your email to verify your subscription.
                </p>
              </form>
            ) : (
              <div className="text-center py-3">
                <span className="text-[--color-primary] text-lg">
                  ✅ Successfully subscribed! Check your email to verify.
                </span>
                <p className="text-xs text-[--color-primary] opacity-75 mt-2">
                  You'll start receiving newsletters after verification.
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
