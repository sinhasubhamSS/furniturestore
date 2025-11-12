"use client";

import React from "react";
import { useRouter } from "next/navigation";
import SupportForm from "@/components/footer/support/SupportForm";

const CreateTicketPage = () => {
  const router = useRouter();

  const handleTicketCreated = (ticketNumber: string) => {
    // Optional: Redirect to ticket detail
    setTimeout(() => {
      router.push(`/support/${ticketNumber}`); // ✅ Complete path
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Create Support Ticket
          </h1>
          <p className="text-gray-600">
            Need help? Our support team is here to assist you.
          </p>
        </div>

        <SupportForm onTicketCreated={handleTicketCreated} />
      </div>
    </div>
  );
};

export default CreateTicketPage;
