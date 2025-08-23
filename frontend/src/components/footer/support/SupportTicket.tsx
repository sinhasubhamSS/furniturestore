"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SupportTicket as SupportTicketType } from "@/types/footer/support/support";
import axiosClient from "../../../../utils/axios";

interface Props {
  ticketNumber: string;
}

const SupportTicket = ({ ticketNumber }: Props) => {
  const router = useRouter();
  const [ticket, setTicket] = useState<SupportTicketType | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState("");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await axiosClient.get(
          `/support/ticket/${ticketNumber}`
        );
        setTicket(response.data.data.ticket);
      } catch (err) {
        console.error("Failed to fetch ticket");
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [ticketNumber]);

  const sendReply = async () => {
    if (!replyMessage.trim()) return;

    try {
      await axiosClient.post(`/support/ticket/${ticketNumber}/reply`, {
        message: replyMessage,
        isAdmin: false,
      });
      setReplyMessage("");
      // Refresh ticket data
      window.location.reload();
    } catch (err) {
      alert("Failed to send reply");
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!ticket) return <div className="text-center py-8">Ticket not found</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="mb-4 text-gray-600">
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-4">{ticket.subject}</h1>

      <div className="bg-gray-50 p-4 rounded mb-4">
        <p>
          <strong>Ticket:</strong> #{ticket.ticketNumber}
        </p>
        <p>
          <strong>Status:</strong> {ticket.status}
        </p>
        <p>
          <strong>Category:</strong> {ticket.category}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Original Message:</h3>
        <p className="bg-blue-50 p-4 rounded">{ticket.description}</p>
      </div>

      {/* Replies */}
      {ticket.replies && ticket.replies.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Conversation:</h3>
          {ticket.replies.map((reply, index) => (
            <div
              key={index}
              className={`p-3 rounded mb-2 ${
                reply.isAdmin
                  ? "bg-blue-50 border-l-4 border-blue-500"
                  : "bg-gray-50"
              }`}
            >
              <small className="font-semibold">
                {reply.isAdmin ? "🎧 Support" : "👤 You"}
              </small>
              <p>{reply.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reply Form */}
      {ticket.status !== "closed" && (
        <div>
          <h3 className="font-semibold mb-2">Add Reply:</h3>
          <textarea
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder="Type your message..."
            className="w-full p-2 border rounded mb-2"
            rows={3}
          />
          <button
            onClick={sendReply}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Send Reply
          </button>
        </div>
      )}
    </div>
  );
};

export default SupportTicket;
