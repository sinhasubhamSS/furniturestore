"use client";

import React from "react";
import { useRouter } from "next/navigation"; // ✅ Changed import
import SupportTicket from "@/components/footer/support/SupportTicket";
import { use } from "react"; // ✅ Import React.use()
// ✅ App Router way - params prop
interface Props {
  params: Promise<{ ticketNumber: string }>; // ✅ Promise type
}

export default function TicketDetailPage({ params }: Props) {
  const router = useRouter();
  const { ticketNumber } = use(params); // ✅ Get from params, not router.query

  // ✅ Validation check
  if (!ticketNumber || typeof ticketNumber !== "string") {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Invalid Ticket Number
          </h1>
          <button
            onClick={() => router.push("/support/my-tickets")}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            View All Tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <SupportTicket ticketNumber={ticketNumber} />
      </div>
    </div>
  );
}
