"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface SupportOption {
  id: string;
  name: string;
  icon: string;
  action?: () => void;
  description: string;
  disabled?: boolean;
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

const CustomerSupport: React.FC = () => {
  const router = useRouter();
  const [showChatbotInfo, setShowChatbotInfo] = useState(false);

  /* ================= ACTIONS ================= */

  const handleWhatsAppClick = () => {
    if (!WHATSAPP_NUMBER) return;

    const message = "Hi! I need help with my order.";
    const whatsappUrl = `https://wa.me/91${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message,
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleRaiseTicket = () => {
    router.push("/support/create-ticket");
  };

  /* ================= OPTIONS ================= */

  const supportOptions: SupportOption[] = [
    {
      id: "faq",
      name: "FAQs",
      icon: "❓",
      action: () => router.push("/FAQs"),
      description: "Find answers to common questions",
    },
    {
      id: "ticket",
      name: "Raise a Ticket",
      icon: "🎫",
      action: handleRaiseTicket,
      description: "Create a support ticket for your issue",
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: "💬",
      action: handleWhatsAppClick,
      description: "Get instant help on WhatsApp",
    },
    {
      id: "chatbot",
      name: "Live Chat",
      icon: "🤖",
      disabled: true,
      description: "AI chat support (Coming Soon)",
    },
  ];

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-[--color-accent] border-b border-[--color-border-custom] pb-2">
        Customer Support
      </h4>

      {/* SUPPORT OPTIONS */}
      <div className="space-y-3">
        {supportOptions.map((option) => (
          <button
            key={option.id}
            onClick={
              option.disabled ? () => setShowChatbotInfo(true) : option.action
            }
            disabled={option.disabled}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition text-left
              ${
                option.disabled
                  ? "bg-[--color-secondary] opacity-60 cursor-not-allowed"
                  : "bg-[--color-secondary] hover:bg-[--color-hover-card]"
              }
            `}
          >
            <span className="text-xl">{option.icon}</span>

            <div>
              <p className="font-medium text-[--text-accent]">{option.name}</p>
              <p className="text-xs text-[--text-accent] opacity-70">
                {option.description}
              </p>
            </div>

            {option.disabled && (
              <span className="ml-auto text-[10px] font-bold text-green-600">
                SOON
              </span>
            )}
          </button>
        ))}
      </div>

      {/* SUPPORT HOURS */}
      <div className="bg-[--color-secondary] p-4 rounded-lg border border-[--color-border-custom]">
        <h5 className="font-medium text-[--text-accent] mb-2">Support Hours</h5>
        <div className="text-sm text-[--text-accent] space-y-1">
          <p>📅 Mon – Fri: 9:00 AM – 8:00 PM</p>
          <p>📅 Saturday: 10:00 AM – 6:00 PM</p>
          <p>📅 Sunday: 10:00 AM – 4:00 PM</p>
        </div>
      </div>

      {/* CHATBOT INFO */}
      {showChatbotInfo && (
        <div className="bg-[--color-accent] text-[--text-light] p-3 rounded-lg text-sm">
          🤖 Live Chat is coming soon. For now, please raise a ticket or contact
          us on WhatsApp.
        </div>
      )}
    </div>
  );
};

export default CustomerSupport;
