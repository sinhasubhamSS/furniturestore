'use client'

import React, { useState } from "react";

interface SupportOption {
  id: string;
  name: string;
  icon: string;
  action: () => void;
  description: string;
}

const CustomerSupport: React.FC = () => {
  const [showChatbot, setShowChatbot] = useState<boolean>(false);

  const handleWhatsAppClick = (): void => {
    const message = "Hi! I need help with my order.";
    const phoneNumber = "919876543210"; // Replace with your actual number
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const toggleChatbot = (): void => {
    setShowChatbot((prev) => !prev);
    // Here you can integrate actual chatbot logic
    console.log("Chatbot toggled:", !showChatbot);
  };

  const handleEmailSupport = (): void => {
    window.location.href = "mailto:support@yourstore.com";
  };

  const supportOptions: SupportOption[] = [
    {
      id: "faq",
      name: "FAQs",
      icon: "❓",
      action: () => window.open("/faq", "_self"),
      description: "Find answers to common questions",
    },
    {
      id: "chatbot",
      name: "Live Chat",
      icon: "🤖",
      action: toggleChatbot,
      description: "Chat with our AI assistant",
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: "💬",
      action: handleWhatsAppClick,
      description: "Get instant help on WhatsApp",
    },
    {
      id: "email",
      name: "Email Support",
      icon: "📧",
      action: handleEmailSupport,
      description: "Send us an email",
    },
  ];

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-[--color-accent] border-b border-[--color-border-custom] pb-2">
        Customer Support
      </h4>

      <div className="space-y-3">
        {supportOptions.map((option: SupportOption) => (
          <button
            key={option.id}
            onClick={option.action}
            className="w-full flex items-center space-x-3 p-3 bg-[--color-secondary] hover:bg-[--color-hover-card] rounded-lg border border-[--color-border-custom] transition-colors text-left"
          >
            <span className="text-xl">{option.icon}</span>
            <div>
              <div className="font-medium text-[--text-accent]">
                {option.name}
              </div>
              <div className="text-xs text-[--text-accent] opacity-70">
                {option.description}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Support Hours */}
      <div className="bg-[--color-secondary] p-4 rounded-lg border border-[--color-border-custom]">
        <h5 className="font-medium text-[--text-accent] mb-2">Support Hours</h5>
        <div className="text-sm text-[--text-accent] space-y-1">
          <p>📅 Mon - Fri: 9:00 AM - 8:00 PM</p>
          <p>📅 Saturday: 10:00 AM - 6:00 PM</p>
          <p>📅 Sunday: 10:00 AM - 4:00 PM</p>
        </div>
      </div>

      {/* Chatbot Indicator */}
      {showChatbot && (
        <div className="bg-[--color-accent] text-[--text-light] p-3 rounded-lg text-sm">
          🤖 Chatbot activated! How can I help you today?
        </div>
      )}
    </div>
  );
};

export default CustomerSupport;
