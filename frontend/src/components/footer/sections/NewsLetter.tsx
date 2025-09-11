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
    setError("");
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
      style={{
        backgroundColor: "var(--color-secondary)",
        color: "var(--text-dark)",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h3 className="text-2xl font-bold mb-2">Get Exclusive Offers!</h3>
            <p className="text-sm">
              Subscribe to get special offers, free giveaways, and deals
              delivered to your inbox.
            </p>
          </div>

          <div className="w-full lg:w-auto lg:min-w-[400px]">
            {!isSubscribed ? (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex flex-wrap -mx-1">
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="flex-grow min-w-0 px-4 py-3 rounded-lg border-none outline-none text-[--text-dark] mx-1 my-1"
                    required
                    disabled={loading}
                    style={{ backgroundColor: "var(--color-card)" }}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-3 rounded-lg font-medium text-[--text-dark] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-1 my-1"
                    style={{ backgroundColor: "var(--color-primary)" }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "var(--color-hover-card)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "var(--color-primary)")
                    }
                  >
                    {loading ? "Subscribing..." : "Subscribe"}
                  </button>
                </div>
                {error && <p className="text-red-300 text-sm mx-1">{error}</p>}
                <p className="text-xs text-[--text-dark] opacity-75 mx-1">
                  By subscribing, you agree to receive marketing emails. Check
                  your email to verify your subscription.
                </p>
              </form>
            ) : (
              <div className="text-center py-3">
                <span className="text-[--text-dark] text-lg">
                  ✅ Successfully subscribed! Check your email to verify.
                </span>
                <p className="text-xs text-[--text-dark] opacity-75 mt-2">
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
