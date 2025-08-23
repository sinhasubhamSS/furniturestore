"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SupportTicket } from "@/types/footer/support/support";
import axiosClient from "../../../../utils/axios";

const SupportList = () => {
  const router = useRouter();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTickets = async () => {
    if (!email) return;
    setLoading(true);

    try {
      const response = await axiosClient.get(
        `/support/customer-tickets?email=${email}`
      );
      setTickets(response.data.data.tickets);
    } catch (err) {
      console.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">My Support Tickets</h2>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={fetchTickets}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {/* Tickets */}
      {tickets.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No tickets found</p>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.ticketNumber}
              onClick={() => router.push(`/support/${ticket.ticketNumber}`)}
              className="border p-4 rounded cursor-pointer hover:shadow-md"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{ticket.subject}</h3>
                  <p className="text-sm text-gray-600">
                    #{ticket.ticketNumber}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    ticket.status === "open"
                      ? "bg-blue-100 text-blue-800"
                      : ticket.status === "resolved"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {ticket.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupportList;
