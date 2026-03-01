"use client";

import React from "react";
import { useRouter } from "next/navigation";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

const CustomerSupport: React.FC = () => {
  const router = useRouter();

  const handleWhatsAppClick = () => {
    if (!WHATSAPP_NUMBER) return;
    const message = "Hi! I need help with my order.";
    const whatsappUrl = `https://wa.me/91${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="space-y-5">
      <h4 className="text-lg font-semibold text-[--color-accent]">
        Customer Support
      </h4>

      <div className="space-y-3 text-sm">
        <button
          onClick={() => router.push("/FAQs")}
          className="block hover:text-[var(--color-accent)] transition"
        >
          ❓ FAQs
        </button>

        <button
          onClick={() => router.push("/support/create-ticket")}
          className="block hover:text-[var(--color-accent)] transition"
        >
          🎫 Raise a Ticket
        </button>

        {WHATSAPP_NUMBER && (
          <button
            onClick={handleWhatsAppClick}
            className="block hover:text-[var(--color-accent)] transition"
          >
            💬 WhatsApp Support
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomerSupport;
