'use client'

import React, { useState } from "react";
import { useRouter } from 'next/navigation';

interface SupportOption {
  id: string;
  name: string;
  icon: string;
  action: () => void;
  description: string;
}

const CustomerSupport: React.FC = () => {
  const router = useRouter();
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
    // Future: Integrate actual chatbot
    console.log("Chatbot coming soon...");
  };

  // ✅ New: Raise a Ticket instead of email
  const handleRaiseTicket = (): void => {
    router.push('/support/create-ticket'); // Navigate to ticket form
    // Or open modal: setShowTicketModal(true)
  };

  const supportOptions: SupportOption[] = [
    {
      id: "faq",
      name: "FAQs",
      icon: "❓",
      action: () => router.push('/FAQs'),
      description: "Find answers to common questions",
    },
    {
      id: "ticket", // ✅ Changed from "email" to "ticket"
      name: "Raise a Ticket", // ✅ Updated name
      icon: "🎫", // ✅ Updated icon
      action: handleRaiseTicket, // ✅ New action
      description: "Create a support ticket", // ✅ Updated description
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
      action: toggleChatbot,
      description: "Chat with our AI assistant (Coming Soon)",
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

      {/* Future Chatbot Indicator */}
      {showChatbot && (
        <div className="bg-[--color-accent] text-[--text-light] p-3 rounded-lg text-sm">
          🤖 Live Chat coming soon! For now, please raise a ticket or contact us on WhatsApp.
        </div>
      )}
    </div>
  );
};

export default CustomerSupport;
